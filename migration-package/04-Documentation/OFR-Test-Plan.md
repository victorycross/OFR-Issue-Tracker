# OFR Issue Tracker — Test Plan

**Version:** 1.0
**Date:** February 18, 2025
**Application:** OFR Issue Tracker (M365-Native)
**Environment:** papercuts.cafe (default) — M365 Business Standard + Power Apps Developer + Power Automate Free

---

## 1. Test Objectives

Validate that the M365-native OFR Issue Tracker correctly supports the full issue lifecycle: intake submission, triage, promotion to active tracking, issue updates with audit trail, staleness calculations, dashboard KPIs, and filtering/search. Confirm all three layers (SharePoint data, Power Apps UI, Power Automate automation) work together end-to-end.

---

## 2. Test Environment

| Component | Details |
|-----------|---------|
| SharePoint Site | https://papercutscafe.sharepoint.com/sites/OFRIssueTracker |
| Power Apps App ID | `0fbbc26c-ad71-476a-bcfc-edc0d7989533` |
| Staleness Flow ID | `aefb8de0-35fe-4d5d-a629-ddd8502ee5aa` |
| Intake Promotion Flow ID | `1c631640-113f-4602-805e-1d693582de8c` |
| Test User | david@papercuts.cafe (admin) |
| Browser | Microsoft Edge or Google Chrome (latest) |

### Pre-loaded Sample Data

| List | Records | Details |
|------|---------|---------|
| OFR_Issues | 8 items | OFR-1 through OFR-8 with mixed priorities, statuses, staleness |
| OFR_UpdateHistory | 17 entries | 2-3 updates per issue |
| OFR_IntakeQueue | 2 items | Both "Pending" status |

---

## 3. Test Categories

### 3.1 — SharePoint Data Layer Validation

#### TC-SP-01: Verify OFR_Issues list schema
| Field | Value |
|-------|-------|
| **Precondition** | Navigate to OFR_Issues list in SharePoint |
| **Steps** | 1. Open https://papercutscafe.sharepoint.com/sites/OFRIssueTracker/Lists/OFR_Issues <br> 2. Verify all 10 columns exist: Title, ItemID, Owner, Priority, Status, DateRaised, LastUpdated, NextAction, DaysSinceUpdate, StalenessFlag <br> 3. Verify column types match spec (Choice fields have correct options) |
| **Expected Result** | All columns present with correct types. Priority has High/Medium/Low. Status has New/Active/Monitoring/Escalated/Closed. StalenessFlag has Current/Aging/Stale. |
| **Priority** | High |

#### TC-SP-02: Verify OFR_UpdateHistory list schema
| Field | Value |
|-------|-------|
| **Precondition** | Navigate to OFR_UpdateHistory list |
| **Steps** | 1. Open OFR_UpdateHistory list <br> 2. Verify 6 columns: Title, ParentItemID, UpdateDate, StatusAtUpdate, Notes, UpdatedBy <br> 3. Verify StatusAtUpdate choices match OFR_Issues.Status choices |
| **Expected Result** | All columns present. StatusAtUpdate has New/Active/Monitoring/Escalated/Closed. |
| **Priority** | High |

#### TC-SP-03: Verify OFR_IntakeQueue list schema
| Field | Value |
|-------|-------|
| **Precondition** | Navigate to OFR_IntakeQueue list |
| **Steps** | 1. Open OFR_IntakeQueue list <br> 2. Verify 6 columns: Title, Owner, Priority, Description, DateSubmitted, TriageStatus <br> 3. Verify TriageStatus choices: Pending/Promoted/Dismissed |
| **Expected Result** | All columns present with correct types and choice values. |
| **Priority** | High |

#### TC-SP-04: Verify sample data integrity
| Field | Value |
|-------|-------|
| **Precondition** | Sample data has been loaded |
| **Steps** | 1. Open OFR_Issues — verify 8 items (OFR-1 to OFR-8) <br> 2. Open OFR_UpdateHistory — verify 17 entries <br> 3. Open OFR_IntakeQueue — verify 2 pending items <br> 4. Spot-check: OFR-1 should be High/Active, OFR-3 should be Medium/Active/Stale, OFR-5 should be Low/Monitoring |
| **Expected Result** | All records present with correct field values matching the sample data specification. |
| **Priority** | High |

---

### 3.2 — Power Apps: Dashboard Screen

#### TC-PA-D01: Dashboard loads and displays KPIs
| Field | Value |
|-------|-------|
| **Precondition** | Open Power Apps canvas app |
| **Steps** | 1. Launch app from make.powerapps.com or Teams <br> 2. Verify Dashboard Screen loads as the home screen <br> 3. Check KPI card values |
| **Expected Result** | KPI cards show: Open Items = 8, Stale = 2 (OFR-3, OFR-8), High Priority = 4 (OFR-1, OFR-2, OFR-4, OFR-8). Medium and Low counts are correct. |
| **Priority** | High |

#### TC-PA-D02: Intake queue displays pending items
| Field | Value |
|-------|-------|
| **Precondition** | Dashboard Screen loaded, 2 intake items exist |
| **Steps** | 1. Scroll to intake queue section <br> 2. Verify both pending items are displayed <br> 3. Verify each card shows: Title, Owner, Priority badge, DateSubmitted |
| **Expected Result** | "Audit finding on access controls" (High) and "Project staffing shortfall for Q2" (Medium) displayed with correct details. Sorted by Priority then DateSubmitted. |
| **Priority** | High |

#### TC-PA-D03: New Issue submission form
| Field | Value |
|-------|-------|
| **Precondition** | Dashboard Screen loaded |
| **Steps** | 1. Click "+ New Issue" button <br> 2. Verify overlay form appears with fields: Title, Owner, Priority, Description <br> 3. Fill in test data: Title="Test intake item", Owner="Test User", Priority=Medium, Description="Testing intake submission" <br> 4. Submit the form |
| **Expected Result** | Form submits. New item appears in OFR_IntakeQueue with TriageStatus="Pending". Item appears in the intake gallery on Dashboard. |
| **Priority** | High |

#### TC-PA-D04: Dismiss intake item
| Field | Value |
|-------|-------|
| **Precondition** | At least one pending intake item exists |
| **Steps** | 1. Find a pending intake item in the gallery <br> 2. Click "Dismiss" button <br> 3. Verify the item disappears from the gallery |
| **Expected Result** | Item's TriageStatus changes to "Dismissed" in SharePoint. Item no longer appears in the pending intake gallery. KPIs update if applicable. |
| **Priority** | Medium |

#### TC-PA-D05: Navigate to Tracker Screen
| Field | Value |
|-------|-------|
| **Precondition** | Dashboard Screen loaded |
| **Steps** | 1. Click "View Tracker" or navigation button <br> 2. Verify navigation to Tracker Screen |
| **Expected Result** | Tracker Screen loads showing the issue table with all open items. |
| **Priority** | High |

---

### 3.3 — Power Apps: Tracker Screen

#### TC-PA-T01: Issue table displays all open items
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Verify gallery shows all open issues <br> 2. Verify columns: ItemID, Title, Owner, Priority badge, Status badge, DaysSinceUpdate <br> 3. Count visible rows |
| **Expected Result** | All 8 open issues displayed with correct data in all columns. |
| **Priority** | High |

#### TC-PA-T02: Staleness color-coding
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded with sample data |
| **Steps** | 1. Find OFR-2 (DaysSinceUpdate=2) — should show green/Current <br> 2. Find OFR-1 (DaysSinceUpdate=8) — should show amber/Aging <br> 3. Find OFR-3 (DaysSinceUpdate=19) — should show red/Stale <br> 4. Find OFR-8 (DaysSinceUpdate=21) — should show red/Stale |
| **Expected Result** | Green for 0-7 days, amber for 8-14 days, red for 15+ days. Visual emphasis (bold/highlight) on stale items. |
| **Priority** | High |

#### TC-PA-T03: Filter — All Open
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "All Open" filter toggle <br> 2. Count visible items |
| **Expected Result** | All 8 open items visible (none are Closed). |
| **Priority** | Medium |

#### TC-PA-T04: Filter — Stale
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "Stale" filter toggle <br> 2. Verify filtered results |
| **Expected Result** | Only OFR-3 and OFR-8 visible (StalenessFlag = "Stale"). |
| **Priority** | High |

#### TC-PA-T05: Filter — High Priority
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "High" filter toggle <br> 2. Verify filtered results |
| **Expected Result** | Only OFR-1, OFR-2, OFR-4, OFR-8 visible (Priority = "High"). |
| **Priority** | Medium |

#### TC-PA-T06: Filter — Medium Priority
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "Medium" filter toggle <br> 2. Verify filtered results |
| **Expected Result** | Only OFR-3, OFR-6, OFR-7 visible (Priority = "Medium"). |
| **Priority** | Medium |

#### TC-PA-T07: Filter — Low Priority
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "Low" filter toggle <br> 2. Verify filtered results |
| **Expected Result** | Only OFR-5 visible (Priority = "Low"). |
| **Priority** | Low |

#### TC-PA-T08: Search by Title
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Type "migration" in search box <br> 2. Verify filtered results |
| **Expected Result** | Only OFR-1 ("Client data migration delays") visible. |
| **Priority** | High |

#### TC-PA-T09: Search by Owner
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Clear search box <br> 2. Type "Sarah" in search box <br> 3. Verify filtered results |
| **Expected Result** | OFR-1 and OFR-5 visible (Owner = "Sarah Chen"). |
| **Priority** | High |

#### TC-PA-T10: Search by ItemID
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Clear search box <br> 2. Type "OFR-4" in search box <br> 3. Verify filtered results |
| **Expected Result** | Only OFR-4 ("Budget reconciliation discrepancies") visible. |
| **Priority** | Medium |

#### TC-PA-T11: Combined filter + search
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "High" filter toggle <br> 2. Type "Park" in search box |
| **Expected Result** | Only OFR-4 and OFR-8 visible (High priority AND Owner contains "Park"). |
| **Priority** | Medium |

#### TC-PA-T12: Column sort
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded, "All Open" filter active |
| **Steps** | 1. Click Priority column header to sort <br> 2. Verify order changes <br> 3. Click DaysSinceUpdate column header <br> 4. Verify order changes (highest staleness first or last) |
| **Expected Result** | Gallery re-sorts by the clicked column. Clicking again reverses sort direction. |
| **Priority** | Medium |

#### TC-PA-T13: Navigate to Issue Detail
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Tap on OFR-2 row <br> 2. Verify navigation to Issue Detail Screen |
| **Expected Result** | Issue Detail Screen loads showing OFR-2 header info and update history. |
| **Priority** | High |

#### TC-PA-T14: Back to Dashboard navigation
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Click "Back to Dashboard" button |
| **Expected Result** | Returns to Dashboard Screen with KPIs and intake gallery. |
| **Priority** | Low |

---

### 3.4 — Power Apps: Issue Detail Screen

#### TC-PA-I01: Issue header displays correctly
| Field | Value |
|-------|-------|
| **Precondition** | Navigated to Issue Detail for OFR-2 |
| **Steps** | 1. Verify header shows: ItemID="OFR-2", Title="Regulatory compliance gap in reporting", Owner="James Wilson", Priority="High", Status="Escalated", DateRaised, LastUpdated |
| **Expected Result** | All header fields match the OFR_Issues record for OFR-2. |
| **Priority** | High |

#### TC-PA-I02: Update history timeline displays correctly
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen for OFR-2 |
| **Steps** | 1. Verify update history gallery shows 3 entries <br> 2. Verify sorted descending by UpdateDate (newest first) <br> 3. Verify each entry shows: date, status badge, notes, updated by |
| **Expected Result** | 3 entries visible in order: "Escalated to partner level..." (Feb 16), "Drafted remediation plan..." (Feb 5), "Gap found in quarterly reporting..." (Jan 20). |
| **Priority** | High |

#### TC-PA-I03: Update history for issue with many updates
| Field | Value |
|-------|-------|
| **Precondition** | Navigate to Issue Detail for OFR-1 |
| **Steps** | 1. Verify update history shows 3 entries <br> 2. Verify chronological order (newest first) <br> 3. Verify all entries have ParentItemID = "OFR-1" |
| **Expected Result** | 3 entries: "Server allocation pending..." (Feb 10), "Migration tool selected..." (Jan 22), "Issue identified during client..." (Jan 15). |
| **Priority** | Medium |

#### TC-PA-I04: Add update — notes only (no status change)
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen for OFR-1 (Status = Active) |
| **Steps** | 1. Enter notes: "Follow-up meeting scheduled with IT for server allocation" <br> 2. Leave status dropdown as current ("Active") <br> 3. Click "Save Update" |
| **Expected Result** | New entry appears at top of timeline with today's date, status "Active", the entered notes, and current user. OFR_Issues.LastUpdated updates to now. OFR_Issues.DaysSinceUpdate resets to 0. |
| **Priority** | High |

#### TC-PA-I05: Add update — with status change
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen for OFR-7 (Status = New) |
| **Steps** | 1. Enter notes: "Initial assessment complete, assigning cross-team leads" <br> 2. Change status dropdown from "New" to "Active" <br> 3. Click "Save Update" |
| **Expected Result** | New entry appears in timeline with status "Active". OFR_Issues.Status changes from "New" to "Active". OFR_Issues.LastUpdated and DaysSinceUpdate update. Header refreshes to show new status. |
| **Priority** | High |

#### TC-PA-I06: Add update — validation (empty notes)
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen for any issue |
| **Steps** | 1. Leave notes field empty <br> 2. Click "Save Update" |
| **Expected Result** | Form validation prevents submission. Error message or visual indicator on required notes field. No record created. |
| **Priority** | Medium |

#### TC-PA-I07: Update history reflects in SharePoint
| Field | Value |
|-------|-------|
| **Precondition** | An update was added via TC-PA-I04 or TC-PA-I05 |
| **Steps** | 1. Open OFR_UpdateHistory list in SharePoint <br> 2. Find the new entry <br> 3. Verify ParentItemID, UpdateDate, StatusAtUpdate, Notes, UpdatedBy |
| **Expected Result** | SharePoint record matches exactly what was entered in Power Apps. |
| **Priority** | High |

#### TC-PA-I08: Back to Tracker navigation
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen loaded |
| **Steps** | 1. Click "Back to Tracker" button |
| **Expected Result** | Returns to Tracker Screen with filters preserved. |
| **Priority** | Low |

---

### 3.5 — Power Automate: Daily Staleness Calculator

#### TC-FL-S01: Manual test run
| Field | Value |
|-------|-------|
| **Precondition** | Flow `aefb8de0-35fe-4d5d-a629-ddd8502ee5aa` exists and is turned on |
| **Steps** | 1. Open flow in Power Automate <br> 2. Click "Test" → "Manually" → "Run flow" <br> 3. Wait for flow to complete <br> 4. Check run history for success |
| **Expected Result** | Flow runs successfully. All open issues processed. No errors in run history. |
| **Priority** | High |

#### TC-FL-S02: DaysSinceUpdate calculation accuracy
| Field | Value |
|-------|-------|
| **Precondition** | Staleness flow has been run |
| **Steps** | 1. Open OFR_Issues in SharePoint <br> 2. For each open issue, manually calculate days between LastUpdated and today <br> 3. Compare with DaysSinceUpdate column |
| **Expected Result** | DaysSinceUpdate values match manual calculation (within 1 day tolerance for timezone differences). |
| **Priority** | High |

#### TC-FL-S03: StalenessFlag accuracy
| Field | Value |
|-------|-------|
| **Precondition** | Staleness flow has been run |
| **Steps** | 1. Open OFR_Issues in SharePoint <br> 2. For each item, verify StalenessFlag: <br> — DaysSinceUpdate 0-7 → "Current" <br> — DaysSinceUpdate 8-14 → "Aging" <br> — DaysSinceUpdate 15+ → "Stale" |
| **Expected Result** | All StalenessFlag values match the threshold rules. |
| **Priority** | High |

#### TC-FL-S04: Closed issues excluded
| Field | Value |
|-------|-------|
| **Precondition** | At least one issue has Status = "Closed" |
| **Steps** | 1. Manually close an issue (set Status to "Closed" in SharePoint) <br> 2. Run the staleness flow <br> 3. Check if the closed issue was processed |
| **Expected Result** | Closed issue's DaysSinceUpdate and StalenessFlag are NOT recalculated. Flow's "Get items" filter excludes Closed items. |
| **Priority** | High |

#### TC-FL-S05: Flow after adding an update
| Field | Value |
|-------|-------|
| **Precondition** | An issue was just updated (DaysSinceUpdate = 0) |
| **Steps** | 1. Add an update to OFR-3 (currently Stale) via Power Apps <br> 2. Verify DaysSinceUpdate resets to 0 in Power Apps <br> 3. Run staleness flow <br> 4. Verify OFR-3 now shows "Current" |
| **Expected Result** | After update: DaysSinceUpdate = 0. After staleness flow: StalenessFlag = "Current" (was "Stale"). |
| **Priority** | High |

---

### 3.6 — Power Automate: Intake Promotion

#### TC-FL-P01: Promote intake item via Power Apps
| Field | Value |
|-------|-------|
| **Precondition** | At least one pending intake item exists in OFR_IntakeQueue |
| **Steps** | 1. Open Power Apps Dashboard <br> 2. Find "Audit finding on access controls" in intake gallery <br> 3. Click "Move to Tracker" / "Promote" button <br> 4. Wait for flow to complete |
| **Expected Result** | Flow runs successfully. Notification or visual confirmation in app. |
| **Priority** | High |

#### TC-FL-P02: Verify promoted issue in OFR_Issues
| Field | Value |
|-------|-------|
| **Precondition** | TC-FL-P01 completed |
| **Steps** | 1. Navigate to Tracker Screen or open OFR_Issues in SharePoint <br> 2. Find the newly created issue <br> 3. Verify fields: Title, Owner, Priority match intake item <br> 4. Verify: Status = "New", DaysSinceUpdate = 0, StalenessFlag = "Current" <br> 5. Verify: DateRaised and LastUpdated are set to promotion time <br> 6. Verify: ItemID is in "OFR-N" format <br> 7. Verify: NextAction = Description from intake item |
| **Expected Result** | New issue exists with all fields correctly mapped from intake item. |
| **Priority** | High |

#### TC-FL-P03: Verify audit trail entry
| Field | Value |
|-------|-------|
| **Precondition** | TC-FL-P01 completed |
| **Steps** | 1. Open OFR_UpdateHistory in SharePoint <br> 2. Find entry with ParentItemID matching the new issue's ItemID <br> 3. Verify: StatusAtUpdate = "New", Notes = "Promoted from intake queue", UpdatedBy = Owner from intake |
| **Expected Result** | Audit trail entry exists with correct metadata. |
| **Priority** | High |

#### TC-FL-P04: Verify intake item marked as Promoted
| Field | Value |
|-------|-------|
| **Precondition** | TC-FL-P01 completed |
| **Steps** | 1. Open OFR_IntakeQueue in SharePoint <br> 2. Find the promoted item <br> 3. Verify TriageStatus = "Promoted" |
| **Expected Result** | Intake item's TriageStatus changed from "Pending" to "Promoted". Item no longer shows in the Power Apps intake gallery. |
| **Priority** | High |

#### TC-FL-P05: Verify NewItemID returned
| Field | Value |
|-------|-------|
| **Precondition** | TC-FL-P01 completed |
| **Steps** | 1. Check Power Automate flow run history <br> 2. Verify "Respond to a PowerApp or flow" action output <br> 3. Confirm NewItemID value matches the created issue's ItemID |
| **Expected Result** | Flow returns the correct ItemID (e.g., "OFR-9") to the calling Power App. |
| **Priority** | Medium |

#### TC-FL-P06: KPIs update after promotion
| Field | Value |
|-------|-------|
| **Precondition** | TC-FL-P01 completed, return to Dashboard |
| **Steps** | 1. Navigate back to Dashboard <br> 2. Check Open Items KPI <br> 3. Check intake gallery count |
| **Expected Result** | Open Items increases by 1 (8 → 9). Intake gallery shows one fewer pending item. |
| **Priority** | Medium |

---

### 3.7 — End-to-End Lifecycle Test

#### TC-E2E-01: Full lifecycle — new issue from intake to closure
| Field | Value |
|-------|-------|
| **Precondition** | App is running, user is authenticated |
| **Steps** | 1. **Submit:** On Dashboard, click "+ New Issue", fill in: Title="E2E Test Issue", Owner="Test User", Priority=High, Description="End-to-end lifecycle test" <br> 2. **Verify intake:** Confirm item appears in intake gallery as Pending <br> 3. **Promote:** Click "Move to Tracker" on the new intake item <br> 4. **Verify tracker:** Navigate to Tracker, find the new issue, verify Status=New, green staleness <br> 5. **First update:** Tap the issue, add update: "Initial assessment underway", change Status to Active <br> 6. **Verify update:** Confirm timeline shows the update, header shows Active <br> 7. **Second update:** Add another update: "Assessment complete, monitoring required", change Status to Monitoring <br> 8. **Verify:** Timeline shows 3 entries (promotion + 2 updates), header shows Monitoring <br> 9. **Close:** Add final update: "Issue resolved and closed", change Status to Closed <br> 10. **Verify closure:** Issue no longer appears in "All Open" filter on Tracker. Dashboard Open Items count decreases. |
| **Expected Result** | Complete lifecycle works: Submit → Promote → Update (x2) → Close. All data consistent across SharePoint lists, Power Apps screens, and KPIs. |
| **Priority** | Critical |

#### TC-E2E-02: Staleness progression over time
| Field | Value |
|-------|-------|
| **Precondition** | An active issue exists with recent LastUpdated |
| **Steps** | 1. Note an issue's current DaysSinceUpdate and StalenessFlag <br> 2. Wait for staleness flow to run (or trigger manually) <br> 3. Verify DaysSinceUpdate incremented <br> 4. If days cross a threshold (7→8 or 14→15), verify StalenessFlag changes <br> 5. Verify color changes on Tracker Screen |
| **Expected Result** | Staleness progresses: Current (green) → Aging (amber) → Stale (red) as days increase. Colors in Power Apps match the flags in SharePoint. |
| **Priority** | High |

---

### 3.8 — Edge Cases & Negative Tests

#### TC-NEG-01: Search with no results
| Field | Value |
|-------|-------|
| **Precondition** | Tracker Screen loaded |
| **Steps** | 1. Type "ZZZZZ" in search box |
| **Expected Result** | Empty gallery or "No items found" message. No errors. |
| **Priority** | Low |

#### TC-NEG-02: Rapid successive updates
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen loaded |
| **Steps** | 1. Add update and save <br> 2. Immediately add another update and save |
| **Expected Result** | Both updates saved correctly. Timeline shows both entries. No data corruption or duplicate records. |
| **Priority** | Medium |

#### TC-NEG-03: Long text in notes
| Field | Value |
|-------|-------|
| **Precondition** | Issue Detail Screen loaded |
| **Steps** | 1. Enter a very long note (500+ characters) <br> 2. Save the update |
| **Expected Result** | Note saves completely. Timeline displays the full text (with scrolling if needed). |
| **Priority** | Low |

#### TC-NEG-04: Special characters in text fields
| Field | Value |
|-------|-------|
| **Precondition** | Dashboard or Issue Detail Screen |
| **Steps** | 1. Submit an intake item or update with special characters: é, ñ, &, <, >, "quotes", $dollars |
| **Expected Result** | All characters saved and displayed correctly. No HTML encoding issues. |
| **Priority** | Low |

#### TC-NEG-05: Concurrent access
| Field | Value |
|-------|-------|
| **Precondition** | Two browser sessions open to the same app |
| **Steps** | 1. User A opens OFR-1 detail <br> 2. User B opens OFR-1 detail <br> 3. User A adds an update <br> 4. User B adds a different update |
| **Expected Result** | Both updates saved. No data loss. Both entries appear in timeline (may require refresh). |
| **Priority** | Medium |

---

### 3.9 — Access & Authentication

#### TC-AUTH-01: SSO authentication
| Field | Value |
|-------|-------|
| **Precondition** | User is logged into M365 |
| **Steps** | 1. Open the Power Apps app URL <br> 2. Verify automatic sign-in via Entra ID |
| **Expected Result** | No separate login required. App loads with user context. |
| **Priority** | High |

#### TC-AUTH-02: Unauthorized user access
| Field | Value |
|-------|-------|
| **Precondition** | User NOT in the OFR SharePoint site members group |
| **Steps** | 1. Attempt to open the app |
| **Expected Result** | Access denied or data connection error. User cannot view or modify data. |
| **Priority** | Medium |

---

## 4. Test Execution Summary Template

| Test ID | Description | Status | Tester | Date | Notes |
|---------|-------------|--------|--------|------|-------|
| TC-SP-01 | OFR_Issues schema | | | | |
| TC-SP-02 | OFR_UpdateHistory schema | | | | |
| TC-SP-03 | OFR_IntakeQueue schema | | | | |
| TC-SP-04 | Sample data integrity | | | | |
| TC-PA-D01 | Dashboard KPIs | | | | |
| TC-PA-D02 | Intake queue display | | | | |
| TC-PA-D03 | New Issue form | | | | |
| TC-PA-D04 | Dismiss intake | | | | |
| TC-PA-D05 | Navigate to Tracker | | | | |
| TC-PA-T01 | Issue table display | | | | |
| TC-PA-T02 | Staleness colors | | | | |
| TC-PA-T03 | Filter — All Open | | | | |
| TC-PA-T04 | Filter — Stale | | | | |
| TC-PA-T05 | Filter — High | | | | |
| TC-PA-T06 | Filter — Medium | | | | |
| TC-PA-T07 | Filter — Low | | | | |
| TC-PA-T08 | Search by Title | | | | |
| TC-PA-T09 | Search by Owner | | | | |
| TC-PA-T10 | Search by ItemID | | | | |
| TC-PA-T11 | Combined filter + search | | | | |
| TC-PA-T12 | Column sort | | | | |
| TC-PA-T13 | Navigate to Detail | | | | |
| TC-PA-T14 | Back to Dashboard | | | | |
| TC-PA-I01 | Issue header display | | | | |
| TC-PA-I02 | Update history timeline | | | | |
| TC-PA-I03 | Multiple update entries | | | | |
| TC-PA-I04 | Add update — notes only | | | | |
| TC-PA-I05 | Add update — status change | | | | |
| TC-PA-I06 | Validation — empty notes | | | | |
| TC-PA-I07 | Update reflects in SP | | | | |
| TC-PA-I08 | Back to Tracker | | | | |
| TC-FL-S01 | Staleness — manual run | | | | |
| TC-FL-S02 | DaysSinceUpdate calc | | | | |
| TC-FL-S03 | StalenessFlag accuracy | | | | |
| TC-FL-S04 | Closed issues excluded | | | | |
| TC-FL-S05 | Flow after update | | | | |
| TC-FL-P01 | Promote intake item | | | | |
| TC-FL-P02 | Verify promoted issue | | | | |
| TC-FL-P03 | Verify audit trail | | | | |
| TC-FL-P04 | Intake marked Promoted | | | | |
| TC-FL-P05 | NewItemID returned | | | | |
| TC-FL-P06 | KPIs update | | | | |
| TC-E2E-01 | Full lifecycle test | | | | |
| TC-E2E-02 | Staleness progression | | | | |
| TC-NEG-01 | Search no results | | | | |
| TC-NEG-02 | Rapid updates | | | | |
| TC-NEG-03 | Long text | | | | |
| TC-NEG-04 | Special characters | | | | |
| TC-NEG-05 | Concurrent access | | | | |
| TC-AUTH-01 | SSO authentication | | | | |
| TC-AUTH-02 | Unauthorized access | | | | |

---

## 5. Test Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| Critical | 1 | Full end-to-end lifecycle (TC-E2E-01) |
| High | 25 | Core functionality — KPIs, filters, updates, flows, data integrity |
| Medium | 13 | Secondary features — sorting, combined filters, concurrent access |
| Low | 6 | Edge cases — empty search, long text, special chars, navigation |
| **Total** | **45** | |

### Recommended Test Order
1. **SharePoint data layer** (TC-SP-01 to TC-SP-04) — confirm foundation
2. **Power Automate flows** (TC-FL-S01 to TC-FL-S05, TC-FL-P01 to TC-FL-P06) — confirm automation
3. **Power Apps screens** (TC-PA-D01 to TC-PA-I08) — confirm UI
4. **End-to-end** (TC-E2E-01, TC-E2E-02) — confirm full lifecycle
5. **Edge cases & auth** (TC-NEG-01 to TC-AUTH-02) — confirm robustness
