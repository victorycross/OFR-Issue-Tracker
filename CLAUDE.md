# OFR Issue Tracker — Claude Project Memory

## Project Overview

This is the **OFR Issue Tracker**, an M365-native Power Apps canvas application for managing cross-firm risk issues through their full lifecycle. It replaces a previous React/Vite SPA and runs entirely within the Microsoft 365 ecosystem (SharePoint Online + Power Apps + Power Automate).

**Environment:**
- Tenant: Bright Path Technology (papercutscafe)
- Tenant ID: `2ed6f0bd-7701-49b6-80d5-e7ea9667ac3e`
- Environment: papercuts.cafe (default)
- Power Apps App ID: `0fbbc26c-ad71-476a-bcfc-edc0d7989533`
- SharePoint Site: https://papercutscafe.sharepoint.com/sites/OFRIssueTracker
- Azure Subscription: Bright Path Technology (`2a362a99-e5da-4c29-b806-64f2acf6bee1`)
- Azure Function App: `func-ofr-issuetracker` (Resource Group: `rg-ofr-issuetracker`, Australia East)
- App Registration: Bright Path Risk Tracker (AppId: `7570df18-68fe-47be-9305-7f6476909ebb`)

## Architecture (4-Tier)

1. **Data Layer** — SharePoint Online lists: `OFR_Issues`, `OFR_UpdateHistory`, `OFR_IntakeQueue`
2. **UI Layer** — Power Apps Canvas App with 7 screens
3. **Automation Layer** — Power Automate cloud flows (Daily Staleness Calculator, Intake Promotion, Issue Deck Generator)
4. **Backend Layer** — Azure Function (Python 3.11, Consumption plan) for PPTX deck generation

## Screens & Element Naming Convention

All UI controls follow the naming convention: **`{Type}_{Screen}_{Purpose}`**

**Type prefixes:** `Btn_`, `Lbl_`, `Dd_`, `Txt_`, `Rect_`, `Gal_`
**Screen shorthand:** `Tracker`, `Detail`, `Submit`, `Group`, `Kanban`, `Dash`, `Closed`

### Navigation Pattern

All 7 screens use a **unified hamburger navigation menu**:
- **Header:** Orange bar (`RGBA(208,74,2,1)`, 55px) with ☰ hamburger button (left), screen title (centre-left), "+ Submit New Issue" CTA (right)
- **Dropdown:** 6 nav items (Dashboard, Issue Tracker, Group Allocation, Kanban Board, Closed Items, Submit New Issue) with current-screen highlighting. Dropdown height: 264px (6 items × 44px, Y positions: 55, 100, 145, 190, 235, 280)
- **Back buttons:** IssueDetailScreen ("< Tracker") and SubmitScreen ("< Dashboard") have back buttons between hamburger and title
- **Context variable:** `varShowNav` controls dropdown visibility; reset to `false` in each screen's `OnVisible`
- **10 controls per screen, 70 total:** `Btn_{Screen}_HamburgerMenu`, `Rect_{Screen}_NavOverlay`, `Rect_{Screen}_NavDropdown`, 6 nav buttons (`NavDashboard`, `NavTracker`, `NavGroupAlloc`, `NavKanban`, `NavClosed`, `NavSubmit`), `Btn_{Screen}_SubmitCTA`

### Screen Summary

| Screen | Shorthand | Purpose | Element Count |
|--------|-----------|---------|---------------|
| DashboardScreen | Dash | KPI overview, intake triage, navigation hub | ~20+ (+ 10 nav) |
| TrackerScreen | Tracker | Sortable/filterable issue table with quick-update panel | 11 renamed (+ 10 nav) |
| IssueDetailScreen | Detail | Full issue view with update history and add-update form | 12 renamed (+ 10 nav + back) |
| SubmitScreen | Submit | Intake submission form | 19 renamed (+ 10 nav + back) — includes Dd_Submit_FuncGroup, Txt_Submit_PrevRef |
| GroupAllocationScreen | Group | Colour-coded card grid showing open issues per functional group (4-4-2 layout, 10 groups) | 36 renamed (+ 10 nav) |
| KanbanScreen | Kanban | 4-column board (New, Active, Escalated, Monitoring) | 14 renamed (+ 10 nav) |
| ClosedScreen | Closed | Searchable list of closed issues with drill-through to detail | Gallery + search (+ 10 nav) |

### Key Functional Groups (10)

Risk Management Office (RMO), Engagement Risk (EngRisk), Client Risk and KYC (ClientRisk), Technology Risk & AI Trust (TechRisk), OGC Contracts (OGCContract), OGC Privacy (OGCPrivacy), Internal Audit (IntAudit), National Security (NatSec), OGC General Counsel (OGCCounsel), Independence (Indep)

## Project Directory Structure

```
~/Projects/OFR-Issue-Tracker/
├── CLAUDE.md                          ← This file (project memory for Claude Code)
├── .claude/settings.local.json        ← Claude Code permissions
├── docs/                              ← Current (latest) documentation
│   ├── OFR-SDD.md                     ← System Design Document
│   ├── OFR-PowerApps-Completion-Guide.md  ← Power Apps build guide (SINGLE-LINE file, use sed)
│   ├── OFR-User-Guide.md             ← End-user guide
│   ├── OFR-Test-Plan.md              ← 76-case test plan
│   ├── OFR-Completion-Guide.md       ← Build summary
│   ├── OFR-Appkit4-Colour-Map.md     ← Appkit4 design system colours
│   └── OFR-Tear-Sheet.html           ← One-page tear sheet
├── migration-package/                 ← Latest migration package (for deploying to new tenants)
│   ├── README-INSTALL.md
│   ├── 01-SharePoint/                 ← List schemas, sample data, site creation guide
│   ├── 02-PowerAutomate/             ← Flow rebuild guides + expressions
│   ├── 03-PowerApps/                 ← App rebuild guide + completion guide snapshot
│   ├── 04-Documentation/             ← Doc snapshots at package time
│   ├── 05-Reference-Docs/            ← BRD, Exec Outline, Playbook, Word/HTML exports
│   └── 06-Environment-Config/        ← Environment variables, find-and-replace checklist
├── migration-package-v1/              ← Archive of v1 migration package
├── reference/                         ← Supporting reference materials
│   ├── design-artifacts/              ← Use case templates, process maps, metrics
│   ├── *.html                         ← BRD, SDD, Exec Outline (HTML renders)
│   ├── *.docx                         ← Solution Overview, User Guide (Word exports)
│   └── US_Quick_Suite_SDD_extracted.txt
├── screenshots/                       ← App screenshots (legacy React app)
├── tools/                             ← Utility scripts
│   ├── create_ofr_template.py         ← One-time: strip corporate PPTX to clean template
│   ├── generate_issue_deck.py         ← Generate OFR Issue Deck PPTX from JSON
│   ├── export_ofr_data.py             ← Export SharePoint OFR_Issues → JSON via Graph API
│   ├── generate_solution_overview_docx.py
│   ├── generate_user_guide_docx.py
│   ├── capture-screenshots.mjs        ← Puppeteer screenshot script
│   ├── templates/
│   │   └── OFR_Issue_Deck_Template.pptx  ← Clean PwC template (71 layouts, 0 slides)
│   ├── sample-data/
│   │   └── ofr_issues_sample.json     ← 18 test issues for deck generation
│   ├── azure-function/                ← Azure Function for automated deck generation
│   │   ├── function_app.py           ← HTTP trigger entry point (POST /api/generate-deck)
│   │   ├── generate_deck/
│   │   │   ├── __init__.py
│   │   │   ├── export_data.py        ← SharePoint data fetch + upload (library form)
│   │   │   └── generate_deck.py      ← PPTX generation (library form, returns bytes)
│   │   ├── templates/
│   │   │   └── OFR_Issue_Deck_Template.pptx
│   │   ├── requirements.txt          ← azure-functions, python-pptx, msal, requests
│   │   ├── host.json                 ← functionTimeout: 5 min
│   │   ├── local.settings.json       ← Local dev (gitignored)
│   │   └── .gitignore
│   ├── package.json
│   └── package-lock.json
└── legacy-react-app/                  ← Previous React/Vite SPA (replaced by Power Apps)
    ├── src/
    ├── index.html
    └── ...
```

## Documentation Files

All docs live in `docs/`. Key files:

| File | Purpose | Notes |
|------|---------|-------|
| `docs/OFR-SDD.md` | System Design Document | Full architecture, data model, screen specs, flow details |
| `docs/OFR-PowerApps-Completion-Guide.md` | Step-by-step Power Apps build guide | Very large (~43K tokens). **Single-line file** — use `sed` for edits, not `Edit` tool |
| `docs/OFR-User-Guide.md` | End-user guide | No internal control names — written for end users |
| `docs/OFR-Test-Plan.md` | 76-case test plan | Covers all functionality |
| `docs/OFR-Completion-Guide.md` | Build summary | Shorter overview |
| `docs/OFR-Appkit4-Colour-Map.md` | Appkit4 design system colour reference | RGBA values for all UI elements |

## Power Apps Browser Automation Notes

When editing Power Apps via Chrome MCP tools:

- **Tab ID** may change between sessions — always call `tabs_context_mcp` first
- **Tree view navigation:** Double-click element name to enter edit mode → `Cmd+A` to select all → type new name → `Enter` to confirm
- **Tree view scrolling:** Arrow keys work; mouse scroll does NOT work on the tree view panel
- **Saving:** `Cmd+S` to save the app
- **Element identification:** Click an element in the tree to highlight it on canvas and see its formula in the formula bar
- **GroupAllocationScreen cards:** Elements are numbered in reverse order in the tree (e.g., `_10` = Independence at bottom-right, `_1` = RMO at top-left). Some used abbreviated suffixes (`_TR`, `_CR`, `_ER`, `_RMO`)

## Design System (Appkit4)

| Colour | RGBA | Usage |
|--------|------|-------|
| Primary Blue | `RGBA(65,83,133,1)` | Headers, Current staleness, Low priority |
| Primary Orange | `RGBA(208,74,2,1)` | Header bar fill, Active status, CTA buttons |
| Primary Red | `RGBA(224,48,30,1)` | Stale staleness, Escalated status, High priority |
| Orange Lighter | `RGBA(228,92,43,1)` | Aging staleness, Monitoring status |
| Neutral Black | `RGBA(45,45,45,1)` | Body text |

**Button interaction colours:**
- Orange CTA: PressedFill `RGBA(167,69,44,1)`, HoverFill `RGBA(195,76,47,1)`
- Back/Close: PressedFill `RGBA(210,215,226,1)`, HoverFill `RGBA(240,240,240,1)`
- Gray Secondary: PressedFill `RGBA(160,160,160,1)`, HoverFill `RGBA(200,200,200,1)`

## Data Model Quick Reference

### OFR_Issues (primary)
Key columns: `ItemID` (OFR-NNN), `Title`, `Owner`, `Priority` (High/Medium/Low), `Status` (New/Active/Monitoring/Escalated/Closed), `FunctionalGroup` (10 choices), `DateRaised`, `LastUpdated`, `DaysSinceUpdate`, `StalenessFlag` (Current/Aging/Stale), `NextAction`

### OFR_UpdateHistory (audit trail)
Key columns: `ParentItemID`, `UpdateDate`, `StatusAtUpdate`, `Notes`, `UpdatedBy`

### OFR_IntakeQueue (triage)
Key columns: `Title`, `Owner`, `Priority`, `Description`, `DateSubmitted`, `TriageStatus` (Pending/Promoted/Dismissed/Accepted/Rejected), `FunctionalGroup`, `RelatedOFRIssue`

## Power Automate Flows

| Flow | ID | Trigger | Purpose |
|------|----|---------|---------|
| Daily Staleness Calculator | `aefb8de0-35fe-4d5d-a629-ddd8502ee5aa` | Daily 6AM UTC | Calculates DaysSinceUpdate and StalenessFlag for all open issues |
| Intake Promotion | `1c631640-113f-4602-805e-1d693582de8c` | Power Apps V2 | Promotes intake items → creates issue + audit entry + updates intake status |
| OFR Generate Issue Deck | `718dd979-d1e9-497a-b9ec-fa49152c7963` | Power Apps V2 | Calls Azure Function to generate PPTX deck, returns filename + URL to Power Apps |

## Staleness Thresholds

| Days Since Update | Flag | Colour |
|-------------------|------|--------|
| 0–7 | Current | Blue |
| 8–14 | Aging | Orange |
| 15+ | Stale | Red |

## Completed Work Log

### Element Renaming (all 6 screens — completed)
- TrackerScreen: 11 renames
- IssueDetailScreen: 12 renames
- SubmitScreen: 17 renames
- GroupAllocationScreen: 36 renames (5 header + 31 card elements across 10 functional groups)
- DashboardScreen: 4 renames (TextInput6→Txt_Dash_IntakeNotes, Rectangle2→Rect_Dash_IntakePanel, HeaderBar→Rect_Dash_HeaderBar, Gallery1→Gal_Dash_IntakeQueue)
- KanbanScreen: 14 renames (nav buttons, header, column labels, 4 galleries)

### Hamburger Navigation Menu (all 6 screens — completed)
- Replaced two header patterns (Full Navigation Bar + Incident View Header) with unified hamburger menu
- 9 new controls per screen (54 total): hamburger button, overlay, dropdown panel, 5 nav buttons, submit CTA
- 16 old inline nav buttons removed across all screens
- `varShowNav` context variable added to all screens' `OnVisible`
- Current-screen highlighting in dropdown (blue text + light fill)
- Back buttons retained on IssueDetailScreen ("< Tracker") and SubmitScreen ("< Dashboard")

### Issue Deck PPTX Generation Pipeline (completed)
- Built end-to-end PPTX generation pipeline using python-pptx and corporate PwC template
- **`tools/create_ofr_template.py`**: One-time script to strip 14 content slides from corporate PPTX, preserving slide master + all 71 layouts + PwC Office theme (Georgia/Arial fonts, 10.00"×7.50" 4:3)
- **`tools/templates/OFR_Issue_Deck_Template.pptx`**: Clean template (478KB) with 0 slides, 71 layouts
- **`tools/generate_issue_deck.py`**: Main generation script (~980 lines). Produces a 51-slide deck (with 18 issues) from JSON input. Slide sequence:
  - Cover + Executive Summary + KPI Dashboard (colour-coded stat boxes) + Staleness Overview
  - Priority Summary Tables: High (red header), Medium (amber header), Low (blue header) — paginated at 8 rows per slide
  - Per-group section dividers + issue tables (10 functional groups, paginated at 7 rows)
  - **Individual Issue Detail Slides** (one per active issue, sorted by priority then staleness): formatted layout with colour-coded Priority/Status/Staleness badge pills (rounded rectangles), functional group + owner, next action with date context, **update history timeline** (up to 5 entries with colour-coded status, author, and notes), and **Copilot Executive Brief placeholder** (light blue-grey bar for future MS Copilot integration)
  - Items Requiring Attention table (stale items) + Closing slide
  - All Appkit4 colours applied (Blue `#415385`/Orange `#D04A02`/Red `#E0301E`/Amber `#E45C2B`). Tables with alternating row shading.
- **`tools/sample-data/ofr_issues_sample.json`**: 18 realistic test issues covering all 10 groups, all statuses/priorities/staleness flags. Each issue includes an `Updates` array with Date, Status, Notes, and UpdatedBy fields (1-3 updates per issue).
- **`tools/export_ofr_data.py`**: SharePoint data export script using Microsoft Graph API (MSAL). Supports client credentials (service principal) and device code (interactive) auth flows. Exports both `OFR_Issues` and `OFR_UpdateHistory` lists, attaches update records to each issue by ParentItemID, and outputs JSON for deck generation.
- **`Btn_Dash_GenerateDeck`**: Button on DashboardScreen (Appkit Blue fill, white text, Lato 13, border radius 8). OnSelect calls Power Automate flow `OFRGenerateIssueDeck.Run()` with loading state via `varGenerating` context variable. Text property: `If(varGenerating, "Generating...", "Generate Issue Deck")`. On success: shows notification with filename and launches the SharePoint URL. On error: shows error notification. "Generated Reports" folder in SharePoint Shared Documents library.
- **Key bug fixed**: `SlidePlaceholders` does not support `in` for index lookup — `0 in slide.placeholders` returns `False` even when `slide.placeholders[0]` works. Added `get_ph()` helper with try/except access.
- CLI: `python3 tools/generate_issue_deck.py -i tools/sample-data/ofr_issues_sample.json [-o output.pptx]`

### Documentation Updates (completed)
- OFR-SDD.md: Updated TextInput6 references to Txt_Dash_IntakeNotes; replaced two header patterns with unified hamburger navigation; updated all 6 screen specs + navigation map; added `varShowNav` context variable
- OFR-PowerApps-Completion-Guide.md: Updated all old control names; added GroupAllocationScreen rewrite, header nav patterns, SubmitScreen section, Closed Items KPI, colour references; replaced all header/nav sections with hamburger menu pattern + full property reference
- OFR-User-Guide.md: Version bump to 1.4, added Closed Items KPI, updated field labels, added "Navigating the App" section, updated all screen navigation sections to reference hamburger menu, Submit screen updates
- OFR-Test-Plan.md: Version bump to 1.2, updated 8 existing navigation test cases, added 6 new NAV test cases (NAV01-NAV06), total now 82 cases

### Azure Function — Automated Deck Generation (completed)
- **Architecture:** Power Apps button → Power Automate flow → Azure Function (Python 3.11, Consumption plan) → SharePoint
- **`tools/azure-function/function_app.py`**: HTTP POST trigger at `/api/generate-deck`, Function-level auth. Reads `OFR_CLIENT_ID`/`OFR_CLIENT_SECRET`/`OFR_TENANT_ID` from env vars. Orchestrates: fetch data → generate PPTX → upload to SharePoint. Returns JSON `{status, filename, url, issue_count, generated_at}`. Timestamped filename: `OFR_Issue_Deck_YYYY-MM-DD_HHMMSS.pptx`.
- **`tools/azure-function/generate_deck/export_data.py`**: Library refactor of `export_ofr_data.py`. Functions: `fetch_issues_from_sharepoint()` (returns complete data dict), `upload_pptx_to_sharepoint()` (Graph API PUT to `/drive/root:/{path}:/content`). Uses `logging` module. No CLI, no file I/O.
- **`tools/azure-function/generate_deck/generate_deck.py`**: Library refactor of `generate_issue_deck.py`. Function: `generate_pptx_bytes(data, template_path)` — generates all 51 slides in memory, saves to `io.BytesIO`, returns bytes. All slide builders reused verbatim. Verified: 51 slides, 552KB output identical to CLI version.
- **`migration-package/02-PowerAutomate/OFR-Issue-Deck-Generator.md`**: Complete flow rebuild guide with step-by-step instructions for creating the Power Automate flow, Power Apps integration, loading indicator, and troubleshooting.
- **Deployment prerequisites (manual):** Create Azure subscription → Resource Group `rg-ofr-issuetracker` → Storage Account `stofrissuetracker` → Function App `func-ofr-issuetracker` (Consumption, Python 3.11) → Set Application Settings → Deploy via `func azure functionapp publish` → Create Power Automate flow → Update Power Apps button.

### Azure Deployment & End-to-End Integration (completed)
- **Azure Resources:** Subscription "Bright Path Technology" (`2a362a99-e5da-4c29-b806-64f2acf6bee1`), Resource Group `rg-ofr-issuetracker` (Australia East), Storage Account `stofrissuetracker`, Function App `func-ofr-issuetracker` (Python 3.11, Consumption, Linux)
- **App Registration:** "Bright Path Risk Tracker" (AppId: `7570df18-68fe-47be-9305-7f6476909ebb`). Permissions: `Sites.Read.All` (Application, `332a536c-c7ef-4017-ab91-336970924f0d`) + `Sites.ReadWrite.All` (Application, `9492366f-7969-46a4-8d15-ed1a20078fff`). Admin consent granted.
- **Function URL:** `https://func-ofr-issuetracker.azurewebsites.net/api/generate-deck` (Function-level auth key required)
- **Deployment:** `cd tools/azure-function && func azure functionapp publish func-ofr-issuetracker`
- **Tested successfully:** 200 OK, 15 issues fetched, 39-slide PPTX (29KB) uploaded to SharePoint
- **Power Automate Flow:** "OFR Generate Issue Deck" (`718dd979-d1e9-497a-b9ec-fa49152c7963`). Trigger: Power Apps V2 → HTTP POST to Azure Function → Parse JSON → Respond to Power App (ResultStatus, FileName, FileURL)
- **Power Apps Integration:** Flow connected as `OFRGenerateIssueDeck`. Button `Btn_Dash_GenerateDeck` calls `OFRGenerateIssueDeck.Run()` with `varGenerating` loading state. Success: Notify + Launch file URL. Error: Notify error.
- **Key bugs fixed during deployment:**
  - Graph API `$select` with `fields/ColumnName` syntax returns OData error on SharePoint lists — removed `$select` parameter, using `$expand=fields` only (returns all fields, acceptable for this use case)
  - `Files.ReadWrite.All` Application permission GUID `01d4f6f2-7c1d-453e-8b59-d29efe4525ab` does not exist in Microsoft Graph — use `Sites.ReadWrite.All` (`9492366f-7969-46a4-8d15-ed1a20078fff`) instead, which covers both list reads and file uploads to SharePoint
  - Power Apps Properties panel Text field treats formula input as string literal — always use the **formula bar** (property dropdown → select "Text" → type formula) to enter formulas, not the Properties panel text input

### App Checker Fixes (completed)
- **10 Formula Errors:** Restored accidentally deleted SubmitScreen controls (`Dd_Submit_FuncGroup` and `Txt_Submit_PrevRef`). These are referenced by `Btn_Submit_Issue.OnSelect` for FunctionalGroup and RelatedOFRIssue fields. `RelatedOFRIssue` column added to `OFR_IntakeQueue` SharePoint list schema documentation.
- **45 Delegation Warnings:** Accepted — non-delegable `CountRows(Filter(...))` on Choice columns. Acceptable for SharePoint lists under 500 items (documented limitation).
- **49 Missing Accessible Labels:** Set `AccessibleLabel` on all 49 controls across all 6 screens (galleries, dropdowns, text inputs, rectangles, navigation overlays).
- **67 Missing Tab Stops:** Set `TabIndex = 0` on all 67 controls across all 6 screens for keyboard navigation support.
- **4 Performance Issues:** Replaced cross-screen `Gal_Tracker_Issues.Selected.*` references with `selectedItem` context variable on 3 IssueDetailScreen controls (`Lbl_Detail_IssueInfo.Text`, `Gal_Detail_UpdateHistory.Items`, `Dd_Detail_Status.Default`). This eliminated both the "Inefficient delay loading" warnings (3) and the "Unused variable" warning (1) for `selectedItem`, since Navigate already passes the selected item via context variable.
- **Final App Checker State:** Formulas 45 (delegation warnings only), Runtime 0, Accessibility 37 (reduced from 116), Performance 0, Data source 0.

### IssueDetailScreen Variable Name Fix (completed)
- **Root cause:** The App Checker performance fix (above) changed 3 IssueDetailScreen controls to use `selectedItem` context variable, but several Navigate calls still passed the old `varSelectedIssue` name — causing blank header fields on IssueDetailScreen.
- **Fix:** Used Power Apps Studio Find & Replace to replace all 6 remaining `varSelectedIssue` references with `selectedItem`:
  - 3 TrackerScreen priority gallery OnSelect formulas (`Gal_Tracker_HighPrio`, `Gal_Tracker_MedPrio`, `Gal_Tracker_LowPrior`)
  - 4 KanbanScreen gallery OnSelect formulas (`Gal_Kanban_New`, `Gal_Kanban_Active`, `Gal_Kanban_Escalated`, `Gal_Kanban_Monitoring`)
  - `Dd_Detail_ReassignGroup.Default` formula
- **Additional fix:** `Lbl_Detail_Title.Text` updated from `"Issue Detail"` to `"Issue Detail: " & selectedItem.ItemID`
- **Context variable name (canonical):** All Navigate calls and IssueDetailScreen controls now use `selectedItem` (NOT `varSelectedIssue`). The Navigate third parameter is `{selectedItem: ThisItem}` or `{selectedItem: selectedIssue}`.
- **Verified:** Both TrackerScreen and KanbanScreen navigation to IssueDetailScreen populate all fields correctly. App Checker unchanged: Performance 0, no regression.
- **Key lesson:** Power Apps formula bar autocomplete can replace typed text when typing a dot (`.`) — it accepts the autocomplete suggestion. Use Find & Replace (Cmd+H) for reliable formula edits, especially when renaming variables.

### ClosedScreen — New Screen for Closed Issues (completed)
- **Purpose:** Dedicated screen showing all closed issues in a searchable gallery, with drill-through to IssueDetailScreen. Fulfils requirement: "A filtered list of closed items on a new page, by group."
- **Created by:** Duplicating KanbanScreen, removing Kanban-specific elements, renaming all controls from `_Kanban_` to `_Closed_`, adding search bar and gallery.
- **Key controls:**
  - `Txt_Closed_Search`: TextInput, `OnChange = UpdateContext({varClosedSearch: Self.Text})`, HintText `"Search by ID, title, owner, or group..."`
  - `Gal_Closed_Issues`: Gallery, Items = `SortByColumns(Filter(OFR_Issues, Status.Value = "Closed", Or(IsBlank(varClosedSearch), varClosedSearch in Title, varClosedSearch in Owner, varClosedSearch in ItemID)), "LastUpdated", SortOrder.Descending)`, OnSelect = `Navigate(IssueDetailScreen, ScreenTransition.Fade, {selectedItem: ThisItem})`
  - Gallery Title: `ThisItem.ItemID & "  |  " & ThisItem.Title & "  |  " & ThisItem.Owner`
  - Gallery Subtitle: `ThisItem.FunctionalGroup.Value & "  |  Closed " & Text(ThisItem.LastUpdated, "yyyy-mm-dd")`
  - Screen OnVisible: `UpdateContext({varShowNav: false, varClosedSearch: ""})`
- **Navigation updates (all 7 screens):** Added `Btn_{Screen}_NavClosed` button (Text: `"Closed Items"`, Y: 280) to all 7 screens. Nav dropdown now has 6 items. ClosedScreen's own NavClosed button has current-screen highlighting (blue text + light fill, no Navigate — just closes nav).
- **Dashboard KPI drill-through:** Set OnSelect = `Navigate(ClosedScreen, ScreenTransition.Fade)` on 3 Dashboard elements: `lbl_CountClosedIssues`, `lbl_ClosedItems`, `Shp_Closed_Items` (the yellow KPI card).
- **Accessibility:** Set AccessibleLabel on `Txt_Closed_Search`, `Gal_Closed_Issues`, `Shp_Closed_Items`. Remaining accessibility items (43 total) follow the same pattern as pre-existing controls.
- **App Checker state:** Formulas 47 (delegation warnings), Runtime 0, Accessibility 43, Performance 0, Data source 0.
- **Closed items correctly excluded from:** TrackerScreen, KanbanScreen, GroupAllocationScreen, Dashboard KPIs (no changes needed — existing `Status.Value <> "Closed"` filters already in place).

## How to Start a New Session

Open your terminal and run:

```bash
cd ~/Projects/OFR-Issue-Tracker
claude
```

Claude Code will automatically read this `CLAUDE.md` at session start — no flags needed.

### Session Checklist

1. This file loads automatically — you have full project context
2. If working with the **Power Apps browser**:
   - Call `tabs_context_mcp` to get the current tab ID (changes between sessions)
   - Take a screenshot to confirm which screen is active
   - App URL: `https://make.powerapps.com/e/Default-2ed6f0bd-7701-49b6-80d5-e7ea9667ac3e/canvas/?action=edit&app-id=%2Fproviders%2FMicrosoft.PowerApps%2Fapps%2F0fbbc26c-ad71-476a-bcfc-edc0d7989533`
3. For **documentation edits**:
   - `docs/OFR-PowerApps-Completion-Guide.md` is a **single-line file** (~43K tokens) — use `sed` or `Bash` for replacements, NOT the `Edit` tool
   - All other docs are standard multi-line markdown
4. **Key reference docs** to read as needed:
   - `docs/OFR-SDD.md` — full technical specs
   - `docs/OFR-Appkit4-Colour-Map.md` — colour values for any UI work
5. **Previous session context** (if needed): The original working directory was `~/Downloads/Agentic process/`. Session transcripts are in `~/.claude/projects/`
