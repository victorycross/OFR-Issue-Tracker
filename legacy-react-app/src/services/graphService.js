/**
 * ═══════════════════════════════════════════════════════════
 * MICROSOFT GRAPH API SERVICE
 * ═══════════════════════════════════════════════════════════
 *
 * Thin wrapper around the Microsoft Graph REST API.
 * All calls use the delegated (user-signed-in) token flow.
 */

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

/**
 * Make an authenticated request to Microsoft Graph.
 *
 * @param {string} accessToken — Bearer token from MSAL
 * @param {string} endpoint — Graph API path (e.g., /me, /sites/…)
 * @param {object} options — fetch options (method, body, etc.)
 * @returns {Promise<object|null>} — parsed JSON response
 */
export async function callGraph(accessToken, endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${GRAPH_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) return null; // No content (DELETE success)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(
      errorBody?.error?.message || `Graph API error: ${response.status} ${response.statusText}`
    );
    error.status = response.status;
    error.code = errorBody?.error?.code;
    throw error;
  }

  return response.json();
}

/**
 * Get the authenticated user's profile
 */
export async function getMe(accessToken) {
  return callGraph(accessToken, '/me');
}

/**
 * Resolve a SharePoint site by hostname + path
 *
 * @param {string} accessToken
 * @param {string} hostname — e.g., "contoso.sharepoint.com"
 * @param {string} sitePath — e.g., "/sites/ofr-risk-tracker"
 * @returns {Promise<object>} — site resource including .id
 */
export async function getSite(accessToken, hostname, sitePath) {
  return callGraph(accessToken, `/sites/${hostname}:${sitePath}`);
}

/**
 * Get all lists on a site
 */
export async function getSiteLists(accessToken, siteId) {
  return callGraph(accessToken, `/sites/${siteId}/lists`);
}

/**
 * Get items from a SharePoint list
 *
 * @param {string} accessToken
 * @param {string} siteId
 * @param {string} listName — display name or list ID
 * @param {object} params — optional OData query params
 * @returns {Promise<object>} — { value: [...items] }
 */
export async function getListItems(accessToken, siteId, listName, params = {}) {
  const query = new URLSearchParams();
  if (params.$expand) query.set('$expand', params.$expand);
  if (params.$filter) query.set('$filter', params.$filter);
  if (params.$orderby) query.set('$orderby', params.$orderby);
  if (params.$top) query.set('$top', String(params.$top));
  if (params.$select) query.set('$select', params.$select);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return callGraph(accessToken, `/sites/${siteId}/lists/${listName}/items${qs}`);
}

/**
 * Create a new item in a SharePoint list
 *
 * @param {string} accessToken
 * @param {string} siteId
 * @param {string} listName
 * @param {object} fields — field values to set
 * @returns {Promise<object>} — created item
 */
export async function createListItem(accessToken, siteId, listName, fields) {
  return callGraph(accessToken, `/sites/${siteId}/lists/${listName}/items`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
}

/**
 * Update an existing list item
 *
 * @param {string} accessToken
 * @param {string} siteId
 * @param {string} listName
 * @param {string} itemId — SharePoint list item ID
 * @param {object} fields — field values to update
 * @returns {Promise<object>} — updated item
 */
export async function updateListItem(accessToken, siteId, listName, itemId, fields) {
  return callGraph(accessToken, `/sites/${siteId}/lists/${listName}/items/${itemId}/fields`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

/**
 * Delete a list item
 *
 * @param {string} accessToken
 * @param {string} siteId
 * @param {string} listName
 * @param {string} itemId
 * @returns {Promise<null>}
 */
export async function deleteListItem(accessToken, siteId, listName, itemId) {
  return callGraph(accessToken, `/sites/${siteId}/lists/${listName}/items/${itemId}`, {
    method: 'DELETE',
  });
}
