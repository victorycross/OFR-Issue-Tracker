import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig.js';
import './index.css';
import App from './App.jsx';

/**
 * MSAL instance — must be created outside of React components
 * to prevent re-instantiation on re-renders.
 */
const msalInstance = new PublicClientApplication(msalConfig);

// Set the active account if one exists from a previous session
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

// Listen for login success events and set the active account
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
