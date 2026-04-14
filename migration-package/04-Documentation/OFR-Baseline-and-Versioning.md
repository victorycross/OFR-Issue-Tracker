# OFR Issue Tracker — Baseline & Version History

**Current Version:** 1.6
**Baseline Date:** February 23, 2026
**Platform:** Microsoft 365 (Power Apps + SharePoint Online + Power Automate)
**App ID:** `[AUTO-GENERATED-APP-ID]`
**Tenant:** Bright Path Technology ([TENANT-DOMAIN])

---

## Current Baseline Summary

The OFR Issue Tracker is a fully operational M365-native canvas application managing cross-firm risk issues through their complete lifecycle. The app replaces an earlier React/Vite SPA and runs entirely within SharePoint Online, Power Apps, and Power Automate with zero custom code or Azure infrastructure.

### What's Deployed

| Layer | Component | Status |
|-------|-----------|--------|
| **Data** | 3 SharePoint lists (`OFR_Issues`, `OFR_UpdateHistory`, `OFR_IntakeQueue`) | Live |
| **UI** | 7-screen Power Apps canvas app | Live |
| **Automation** | 2 Power Automate cloud flows (Daily Staleness Calculator, Intake Promotion) | Live |

### Screens at Baseline

| Screen | Key Capabilities |
|--------|-----------------|
| DashboardScreen | 5 KPI cards (Open, Stale, High, Medium, Low) + Closed Items KPI, Intake Queue with triage (Promote/Dismiss/Accept/Reject), intake review panel |
| TrackerScreen | 3 priority-grouped galleries (High/Medium/Low) with colour-coded staleness, search box, quick-update side panel |
| IssueDetailScreen | Full issue metadata, update history timeline, add-update form with auto-patch of LastUpdated/DaysSinceUpdate |
| SubmitScreen | Intake submission form (Title, Owner, Priority, FunctionalGroup, Description) |
| GroupAllocationScreen | 10 functional-group cards in 4-4-2 grid layout with open issue counts and colour coding |
| KanbanScreen | 4-column board (New, Active, Escalated, Monitoring) with filterable galleries |
| ClosedScreen | Searchable gallery of closed issues with drill-through to Issue Detail |

### Cross-Cutting Features

- **Unified hamburger navigation** across all 7 screens (10 controls per screen, 70 total)
- **Appkit4 design system** colour palette throughout (Primary Blue, Orange, Red)
- **Staleness engine** with 3-tier thresholds (Current 0–7d, Aging 8–14d, Stale 15+d)
- **10 functional groups** with dedicated allocation view
- **Context variable pattern** (`varShowNav`, `selectedItem`, `varShowPanel`, `varClosedSearch`)

---

## Version History

### v1.6 — February 23, 2026

**ClosedScreen & Dashboard KPI Drill-Through**

- New **ClosedScreen** (7th screen) — searchable archive of all closed issues with gallery sorted by most recently closed
- Search bar filters by ItemID, Title, Owner, or FunctionalGroup
- Gallery row click navigates to IssueDetailScreen with full audit trail
- **Dashboard KPI drill-through:** Clicking the Closed Items KPI card (count label, text label, background shape) navigates to ClosedScreen
- **Hamburger navigation updated** across all 7 screens: added "Closed Items" as 6th nav item (dropdown height 264px, 10 controls per screen, 70 total)
- **Accessibility:** AccessibleLabel set on Txt_Closed_Search, Gal_Closed_Issues, Shp_Closed_Items
- App Checker: Formulas 47 (delegation warnings), Accessibility 43, Performance 0, Runtime 0
- All documentation updated: SDD v2.1, User Guide v1.6, Test Plan v1.4 (103 cases), Demo Walkthrough Script v1.1
- Migration package updated with ClosedScreen build instructions

### v1.5 — February 21, 2026

**TrackerScreen Priority Galleries & Z-Order Fix**

- Replaced single flat gallery with 3 priority-grouped sections (High, Medium, Low) inside a scrollable vertical container (`Con_Tracker_Sections`)
- Each section has a collapsible header with count badge and colour-coded priority indicator (Red/Orange/Blue)
- Gallery items display: ItemID | Title | Status | Owner | FunctionalGroup | Staleness
- OnSelect navigation to IssueDetailScreen with `varSelectedIssue` context
- Fixed z-order layering issue: moved all 9 nav controls + SubmitCTA to top of TrackerScreen tree so hamburger dropdown renders above the priority section container
- App saved and tested in preview

### v1.4 — February 21, 2026

**Hamburger Navigation & Documentation Overhaul**

- Replaced two legacy header patterns (Full Navigation Bar + Incident View Header) with unified hamburger menu on all 6 screens
- Added `varShowNav` context variable to control dropdown visibility
- 16 old inline nav buttons removed, 54 new nav controls added (9 per screen)
- Current-screen highlighting in dropdown (blue text + light fill)
- Back buttons retained on IssueDetailScreen ("< Tracker") and SubmitScreen ("< Dashboard")
- Updated all 4 documentation files (SDD, Completion Guide, User Guide, Test Plan)
- Added 6 new navigation test cases (NAV01–NAV06), total now 82 cases

### v1.3 — February 2026

**Element Renaming & GroupAllocationScreen**

- Renamed all UI controls across 6 screens to follow `{Type}_{Screen}_{Purpose}` convention
- TrackerScreen: 11 renames
- IssueDetailScreen: 12 renames
- SubmitScreen: 17 renames
- GroupAllocationScreen: 36 renames (5 header + 31 card elements across 10 functional groups)
- DashboardScreen: 4 renames
- KanbanScreen: 14 renames
- GroupAllocationScreen card grid rebuilt with 4-4-2 layout and colour-coded functional group cards

### v1.2 — February 2026

**KanbanScreen & Dashboard Enhancements**

- KanbanScreen built with 4-column board (New, Active, Escalated, Monitoring)
- Dashboard Closed Items KPI card added
- Intake review panel with Accept/Reject workflow

### v1.1 — February 2026

**Initial Power Apps Build**

- 6-screen canvas app created in Power Apps Studio
- Connected to 3 SharePoint Online lists
- 2 Power Automate flows deployed (Daily Staleness Calculator, Intake Promotion)
- Core CRUD operations for issues and intake queue
- Appkit4 design system applied

### v1.0 — January 2026

**Platform Migration**

- Migrated from React/Vite SPA to M365-native Power Apps canvas app
- SharePoint Online lists created with full schema
- Migration package assembled for tenant portability

---

## Document Version Tracker

| Document | Current Version | Last Updated |
|----------|----------------|--------------|
| System Design Document (SDD) | 2.1 | Feb 23, 2026 |
| User Guide | 1.6 | Feb 23, 2026 |
| Test Plan | 1.4 | Feb 23, 2026 |
| Completion Guide | 1.0 | Feb 2026 |
| Appkit4 Colour Map | 1.0 | Feb 2026 |
| Demo Walkthrough Script | 1.1 | Feb 23, 2026 |
| **This document (Baseline & Versioning)** | **1.6** | **Feb 23, 2026** |

---

## Naming Conventions

| Convention | Pattern | Example |
|------------|---------|---------|
| UI controls | `{Type}_{Screen}_{Purpose}` | `Btn_Tracker_HamburgerMenu` |
| Type prefixes | `Btn_`, `Lbl_`, `Dd_`, `Txt_`, `Rect_`, `Gal_`, `Con_` | `Gal_Kanban_New` |
| Screen shorthand | `Tracker`, `Detail`, `Submit`, `Group`, `Kanban`, `Dash`, `Closed` | `Rect_Dash_NavOverlay` |
| Context variables | `var{Purpose}` | `varShowNav`, `varSelectedIssue` |
| SharePoint lists | `OFR_{ListName}` | `OFR_Issues` |
| Item IDs | `OFR-NNN` | `OFR-12` |

---

## Environment & Deployment

| Setting | Value |
|---------|-------|
| Tenant | Bright Path Technology |
| Domain | [TENANT] |
| Environment | [TENANT-DOMAIN] (default) |
| Power Apps App ID | `[AUTO-GENERATED-APP-ID]` |
| SharePoint Site | `https://[TENANT].sharepoint.com/sites/OFRIssueTracker` |
| Staleness Flow ID | `[AUTO-GENERATED-FLOW-ID-STALENESS]` |
| Intake Promotion Flow ID | `[AUTO-GENERATED-FLOW-ID-INTAKE]` |
| Licence | M365 Business Standard + Power Apps Developer + Power Automate Free |
