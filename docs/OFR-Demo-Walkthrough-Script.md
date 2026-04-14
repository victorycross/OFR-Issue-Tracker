# OFR Issue Tracker — Demo Walkthrough Script

**Version:** 1.1
**Date:** February 23, 2026
**Duration:** ~14-16 minutes
**Format:** Screen-share recording with voiceover

---

## Pre-Recording Setup

Before starting the recording:

1. **Open the app** in Microsoft Edge or Chrome at full screen (1920x1080 recommended)
2. **Ensure sample data is loaded:** 8 issues in OFR_Issues, 17 update history entries, 2 pending intake items
3. **Start on the Dashboard screen** — this is the default landing page
4. **Close the hamburger menu** if it's open
5. **Optional:** Have the SharePoint site open in a second tab to show backend data when referenced

---

## SCENE 1: Opening & Context (30 seconds)

**[Screen: Dashboard — full view visible]**

> "Welcome to the OFR Issue Tracker. This is our M365-native application for managing cross-firm risk issues through their full lifecycle — from intake and triage, through active tracking, all the way to resolution and closure.
>
> The app runs entirely within the Microsoft 365 ecosystem. It uses SharePoint for data, Power Apps for the interface, and Power Automate for automation. There's nothing to install — you sign in with your existing M365 credentials, and you're ready to go.
>
> Let me walk you through each screen and show you how the key workflows operate."

---

## SCENE 2: Dashboard — KPI Overview (1 minute)

**[Screen: Dashboard — focus on KPI cards at top]**

> "The Dashboard is your home screen and command centre. At the top you can see six KPI summary cards that give you an instant snapshot of the current risk landscape."

**[Mouse: hover over each card as you mention it]**

> "**Open Items** shows the total number of issues currently being tracked that haven't been resolved. **Closed Items** is a running count of resolved issues.
>
> The next four cards break down the open items by urgency. **Stale** — shown in red — these are issues with no update in fifteen or more days. They need urgent attention. Then we have counts by priority level: **High**, **Medium**, and **Low**.
>
> These numbers update in real time whenever you return to the Dashboard, so you always have a current picture."

---

## SCENE 3: Dashboard — Intake Queue & Triage (2 minutes)

**[Screen: Dashboard — scroll down to Intake Queue section]**

> "Below the KPIs is the **Intake Queue**. This is where newly submitted issues land before they're accepted into the tracker. Think of it as a triage inbox."

**[Mouse: point to the intake items]**

> "Each card shows the issue title, who raised it, its priority level, and when it was submitted. Right now we have two pending items waiting for review."

**[Action: Click on the first intake item to open the Intake Review Panel]**

> "When I click on an intake item, the **Intake Review Panel** slides in from the right. This gives me the full details — title, description, priority, and date submitted.
>
> As a manager, I have three options here. I can **assign an owner** and click **Accept into Tracker** to promote this into an active issue. I can **Reject** it if it doesn't warrant tracking. Or I can close the panel with the X button to come back to it later."

**[Action: Type a name in the Assign Owner field, e.g., "Sarah Chen"]**

> "Let me assign this to Sarah Chen..."

**[Action: Click "Accept into Tracker"]**

> "...and accept it into the tracker. You'll see the success notification, and the item disappears from the queue. Behind the scenes, the system has created a new issue in our main tracker, generated an audit trail entry, and marked the intake item as 'Accepted'."

**[Action: Point to the KPI cards]**

> "Notice the Open Items count has increased by one — the Dashboard reflects the change immediately."

---

## SCENE 4: Navigation — Hamburger Menu (45 seconds)

**[Screen: Dashboard — header bar visible]**

> "Before we move on, let me show you how navigation works. Every screen has the same header bar — the orange bar across the top."

**[Action: Click the hamburger menu button]**

> "Click the hamburger icon in the top-left corner and a dropdown menu appears with six destinations: Dashboard, Issue Tracker, Group Allocation, Kanban Board, Closed Items, and Submit New Issue. The screen you're currently on is highlighted — you can see 'Dashboard' is highlighted right now."

**[Action: Point to "+ Submit New Issue" CTA button on the right]**

> "There's also a **+ Submit New Issue** shortcut button on the right side of every header bar, so you can jump straight to the submission form from anywhere."

**[Action: Click outside the dropdown to close it]**

> "Tap anywhere outside the menu to close it without navigating. This consistent navigation pattern works identically across all seven screens."

---

## SCENE 5: Submit New Issue (1.5 minutes)

**[Action: Click "+ Submit New Issue" button in the header]**

**[Screen: SubmitScreen loads]**

> "This is the **Submit New Issue** screen — a dedicated form for creating new intake items.
>
> Let me walk through the fields."

**[Action: Click into the Title field]**

> "First, the **Topic / Issue / Problem** field. This is a short, descriptive title — for example, 'Vendor compliance gap in Q2 reporting'."

**[Action: Type the title, then move to Priority dropdown]**

> "Next, **Priority**. Select High, Medium, or Low based on urgency and potential impact."

**[Action: Select "High" from the dropdown]**

> "Then we have the **Functional Group** dropdown. This is optional but highly recommended. It tells managers which team should own this issue — there are ten groups to choose from, covering everything from Risk Management Office to OGC Privacy to Internal Audit."

**[Action: Open the Functional Group dropdown, scroll through the options, select one]**

> "Below that is the **Related OFR Issue** field. This is also optional — if your new issue is related to an existing tracked issue, you can enter its ID here, like 'OFR-3'. This helps managers spot connections during triage."

**[Action: Type "OFR-3" in the Related OFR Issue field]**

> "Then the **Description** field — provide enough context so a reviewer can understand the issue, its impact, and any relevant background."

**[Action: Type a description, then point to "Submitted By"]**

> "The **Submitted By** field is auto-populated from your Microsoft 365 account, so the system always knows who raised it."

**[Action: Click "Submit"]**

> "Click Submit, and you'll see a confirmation notification. The issue is now sitting in the Intake Queue on the Dashboard as 'Pending', ready for a manager to triage."

**[Action: Click "< Dashboard" back button]**

> "Click the back button to return to the Dashboard. You can see the new item has appeared in the intake queue."

---

## SCENE 6: Issue Tracker Screen (2.5 minutes)

**[Action: Open hamburger menu, click "Issue Tracker"]**

**[Screen: TrackerScreen loads]**

> "The **Issue Tracker** is the main working screen. It shows all active issues in a table format."

### 6a: Table Layout

**[Mouse: sweep across the column headers]**

> "Each row shows the issue's ID, title, owner, a colour-coded priority badge, current status, the functional group it's assigned to, and the days since last update."

### 6b: Staleness Indicators

**[Mouse: point to a blue staleness indicator, then an orange one, then a red one]**

> "The staleness indicator is key. **Blue** means Current — updated within the last seven days. **Orange** means Aging — eight to fourteen days since the last update. And **Red** means Stale — more than fifteen days without an update. If you see red items, those need attention."

### 6c: Filtering

**[Action: Click the "Stale" filter button]**

> "The filter buttons let you narrow the view quickly. If I click **Stale**, I see only the issues that haven't been updated in over two weeks."

**[Action: Click "High" filter button]**

> "Click **High** to see only high-priority items. Click **All Open** to reset and see everything."

**[Action: Click "All Open"]**

### 6d: Searching

**[Action: Click into the search box and type "Sarah"]**

> "The search box works across title, owner, item ID, and functional group. If I type 'Sarah', I see all issues owned by Sarah Chen."

**[Action: Clear search, type "Privacy"]**

> "Type 'Privacy' and I get issues assigned to the OGC Privacy functional group."

**[Action: Clear search]**

### 6e: Combined Filter + Search

**[Action: Click "High" filter, then type "Park" in search]**

> "Filters and search work together. Here I've filtered by High priority and searched for 'Park' — I get only David Park's high-priority issues."

**[Action: Clear everything]**

### 6f: Sorting

**[Action: Click the "Days" column header]**

> "Click any column header to sort. Here I'm sorting by Days Since Update so the most stale issues float to the top — that's a great way to find what needs attention first."

### 6g: Quick Update Side Panel

**[Action: Click the pencil/Quick Update icon on an issue row]**

> "For quick updates without leaving the Tracker, click the pencil icon on any row. The **Quick Update Panel** slides in from the right.
>
> You can add a note, change the status, or even reassign the issue to a different functional group — all without navigating away. This is perfect for bulk status updates."

**[Action: Type a note, click "Save", panel closes]**

> "Save the update, and the panel closes. The staleness clock resets immediately."

---

## SCENE 7: Issue Detail Screen (2 minutes)

**[Action: Click on an issue row (e.g., OFR-2)]**

**[Screen: IssueDetailScreen loads]**

> "Clicking an issue row opens the **Issue Detail** screen. This is the full view of a single issue."

### 7a: Issue Header

**[Mouse: point to each field in the header]**

> "The header shows everything at a glance — Item ID and title, who owns it, the priority badge, current status, functional group, date raised, and date of the last update."

### 7b: Update History Timeline

**[Mouse: scroll through the update history]**

> "Below the header is the complete **Update History Timeline** — a full audit trail showing every update ever made to this issue, newest first. Each entry records the date, the status at that time, what was reported, and who made the update.
>
> This timeline is critical for accountability and context. Any stakeholder can look at an issue and immediately understand its full history."

### 7c: Adding an Update

**[Action: Scroll to the "Add Update" section]**

> "At the bottom is the **Add Update** form. This is one of the most important actions in the app — regular updates keep issues current and prevent them from going stale."

**[Action: Type a note in the Notes field]**

> "Enter your notes describing what's happened or what the current situation is."

**[Action: Open the Status dropdown]**

> "Optionally change the status — say from 'Active' to 'Monitoring' if we're pausing active work. The lifecycle goes: New, Active, Monitoring, Escalated, and Closed."

**[Action: Select "Monitoring" from dropdown]**

**[Action: Point to the Reassign Group dropdown]**

> "You can also reassign the issue to a different functional group if ownership needs to change."

**[Action: Click "Save Update"]**

> "Click Save. A new entry appears at the top of the timeline. The Days Since Update counter resets to zero, the status badge updates, and the staleness indicator turns blue — Current."

### 7d: Closing an Issue

> "To close an issue, you'd add a final update explaining the resolution and change the status to **Closed**. Closed issues drop out of the active views but remain in the system permanently for audit purposes."

**[Action: Click "< Tracker" back button]**

> "The back button returns us to the Tracker."

---

## SCENE 8: Group Allocation Screen (1 minute)

**[Action: Open hamburger menu, click "Group Allocation"]**

**[Screen: GroupAllocationScreen loads]**

> "The **Group Allocation** screen gives you a visual overview of how issues are distributed across your ten functional groups."

**[Mouse: gesture across the card grid]**

> "Ten colour-coded cards are arranged in a grid. Each card shows the group name and its current count of open issues. The colours tell you the load at a glance:"

**[Mouse: point to a green card, then a blue one, then yellow/red]**

> "**Green** means zero to one open issues — light load. **Blue** is two to three — moderate. **Yellow** is four to five — elevated. And **Pink or Red** means six or more — that group may need support or rebalancing.
>
> At the bottom, a summary row shows the total active count and highlights any issues that don't have a functional group assigned — shown in orange as a warning."

> "This screen is especially valuable for leadership meetings and resource planning — you can immediately see which teams are overloaded and which have capacity."

---

## SCENE 9: Kanban Board (1 minute)

**[Action: Open hamburger menu, click "Kanban Board"]**

**[Screen: KanbanScreen loads]**

> "The **Kanban Board** provides a visual, column-based view of all active issues organised by status."

**[Mouse: sweep across the four columns]**

> "Four columns — **New** in blue, **Active** in orange, **Escalated** in red, and **Monitoring** in light orange. Each issue appears as a card in its status column."

**[Mouse: point to a card]**

> "Each card shows the issue ID, title, owner, functional group, and days since last update. The left-edge accent stripe is colour-coded for staleness — blue for current, orange for aging, red for stale."

**[Mouse: point to the top of a column]**

> "Within each column, the most stale issues sort to the top — so the items needing the most attention are always the most visible."

**[Action: Click on a card]**

> "Click any card to jump straight to the Issue Detail screen for that issue."

**[Action: Click "< Tracker" or use hamburger to go back]**

---

## SCENE 10: Closed Items Screen (1 minute)

**[Action: Open hamburger menu, click "Closed Items"]**

**[Screen: ClosedScreen loads]**

> "The **Closed Items** screen is a dedicated archive of all resolved issues. Once an issue's status is set to Closed, it drops off the active Tracker, Kanban Board, and Group Allocation views — but it doesn't disappear. It lives here."

**[Mouse: gesture across the gallery list]**

> "You see a searchable list of every closed issue. Each row shows the item ID, title, owner, functional group, and the date it was closed — sorted with the most recently closed at the top."

**[Action: Click into the search box and type "RMO"]**

> "The search bar works just like the Tracker — you can search by ID, title, owner, or functional group. Here I've typed 'RMO' to find all closed issues that belonged to the Risk Management Office."

**[Action: Clear search]**

**[Action: Click on a closed issue row]**

> "Click any row to open the full Issue Detail screen for that closed issue — you get the complete audit trail, all updates, and the resolution details. The back button returns you here."

**[Action: Navigate back to Dashboard]**

> "You can also reach this screen directly from the Dashboard — click the yellow Closed Items KPI card and it takes you straight here."

---

## SCENE 11: End-to-End Lifecycle Demo (2 minutes)

**[Screen: Dashboard]**

> "Let me put it all together with a quick end-to-end lifecycle demonstration.
>
> Step one — **Submit.** I'll click Submit New Issue and fill in a test issue."

**[Action: Click "+ Submit New Issue", quickly fill in the form with a test issue, submit]**

> "The issue is now in the Intake Queue as Pending."

**[Action: Navigate back to Dashboard]**

> "Step two — **Triage.** I click the pending item, assign an owner, and accept it into the tracker."

**[Action: Click intake item, assign owner, click Accept]**

> "The issue is now promoted — it has an item ID, it's in the tracker as Status 'New', and there's an audit trail entry recording the promotion."

**[Action: Navigate to Tracker, find the new issue]**

> "Step three — **Track and Update.** Here's our new issue on the Tracker. Let me open it and add an update."

**[Action: Click the issue, add an update changing status to "Active"]**

> "I've changed the status to Active and added a note. The timeline records everything.
>
> Step four — over time, the automated **Daily Staleness Calculator** runs every morning at 6 AM. It calculates how many days since each issue was last updated and sets the staleness flag — Current, Aging, or Stale. No manual work required."

> "Step five — **Resolve and Close.** When the issue is resolved, I add a final update and set the status to Closed."

**[Action: Add final update, change status to "Closed"]**

> "The issue now drops off the active views. The Open Items count decreases, the Closed Items count increases, it disappears from the Kanban board and Group Allocation counts, and it no longer appears in the Stale filter — but it's now browsable on the Closed Items screen, and the complete audit trail is preserved permanently."

---

## SCENE 12: Generate Issue Deck (45 seconds) — Optional

**[Screen: Dashboard — point to the "Generate Issue Deck" button]**

> "One last feature — the **Generate Issue Deck** button. This triggers an automated pipeline that creates a branded PowerPoint report of all current issues."

**[Action: Click the button (or describe the process if the Azure Function isn't deployed)]**

> "When you click it, the system calls an Azure Function that pulls live data from SharePoint, generates a multi-slide PPTX deck — complete with cover page, KPI dashboard, priority summary tables, individual issue detail slides with update timelines, and a stale items attention list — then uploads it to SharePoint and opens it in your browser.
>
> Previous reports are saved in the Shared Documents library, so you always have access to historical snapshots."

---

## SCENE 13: Closing (30 seconds)

**[Screen: Dashboard — full view]**

> "That's the OFR Issue Tracker. To recap what we've covered:
>
> - **Dashboard** with real-time KPIs, intake triage queue, and drill-through navigation
> - **Submit** screen for raising new issues with functional group assignment
> - **Tracker** with filtering, searching, sorting, and quick-update capabilities
> - **Issue Detail** with full audit timeline and status management
> - **Group Allocation** for visualising workload across ten functional groups
> - **Kanban Board** for a visual status-based view
> - **Closed Items** archive for browsing and searching resolved issues
> - Automated **staleness tracking** that runs daily
> - And one-click **report generation** for stakeholder briefings
>
> It's all built natively within Microsoft 365 — no custom infrastructure, no separate logins, and fully auditable end to end.
>
> Thank you for watching."

---

## Appendix: Scene Timing Summary

| Scene | Topic | Est. Duration |
|-------|-------|---------------|
| 1 | Opening & Context | 0:30 |
| 2 | Dashboard — KPIs | 1:00 |
| 3 | Dashboard — Intake & Triage | 2:00 |
| 4 | Navigation — Hamburger Menu | 0:45 |
| 5 | Submit New Issue | 1:30 |
| 6 | Issue Tracker | 2:30 |
| 7 | Issue Detail | 2:00 |
| 8 | Group Allocation | 1:00 |
| 9 | Kanban Board | 1:00 |
| 10 | Closed Items | 1:00 |
| 11 | End-to-End Lifecycle | 2:00 |
| 12 | Generate Issue Deck (optional) | 0:45 |
| 13 | Closing | 0:30 |
| **Total** | | **~15-16 min** |

## Tips for Recording

- **Mouse movements:** Move slowly and deliberately. Hover over elements as you talk about them so the viewer can follow.
- **Pauses:** After clicking a button or submitting a form, pause for 1-2 seconds to let the UI respond before speaking about the result.
- **Zoom:** If your resolution is high, consider zooming the browser to 110-125% so text is readable in the recording.
- **Intake demo order:** Accept one item in Scene 3 so you can show the accept flow. Leave the other pending item for the end-to-end demo in Scene 11, or submit a fresh one.
- **Data state:** The lifecycle demo (Scene 11) creates, promotes, updates, and closes an issue. If you're doing multiple takes, delete the test data between runs to keep the demo clean.
- **If Generate Issue Deck isn't deployed:** You can narrate over a static screenshot of the button or skip Scene 12 entirely. The core demo is complete at Scene 11.
- **Editing:** Scenes are self-contained. You can record them independently and stitch together in post-production if needed.
