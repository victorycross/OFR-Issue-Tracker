import { LogLevel } from '@azure/msal-browser';

/**
 * ═══════════════════════════════════════════════════════════
 * MSAL CONFIGURATION — One Firm Risk Tracker
 * ═══════════════════════════════════════════════════════════
 *
 * Before deploying, register an application in the Microsoft
 * Entra admin center (https://entra.microsoft.com):
 *
 *   1. App registrations → New registration
 *   2. Name: "One Firm Risk Tracker"
 *   3. Supported account types: Accounts in this organizational directory only
 *   4. Redirect URI → Single-page application (SPA):
 *        - Dev:  http://localhost:5173
 *        - Prod: https://<your-azure-static-web-app>.azurestaticapps.net
 *   5. API permissions → Add:
 *        - Microsoft Graph → Delegated → Sites.ReadWrite.All
 *        - Microsoft Graph → Delegated → User.Read
 *   6. Copy the Application (client) ID and Directory (tenant) ID below
 *
 * ═══════════════════════════════════════════════════════════
 */

// ── Replace these with your Entra ID app registration values ──
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'YOUR_TENANT_ID';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'YOUR_CLIENT_ID';

/**
 * MSAL configuration object
 */
export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            break;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            break;
          case LogLevel.Info:
            // console.info('[MSAL]', message);
            break;
          case LogLevel.Verbose:
            // console.debug('[MSAL]', message);
            break;
        }
      },
    },
  },
};

/**
 * Scopes for the login request
 * User.Read — basic profile info (name, email)
 * Sites.ReadWrite.All — read/write SharePoint lists
 */
export const loginRequest = {
  scopes: ['User.Read', 'Sites.ReadWrite.All'],
};

/**
 * Scopes specifically for Graph API calls
 */
export const graphScopes = {
  sharepoint: ['Sites.ReadWrite.All'],
  user: ['User.Read'],
};

/**
 * SharePoint site configuration
 * Update these after creating your SharePoint site and lists
 */
export const sharepointConfig = {
  // The hostname of your SharePoint tenant
  siteHostname: import.meta.env.VITE_SP_HOSTNAME || 'yourcompany.sharepoint.com',

  // The site path (e.g., /sites/ofr-risk)
  sitePath: import.meta.env.VITE_SP_SITE_PATH || '/sites/ofr-risk-tracker',

  // List names — must match the SharePoint Lists you create
  lists: {
    riskRegister: 'OFR_RiskRegister',
    updateHistory: 'OFR_UpdateHistory',
    intakeQueue: 'OFR_IntakeQueue',
  },
};

/**
 * Check if the app has been configured with real credentials
 */
export const isConfigured = () => {
  return CLIENT_ID !== 'YOUR_CLIENT_ID' && TENANT_ID !== 'YOUR_TENANT_ID';
};
