/**
 * ═══════════════════════════════════════════════════════════
 * SHAREPOINT DATA SERVICE
 * ═══════════════════════════════════════════════════════════
 *
 * Domain-specific service that maps the Risk Tracker's data
 * model to/from SharePoint List items via the Graph API.
 *
 * All functions accept a getToken() callback that returns
 * a fresh access token (handled by the MSAL hook in the UI).
 *
 * This layer owns the field mapping between SharePoint column
 * names and the front-end object shape used by App.jsx.
 */

import {
  getSite,
  getListItems,
  createListItem,
  updateListItem,
  deleteListItem,
} from './graphService.js';
import { sharepointConfig } from '../authConfig.js';

const { siteHostname, sitePath, lists } = sharepointConfig;

/* ─── Cached site ID ─── */
let cachedSiteId = null;

/**
 * Resolve and cache the SharePoint site ID
 */
async function resolveSiteId(getToken) {
  if (cachedSiteId) return cachedSiteId;
  const token = await getToken();
  const site = await getSite(token, siteHostname, sitePath);
  cachedSiteId = site.id;
  return cachedSiteId;
}

/**
 * Reset cached site ID (e.g., on logout)
 */
export function resetSiteCache() {
  cachedSiteId = null;
}

/* ═══════════════════════════════════════════════════════════
   FIELD MAPPING
   ═══════════════════════════════════════════════════════════

   SharePoint List Column  →  Front-end Field
   ───────────────────────────────────────────
   OFR_RiskRegister:
     Title                    topic
     ItemID                   id          (OFR-NNN)
     Owner                    owner
     Priority                 priority
     Status                   status
     DateRaised               dateRaised
     LastUpdated              lastUpdated
     NextAction               nextAction
     Source                   (internal)

   OFR_UpdateHistory:
     Title                    (ParentItemID)
     ParentItemID             parentId
     UpdateDate               date
     UpdatedBy                (auto from token)
     StatusAtUpdate           status
     Notes                    text

   OFR_IntakeQueue:
     Title                    title
     Owner                    owner
     Priority                 priority
     Description              description
     DateSubmitted            date
     TriageStatus             (Pending/Promoted/Dismissed)
   ═══════════════════════════════════════════════════════════ */

/* ─── RISK REGISTER ─── */

/**
 * Map a SharePoint list item → front-end tracker item (without history)
 */
function mapRegisterItem(spItem) {
  const f = spItem.fields;
  return {
    _spId: spItem.id, // SharePoint internal item ID for PATCH/DELETE
    id: f.ItemID || f.Title,
    topic: f.Title || '',
    owner: f.Owner || '',
    priority: (f.Priority || 'medium').toLowerCase(),
    status: (f.Status || 'new').toLowerCase(),
    dateRaised: f.DateRaised || f.Created,
    lastUpdated: f.LastUpdated || f.Modified,
    nextAction: f.NextAction || '',
    history: [], // populated separately from UpdateHistory list
  };
}

/**
 * Map front-end fields → SharePoint column values for creation
 */
function toRegisterFields(item) {
  return {
    Title: item.topic,
    ItemID: item.id,
    Owner: item.owner,
    Priority: capitalize(item.priority),
    Status: capitalize(item.status),
    DateRaised: item.dateRaised,
    LastUpdated: item.lastUpdated || new Date().toISOString(),
    NextAction: item.nextAction || '',
    Source: item.source || 'Intake',
  };
}

/**
 * Load all risk register items with their update histories
 */
export async function loadTrackerItems(getToken) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  // Fetch register items
  const registerResult = await getListItems(token, siteId, lists.riskRegister, {
    $expand: 'fields',
    $top: 500,
  });

  const items = (registerResult.value || []).map(mapRegisterItem);

  // Fetch all update history entries (no $orderby — sort client-side to avoid non-indexed column errors)
  const historyResult = await getListItems(token, siteId, lists.updateHistory, {
    $expand: 'fields',
    $top: 5000,
  });

  // Group history entries by parent item ID
  const historyMap = {};
  for (const entry of historyResult.value || []) {
    const f = entry.fields;
    const parentId = f.ParentItemID || f.Title;
    if (!historyMap[parentId]) historyMap[parentId] = [];
    historyMap[parentId].push({
      _spId: entry.id,
      date: f.UpdateDate || f.Created,
      text: f.Notes || '',
      status: (f.StatusAtUpdate || '').toLowerCase(),
    });
  }

  // Sort each group by date ascending (since we couldn't $orderby server-side)
  for (const key of Object.keys(historyMap)) {
    historyMap[key].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Attach history to each register item
  for (const item of items) {
    item.history = historyMap[item.id] || [];
  }

  return items;
}

/**
 * Create a new risk register item with an initial history entry
 */
export async function createTrackerItem(getToken, item) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  // Create the register item
  const created = await createListItem(token, siteId, lists.riskRegister, toRegisterFields(item));

  // Create the initial history entry
  if (item.history && item.history.length > 0) {
    const firstEntry = item.history[0];
    await createListItem(token, siteId, lists.updateHistory, {
      Title: item.id,
      ParentItemID: item.id,
      UpdateDate: firstEntry.date || new Date().toISOString(),
      StatusAtUpdate: capitalize(firstEntry.status),
      Notes: firstEntry.text,
    });
  }

  return { ...item, _spId: created.id };
}

/**
 * Add an update to an existing tracker item
 */
export async function addTrackerUpdate(getToken, itemId, spItemId, update, newStatus) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  const now = new Date().toISOString();

  // Create the history entry
  await createListItem(token, siteId, lists.updateHistory, {
    Title: itemId,
    ParentItemID: itemId,
    UpdateDate: now,
    StatusAtUpdate: capitalize(newStatus),
    Notes: update.text,
  });

  // Update the register item's LastUpdated and optionally Status
  const patchFields = { LastUpdated: now };
  if (newStatus) patchFields.Status = capitalize(newStatus);

  await updateListItem(token, siteId, lists.riskRegister, spItemId, patchFields);
}

/**
 * Update a register item's fields (e.g., status change, next action)
 */
export async function updateTrackerFields(getToken, spItemId, fields) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  const spFields = {};
  if (fields.status) spFields.Status = capitalize(fields.status);
  if (fields.nextAction !== undefined) spFields.NextAction = fields.nextAction;
  if (fields.lastUpdated) spFields.LastUpdated = fields.lastUpdated;

  return updateListItem(token, siteId, lists.riskRegister, spItemId, spFields);
}

/* ─── INTAKE QUEUE ─── */

/**
 * Map a SharePoint intake item → front-end intake item
 */
function mapIntakeItem(spItem) {
  const f = spItem.fields;
  return {
    _spId: spItem.id,
    id: `INT-${spItem.id}`,
    title: f.Title || '',
    owner: f.Owner || 'Unassigned',
    priority: (f.Priority || 'medium').toLowerCase(),
    description: f.Description || '',
    date: f.DateSubmitted || f.Created,
  };
}

/**
 * Load all pending intake items
 */
export async function loadIntakeItems(getToken) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  // Fetch all intake items (no $filter — filter client-side to avoid non-indexed column errors)
  const result = await getListItems(token, siteId, lists.intakeQueue, {
    $expand: 'fields',
    $top: 500,
  });

  // Filter to pending items client-side
  return (result.value || [])
    .filter(item => (item.fields?.TriageStatus || '').toLowerCase() === 'pending')
    .map(mapIntakeItem);
}

/**
 * Create a new intake item
 */
export async function createIntakeItem(getToken, item) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  const created = await createListItem(token, siteId, lists.intakeQueue, {
    Title: item.title,
    Owner: item.owner || 'Unassigned',
    Priority: capitalize(item.priority),
    Description: item.description || '',
    DateSubmitted: new Date().toISOString(),
    TriageStatus: 'Pending',
  });

  return { ...item, _spId: created.id, id: `INT-${created.id}` };
}

/**
 * Promote an intake item → mark as Promoted in SP, then create register item
 */
export async function promoteIntakeItem(getToken, intakeItem, trackerItem) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  // Mark intake as promoted
  await updateListItem(token, siteId, lists.intakeQueue, intakeItem._spId, {
    TriageStatus: 'Promoted',
  });

  // Create the register item
  return createTrackerItem(getToken, trackerItem);
}

/**
 * Dismiss an intake item (mark as Dismissed in SP)
 */
export async function dismissIntakeItem(getToken, spItemId) {
  const siteId = await resolveSiteId(getToken);
  const token = await getToken();

  await updateListItem(token, siteId, lists.intakeQueue, spItemId, {
    TriageStatus: 'Dismissed',
  });
}

/* ─── HELPERS ─── */

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
