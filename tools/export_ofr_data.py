#!/usr/bin/env python3
"""
Export OFR Issue data from SharePoint Online to JSON for deck generation.

Uses the Microsoft Graph API with an app registration (client credentials) or
delegated (device code) flow to pull the latest OFR_Issues list items and
format them as the JSON schema expected by generate_issue_deck.py.

Prerequisites:
    pip install msal requests

    You need one of:
    A) An Azure AD app registration with Sites.Read.All (application) permission
    B) A user account with read access to the OFR site (device code flow)

Usage:
    # Using client credentials (service principal):
    python3 export_ofr_data.py --client-id <ID> --client-secret <SECRET> --tenant-id <TENANT>

    # Using device code (interactive login):
    python3 export_ofr_data.py --device-code --client-id <ID> --tenant-id <TENANT>

    # Using environment variables:
    export OFR_CLIENT_ID=<ID>
    export OFR_CLIENT_SECRET=<SECRET>
    export OFR_TENANT_ID=<TENANT>
    python3 export_ofr_data.py

    # Output options:
    python3 export_ofr_data.py -o custom_output.json
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUTPUT = os.path.join(BASE, "sample-data", "ofr_issues_live.json")

# SharePoint site and list identifiers (env var overrides for multi-tenant use)
SHAREPOINT_HOSTNAME = os.environ.get("OFR_SHAREPOINT_HOSTNAME", "papercutscafe.sharepoint.com")
SITE_PATH = os.environ.get("OFR_SITE_PATH", "/sites/OFRIssueTracker")
LIST_NAME_ISSUES = "OFR_Issues"
LIST_NAME_UPDATES = "OFR_UpdateHistory"

# Graph API endpoints
GRAPH_BASE = "https://graph.microsoft.com/v1.0"

# Fields to request from SharePoint (internal names)
ISSUE_FIELDS = [
    "fields/ItemID",
    "fields/Title",
    "fields/Owner",
    "fields/Priority",
    "fields/Status",
    "fields/FunctionalGroup",
    "fields/DateRaised",
    "fields/LastUpdated",
    "fields/DaysSinceUpdate",
    "fields/StalenessFlag",
    "fields/NextAction",
]

UPDATE_FIELDS = [
    "fields/ParentItemID",
    "fields/UpdateDate",
    "fields/StatusAtUpdate",
    "fields/Notes",
    "fields/UpdatedBy",
]


def get_access_token_client_credentials(client_id, client_secret, tenant_id):
    """Get an access token using client credentials (app-only)."""
    try:
        import msal
    except ImportError:
        print("Error: msal package not installed. Run: pip install msal")
        sys.exit(1)

    authority = f"https://login.microsoftonline.com/{tenant_id}"
    app = msal.ConfidentialClientApplication(
        client_id,
        authority=authority,
        client_credential=client_secret,
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

    if "access_token" in result:
        return result["access_token"]
    else:
        print(f"Error acquiring token: {result.get('error_description', result)}")
        sys.exit(1)


def get_access_token_device_code(client_id, tenant_id):
    """Get an access token using device code flow (interactive)."""
    try:
        import msal
    except ImportError:
        print("Error: msal package not installed. Run: pip install msal")
        sys.exit(1)

    authority = f"https://login.microsoftonline.com/{tenant_id}"
    app = msal.PublicClientApplication(client_id, authority=authority)
    flow = app.initiate_device_flow(scopes=["Sites.Read.All"])

    if "user_code" not in flow:
        print(f"Error initiating device flow: {flow}")
        sys.exit(1)

    print(flow["message"])  # Shows the URL and code for the user
    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        return result["access_token"]
    else:
        print(f"Error acquiring token: {result.get('error_description', result)}")
        sys.exit(1)


def get_site_id(token):
    """Resolve the SharePoint site ID from hostname and path."""
    import requests

    url = f"{GRAPH_BASE}/sites/{SHAREPOINT_HOSTNAME}:{SITE_PATH}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()["id"]


def get_list_id(token, site_id, list_name):
    """Get the list ID for a named SharePoint list."""
    import requests

    url = f"{GRAPH_BASE}/sites/{site_id}/lists/{list_name}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()["id"]


def fetch_list_items(token, site_id, list_id, select_fields):
    """Fetch all items from a SharePoint list with pagination."""
    import requests

    url = f"{GRAPH_BASE}/sites/{site_id}/lists/{list_id}/items"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "$expand": "fields",
        "$select": ",".join(select_fields),
        "$top": 200,  # Max page size
    }

    all_items = []
    while url:
        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        all_items.extend(data.get("value", []))

        # Handle pagination
        url = data.get("@odata.nextLink")
        params = None  # Next link includes params

    return all_items


def build_update_map(raw_updates):
    """Build a dict mapping ParentItemID → list of update records, sorted newest first."""
    from collections import defaultdict

    update_map = defaultdict(list)
    for item in raw_updates:
        fields = item.get("fields", {})
        parent_id = fields.get("ParentItemID", "")
        if not parent_id:
            continue

        update = {
            "Date": fields.get("UpdateDate", "")[:10] if fields.get("UpdateDate") else "",
            "Status": fields.get("StatusAtUpdate", ""),
            "Notes": fields.get("Notes", ""),
            "UpdatedBy": fields.get("UpdatedBy", ""),
        }
        update_map[parent_id].append(update)

    # Sort each issue's updates by date descending (newest first)
    for parent_id in update_map:
        update_map[parent_id].sort(key=lambda u: u["Date"], reverse=True)

    return update_map


def transform_issues(raw_items, update_map=None):
    """Transform Graph API items to the generate_issue_deck.py JSON schema.

    Args:
        raw_items: Raw SharePoint list items from the OFR_Issues list.
        update_map: Optional dict mapping ItemID → list of update records.
    """
    if update_map is None:
        update_map = {}

    issues = []
    for item in raw_items:
        fields = item.get("fields", {})
        status = fields.get("Status", "")
        item_id = fields.get("ItemID", "")

        issue = {
            "ItemID": item_id,
            "Title": fields.get("Title", ""),
            "Owner": fields.get("Owner", ""),
            "Priority": fields.get("Priority", "Medium"),
            "Status": status,
            "FunctionalGroup": fields.get("FunctionalGroup", ""),
            "DateRaised": fields.get("DateRaised", "")[:10] if fields.get("DateRaised") else "",
            "LastUpdated": fields.get("LastUpdated", "")[:10] if fields.get("LastUpdated") else "",
            "DaysSinceUpdate": int(fields.get("DaysSinceUpdate", 0)),
            "StalenessFlag": fields.get("StalenessFlag", "Current"),
            "NextAction": fields.get("NextAction", ""),
            "Updates": update_map.get(item_id, []),
        }
        issues.append(issue)

    return issues


def build_output(issues):
    """Build the full JSON output structure."""
    now = datetime.now(timezone.utc)
    return {
        "generated_at": now.isoformat(),
        "report_title": "OFR Issue Tracker - Weekly Risk Report",
        "report_subtitle": f"Week of {now.strftime('%B %d, %Y')}",
        "issues": issues,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Export OFR Issues from SharePoint to JSON"
    )
    parser.add_argument("--output", "-o", default=None, help="Output JSON path")
    parser.add_argument(
        "--client-id",
        default=os.environ.get("OFR_CLIENT_ID"),
        help="Azure AD app client ID (or set OFR_CLIENT_ID env var)",
    )
    parser.add_argument(
        "--client-secret",
        default=os.environ.get("OFR_CLIENT_SECRET"),
        help="Azure AD app client secret (or set OFR_CLIENT_SECRET env var)",
    )
    parser.add_argument(
        "--tenant-id",
        default=os.environ.get("OFR_TENANT_ID"),
        help="Azure AD tenant ID (or set OFR_TENANT_ID env var)",
    )
    parser.add_argument(
        "--device-code",
        action="store_true",
        help="Use device code flow (interactive login) instead of client credentials",
    )
    args = parser.parse_args()

    output_path = args.output or DEFAULT_OUTPUT

    # Validate required parameters
    if not args.client_id:
        print("Error: --client-id required (or set OFR_CLIENT_ID env var)")
        print("\nTo use this script, you need an Azure AD app registration.")
        print("See: https://learn.microsoft.com/en-us/graph/auth-register-app-v2")
        print("\nAlternatively, export data manually from SharePoint:")
        print("  1. Open OFR_Issues list in SharePoint")
        print("  2. Click 'Export to Excel' from the toolbar")
        print("  3. Convert the Excel to JSON using the schema in sample-data/")
        sys.exit(1)

    if not args.tenant_id:
        print("Error: --tenant-id required (or set OFR_TENANT_ID env var)")
        sys.exit(1)

    if not args.device_code and not args.client_secret:
        print("Error: --client-secret required for client credentials flow")
        print("       (or use --device-code for interactive login)")
        sys.exit(1)

    # Authenticate
    print("Authenticating with Microsoft Graph...")
    if args.device_code:
        token = get_access_token_device_code(args.client_id, args.tenant_id)
    else:
        token = get_access_token_client_credentials(
            args.client_id, args.client_secret, args.tenant_id
        )
    print("  Authenticated successfully")

    # Resolve site
    print(f"Resolving site: {SHAREPOINT_HOSTNAME}{SITE_PATH}")
    site_id = get_site_id(token)
    print(f"  Site ID: {site_id[:30]}...")

    # Resolve lists
    print(f"Resolving list: {LIST_NAME_ISSUES}")
    issues_list_id = get_list_id(token, site_id, LIST_NAME_ISSUES)
    print(f"  Issues List ID: {issues_list_id[:30]}...")

    print(f"Resolving list: {LIST_NAME_UPDATES}")
    updates_list_id = get_list_id(token, site_id, LIST_NAME_UPDATES)
    print(f"  Updates List ID: {updates_list_id[:30]}...")

    # Fetch issues
    print("Fetching issues from SharePoint...")
    raw_items = fetch_list_items(token, site_id, issues_list_id, ISSUE_FIELDS)
    print(f"  Retrieved {len(raw_items)} issue items")

    # Fetch update history
    print("Fetching update history from SharePoint...")
    raw_updates = fetch_list_items(token, site_id, updates_list_id, UPDATE_FIELDS)
    print(f"  Retrieved {len(raw_updates)} update records")

    # Build update map and transform
    update_map = build_update_map(raw_updates)
    issues = transform_issues(raw_items, update_map)
    updates_attached = sum(1 for i in issues if i.get("Updates"))
    print(f"  Attached updates to {updates_attached} issues")

    # Filter stats
    open_issues = [i for i in issues if i["Status"] != "Closed"]
    stale = sum(1 for i in open_issues if i["StalenessFlag"] == "Stale")
    high = sum(1 for i in open_issues if i["Priority"] == "High")
    print(f"  Open: {len(open_issues)} | Stale: {stale} | High: {high}")

    # Build and write output
    output = build_output(issues)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nExport complete: {output_path}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")
    print(f"\nTo generate the deck:")
    print(f"  python3 {os.path.join(BASE, 'generate_issue_deck.py')} -i {output_path}")


if __name__ == "__main__":
    main()
