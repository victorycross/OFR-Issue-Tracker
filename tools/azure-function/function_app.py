"""
OFR Issue Deck Generator — Azure Function (HTTP Trigger).

Endpoint:  POST /api/generate-deck
Auth:      Function key (FUNCTION level)
Timeout:   5 minutes (configured in host.json)

Orchestrates the full pipeline:
  1. Fetch OFR_Issues + OFR_UpdateHistory from SharePoint (Graph API)
  2. Generate the PPTX deck in memory (python-pptx)
  3. Upload the PPTX to SharePoint Generated Reports folder
  4. Return JSON with status, filename, and URL

Environment variables (Azure Application Settings):
  - OFR_CLIENT_ID            — Azure AD app registration client ID
  - OFR_CLIENT_SECRET        — App registration client secret
  - OFR_TENANT_ID            — Azure AD tenant ID
  - OFR_SHAREPOINT_HOSTNAME  — SharePoint hostname (e.g., contoso.sharepoint.com)
  - OFR_SITE_PATH            — SharePoint site path (default: /sites/OFRIssueTracker)
"""

import json
import logging
import os
from datetime import datetime, timezone

import azure.functions as func

from generate_deck.export_data import fetch_issues_from_sharepoint, upload_pptx_to_sharepoint
from generate_deck.generate_deck import generate_pptx_bytes

# ── Configure logging ────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Resolve template path (bundled with the deployment) ──────────────────────
FUNCTION_ROOT = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(FUNCTION_ROOT, "templates", "OFR_Issue_Deck_Template.pptx")

# ── Create the Function App ──────────────────────────────────────────────────
app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)


@app.route(route="generate-deck", methods=["POST"])
def generate_deck(req: func.HttpRequest) -> func.HttpResponse:
    """Generate the OFR Issue Deck and upload to SharePoint.

    Returns JSON:
        Success (200): { status, filename, url, issue_count, slide_count, generated_at }
        Error (500):   { status, message }
    """
    logger.info("OFR Issue Deck generation triggered")

    # ── Read configuration ────────────────────────────────────────────────────
    client_id = os.environ.get("OFR_CLIENT_ID")
    client_secret = os.environ.get("OFR_CLIENT_SECRET")
    tenant_id = os.environ.get("OFR_TENANT_ID")
    sharepoint_hostname = os.environ.get("OFR_SHAREPOINT_HOSTNAME")

    if not all([client_id, client_secret, tenant_id]):
        logger.error("Missing required environment variables (OFR_CLIENT_ID, OFR_CLIENT_SECRET, OFR_TENANT_ID)")
        return func.HttpResponse(
            body='{"status": "error", "message": "Server configuration error: missing credentials"}',
            mimetype="application/json",
            status_code=500,
        )

    if not sharepoint_hostname:
        logger.error("Missing required environment variable: OFR_SHAREPOINT_HOSTNAME")
        return func.HttpResponse(
            body='{"status": "error", "message": "Server configuration error: missing OFR_SHAREPOINT_HOSTNAME"}',
            mimetype="application/json",
            status_code=500,
        )

    # ── Verify template exists ────────────────────────────────────────────────
    if not os.path.exists(TEMPLATE_PATH):
        logger.error(f"Template not found: {TEMPLATE_PATH}")
        return func.HttpResponse(
            body='{"status": "error", "message": "Server configuration error: template not found"}',
            mimetype="application/json",
            status_code=500,
        )

    try:
        # ── Step 1: Fetch data from SharePoint ────────────────────────────────
        logger.info("Step 1/3: Fetching issues from SharePoint...")
        data = fetch_issues_from_sharepoint(client_id, client_secret, tenant_id)
        issue_count = len(data.get("issues", []))
        logger.info(f"  Fetched {issue_count} issues")

        # ── Step 2: Generate PPTX in memory ───────────────────────────────────
        logger.info("Step 2/3: Generating PPTX deck...")
        pptx_bytes = generate_pptx_bytes(data, TEMPLATE_PATH)
        logger.info(f"  Generated {len(pptx_bytes):,} bytes")

        # ── Step 3: Upload to SharePoint ──────────────────────────────────────
        now = datetime.now(timezone.utc)
        filename = f"OFR_Issue_Deck_{now.strftime('%Y-%m-%d_%H%M%S')}.pptx"

        logger.info(f"Step 3/3: Uploading {filename} to SharePoint...")
        upload_result = upload_pptx_to_sharepoint(
            client_id, client_secret, tenant_id, filename, pptx_bytes
        )

        web_url = upload_result.get("web_url", "")
        logger.info(f"  Upload complete: {web_url}")

        # ── Return success response ───────────────────────────────────────────
        response_body = json.dumps({
            "status": "success",
            "filename": filename,
            "url": web_url,
            "issue_count": issue_count,
            "generated_at": now.isoformat(),
        })

        return func.HttpResponse(
            body=response_body,
            mimetype="application/json",
            status_code=200,
        )

    except Exception as e:
        logger.exception(f"Deck generation failed: {e}")
        error_body = json.dumps({
            "status": "error",
            "message": str(e),
        })
        return func.HttpResponse(
            body=error_body,
            mimetype="application/json",
            status_code=500,
        )
