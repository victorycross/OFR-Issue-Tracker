# OFR Issue Tracker — Claude Project Memory

## Project Overview

This is the **OFR Issue Tracker**, an M365-native Power Apps canvas application for managing cross-firm risk issues through their full lifecycle. It replaces a previous React/Vite SPA and runs entirely within the Microsoft 365 ecosystem (SharePoint Online + Power Apps + Power Automate).

**Environment:**
- Tenant: Bright Path Technology (papercutscafe)
- Environment: papercuts.cafe (default)
- Power Apps App ID: `0fbbc26c-ad71-476a-bcfc-edc0d7989533`
- SharePoint Site: https://papercutscafe.sharepoint.com/sites/OFRIssueTracker

## Architecture (3-Tier)

1. **Data Layer** — SharePoint Online lists: `OFR_Issues`, `OFR_UpdateHistory`, `OFR_IntakeQueue`
2. **UI Layer** — Power Apps Canvas App with 6 screens
3. **Automation Layer** — Power Automate cloud flows (Daily Staleness Calculator, Intake Promotion)

## Screens & Element Naming Convention

All UI controls follow the naming convention: **`{Type}_{Screen}_{Purpose}`**

**Type prefixes:** `Btn_`, `Lbl_`, `Dd_`, `Txt_`, `Rect_`, `Gal_`
**Screen shorthand:** `Tracker`, `Detail`, `Submit`, `Group`, `Kanban`, `Dash`

### Screen Summary

| Screen | Shorthand | Purpose | Element Count |
|--------|-----------|---------|---------------|
| DashboardScreen | Dash | KPI overview, intake triage, navigation hub | ~20+ |
| TrackerScreen | Tracker | Sortable/filterable issue table with quick-update panel | 11 renamed |
| IssueDetailScreen | Detail | Full issue view with update history and add-update form | 12 renamed |
| SubmitScreen | Submit | Intake submission form | 17 renamed |
| GroupAllocationScreen | Group | Colour-coded card grid showing open issues per functional group (4-4-2 layout, 10 groups) | 36 renamed |
| KanbanScreen | Kanban | 4-column board (New, Active, Escalated, Monitoring) | 14 renamed |

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
│   ├── capture-screenshots.mjs        ← Puppeteer screenshot script
│   ├── generate_solution_overview_docx.py
│   ├── generate_user_guide_docx.py
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
Key columns: `Title`, `Owner`, `Priority`, `Description`, `DateSubmitted`, `TriageStatus` (Pending/Promoted/Dismissed/Accepted/Rejected), `FunctionalGroup`

## Power Automate Flows

| Flow | ID | Trigger | Purpose |
|------|----|---------|---------|
| Daily Staleness Calculator | `aefb8de0-35fe-4d5d-a629-ddd8502ee5aa` | Daily 6AM UTC | Calculates DaysSinceUpdate and StalenessFlag for all open issues |
| Intake Promotion | `1c631640-113f-4602-805e-1d693582de8c` | Power Apps V2 | Promotes intake items → creates issue + audit entry + updates intake status |

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

### Documentation Updates (completed)
- OFR-SDD.md: Updated TextInput6 references to Txt_Dash_IntakeNotes
- OFR-PowerApps-Completion-Guide.md: Updated all old control names; added GroupAllocationScreen rewrite, header nav patterns, SubmitScreen section, Closed Items KPI, colour references
- OFR-User-Guide.md: Version bump to 1.3, added Closed Items KPI, updated field labels, navigation sections, Submit screen updates

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
