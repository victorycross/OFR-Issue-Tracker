# OFR Issue Tracker — M365-Native Build Completion Guide

## Build Summary

The One Firm Risk (OFR) Issue Tracker has been rebuilt as a fully M365-native solution using SharePoint Online, Power Apps, and Power Automate. Zero custom code, zero Azure infrastructure.

---

## What Was Built

### SharePoint Site & Lists (Data Layer)

**Site:** https://[TENANT].sharepoint.com/sites/OFRIssueTracker

| List | Purpose | Columns |
|------|---------|---------|
| OFR_Issues | Main issue tracker | Title, ItemID, Owner, Priority (High/Medium/Low), Status (New/Active/Monitoring/Escalated/Closed), DateRaised, LastUpdated, NextAction, DaysSinceUpdate, StalenessFlag (Current/Aging/Stale) |
| OFR_UpdateHistory | Audit trail for updates | Title, ParentItemID, UpdateDate, StatusAtUpdate, Notes, UpdatedBy |
| OFR_IntakeQueue | Triage queue for new issues | Title, Owner, Priority, Description, DateSubmitted, TriageStatus (Pending/Promoted/Dismissed) |

### Power Apps Canvas App (UI Layer)

**App ID:** `[AUTO-GENERATED-APP-ID]`

**3 Screens:**

1. **Dashboard Screen**
   - KPI summary cards: Open Items, Stale, High Priority, Medium, Low
   - Intake Queue gallery with Promote/Dismiss buttons
   - New Issue submission form (overlay)
   - Navigation to Tracker Screen

2. **Tracker Screen**
   - Sortable/filterable issue gallery (table layout)
   - Filter toggles: All Open, Stale, High, Medium, Low
   - Search box (Title, Owner, ItemID)
   - Staleness color-coding: Green (0-7 days), Amber (8-14), Red (15+)
   - Row tap → Issue Detail Screen

3. **Issue Detail Screen**
   - Full issue header with all metadata
   - Update history timeline (sorted descending)
   - Add Update form with notes + status change
   - Auto-patches OFR_Issues.LastUpdated and DaysSinceUpdate on save

### Power Automate Flows (Automation Layer)

| Flow | ID | Trigger | Purpose |
|------|----|---------|---------|
| OFR Daily Staleness Calculator | `[AUTO-GENERATED-FLOW-ID]` | Recurrence (daily 6 AM) | Calculates DaysSinceUpdate and sets StalenessFlag for all open issues |
| OFR Intake Promotion | `[AUTO-GENERATED-FLOW-ID]` | Power Apps V2 trigger | Promotes intake item → creates OFR_Issues entry + UpdateHistory audit trail → marks intake as Promoted → returns new ItemID |

### Sample Data Loaded

- **8 issues** in OFR_Issues (OFR-1 through OFR-8) with varied priorities, statuses, and staleness levels
- **17 update history entries** across all issues
- **2 intake queue items** (Pending) ready for triage testing

---

## Flow Details

### Flow 1: OFR Daily Staleness Calculator

```
Trigger: Recurrence → Every 1 Day at 06:00 AM
  ↓
Get items: OFR_Issues where Status ≠ 'Closed'
  ↓
Apply to each:
  ↓
  Update item:
    DaysSinceUpdate = div(sub(ticks(utcNow()), ticks(LastUpdated)), 864000000000)
    StalenessFlag = if(days ≤ 7, 'Current', if(days ≤ 14, 'Aging', 'Stale'))
```

### Flow 2: OFR Intake Promotion

```
Trigger: Power Apps V2 → IntakeItemID (Number)
  ↓
Get item: OFR_IntakeQueue by IntakeItemID
  ↓
Create item: OFR_Issues
  - Title, Owner, Priority from intake item
  - ItemID = concat('OFR-', string(ID))
  - Status = 'New', DateRaised = utcNow(), LastUpdated = utcNow()
  - DaysSinceUpdate = 0, StalenessFlag = 'Current'
  - NextAction = Description from intake
  ↓
Create item: OFR_UpdateHistory
  - ParentItemID = new ItemID
  - StatusAtUpdate = 'New'
  - Notes = 'Promoted from intake queue'
  - UpdatedBy = Owner from intake
  ↓
Update item: OFR_IntakeQueue
  - TriageStatus = 'Promoted'
  ↓
Respond to Power App: NewItemID
```

---

## Testing Checklist

### Basic Verification
- [ ] Open the Power Apps canvas app
- [ ] Dashboard shows correct KPI counts (8 open, 2 stale, 4 high priority)
- [ ] Intake queue shows 2 pending items

### Issue Lifecycle Test
- [ ] Promote an intake item → verify it appears in OFR_Issues with correct data
- [ ] Navigate to Tracker screen → verify all 8+ issues display
- [ ] Filter by "Stale" → should show OFR-3 and OFR-8
- [ ] Filter by "High" → should show OFR-1, OFR-2, OFR-4, OFR-8
- [ ] Search for "Sarah" → should show OFR-1 and OFR-5
- [ ] Tap an issue → verify detail screen shows correct header + update history
- [ ] Add an update with notes → verify it appears in timeline
- [ ] Change status during update → verify status badge updates

### Staleness Flow Test
- [ ] Manually trigger or wait for daily staleness flow
- [ ] Verify DaysSinceUpdate recalculates correctly
- [ ] Verify StalenessFlag transitions (Current → Aging → Stale)

### Intake Test
- [ ] Submit a new issue via Dashboard "New Issue" button
- [ ] Verify it appears in intake queue as "Pending"
- [ ] Promote it → verify flow runs and issue appears in tracker
- [ ] Dismiss the other intake item → verify TriageStatus changes

---

## Next Steps (Deferred Features)

| Feature | Approach | Effort |
|---------|----------|--------|
| Bilingual EN/FR | Power Apps variables + Switch() for labels | Medium |
| CSV Export | SharePoint list "Export to Excel" or Power Automate file creation | Low |
| Email Notifications | Power Automate flow for stale items → Office 365 Outlook send | Low |
| Teams Integration | Pin Power App as tab in Teams channel | Low |

---

## Key URLs

| Resource | URL |
|----------|-----|
| SharePoint Site | https://[TENANT].sharepoint.com/sites/OFRIssueTracker |
| OFR_Issues List | https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Lists/OFR_Issues |
| OFR_UpdateHistory List | https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Lists/OFR_UpdateHistory |
| OFR_IntakeQueue List | https://[TENANT].sharepoint.com/sites/OFRIssueTracker/Lists/OFR_IntakeQueue |
| Power Apps Studio | https://make.powerapps.com |
| Power Automate | https://make.powerautomate.com |

---

## Architecture Advantage

**Zero infrastructure.** No Azure subscriptions, no GitHub repos, no CI/CD pipelines, no custom domains, no SSL certificates. Everything runs within M365. Users authenticate automatically via Entra ID. Data stays in SharePoint. The app lives in Power Apps and can be pinned to Teams. IT has nothing new to manage.
