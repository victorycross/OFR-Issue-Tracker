# OFR Issue Deck Generator — Flow Rebuild Guide

> **Prerequisites:**
> 1. The Azure Function `[AZURE-FUNCTION-APP]` must be deployed and working. See `06-Environment-Config/Azure-Function-Setup.md`.
> 2. You must have the Azure Function URL and function key (`[FUNCTION-KEY]`).

---

## Flow Overview

| Property | Value |
|----------|-------|
| Name | `OFR Generate Issue Deck` |
| Type | Instant cloud flow |
| Trigger | Power Apps (V2) — no inputs |
| Output | `ResultStatus` (Text), `FileName` (Text), `FileURL` (Text) |
| Purpose | Triggers PPTX deck generation via Azure Function, returns file details to Power Apps |
| Connections | HTTP (built-in) |

### What This Flow Does

1. Sends an HTTP POST to the Azure Function `generate-deck` endpoint
2. Parses the JSON response (status, filename, URL)
3. Returns the result to Power Apps for user notification

### Architecture

```
Power Apps "Generate Issue Deck" button
    │
    ▼
Power Automate Flow "OFR Generate Issue Deck"
    │  (instant, Power Apps V2 trigger)
    ▼
HTTP POST → Azure Function /api/generate-deck
    │
    ├── 1. Reads OFR_Issues + OFR_UpdateHistory from SharePoint (Graph API)
    ├── 2. Generates PPTX deck in memory (python-pptx, ~51 slides)
    └── 3. Uploads PPTX to SharePoint: Shared Documents/Generated Reports/
    │
    ▼
Returns JSON → { status, filename, url, issue_count, generated_at }
    │
    ▼
Power Apps: Success notification + opens file link
```

---

## Step-by-Step Build Instructions

### 1. Create the Flow

1. Navigate to `https://make.powerautomate.com`
2. Click **+ Create** → **Instant cloud flow**
3. Flow name: `OFR Generate Issue Deck`
4. Select trigger: **PowerApps (V2)**
5. Click **Create**

### 2. Configure the Trigger — Power Apps (V2)

1. Click the trigger to expand it
2. No inputs are needed — the flow will not receive any parameters from Power Apps
3. Leave the trigger as-is with no inputs configured

### 3. Add Action — HTTP (Call Azure Function)

1. Click **+ New step**
2. Search for **HTTP** → select **HTTP** (the built-in action, not a connector)
3. Configure:
   - **Method:** `POST`
   - **URI:** `https://[AZURE-FUNCTION-APP].azurewebsites.net/api/generate-deck`
   - **Headers:**
     | Key | Value |
     |-----|-------|
     | `x-functions-key` | `[FUNCTION-KEY]` |
     | `Content-Type` | `application/json` |
   - **Body:** (leave empty — the function requires no input)

> **Finding your Function Key:** In the Azure Portal, navigate to your Function App → Functions → `generate_deck` → Function Keys → copy the `default` key.

> **Timeout consideration:** The Azure Function may take 15–45 seconds to complete (fetching data, generating 51 slides, uploading). The default HTTP action timeout is 100 seconds, which is sufficient. If needed, you can increase it in the action settings.

### 4. Add Action — Parse JSON (Parse Response)

1. Click **+ New step**
2. Search for **Data Operations** → select **Parse JSON**
3. Configure:
   - **Content:** Select `Body` from the HTTP action's dynamic content
   - **Schema:** Click "Use sample payload to generate schema" and paste:

```json
{
    "status": "success",
    "filename": "OFR_Issue_Deck_2026-02-22_143015.pptx",
    "url": "https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Shared Documents/Generated Reports/OFR_Issue_Deck_2026-02-22_143015.pptx",
    "issue_count": 18,
    "generated_at": "2026-02-22T14:30:15.123456+00:00"
}
```

This generates the schema:

```json
{
    "type": "object",
    "properties": {
        "status": { "type": "string" },
        "filename": { "type": "string" },
        "url": { "type": "string" },
        "issue_count": { "type": "integer" },
        "generated_at": { "type": "string" }
    }
}
```

### 5. Add Action — Condition (Check Status)

1. Click **+ New step**
2. Search for **Control** → select **Condition**
3. Configure the condition:
   - **Left value:** Select `status` from Parse JSON dynamic content
   - **Operator:** `is equal to`
   - **Right value:** `success`

### 6. Configure the **If yes** Branch

1. In the **If yes** branch, click **Add an action**
2. Search for **Power Apps** → select **Respond to a PowerApp or flow**
3. Click **+ Add an output** three times:
   - **Text** → Name: `ResultStatus` → Value: Select `status` from Parse JSON
   - **Text** → Name: `FileName` → Value: Select `filename` from Parse JSON
   - **Text** → Name: `FileURL` → Value: Select `url` from Parse JSON

### 7. Configure the **If no** Branch

1. In the **If no** branch, click **Add an action**
2. Search for **Power Apps** → select **Respond to a PowerApp or flow**
3. Click **+ Add an output** three times:
   - **Text** → Name: `ResultStatus` → Value: `error`
   - **Text** → Name: `FileName` → Value: (leave empty)
   - **Text** → Name: `FileURL` → Value: (leave empty)

### 8. Save and Test

1. Click **Save** in the top-right corner
2. Click **Test** → **Manually** → **Test**
3. The flow will run and call the Azure Function
4. Verify:
   - The flow completes successfully
   - The response contains a valid filename and URL
   - A new PPTX file appears in SharePoint: `Shared Documents/Generated Reports/`

---

## Power Apps Integration

### Update `Btn_Dash_GenerateDeck` OnSelect

Replace the current formula with:

```
UpdateContext({varDeckGenerating: true});
Set(
    varDeckResult,
    OFRGenerateIssueDeck.Run()
);
UpdateContext({varDeckGenerating: false});
If(
    varDeckResult.resultstatus = "success",
    Notify(
        "Issue Deck generated: " & varDeckResult.filename,
        NotificationType.Success
    );
    Launch(varDeckResult.fileurl),
    Notify(
        "Deck generation failed. Please try again.",
        NotificationType.Error
    )
)
```

> **Note:** `OFRGenerateIssueDeck` is the name Power Apps assigns to the flow connection. The exact name may vary — check the flow name in the Power Apps action menu.

### Add Loading Indicator

1. Add a **Label** control on DashboardScreen:
   - **Name:** `Lbl_Dash_DeckLoading`
   - **Text:** `"Generating Issue Deck... This may take 30-45 seconds."`
   - **Visible:** `varDeckGenerating`
   - **Color:** `RGBA(65,83,133,1)` (Appkit Blue)
   - **Font size:** 12
   - **Font weight:** `Bold`
   - Position: Below or near `Btn_Dash_GenerateDeck`

2. Update `Btn_Dash_GenerateDeck` **DisplayMode:**
   ```
   If(varDeckGenerating, DisplayMode.Disabled, DisplayMode.Edit)
   ```

3. Add to **DashboardScreen** `OnVisible`:
   ```
   UpdateContext({varDeckGenerating: false})
   ```

---

## Connecting the Flow to Power Apps

1. In Power Apps Studio, select `Btn_Dash_GenerateDeck`
2. Go to **Action** menu (top toolbar) → **Power Automate**
3. In the Power Automate panel, find and select `OFR Generate Issue Deck`
4. This adds the flow as a data source accessible via `OFRGenerateIssueDeck.Run()`
5. Update the OnSelect formula as shown above
6. Save and publish the app

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Flow fails with HTTP 401 | Check the function key in the HTTP action headers |
| Flow fails with HTTP 500 | Check Azure Function logs in Application Insights. Common causes: missing env vars, expired client secret, SharePoint permissions |
| Flow times out | The Azure Function has a 5-minute timeout. If data volume is very large, check Application Insights for bottlenecks |
| Power Apps shows "Deck generation failed" | Run the flow manually in Power Automate to see the error details |
| PPTX not appearing in SharePoint | Check that the Azure AD app registration has `Sites.ReadWrite.All` permission with admin consent |
| Power Apps can't find the flow | Ensure the flow is saved, enabled, and in the same environment as the Power App |

---

## Azure Function Details

| Property | Value |
|----------|-------|
| Function App Name | `[AZURE-FUNCTION-APP]` |
| Runtime | Python 3.11 |
| Plan | Consumption (serverless) |
| Endpoint | `POST /api/generate-deck` |
| Auth Level | Function (key required) |
| Timeout | 5 minutes |
| Expected Duration | 15–45 seconds |
| Output File Location | `Shared Documents/Generated Reports/` |
| Filename Pattern | `OFR_Issue_Deck_YYYY-MM-DD_HHMMSS.pptx` |

### Application Settings (Environment Variables)

| Setting | Description |
|---------|-------------|
| `OFR_CLIENT_ID` | Azure AD app registration client ID (`[APP-REGISTRATION-ID]`) |
| `OFR_CLIENT_SECRET` | App registration client secret |
| `OFR_TENANT_ID` | Azure AD / Entra ID tenant GUID (`[TENANT-ID]`) |
| `OFR_SHAREPOINT_HOSTNAME` | SharePoint hostname (`[TENANT].sharepoint.com`) |
| `OFR_SITE_PATH` | SharePoint site path (default: `/sites/OFRIssueTracker`) |

### Required Azure AD Permissions (Application)

| Permission | Type | Purpose |
|------------|------|---------|
| `Sites.Read.All` | Application | Read SharePoint list data (issues + updates) |
| `Sites.ReadWrite.All` | Application | Upload PPTX to SharePoint document library |

---

## Response Schema

### Success (HTTP 200)

```json
{
    "status": "success",
    "filename": "OFR_Issue_Deck_2026-02-22_143015.pptx",
    "url": "https://[TENANT].sharepoint.com/...",
    "issue_count": 18,
    "generated_at": "2026-02-22T14:30:15.123456+00:00"
}
```

### Error (HTTP 500)

```json
{
    "status": "error",
    "message": "Description of what went wrong"
}
```
