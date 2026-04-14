# OFR Issue Tracker — Environment Variables

Fill in this table with your target environment values before deploying.

## Required Substitutions

| Placeholder | Your Value | Description |
|-------------|-----------|-------------|
| `[TENANT]` | __________ | M365 tenant prefix (e.g., `contoso`). This is the subdomain in `contoso.sharepoint.com`. |
| `[TENANT-DOMAIN]` | __________ | Primary email domain (e.g., `contoso.com`). Used for admin email addresses. |
| `[ADMIN-EMAIL]` | __________ | Admin account email for Power Platform connections (e.g., `admin@contoso.com`). |
| `[ADMIN-DISPLAY-NAME]` | __________ | Display name of the admin account (e.g., `Jane Smith`). Used in sample data. |
| `[M365-GROUP]` | `OFR Issue Tracker Members` | M365 security group for site access. Auto-created with the SharePoint team site. Change if using a different group name. |

## Azure Function Placeholders (Phase 2 — Optional)

Only fill in this section if deploying the Issue Deck Generator (Azure Function).

| Placeholder | Your Value | Description |
|-------------|-----------|-------------|
| `[TENANT-ID]` | __________ | Azure AD / Entra ID tenant GUID. Find in Azure Portal → Entra ID → Overview. |
| `[AZURE-SUBSCRIPTION]` | __________ | Azure subscription name for OFR resources. |
| `[AZURE-RESOURCE-GROUP]` | `rg-ofr-issuetracker` | Resource group name. Default suggested. |
| `[AZURE-STORAGE-ACCOUNT]` | `stofrissuetracker` | Storage account name. Must be globally unique, 3-24 lowercase alphanumeric. |
| `[AZURE-FUNCTION-APP]` | `func-ofr-issuetracker` | Function App name. Must be globally unique. Forms the URL: `https://[name].azurewebsites.net`. |
| `[AZURE-REGION]` | __________ | Azure region (e.g., `eastus`, `westeurope`, `australiaeast`). |
| `[APP-REGISTRATION-NAME]` | `OFR Issue Tracker API` | Display name for the Entra ID app registration. |
| `[APP-REGISTRATION-ID]` | __________ | Client ID of the app registration (auto-generated — record after creation). |
| `[FUNCTION-KEY]` | __________ | Function-level auth key (auto-generated — record after deployment). |

## Derived URLs (Computed from Above)

| URL | Value |
|-----|-------|
| SharePoint Site | `https://[TENANT].sharepoint.com/sites/OFRIssueTracker` |
| OFR_Issues List | `https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Lists/OFR_Issues` |
| OFR_UpdateHistory List | `https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Lists/OFR_UpdateHistory` |
| OFR_IntakeQueue List | `https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Lists/OFR_IntakeQueue` |
| Power Apps Studio | `https://make.powerapps.com` |
| Power Automate | `https://make.powerautomate.com` |

### Azure Derived URLs (Phase 2)

| URL | Value |
|-----|-------|
| Azure Function Endpoint | `https://[AZURE-FUNCTION-APP].azurewebsites.net/api/generate-deck` |
| Azure Portal Resource Group | `https://portal.azure.com → Resource groups → [AZURE-RESOURCE-GROUP]` |
| Function App Portal | `https://portal.azure.com → Function App → [AZURE-FUNCTION-APP]` |

## Auto-Generated IDs (Do Not Pre-Set)

The following identifiers are automatically generated when components are created. You do **not** need to set these — they will be assigned by the platform. Record them here after creation for your reference.

| Component | New ID |
|-----------|--------|
| Power Apps App ID | *(recorded after app creation)* |
| OFR_Issues List GUID | *(recorded after list creation)* |
| OFR_UpdateHistory List GUID | *(recorded after list creation)* |
| OFR_IntakeQueue List GUID | *(recorded after list creation)* |
| Staleness Calculator Flow ID | *(recorded after flow creation)* |
| Intake Promotion Flow ID | *(recorded after flow creation)* |
| Issue Deck Generator Flow ID | *(recorded after flow creation — Phase 2)* |
| App Registration Client ID | *(recorded after app registration — Phase 2)* |
| App Registration Client Secret | *(store securely after creation — Phase 2)* |
| Function Key (default) | *(recorded after function deployment — Phase 2)* |

## Original Environment Reference

For reference, the original deployment used these values:

| Placeholder | Original Value |
|-------------|---------------|
| `[TENANT]` | `papercutscafe` |
| `[TENANT-DOMAIN]` | `papercuts.cafe` |
| `[ADMIN-EMAIL]` | `david@papercuts.cafe` |
| `[ADMIN-DISPLAY-NAME]` | `David` |
| Power Apps App ID | `0fbbc26c-ad71-476a-bcfc-edc0d7989533` |
| OFR_Issues List GUID | `a70da6a6-1f0a-4fd3-bb4e-cf7847e18a99` |
| Staleness Flow ID | `aefb8de0-35fe-4d5d-a629-ddd8502ee5aa` |
| Intake Promotion Flow ID | `1c631640-113f-4602-805e-1d693582de8c` |
| `[TENANT-ID]` | `2ed6f0bd-7701-49b6-80d5-e7ea9667ac3e` |
| `[AZURE-SUBSCRIPTION]` | `Bright Path Technology` |
| `[AZURE-RESOURCE-GROUP]` | `rg-ofr-issuetracker` |
| `[AZURE-STORAGE-ACCOUNT]` | `stofrissuetracker` |
| `[AZURE-FUNCTION-APP]` | `func-ofr-issuetracker` |
| `[AZURE-REGION]` | `australiaeast` |
| `[APP-REGISTRATION-NAME]` | `Bright Path Risk Tracker` |
| `[APP-REGISTRATION-ID]` | `7570df18-68fe-47be-9305-7f6476909ebb` |
| Issue Deck Generator Flow ID | `718dd979-d1e9-497a-b9ec-fa49152c7963` |

## Licensing Requirements

| Component | License Required |
|-----------|-----------------|
| SharePoint Online | M365 Business Standard (included) |
| Power Apps | Power Apps Developer Plan (free) or Power Apps per-user |
| Power Automate | Power Automate Free (included with M365) |
| Azure Function (Phase 2) | Azure Subscription — Consumption plan (~free for this workload: <$0.10/month) |
