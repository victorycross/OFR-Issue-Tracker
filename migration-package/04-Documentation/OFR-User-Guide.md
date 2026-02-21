# OFR Issue Tracker — User Guide

**Version:** 1.0
**Last Updated:** February 18, 2025

---

## Welcome

The One Firm Risk (OFR) Issue Tracker helps your team capture, triage, track, and resolve cross-firm risk issues in one place. It runs entirely within Microsoft 365 — no extra software to install, no separate login required.

This guide walks you through everything you need to do in the app, screen by screen.

---

## Getting Started

### How to Open the App

**Option A — From Power Apps:**
1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Find **OFR Issue Tracker** in your Apps list
3. Click to open

**Option B — From Microsoft Teams (if pinned):**
1. Open Teams
2. Navigate to the channel where the app is pinned
3. Click the **OFR Issue Tracker** tab

You will be signed in automatically using your Microsoft 365 account. No separate username or password is needed.

---

## Screen 1: Dashboard

The Dashboard is your home screen. It gives you a quick snapshot of the current risk landscape and lets you manage new incoming issues.

### KPI Summary Cards

At the top of the screen you will see five summary cards:

| Card | What It Shows |
|------|---------------|
| **Open Items** | Total number of issues that are not yet closed |
| **Stale** | Issues with no update in 15 or more days — these need urgent attention |
| **High Priority** | Open issues flagged as High priority |
| **Medium** | Open issues flagged as Medium priority |
| **Low** | Open issues flagged as Low priority |

These numbers update automatically whenever you return to the Dashboard.

### Intake Queue

Below the KPIs you will see the **Intake Queue** — a list of newly submitted issues waiting for triage. Each card shows the issue title, who raised it, its priority, and the date it was submitted.

**What you can do with each intake item:**

| Action | What Happens |
|--------|--------------|
| **Move to Tracker** (or Promote) | The issue is added to the main tracker as a new active issue. An audit trail entry is automatically created. The intake item is marked as "Promoted" and disappears from the queue. |
| **Dismiss** | The issue is marked as "Dismissed" and removed from the queue. It will no longer appear here but remains in the SharePoint list for record-keeping. |

### Submitting a New Issue

1. Click the **+ New Issue** button
2. Fill in the form:
   - **Title** — A short description of the risk or issue
   - **Owner** — The person responsible for tracking this issue
   - **Priority** — Select High, Medium, or Low
   - **Description** — Detailed information about the issue, its impact, and any context
3. Click **Submit**

The issue will appear in the Intake Queue as "Pending" and wait for someone to promote it to the tracker or dismiss it.

### Navigation

Click **View Tracker** to go to the full issue tracking screen.

---

## Screen 2: Tracker

The Tracker is the main working screen. It shows all active issues in a table format with color-coded staleness indicators.

### Understanding the Table

Each row in the table represents one issue and shows:

| Column | Description |
|--------|-------------|
| **ItemID** | Unique identifier (e.g., OFR-1, OFR-2) |
| **Title** | Short description of the issue |
| **Owner** | Person responsible |
| **Priority** | High (red badge), Medium (amber badge), or Low (blue badge) |
| **Status** | Current lifecycle stage: New, Active, Monitoring, Escalated, or Closed |
| **Days Since Update** | Number of days since the last update was recorded |

### Staleness Color Coding

The Days Since Update column uses traffic-light colors to show how current each issue is:

| Color | Days | Meaning |
|-------|------|---------|
| 🟢 **Green** | 0–7 days | **Current** — Issue was updated recently |
| 🟡 **Amber** | 8–14 days | **Aging** — Issue is getting stale, consider updating |
| 🔴 **Red** | 15+ days | **Stale** — Issue has not been updated in over two weeks. Action needed. |

**Tip:** If you see red items on your tracker, open them and add an update — even if it is just to confirm the status has not changed. This keeps the team informed and resets the staleness clock.

### Filtering

Use the filter buttons at the top of the Tracker to narrow down the list:

| Filter | Shows |
|--------|-------|
| **All Open** | Every issue that is not Closed |
| **Stale** | Only issues flagged as Stale (15+ days without update) |
| **High** | Only High priority issues |
| **Medium** | Only Medium priority issues |
| **Low** | Only Low priority issues |

Click a filter button to activate it. Click it again (or click "All Open") to remove the filter.

### Searching

Use the **search box** to find specific issues. You can search by:
- **Title** — e.g., type "migration" to find issues about data migration
- **Owner** — e.g., type "Sarah" to find all issues owned by Sarah Chen
- **ItemID** — e.g., type "OFR-4" to jump directly to a specific issue

Search and filters work together. For example, you can filter by "High" and then search for "Park" to see only high-priority issues owned by David Park.

### Sorting

Click on a **column header** to sort the table by that column. Click the same header again to reverse the sort order (ascending ↔ descending).

### Opening an Issue

Click anywhere on an issue row to open its detail screen.

### Navigation

Click **Back to Dashboard** to return to the home screen.

---

## Screen 3: Issue Detail

The Issue Detail screen shows everything about a single issue and lets you add updates.

### Issue Header

At the top you will see the full details of the issue:
- **ItemID** and **Title**
- **Owner** — who is responsible
- **Priority** — High, Medium, or Low
- **Status** — current lifecycle stage
- **Date Raised** — when the issue was first identified
- **Last Updated** — when the most recent update was added

### Update History Timeline

Below the header is the complete history of updates for this issue, shown newest first. Each entry includes:
- **Date** — when the update was made
- **Status** — what the issue's status was at the time
- **Notes** — what was reported or changed
- **Updated By** — who added the update

This gives you a full audit trail of how the issue has progressed over time.

### Adding an Update

This is one of the most important actions in the app. Regular updates keep the team informed and prevent issues from going stale.

1. Scroll to the **Add Update** section
2. **Notes** (required) — Describe what has happened, what progress was made, or what the current situation is. Be specific enough that someone reading the timeline later will understand the context.
3. **Status** (optional) — If the issue's status needs to change, select the new status from the dropdown:
   - **New** → just identified, not yet being worked on
   - **Active** → being actively worked on
   - **Monitoring** → work is paused, keeping an eye on it
   - **Escalated** → raised to senior leadership for attention
   - **Closed** → resolved, no further action needed
   If the status has not changed, leave the dropdown as-is.
4. Click **Save Update**

**What happens when you save:**
- A new entry is added to the update history timeline
- The issue's **Last Updated** date is set to right now
- The **Days Since Update** counter resets to 0 (turns green)
- If you changed the status, the issue header updates to reflect the new status

### Closing an Issue

To close an issue, add a final update explaining the resolution and change the status to **Closed**. Closed issues:
- No longer appear in the "All Open" filter on the Tracker
- Are not included in the daily staleness calculation
- Reduce the Open Items count on the Dashboard
- Remain in the system for audit purposes — they are never deleted

### Navigation

Click **Back to Tracker** to return to the issue table.

---

## Understanding the Issue Lifecycle

Every issue follows a standard lifecycle:

```
                                    ┌──────────────┐
                                    │   Intake      │
                                    │   Queue       │
                                    │  (Pending)    │
                                    └──────┬───────┘
                                           │ Promote
                                           ▼
┌─────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   New   │────▶│  Active   │────▶│  Monitoring   │────▶│   Closed     │
└─────────┘     └──────────┘     └──────────────┘     └──────────────┘
                      │                                        ▲
                      │          ┌──────────────┐              │
                      └─────────▶│  Escalated    │─────────────┘
                                 └──────────────┘
```

| Stage | When to Use |
|-------|-------------|
| **Pending** (Intake) | Issue has been submitted but not yet accepted into the tracker |
| **New** | Issue has been promoted to the tracker but work has not started |
| **Active** | Issue is being actively investigated or worked on |
| **Monitoring** | Work is paused; watching for developments or waiting on external inputs |
| **Escalated** | Issue has been raised to senior leadership or a higher authority for resolution |
| **Closed** | Issue has been resolved or is no longer relevant |

---

## Daily Staleness Updates

Every morning at 6:00 AM, an automated process runs behind the scenes to:
1. Calculate how many days it has been since each open issue was last updated
2. Set the staleness flag:
   - **0–7 days** → Current (green)
   - **8–14 days** → Aging (amber)
   - **15+ days** → Stale (red)

You do not need to do anything for this to work — it runs automatically. The results will be visible the next time you open the Tracker screen.

**Best practice:** Try to update each of your issues at least once a week to keep them in the green zone. Even a short note like "No change — awaiting vendor response" is valuable.

---

## Tips and Best Practices

### Writing Good Updates
- Be specific: "Met with IT; server allocation approved for March 3" is better than "Progress made"
- Include dates and names when relevant
- Mention what the next step is and who is responsible
- If nothing has changed, say so: "Status unchanged — waiting on legal review expected by Feb 28"

### Managing Your Issues
- Check the Dashboard daily for your stale items
- Use the Tracker search to find all issues you own (search your name)
- Add updates proactively rather than waiting to be asked
- Use the "Monitoring" status for issues that are paused but not resolved

### Priority Guidelines
| Priority | Use When |
|----------|----------|
| **High** | Significant financial, regulatory, or reputational risk. Needs resolution within days or weeks. Senior leadership visibility required. |
| **Medium** | Moderate operational impact. Needs attention within weeks. Team-level management. |
| **Low** | Minor or long-term items. Monitor and address when capacity allows. |

---

## Frequently Asked Questions

**Q: Do I need to install anything?**
A: No. The app runs in your web browser through Power Apps. If it has been pinned to Teams, you can access it directly from a Teams tab.

**Q: Who can see the issues?**
A: Anyone who is a member of the OFR Issue Tracker SharePoint site. Access is controlled through Microsoft 365 group membership.

**Q: Can I edit an issue directly?**
A: You can change an issue's status by adding an update with a new status. Other fields (Title, Owner, Priority) can be edited by your administrator through the SharePoint list.

**Q: What happens to dismissed intake items?**
A: They remain in the OFR_IntakeQueue SharePoint list with TriageStatus = "Dismissed" for record-keeping, but they do not appear in the app.

**Q: Can I export the data?**
A: Yes. Go to the SharePoint list directly and use the built-in "Export to Excel" button in the toolbar. This exports the full list to a downloadable Excel file.

**Q: What if the staleness colors seem wrong?**
A: The staleness calculation runs once daily at 6:00 AM. If you add an update, the Days Since Update resets immediately in the app, but the staleness flag color may not update until the next morning's automated run.

**Q: Can I undo a promotion or dismissal?**
A: Promotions and dismissals cannot be undone from within the app. An administrator can manually change the TriageStatus in the SharePoint list if needed.

---

## Getting Help

If you encounter issues with the app or need changes, contact your system administrator. The following resources are available:

| Resource | Location |
|----------|----------|
| SharePoint Site | https://papercutscafe.sharepoint.com/sites/OFRIssueTracker |
| Power Apps Studio | https://make.powerapps.com |
| Power Automate | https://make.powerautomate.com |
| Technical Documentation | See OFR-SDD.md (System Design Document) |
| Test Plan | See OFR-Test-Plan.md |
