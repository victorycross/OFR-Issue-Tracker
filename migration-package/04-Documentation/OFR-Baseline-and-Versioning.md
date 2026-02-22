# OFR Issue Tracker — Baseline & Version History

**Current Version:** 1.5
**Baseline Date:** February 21, 2026
**Platform:** Microsoft 365 (Power Apps + SharePoint Online + Power Automate)
**App ID:** `0fbbc26c-ad71-476a-bcfc-edc0d7989533`
**Tenant:** Bright Path Technology (papercuts.cafe)

---

## Current Baseline Summary

The OFR Issue Tracker is a fully operational M365-native canvas application managing cross-firm risk issues through their complete lifecycle. The app replaces an earlier React/Vite SPA and runs entirely within SharePoint Online, Power Apps, and Power Automate with zero custom code or Azure infrastructure.

### What's Deployed

| Layer | Component | Status |
|-------|-----------|--------|
| **Data** | 3 SharePoint lists (`OFR_Issues`, `OFR_UpdateHistory`, `OFR_IntakeQueue`) | Live |
| **UI** | 6-screen Power Apps canvas app | Live |
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

### Cross-Cutting Features

- **Unified hamburger navigation** across all 6 screens (9 controls per screen, 54 total)
- **Appkit4 design system** colour palette throughout (Primary Blue, Orange, Red)
- **Staleness engine** with 3-tier thresholds (Current 0–7d, Aging 8–14d, Stale 15+d)
- **10 functional groups** with dedicated allocation view
- **Context variable pattern** (`varShowNav`, `varSelectedIssue`, `varShowPanel`)

---

## Version History

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
| System Design Document (SDD) | 1.1 | Feb 19, 2025 |
| User Guide | 1.4 | Feb 21, 2026 |
| Test Plan | 1.2 | Feb 21, 2026 |
| Completion Guide | 1.0 | Feb 2026 |
| Appkit4 Colour Map | 1.0 | Feb 2026 |
| **This document (Baseline & Versioning)** | **1.5** | **Feb 21, 2026** |

---

## Naming Conventions

| Convention | Pattern | Example |
|------------|---------|---------|
| UI controls | `{Type}_{Screen}_{Purpose}` | `Btn_Tracker_HamburgerMenu` |
| Type prefixes | `Btn_`, `Lbl_`, `Dd_`, `Txt_`, `Rect_`, `Gal_`, `Con_` | `Gal_Kanban_New` |
| Screen shorthand | `Tracker`, `Detail`, `Submit`, `Group`, `Kanban`, `Dash` | `Rect_Dash_NavOverlay` |
| Context variables | `var{Purpose}` | `varShowNav`, `varSelectedIssue` |
| SharePoint lists | `OFR_{ListName}` | `OFR_Issues` |
| Item IDs | `OFR-NNN` | `OFR-12` |

---

## Environment & Deployment

| Setting | Value |
|---------|-------|
| Tenant | Bright Path Technology |
| Domain | papercutscafe |
| Environment | papercuts.cafe (default) |
| Power Apps App ID | `0fbbc26c-ad71-476a-bcfc-edc0d7989533` |
| SharePoint Site | `https://papercutscafe.sharepoint.com/sites/OFRIssueTracker` |
| Staleness Flow ID | `aefb8de0-35fe-4d5d-a629-ddd8502ee5aa` |
| Intake Promotion Flow ID | `1c631640-113f-4602-805e-1d693582de8c` |
| Licence | M365 Business Standard + Power Apps Developer + Power Automate Free |
