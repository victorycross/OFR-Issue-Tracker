"""
SharePoint data export and upload for the OFR Issue Deck Azure Function.

Provides:
- fetch_issues_from_sharepoint() — reads OFR_Issues + OFR_UpdateHistory via Graph API
- upload_pptx_to_sharepoint()    — uploads a PPTX file to the Generated Reports folder

Refactored from tools/export_ofr_data.py into library form (no CLI, no file I/O).
"""

import logging
import os
from collections import defaultdict
from datetime import datetime, timezone

import msal
import requests

logger = logging.getLogger(__name__)

# ── SharePoint site and list identifiers ─────────────────────────────────────
# These are read from environment variables at runtime to support multi-tenant
# deployment. Set OFR_SHAREPOINT_HOSTNAME and OFR_SITE_PATH in Application
# Settings (Azure) or local.settings.json (local development).
LIST_NAME_ISSUES = "OFR_Issues"
LIST_NAME_UPDATES = "OFR_UpdateHistory"


def _get_sharepoint_config():
    """Read SharePoint hostname and site path from environment variables."""
    hostname = os.environ.get("OFR_SHAREPOINT_HOSTNAME", "")
    site_path = os.environ.get("OFR_SITE_PATH", "/sites/OFRIssueTracker")
    if not hostname:
        raise ValueError(
            "OFR_SHAREPOINT_HOSTNAME environment variable must be set "
            "(e.g., 'contoso.sharepoint.com')"
        )
    return hostname, site_path

# ── Graph API ────────────────────────────────────────────────────────────────
GRAPH_BASE = "https://graph.microsoft.com/v1.0"

# ── SharePoint field selections ──────────────────────────────────────────────
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


# ══════════════════════════════════════════════════════════════════════════════
#  AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════════════

def get_access_token(client_id, client_secret, tenant_id):
    """Get a Graph API access token using client credentials (app-only)."""
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
        error = result.get("error_description", str(result))
        raise RuntimeError(f"Failed to acquire Graph API token: {error}")


# ══════════════════════════════════════════════════════════════════════════════
#  SHAREPOINT HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def get_site_id(token, sharepoint_hostname=None, site_path=None):
    """Resolve the SharePoint site ID from hostname and path."""
    if not sharepoint_hostname or not site_path:
        sharepoint_hostname, site_path = _get_sharepoint_config()
    url = f"{GRAPH_BASE}/sites/{sharepoint_hostname}:{site_path}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()["id"]


def get_list_id(token, site_id, list_name):
    """Get the list ID for a named SharePoint list."""
    url = f"{GRAPH_BASE}/sites/{site_id}/lists/{list_name}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()["id"]


def fetch_list_items(token, site_id, list_id, select_fields=None):
    """Fetch all items from a SharePoint list with pagination."""
    url = f"{GRAPH_BASE}/sites/{site_id}/lists/{list_id}/items"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "$expand": "fields",
        "$top": 200,
    }

    all_items = []
    while url:
        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        all_items.extend(data.get("value", []))

        # Handle pagination
        url = data.get("@odata.nextLink")
        params = None  # Next link already includes params

    return all_items


# ══════════════════════════════════════════════════════════════════════════════
#  DATA TRANSFORM
# ══════════════════════════════════════════════════════════════════════════════

def build_update_map(raw_updates):
    """Build a dict mapping ParentItemID -> list of update records, sorted newest first."""
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
    """Transform Graph API items to the deck generation JSON schema."""
    if update_map is None:
        update_map = {}

    issues = []
    for item in raw_items:
        fields = item.get("fields", {})
        item_id = fields.get("ItemID", "")

        issue = {
            "ItemID": item_id,
            "Title": fields.get("Title", ""),
            "Owner": fields.get("Owner", ""),
            "Priority": fields.get("Priority", "Medium"),
            "Status": fields.get("Status", ""),
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


# ══════════════════════════════════════════════════════════════════════════════
#  HIGH-LEVEL OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def fetch_issues_from_sharepoint(client_id, client_secret, tenant_id):
    """Fetch all issues and update history from SharePoint.

    Returns the complete data dict expected by generate_pptx_bytes():
        {
            "generated_at": "...",
            "report_title": "...",
            "report_subtitle": "...",
            "issues": [...]
        }
    """
    logger.info("Authenticating with Microsoft Graph...")
    token = get_access_token(client_id, client_secret, tenant_id)

    logger.info("Resolving SharePoint site...")
    site_id = get_site_id(token)

    # Resolve list IDs
    logger.info("Resolving SharePoint lists...")
    issues_list_id = get_list_id(token, site_id, LIST_NAME_ISSUES)
    updates_list_id = get_list_id(token, site_id, LIST_NAME_UPDATES)

    # Fetch issues
    logger.info("Fetching issues...")
    raw_items = fetch_list_items(token, site_id, issues_list_id, ISSUE_FIELDS)
    logger.info(f"  Retrieved {len(raw_items)} issue items")

    # Fetch update history
    logger.info("Fetching update history...")
    raw_updates = fetch_list_items(token, site_id, updates_list_id, UPDATE_FIELDS)
    logger.info(f"  Retrieved {len(raw_updates)} update records")

    # Build and transform
    update_map = build_update_map(raw_updates)
    issues = transform_issues(raw_items, update_map)

    updates_attached = sum(1 for i in issues if i.get("Updates"))
    logger.info(f"  Attached updates to {updates_attached} of {len(issues)} issues")

    # Build output structure
    now = datetime.now(timezone.utc)
    return {
        "generated_at": now.isoformat(),
        "report_title": "OFR Issue Tracker - Weekly Risk Report",
        "report_subtitle": f"Week of {now.strftime('%B %d, %Y')}",
        "issues": issues,
    }


def upload_pptx_to_sharepoint(client_id, client_secret, tenant_id, filename, pptx_bytes):
    """Upload a PPTX file to the Generated Reports folder in SharePoint.

    Uses the Graph API simple upload (PUT) for files under 4MB.
    The generated PPTX is typically ~550KB, well under the limit.

    Args:
        client_id: Azure AD app registration client ID
        client_secret: App registration client secret
        tenant_id: Azure AD tenant ID
        filename: e.g. "OFR_Issue_Deck_2026-02-22_143015.pptx"
        pptx_bytes: The PPTX file content as bytes

    Returns:
        dict: {"web_url": "https://...", "name": "filename.pptx"}
    """
    token = get_access_token(client_id, client_secret, tenant_id)
    site_id = get_site_id(token)

    # Upload to: /sites/{site_id}/drive/root:/Shared Documents/Generated Reports/{filename}:/content
    drive_path = f"Shared Documents/Generated Reports/{filename}"
    url = f"{GRAPH_BASE}/sites/{site_id}/drive/root:/{drive_path}:/content"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }

    logger.info(f"Uploading {filename} ({len(pptx_bytes):,} bytes) to SharePoint...")
    resp = requests.put(url, headers=headers, data=pptx_bytes)
    resp.raise_for_status()

    result = resp.json()
    web_url = result.get("webUrl", "")
    logger.info(f"  Upload complete: {web_url}")

    return {
        "web_url": web_url,
        "name": result.get("name", filename),
    }
