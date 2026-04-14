# OFR Issue Tracker — Azure Function Setup Guide

> **Phase 2 (Optional):** This guide covers deploying the Issue Deck Generator Azure Function. Phase 1 (SharePoint + Power Apps + 2 core flows) works independently without this component.

## Overview

The Azure Function provides automated PPTX deck generation. The pipeline:

```
Power Apps button → Power Automate flow → Azure Function (HTTP POST)
    → Fetch data from SharePoint (Graph API)
    → Generate PPTX in memory (python-pptx)
    → Upload PPTX to SharePoint "Generated Reports" folder
    → Return JSON { status, filename, url }
```

**Estimated time:** ~45 minutes
**Estimated cost:** Azure Consumption plan — typically <$0.10/month for this workload

---

## Prerequisites

- Azure subscription (`[AZURE-SUBSCRIPTION]`)
- Azure CLI installed (`az --version`)
- Azure Functions Core Tools v4 (`func --version`)
- Python 3.11
- Completed Phase 1 deployment (SharePoint site + lists exist)

---

## Step 1: Create Azure Resources

### 1.1 Create Resource Group

```bash
az group create \
  --name [AZURE-RESOURCE-GROUP] \
  --location [AZURE-REGION]
```

### 1.2 Create Storage Account

```bash
az storage account create \
  --name [AZURE-STORAGE-ACCOUNT] \
  --resource-group [AZURE-RESOURCE-GROUP] \
  --location [AZURE-REGION] \
  --sku Standard_LRS
```

> **Note:** Storage account name must be globally unique, 3-24 characters, lowercase letters and numbers only.

### 1.3 Create Function App

```bash
az functionapp create \
  --name [AZURE-FUNCTION-APP] \
  --resource-group [AZURE-RESOURCE-GROUP] \
  --storage-account [AZURE-STORAGE-ACCOUNT] \
  --consumption-plan-location [AZURE-REGION] \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --os-type Linux
```

> **Note:** Function App name must be globally unique. It forms the URL: `https://[AZURE-FUNCTION-APP].azurewebsites.net`

---

## Step 2: Create Entra ID App Registration

The Azure Function needs an app registration to authenticate with the Microsoft Graph API and access SharePoint data.

### 2.1 Register the Application

1. Go to **Azure Portal** → **Microsoft Entra ID** → **App registrations** → **New registration**
2. **Name:** `[APP-REGISTRATION-NAME]`
3. **Supported account types:** "Accounts in this organizational directory only"
4. **Redirect URI:** Leave blank (not needed for client credentials)
5. Click **Register**

Record the **Application (client) ID** — this is `[APP-REGISTRATION-ID]`.

### 2.2 Verify Tenant ID

On the app registration **Overview** page, confirm the **Directory (tenant) ID** matches `[TENANT-ID]`.

You can also find it at: **Azure Portal** → **Microsoft Entra ID** → **Overview** → **Tenant ID**.

---

## Step 3: Add API Permissions

The Function needs **application-level** (not delegated) permissions to read SharePoint data and upload files.

### 3.1 Add Permissions

1. In the app registration, go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Application permissions**
3. Add the following permissions:

| Permission | GUID | Purpose |
|-----------|------|---------|
| `Sites.Read.All` | `332a536c-c7ef-4017-ab91-336970924f0d` | Read OFR_Issues and OFR_UpdateHistory lists |
| `Sites.ReadWrite.All` | `9492366f-7969-46a4-8d15-ed1a20078fff` | Upload generated PPTX to SharePoint |

### 3.2 Grant Admin Consent

1. Click **Grant admin consent for [TENANT-DOMAIN]**
2. Confirm the consent dialog
3. Verify both permissions show a green checkmark under "Status"

> **Important:** Admin consent is required because these are application permissions, not delegated. Only a Global Administrator or Privileged Role Administrator can grant consent.

---

## Step 4: Create Client Secret

1. In the app registration, go to **Certificates & secrets** → **Client secrets** → **New client secret**
2. **Description:** `OFR Function App`
3. **Expires:** Choose an appropriate duration (e.g., 12 months or 24 months)
4. Click **Add**
5. **Immediately copy the Value** — it will not be shown again

> **Security:** Store the client secret securely. You will enter it as an Azure Function Application Setting in the next step. Never commit it to source control.

---

## Step 5: Configure Application Settings

Set the environment variables that the Azure Function reads at runtime.

### 5.1 Via Azure CLI

```bash
az functionapp config appsettings set \
  --name [AZURE-FUNCTION-APP] \
  --resource-group [AZURE-RESOURCE-GROUP] \
  --settings \
    OFR_CLIENT_ID="[APP-REGISTRATION-ID]" \
    OFR_CLIENT_SECRET="<your-client-secret>" \
    OFR_TENANT_ID="[TENANT-ID]" \
    OFR_SHAREPOINT_HOSTNAME="[TENANT].sharepoint.com" \
    OFR_SITE_PATH="/sites/OFRIssueTracker"
```

### 5.2 Via Azure Portal

1. Go to **Function App** → `[AZURE-FUNCTION-APP]` → **Configuration** → **Application settings**
2. Add each setting:

| Setting | Value |
|---------|-------|
| `OFR_CLIENT_ID` | `[APP-REGISTRATION-ID]` |
| `OFR_CLIENT_SECRET` | *(paste the client secret from Step 4)* |
| `OFR_TENANT_ID` | `[TENANT-ID]` |
| `OFR_SHAREPOINT_HOSTNAME` | `[TENANT].sharepoint.com` |
| `OFR_SITE_PATH` | `/sites/OFRIssueTracker` |

3. Click **Save** and confirm the restart

---

## Step 6: Deploy the Function Code

### 6.1 Navigate to the Function Code Directory

```bash
cd tools/azure-function
```

### 6.2 Deploy to Azure

```bash
func azure functionapp publish [AZURE-FUNCTION-APP]
```

This deploys:
- `function_app.py` — HTTP trigger entry point
- `generate_deck/` — Data fetch, transform, and PPTX generation modules
- `templates/OFR_Issue_Deck_Template.pptx` — Slide template (bundled with deployment)
- `requirements.txt` — Python dependencies (`azure-functions`, `python-pptx`, `msal`, `requests`)

Expected output:
```
Getting site publishing info...
Uploading package...
Upload completed successfully.
Deployment completed successfully.
Functions in [AZURE-FUNCTION-APP]:
    generate-deck - [httpTrigger]
```

---

## Step 7: Get the Function Key

### 7.1 Via Azure Portal

1. Go to **Function App** → `[AZURE-FUNCTION-APP]` → **Functions** → **generate-deck**
2. Click **Function Keys**
3. Copy the **default** key value

Record this as `[FUNCTION-KEY]` — you will need it when creating the Power Automate flow.

### 7.2 Via Azure CLI

```bash
az functionapp function keys list \
  --name [AZURE-FUNCTION-APP] \
  --resource-group [AZURE-RESOURCE-GROUP] \
  --function-name generate-deck
```

---

## Step 8: Test the Endpoint

### 8.1 Quick Test (Azure Portal)

1. Go to **Function App** → `[AZURE-FUNCTION-APP]` → **Functions** → **generate-deck**
2. Click **Code + Test** → **Test/Run**
3. Method: **POST**
4. Click **Run**
5. Expected: HTTP 200 with JSON response containing `status`, `filename`, `url`

### 8.2 Command Line Test

```bash
curl -X POST \
  "https://[AZURE-FUNCTION-APP].azurewebsites.net/api/generate-deck?code=[FUNCTION-KEY]" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response:
```json
{
  "status": "success",
  "filename": "OFR_Issue_Deck_2026-02-22_143015.pptx",
  "url": "https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Shared Documents/Generated Reports/OFR_Issue_Deck_2026-02-22_143015.pptx",
  "issue_count": 12,
  "generated_at": "2026-02-22T14:30:15.123456+00:00"
}
```

### 8.3 Verify the Output

1. Navigate to **SharePoint** → **OFR Issue Tracker** → **Shared Documents** → **Generated Reports**
2. Confirm the PPTX file was created
3. Open it to verify the deck contains the expected slides

---

## Step 9: Create "Generated Reports" Folder

If the folder does not already exist:

1. Go to `https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Shared Documents`
2. Click **+ New** → **Folder**
3. Name: `Generated Reports`

> **Note:** The Azure Function uploads to `Shared Documents/Generated Reports/` via the Graph API. The folder must exist before the first run.

---

## Next Steps

After completing this guide:

1. **Create the Power Automate flow** — See `02-PowerAutomate/OFR-Issue-Deck-Generator.md`
2. **Update the Power Apps button** — The `Btn_Dash_GenerateDeck` button triggers the flow (see `03-PowerApps/REBUILD-GUIDE.md`)

---

## Troubleshooting

### HTTP 500 — "Server configuration error: missing credentials"

One or more required Application Settings are missing or empty. Verify all five settings exist:
- `OFR_CLIENT_ID`, `OFR_CLIENT_SECRET`, `OFR_TENANT_ID`, `OFR_SHAREPOINT_HOSTNAME`, `OFR_SITE_PATH`

### HTTP 500 — "template not found"

The PPTX template was not included in the deployment. Verify `templates/OFR_Issue_Deck_Template.pptx` exists in the `tools/azure-function/` directory and redeploy.

### HTTP 403 — Graph API permission error

The app registration does not have the required permissions, or admin consent was not granted:
1. Verify `Sites.Read.All` and `Sites.ReadWrite.All` are listed under API permissions
2. Verify both show a green checkmark (admin consent granted)
3. After granting consent, wait 5-10 minutes for propagation

### HTTP 401 — Authentication failure

The client secret may have expired or the client ID/tenant ID is incorrect:
1. Verify `OFR_CLIENT_ID` matches the app registration's Application (client) ID
2. Verify `OFR_TENANT_ID` matches the Entra ID Directory (tenant) ID
3. Check the client secret expiry date in the app registration

### Function times out

The default timeout is 5 minutes (configured in `host.json`). If the SharePoint site has many issues (100+), the function may need more time:
1. Check `host.json` — `functionTimeout` should be `"00:05:00"`
2. For very large datasets, consider increasing to `"00:10:00"`

### PPTX uploads but is empty or corrupted

Verify the template file is not corrupted:
1. Download `templates/OFR_Issue_Deck_Template.pptx` and open it locally
2. It should open as a blank presentation with 71 layouts
3. If corrupted, re-copy from `tools/templates/OFR_Issue_Deck_Template.pptx`

---

## Cost Estimate

| Resource | SKU | Estimated Monthly Cost |
|----------|-----|----------------------|
| Function App | Consumption plan | ~$0.00 (1M free executions/month) |
| Storage Account | Standard LRS | ~$0.02 |
| App Registration | Free | $0.00 |
| **Total** | | **<$0.10/month** |

The Consumption plan includes 1 million free executions and 400,000 GB-seconds per month. The OFR deck generation (triggered manually, ~1-5 times/week) uses a negligible fraction of this allowance.
