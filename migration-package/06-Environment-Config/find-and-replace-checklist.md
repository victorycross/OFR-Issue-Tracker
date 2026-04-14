# OFR Issue Tracker — Find-and-Replace Checklist

Use this checklist when deploying to a new environment. Replace all placeholder values with your actual environment values from `ENVIRONMENT-VARIABLES.md`.

---

## Placeholders

| Placeholder | Replace With | Example |
|-------------|-------------|---------|
| `[TENANT]` | Your M365 tenant prefix | `contoso` |
| `[TENANT-DOMAIN]` | Your primary domain | `contoso.com` |
| `[ADMIN-EMAIL]` | Your admin account email | `admin@contoso.com` |
| `[ADMIN-DISPLAY-NAME]` | Your admin display name | `Jane Smith` |
| `[M365-GROUP]` | Your M365 group name | `OFR Issue Tracker Members` |

### Phase 2 — Azure Function Placeholders (Optional)

Only replace these if deploying the Issue Deck Generator (Azure Function).

| Placeholder | Replace With | Example |
|-------------|-------------|---------|
| `[TENANT-ID]` | Your Entra ID tenant GUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `[AZURE-SUBSCRIPTION]` | Your Azure subscription name | `My Azure Subscription` |
| `[AZURE-RESOURCE-GROUP]` | Resource group name | `rg-ofr-issuetracker` |
| `[AZURE-STORAGE-ACCOUNT]` | Storage account name (globally unique) | `stofrissuetracker` |
| `[AZURE-FUNCTION-APP]` | Function App name (globally unique) | `func-ofr-issuetracker` |
| `[AZURE-REGION]` | Azure region | `eastus` |
| `[APP-REGISTRATION-NAME]` | Entra ID app registration name | `OFR Issue Tracker API` |
| `[APP-REGISTRATION-ID]` | App registration Client ID (auto-generated) | `xxxxxxxx-xxxx-...` |
| `[FUNCTION-KEY]` | Function-level auth key (auto-generated) | *(recorded after deployment)* |

### Auto-Generated Placeholders (Do Not Replace)

| Placeholder | Notes |
|-------------|-------|
| `[AUTO-GENERATED-APP-ID]` | Power Apps App ID — assigned on creation |
| `[AUTO-GENERATED-LIST-GUID]` | SharePoint List GUID — assigned on creation |
| `[AUTO-GENERATED-FLOW-ID]` | Power Automate Flow ID — assigned on creation |
| `[APP-REGISTRATION-ID]` | Entra ID Client ID — assigned on app registration |
| `[FUNCTION-KEY]` | Azure Function auth key — assigned on deployment |

---

## File-by-File Checklist

### 01-SharePoint/

| File | Placeholders to Replace | Status |
|------|------------------------|--------|
| `CREATE-SITE.md` | `[TENANT]` | [ ] |

### 02-PowerAutomate/

| File | Placeholders to Replace | Status |
|------|------------------------|--------|
| `OFR-Daily-Staleness-Calculator.md` | `[TENANT]` | [ ] |
| `OFR-Intake-Promotion.md` | `[TENANT]` | [ ] |
| `OFR-Issue-Deck-Generator.md` | `[TENANT]`, `[TENANT-ID]`, `[AZURE-FUNCTION-APP]`, `[FUNCTION-KEY]` | [ ] Phase 2 |

> **Note:** The flow expression `.txt` files do NOT contain any environment-specific values. They are ready to use as-is.

### 03-PowerApps/

| File | Placeholders to Replace | Status |
|------|------------------------|--------|
| `REBUILD-GUIDE.md` | `[TENANT]` | [ ] |
| `OFR-PowerApps-Completion-Guide.md` | *(Contains no environment-specific URLs — formulas reference data source names, not URLs)* | No changes needed |

### 04-Documentation/

| File | Placeholders to Replace | Status |
|------|------------------------|--------|
| `OFR-SDD.md` | `[TENANT]`, `[TENANT-DOMAIN]`, `[ADMIN-EMAIL]`, `[AUTO-GENERATED-*]` | [ ] Already neutralized |
| `OFR-Completion-Guide.md` | `[TENANT]`, `[TENANT-DOMAIN]`, `[ADMIN-EMAIL]`, `[AUTO-GENERATED-*]` | [ ] Already neutralized |
| `OFR-Test-Plan.md` | *(Verify — may contain no environment refs)* | [ ] Check |
| `OFR-User-Guide.md` | *(Verify — may contain no environment refs)* | [ ] Check |
| `OFR-Tear-Sheet.html` | *(Verify — may contain no environment refs)* | [ ] Check |

### 05-Reference-Docs/

| File | Placeholders to Replace | Status |
|------|------------------------|--------|
| All files | *(Reference only — no substitution needed. These are original artifacts.)* | No changes needed |

### 06-Environment-Config/

| File | Placeholders to Replace | Status |
|------|------------------------|--------|
| `ENVIRONMENT-VARIABLES.md` | Fill in the "Your Value" column | [ ] |
| `Azure-Function-Setup.md` | `[TENANT]`, `[TENANT-ID]`, `[AZURE-*]`, `[APP-REGISTRATION-*]` | [ ] Phase 2 |

### Azure Function Code (`tools/azure-function/`)

These files use **environment variables** rather than inline placeholders. Set values in Azure Application Settings (or `local.settings.json` for local dev) — no find-and-replace needed.

| Setting | Where to Set | Notes |
|---------|-------------|-------|
| `OFR_CLIENT_ID` | Application Settings / `local.settings.json` | From `[APP-REGISTRATION-ID]` |
| `OFR_CLIENT_SECRET` | Application Settings | Create in Entra ID app registration |
| `OFR_TENANT_ID` | Application Settings / `local.settings.json` | From `[TENANT-ID]` |
| `OFR_SHAREPOINT_HOSTNAME` | Application Settings / `local.settings.json` | `[TENANT].sharepoint.com` |
| `OFR_SITE_PATH` | Application Settings / `local.settings.json` | Default: `/sites/OFRIssueTracker` |

---

## Quick Find-and-Replace Commands

If you prefer to do bulk replacements from a terminal, you can use these commands (replace the values on the right side with your actual values):

```bash
# Navigate to the package directory
cd OFR-Migration-Package

# ── Phase 1: Core M365 placeholders ──

# Replace [TENANT] in all .md files
find . -name "*.md" -exec sed -i '' 's|\[TENANT\]|contoso|g' {} +

# Replace [TENANT-DOMAIN] in all .md files
find . -name "*.md" -exec sed -i '' 's|\[TENANT-DOMAIN\]|contoso.com|g' {} +

# Replace [ADMIN-EMAIL] in all .md files
find . -name "*.md" -exec sed -i '' 's|\[ADMIN-EMAIL\]|admin@contoso.com|g' {} +

# Replace [ADMIN-DISPLAY-NAME] in all .md files
find . -name "*.md" -exec sed -i '' 's|\[ADMIN-DISPLAY-NAME\]|Jane Smith|g' {} +
```

### Phase 2: Azure Function Placeholders (Optional)

Only run these if deploying the Issue Deck Generator:

```bash
# Replace [TENANT-ID] (Entra ID tenant GUID)
find . -name "*.md" -exec sed -i '' 's|\[TENANT-ID\]|xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx|g' {} +

# Replace [AZURE-SUBSCRIPTION]
find . -name "*.md" -exec sed -i '' 's|\[AZURE-SUBSCRIPTION\]|My Azure Subscription|g' {} +

# Replace [AZURE-RESOURCE-GROUP]
find . -name "*.md" -exec sed -i '' 's|\[AZURE-RESOURCE-GROUP\]|rg-ofr-issuetracker|g' {} +

# Replace [AZURE-STORAGE-ACCOUNT]
find . -name "*.md" -exec sed -i '' 's|\[AZURE-STORAGE-ACCOUNT\]|stofrissuetracker|g' {} +

# Replace [AZURE-FUNCTION-APP]
find . -name "*.md" -exec sed -i '' 's|\[AZURE-FUNCTION-APP\]|func-ofr-issuetracker|g' {} +

# Replace [AZURE-REGION]
find . -name "*.md" -exec sed -i '' 's|\[AZURE-REGION\]|eastus|g' {} +

# Replace [APP-REGISTRATION-NAME]
find . -name "*.md" -exec sed -i '' 's|\[APP-REGISTRATION-NAME\]|OFR Issue Tracker API|g' {} +
```

> **Warning:** Do NOT replace `[AUTO-GENERATED-*]`, `[APP-REGISTRATION-ID]`, or `[FUNCTION-KEY]` placeholders. These values are assigned by the platform when you create the components and cannot be pre-set.

---

## Verification After Replacement

After completing all replacements:

```bash
# Check for any remaining Phase 1 placeholders
grep -r '\[TENANT\]\|\[TENANT-DOMAIN\]\|\[ADMIN-EMAIL\]\|\[ADMIN-DISPLAY-NAME\]' . --include="*.md"

# Check for any remaining Phase 2 placeholders (if Azure Function was deployed)
grep -r '\[TENANT-ID\]\|\[AZURE-SUBSCRIPTION\]\|\[AZURE-RESOURCE-GROUP\]\|\[AZURE-STORAGE-ACCOUNT\]\|\[AZURE-FUNCTION-APP\]\|\[AZURE-REGION\]\|\[APP-REGISTRATION-NAME\]' . --include="*.md"
```

Both commands should return zero results (excluding this checklist file itself and the `ENVIRONMENT-VARIABLES.md` file).

> **Tip:** Auto-generated placeholders (`[AUTO-GENERATED-*]`, `[APP-REGISTRATION-ID]`, `[FUNCTION-KEY]`) are expected to remain — they are filled in after component creation.
