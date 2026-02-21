import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  useIsAuthenticated,
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import {
  Shield, AlertTriangle, Clock, CheckCircle2, ChevronDown, ChevronRight,
  Plus, X, ArrowUpDown, Filter, FileText, TrendingUp, Eye,
  Globe, MessageSquarePlus, ArrowRightToLine, CircleDot,
  Flame, BarChart3, CalendarClock, ChevronUp, Search, Download,
  LogIn, LogOut, User, Wifi, WifiOff, Loader2, Database, Play,
} from 'lucide-react';
import { loginRequest, graphScopes, isConfigured } from './authConfig.js';
import {
  loadTrackerItems,
  loadIntakeItems,
  createTrackerItem,
  addTrackerUpdate,
  createIntakeItem,
  promoteIntakeItem,
  dismissIntakeItem,
  resetSiteCache,
} from './services/sharepointService.js';

/* ═══════════════════════════════════════════════════════════
   TRANSLATIONS
   ═══════════════════════════════════════════════════════════ */
const T = {
  en: {
    headerTitle: 'Bright Path Risk Tracker',
    headerSub: 'Risk Management Office',
    langToggle: 'FR',
    dashTitle: 'Weekly Review Summary',
    totalOpen: 'Open Items',
    staleItems: 'Stale',
    highPriority: 'High Priority',
    medPriority: 'Medium',
    lowPriority: 'Low',
    byStatus: 'By Status',
    activeTitle: 'Issue Intake',
    activeSub: 'Triage new issues before they enter the formal tracker',
    addIssue: 'New Issue',
    issueTitle: 'Title',
    issueOwner: 'Owner',
    issuePriority: 'Priority',
    issueDesc: 'Description',
    issueNextAction: 'Next Action',
    submitIssue: 'Submit',
    cancelIssue: 'Cancel',
    moveToTracker: 'Move to Tracker',
    dismissIssue: 'Close',
    noActiveIssues: 'No issues in triage. Use "New Issue" to add one.',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    new: 'New',
    active: 'Active',
    monitoring: 'Monitoring',
    escalated: 'Escalated',
    closed: 'Closed',
    trackerTitle: 'Risk & Issue Register',
    trackerSub: 'Comprehensive tracking with staleness accountability',
    colId: 'ID',
    colTopic: 'Topic',
    colOwner: 'Owner',
    colPriority: 'Priority',
    colStatus: 'Status',
    colDateRaised: 'Date Raised',
    colLastUpdated: 'Last Updated',
    colDaysSince: 'Days Since Update',
    colNextAction: 'Next Action',
    filterAll: 'All Open',
    filterStale: 'Stale Items',
    filterMy: 'My Items',
    filterHigh: 'High Priority',
    filterMed: 'Medium Priority',
    filterLow: 'Low Priority',
    searchPlaceholder: 'Search topics...',
    updateHistory: 'Update History',
    addUpdate: 'Add Update',
    updateText: 'Update notes',
    changeStatus: 'Change status (optional)',
    noChange: '— No change —',
    submitUpdate: 'Save Update',
    cancelUpdate: 'Cancel',
    raisedOn: 'Raised',
    daysAgo: 'd ago',
    today: 'Today',
    items: 'items',
    noResults: 'No items match the current filter.',
    exportCsv: 'Export CSV',
    exportTooltip: 'Export all items with full update history for SharePoint import',
    signIn: 'Sign in with Microsoft',
    signOut: 'Sign out',
    demoMode: 'Demo Mode',
    liveMode: 'Connected',
    startDemo: 'Try Demo',
    connecting: 'Connecting to SharePoint...',
    loadError: 'Failed to load data from SharePoint',
    saving: 'Saving...',
    loginTitle: 'Bright Path Risk Tracker',
    loginSub: 'Sign in with your Bright Path account to access risk data, or try the demo with sample data.',
    welcomeBack: 'Welcome',
    retry: 'Retry',
  },
  fr: {
    headerTitle: 'Suivi des risques Bright Path',
    headerSub: 'Bureau de gestion des risques',
    langToggle: 'EN',
    dashTitle: 'Résumé de la revue hebdomadaire',
    totalOpen: 'Éléments ouverts',
    staleItems: 'Périmés',
    highPriority: 'Priorité haute',
    medPriority: 'Moyen',
    lowPriority: 'Faible',
    byStatus: 'Par statut',
    activeTitle: 'Prise en charge des enjeux',
    activeSub: 'Triez les nouveaux enjeux avant de les inscrire au registre',
    addIssue: 'Nouvel enjeu',
    issueTitle: 'Titre',
    issueOwner: 'Responsable',
    issuePriority: 'Priorité',
    issueDesc: 'Description',
    issueNextAction: 'Prochaine action',
    submitIssue: 'Soumettre',
    cancelIssue: 'Annuler',
    moveToTracker: 'Ajouter au registre',
    dismissIssue: 'Fermer',
    noActiveIssues: 'Aucun enjeu en triage. Cliquez « Nouvel enjeu » pour en ajouter.',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Faible',
    new: 'Nouveau',
    active: 'Actif',
    monitoring: 'En surveillance',
    escalated: 'Escaladé',
    closed: 'Fermé',
    trackerTitle: 'Registre des risques et enjeux',
    trackerSub: 'Suivi complet avec indicateurs de péremption',
    colId: 'ID',
    colTopic: 'Sujet',
    colOwner: 'Responsable',
    colPriority: 'Priorité',
    colStatus: 'Statut',
    colDateRaised: 'Date de signalement',
    colLastUpdated: 'Dernière mise à jour',
    colDaysSince: 'Jours depuis MAJ',
    colNextAction: 'Prochaine action',
    filterAll: 'Tous (ouverts)',
    filterStale: 'Éléments périmés',
    filterMy: 'Mes éléments',
    filterHigh: 'Priorité haute',
    filterMed: 'Priorité moyenne',
    filterLow: 'Priorité faible',
    searchPlaceholder: 'Rechercher...',
    updateHistory: 'Historique des mises à jour',
    addUpdate: 'Ajouter une mise à jour',
    updateText: 'Notes de mise à jour',
    changeStatus: 'Changer le statut (optionnel)',
    noChange: '— Aucun changement —',
    submitUpdate: 'Enregistrer',
    cancelUpdate: 'Annuler',
    raisedOn: 'Signalé',
    daysAgo: 'j',
    today: "Aujourd'hui",
    items: 'éléments',
    noResults: 'Aucun élément ne correspond au filtre actif.',
    exportCsv: 'Exporter CSV',
    exportTooltip: 'Exporter tous les éléments avec historique complet pour import SharePoint',
    signIn: 'Se connecter avec Microsoft',
    signOut: 'Se déconnecter',
    demoMode: 'Mode démo',
    liveMode: 'Connecté',
    startDemo: 'Essayer la démo',
    connecting: 'Connexion à SharePoint...',
    loadError: 'Échec du chargement depuis SharePoint',
    saving: 'Enregistrement...',
    loginTitle: 'Suivi des risques Bright Path',
    loginSub: 'Connectez-vous avec votre compte Bright Path pour accéder aux données, ou essayez la démo.',
    welcomeBack: 'Bienvenue',
    retry: 'Réessayer',
  },
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const now = new Date();
const daysAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const daysBetween = (dateStr) => {
  const d = new Date(dateStr);
  const diff = now - d;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA');
};
const priorityOrder = { high: 0, medium: 1, low: 2 };
const statusOrder = { new: 0, escalated: 1, active: 2, monitoring: 3, closed: 4 };

let nextId = 9;
const genId = () => `OFR-${String(nextId++).padStart(3, '0')}`;

/* ═══════════════════════════════════════════════════════════
   SAMPLE DATA (Demo Mode)
   ═══════════════════════════════════════════════════════════ */
const INITIAL_TRACKER = [
  {
    id: 'OFR-001',
    topic: 'AI Tool Approval Backlog',
    owner: 'S. Marchand',
    priority: 'high',
    status: 'active',
    dateRaised: daysAgo(30),
    lastUpdated: daysAgo(2),
    nextAction: 'Finalize AI governance framework with Tech Risk',
    history: [
      { date: daysAgo(30), text: 'Issue raised: significant backlog in AI tool approval requests. 14 pending requests, oldest is 45 days.', status: 'new' },
      { date: daysAgo(15), text: 'Met with Tech Risk lead. Agreed to weekly triage cadence. Created prioritized queue.', status: 'active' },
      { date: daysAgo(2), text: 'Cleared 8 of 14 requests. Remaining 6 require governance framework clarification.', status: 'active' },
    ],
  },
  {
    id: 'OFR-002',
    topic: 'Third Party Data Processing Agreement Gaps',
    owner: 'A. Chen',
    priority: 'high',
    status: 'active',
    dateRaised: daysAgo(45),
    lastUpdated: daysAgo(18),
    nextAction: 'Complete gap analysis for top 20 vendors',
    history: [
      { date: daysAgo(45), text: 'Identified that 23 of 58 third-party vendors lack compliant data processing agreements.', status: 'new' },
      { date: daysAgo(30), text: 'Engaged procurement and legal to develop remediation template.', status: 'active' },
      { date: daysAgo(18), text: 'Template finalized. Beginning outreach to vendors in priority tier 1.', status: 'active' },
    ],
  },
  {
    id: 'OFR-003',
    topic: 'Independence Monitoring System Upgrade',
    owner: 'R. Patel',
    priority: 'medium',
    status: 'monitoring',
    dateRaised: daysAgo(60),
    lastUpdated: daysAgo(5),
    nextAction: 'Monitor UAT progress; go/no-go decision by month end',
    history: [
      { date: daysAgo(60), text: 'Current independence monitoring system flagged for end-of-life. Replacement needed.', status: 'new' },
      { date: daysAgo(35), text: 'Vendor shortlist finalized. Budget approved. Implementation timeline confirmed.', status: 'active' },
      { date: daysAgo(5), text: 'UAT underway. Minor data migration issues identified — vendor working on fix.', status: 'monitoring' },
    ],
  },
  {
    id: 'OFR-004',
    topic: 'Client Engagement Letter Template Refresh',
    owner: 'L. Thompson',
    priority: 'low',
    status: 'active',
    dateRaised: daysAgo(90),
    lastUpdated: daysAgo(22),
    nextAction: 'Circulate updated templates for partner review',
    history: [
      { date: daysAgo(90), text: 'Templates identified as outdated, missing new regulatory clauses.', status: 'new' },
      { date: daysAgo(50), text: 'Legal review of proposed changes completed.', status: 'active' },
      { date: daysAgo(22), text: 'Drafts updated. Awaiting partner sign-off before firm-wide rollout.', status: 'active' },
    ],
  },
  {
    id: 'OFR-005',
    topic: 'Cross-Border Data Residency Compliance',
    owner: 'M. Dubois',
    priority: 'high',
    status: 'escalated',
    dateRaised: daysAgo(20),
    lastUpdated: daysAgo(1),
    nextAction: 'Present remediation plan to National Risk Committee',
    history: [
      { date: daysAgo(20), text: 'Audit finding: certain client data stored in non-compliant jurisdictions.', status: 'new' },
      { date: daysAgo(10), text: 'Escalated to National Risk Committee. Remediation workstream initiated.', status: 'escalated' },
      { date: daysAgo(1), text: 'Data migration plan drafted. Estimated 6-week timeline for full compliance.', status: 'escalated' },
    ],
  },
  {
    id: 'OFR-006',
    topic: 'Staff Onboarding Security Training Completion Rates',
    owner: 'J. Williams',
    priority: 'medium',
    status: 'active',
    dateRaised: daysAgo(25),
    lastUpdated: daysAgo(10),
    nextAction: 'Send reminder to non-compliant staff; escalate to LoS leaders',
    history: [
      { date: daysAgo(25), text: 'Q4 audit shows 68% completion rate for mandatory security training, below 95% target.', status: 'new' },
      { date: daysAgo(10), text: 'Identified 312 staff with incomplete training. Automated reminders configured.', status: 'active' },
    ],
  },
  {
    id: 'OFR-007',
    topic: 'Subservice Organization SOC Report Reviews',
    owner: 'K. Nakamura',
    priority: 'medium',
    status: 'monitoring',
    dateRaised: daysAgo(40),
    lastUpdated: daysAgo(3),
    nextAction: 'Follow up on 2 outstanding SOC 2 reports due this month',
    history: [
      { date: daysAgo(40), text: 'Annual SOC report review cycle initiated. 18 reports to review.', status: 'new' },
      { date: daysAgo(20), text: '12 of 18 reports received and reviewed. 4 with noted exceptions.', status: 'active' },
      { date: daysAgo(3), text: '16 of 18 complete. 2 reports overdue — escalation letters sent.', status: 'monitoring' },
    ],
  },
  {
    id: 'OFR-008',
    topic: 'Regulatory Change Impact Assessment — OSFI B-13',
    owner: 'D. Lavoie',
    priority: 'high',
    status: 'new',
    dateRaised: daysAgo(0),
    lastUpdated: daysAgo(0),
    nextAction: 'Assign working group and conduct initial impact scoping',
    history: [
      { date: daysAgo(0), text: 'OSFI released updated B-13 guideline on technology and cyber risk management. Impact assessment required.', status: 'new' },
    ],
  },
];

const INITIAL_INTAKE = [
  {
    id: 'INT-001',
    title: 'Potential Conflict of Interest — Project Maple',
    owner: 'B. Roy',
    priority: 'high',
    description: 'Engagement team flagged possible independence concern with advisory mandate overlapping audit client subsidiary.',
    date: daysAgo(0),
  },
  {
    id: 'INT-002',
    title: 'Delayed SOX Testing Sign-offs',
    owner: 'T. Singh',
    priority: 'medium',
    description: 'Three SOX testing cycles behind schedule due to client data access delays. May impact filing deadline.',
    date: daysAgo(1),
  },
];

/* ═══════════════════════════════════════════════════════════
   DATA MODE: Demo vs. SharePoint Live
   ═══════════════════════════════════════════════════════════ */
const MODE_DEMO = 'demo';
const MODE_LIVE = 'live';

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const activeAccount = instance.getActiveAccount();

  const [lang, setLang] = useState('en');
  const t = T[lang];

  // Data mode: 'demo' (sample data) or 'live' (SharePoint)
  const [dataMode, setDataMode] = useState(null); // null = not chosen yet
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [trackerItems, setTrackerItems] = useState([]);
  const [intakeItems, setIntakeItems] = useState([]);

  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [intakeForm, setIntakeForm] = useState({ title: '', owner: '', priority: 'medium', description: '' });

  const [expandedRow, setExpandedRow] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('priority');
  const [sortDir, setSortDir] = useState('asc');

  const [updateModal, setUpdateModal] = useState(null);
  const [updateForm, setUpdateForm] = useState({ text: '', status: '' });

  /* ─── MSAL Token Helper ─── */
  const getToken = useCallback(async () => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: graphScopes.sharepoint,
        account: activeAccount,
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await instance.acquireTokenRedirect({
          scopes: graphScopes.sharepoint,
        });
        return response?.accessToken;
      }
      throw error;
    }
  }, [instance, activeAccount]);

  /* ─── Auth handlers ─── */
  const handleLogin = useCallback(() => {
    instance.loginRedirect(loginRequest).catch((err) => {
      console.error('Login failed:', err);
    });
  }, [instance]);

  const handleLogout = useCallback(() => {
    resetSiteCache();
    setDataMode(null);
    setTrackerItems([]);
    setIntakeItems([]);
    instance.logoutRedirect().catch((err) => {
      console.error('Logout failed:', err);
    });
  }, [instance]);

  /* ─── Start Demo Mode ─── */
  const startDemo = useCallback(() => {
    setDataMode(MODE_DEMO);
    setTrackerItems(INITIAL_TRACKER);
    setIntakeItems(INITIAL_INTAKE);
    setLoadError(null);
  }, []);

  /* ─── Start Live Mode (load from SharePoint) ─── */
  const startLive = useCallback(async () => {
    setDataMode(MODE_LIVE);
    setIsLoading(true);
    setLoadError(null);
    try {
      const [tracker, intake] = await Promise.all([
        loadTrackerItems(getToken),
        loadIntakeItems(getToken),
      ]);
      setTrackerItems(tracker);
      setIntakeItems(intake);
    } catch (err) {
      console.error('Failed to load SharePoint data:', err);
      setLoadError(err.message || 'Failed to connect to SharePoint');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  /* ─── Auto-connect when authenticated & configured ─── */
  const hasAutoConnected = useRef(false);
  useEffect(() => {
    if (isAuthenticated && isConfigured() && !dataMode && !hasAutoConnected.current) {
      hasAutoConnected.current = true;
      startLive();
    }
  }, [isAuthenticated, dataMode, startLive]);

  /* ─── Derived ─── */
  const openItems = useMemo(() => trackerItems.filter((i) => i.status !== 'closed'), [trackerItems]);

  const stats = useMemo(() => {
    const stale = openItems.filter((i) => daysBetween(i.lastUpdated) >= 15).length;
    const high = openItems.filter((i) => i.priority === 'high').length;
    const med = openItems.filter((i) => i.priority === 'medium').length;
    const low = openItems.filter((i) => i.priority === 'low').length;
    const byStatus = {};
    openItems.forEach((i) => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
    return { total: openItems.length, stale, high, med, low, byStatus };
  }, [openItems]);

  const userDisplayName = activeAccount?.name || activeAccount?.username || '';

  const filteredItems = useMemo(() => {
    let items = [...openItems];
    if (activeFilter === 'stale') items = items.filter((i) => daysBetween(i.lastUpdated) >= 15);
    else if (activeFilter === 'my') {
      // In live mode, match on the authenticated user's name; in demo, use placeholder
      const myName = dataMode === MODE_LIVE && userDisplayName
        ? userDisplayName.toLowerCase()
        : 's. marchand';
      items = items.filter((i) => i.owner.toLowerCase().includes(myName));
    }
    else if (activeFilter === 'high') items = items.filter((i) => i.priority === 'high');
    else if (activeFilter === 'medium') items = items.filter((i) => i.priority === 'medium');
    else if (activeFilter === 'low') items = items.filter((i) => i.priority === 'low');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) =>
        i.topic.toLowerCase().includes(q) || i.owner.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      else if (sortCol === 'status') cmp = statusOrder[a.status] - statusOrder[b.status];
      else if (sortCol === 'topic') cmp = a.topic.localeCompare(b.topic);
      else if (sortCol === 'owner') cmp = a.owner.localeCompare(b.owner);
      else if (sortCol === 'dateRaised') cmp = new Date(a.dateRaised) - new Date(b.dateRaised);
      else if (sortCol === 'lastUpdated') cmp = new Date(a.lastUpdated) - new Date(b.lastUpdated);
      else if (sortCol === 'daysSince') cmp = daysBetween(b.lastUpdated) - daysBetween(a.lastUpdated);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [openItems, activeFilter, searchQuery, sortCol, sortDir, dataMode, userDisplayName]);

  /* ─── Handlers ─── */
  const handleIntakeSubmit = useCallback(async () => {
    if (!intakeForm.title.trim()) return;
    const newItem = {
      id: `INT-${String(Date.now()).slice(-3)}`,
      title: intakeForm.title,
      owner: intakeForm.owner || 'Unassigned',
      priority: intakeForm.priority,
      description: intakeForm.description,
      date: new Date().toISOString(),
    };

    if (dataMode === MODE_LIVE) {
      setIsSaving(true);
      try {
        const created = await createIntakeItem(getToken, newItem);
        setIntakeItems((prev) => [...prev, created]);
      } catch (err) {
        console.error('Failed to create intake item:', err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIntakeItems((prev) => [...prev, newItem]);
    }
    setIntakeForm({ title: '', owner: '', priority: 'medium', description: '' });
    setShowIntakeForm(false);
  }, [intakeForm, dataMode, getToken]);

  const moveToTracker = useCallback(async (intake) => {
    const newItem = {
      id: genId(),
      topic: intake.title,
      owner: intake.owner,
      priority: intake.priority,
      status: 'new',
      dateRaised: intake.date,
      lastUpdated: new Date().toISOString(),
      nextAction: intake.description,
      history: [{ date: new Date().toISOString(), text: `Triaged from intake: ${intake.description}`, status: 'new' }],
    };

    if (dataMode === MODE_LIVE) {
      setIsSaving(true);
      try {
        const created = await promoteIntakeItem(getToken, intake, newItem);
        setTrackerItems((prev) => [...prev, created]);
        setIntakeItems((prev) => prev.filter((i) => i.id !== intake.id));
      } catch (err) {
        console.error('Failed to promote intake item:', err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setTrackerItems((prev) => [...prev, newItem]);
      setIntakeItems((prev) => prev.filter((i) => i.id !== intake.id));
    }
  }, [dataMode, getToken]);

  const dismissIntake = useCallback(async (id) => {
    const item = intakeItems.find((i) => i.id === id);
    if (dataMode === MODE_LIVE && item?._spId) {
      setIsSaving(true);
      try {
        await dismissIntakeItem(getToken, item._spId);
      } catch (err) {
        console.error('Failed to dismiss intake item:', err);
      } finally {
        setIsSaving(false);
      }
    }
    setIntakeItems((prev) => prev.filter((i) => i.id !== id));
  }, [dataMode, getToken, intakeItems]);

  const handleUpdate = useCallback(async () => {
    if (!updateForm.text.trim() || !updateModal) return;
    const item = trackerItems.find((i) => i.id === updateModal);
    if (!item) return;

    const newStatus = updateForm.status || item.status;
    const nowISO = new Date().toISOString();

    if (dataMode === MODE_LIVE && item._spId) {
      setIsSaving(true);
      try {
        await addTrackerUpdate(getToken, item.id, item._spId, updateForm, newStatus);
        setTrackerItems((prev) =>
          prev.map((it) => {
            if (it.id !== updateModal) return it;
            return {
              ...it,
              status: newStatus,
              lastUpdated: nowISO,
              history: [...it.history, { date: nowISO, text: updateForm.text, status: newStatus }],
            };
          })
        );
      } catch (err) {
        console.error('Failed to add update:', err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setTrackerItems((prev) =>
        prev.map((it) => {
          if (it.id !== updateModal) return it;
          return {
            ...it,
            status: newStatus,
            lastUpdated: nowISO,
            history: [...it.history, { date: nowISO, text: updateForm.text, status: newStatus }],
          };
        })
      );
    }
    setUpdateModal(null);
    setUpdateForm({ text: '', status: '' });
  }, [updateModal, updateForm, dataMode, getToken, trackerItems]);

  const handleSort = useCallback((col) => {
    setSortCol((prev) => {
      if (prev === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return col;
      }
      setSortDir('asc');
      return col;
    });
  }, []);

  /* ─── CSV Export ─── */
  const handleExportCSV = useCallback(() => {
    const escCSV = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const statusLabels = { new: 'New', active: 'Active', monitoring: 'Monitoring', escalated: 'Escalated', closed: 'Closed' };
    const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };
    const stalenessLabel = (days) => days >= 15 ? 'Stale' : days >= 8 ? 'Aging' : 'Current';

    const headers = [
      'Item ID', 'Topic', 'Owner', 'Priority', 'Current Status',
      'Date Raised', 'Last Updated', 'Days Since Update', 'Staleness',
      'Next Action', 'Update Number', 'Update Date', 'Update Status', 'Update Notes',
    ];

    const rows = [];
    const sorted = [...trackerItems].sort((a, b) => a.id.localeCompare(b.id));

    for (const item of sorted) {
      const days = daysBetween(item.lastUpdated);
      const baseFields = [
        item.id, item.topic, item.owner,
        priorityLabels[item.priority] || item.priority,
        statusLabels[item.status] || item.status,
        formatDate(item.dateRaised), formatDate(item.lastUpdated),
        days, stalenessLabel(days), item.nextAction,
      ];

      if (item.history.length === 0) {
        rows.push([...baseFields, '', '', '', ''].map(escCSV).join(','));
      } else {
        item.history.forEach((entry, idx) => {
          rows.push([
            ...baseFields, idx + 1, formatDate(entry.date),
            statusLabels[entry.status] || entry.status, entry.text,
          ].map(escCSV).join(','));
        });
      }
    }

    const csv = '\uFEFF' + headers.map(escCSV).join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OFR_Risk_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [trackerItems]);

  /* ─── Sub-components ─── */
  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: 'bg-risk-red/10 text-risk-red border-risk-red/20',
      medium: 'bg-risk-amber/10 text-risk-amber border-risk-amber/20',
      low: 'bg-risk-green/10 text-risk-green border-risk-green/20',
    };
    const labels = { high: t.high, medium: t.medium, low: t.low };
    const dots = { high: 'bg-risk-red', medium: 'bg-risk-amber', low: 'bg-risk-green' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium border rounded ${colors[priority]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dots[priority]}`} />
        {labels[priority]}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      new: 'bg-navy-100 text-navy-700 border-navy-200',
      active: 'bg-blue-50 text-blue-700 border-blue-200',
      monitoring: 'bg-risk-amber/8 text-risk-amber border-risk-amber/20',
      escalated: 'bg-escalated-purple-light text-escalated-purple border-purple-200',
      closed: 'bg-gray-100 text-gray-500 border-gray-200',
    };
    const labels = { new: t.new, active: t.active, monitoring: t.monitoring, escalated: t.escalated, closed: t.closed };
    const icons = {
      new: <CircleDot className="w-3 h-3" />,
      active: <TrendingUp className="w-3 h-3" />,
      monitoring: <Eye className="w-3 h-3" />,
      escalated: <Flame className="w-3 h-3" />,
      closed: <CheckCircle2 className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium border rounded ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const DaysBadge = ({ days }) => {
    let color = 'bg-risk-green/10 text-risk-green';
    let icon = <CheckCircle2 className="w-3 h-3" />;
    if (days >= 15) {
      color = 'bg-risk-red/10 text-risk-red';
      icon = <AlertTriangle className="w-3 h-3" />;
    } else if (days >= 8) {
      color = 'bg-risk-amber/10 text-risk-amber';
      icon = <Clock className="w-3 h-3" />;
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded ${color} ${days >= 15 ? 'stale-pulse' : ''}`}>
        {icon}
        {days === 0 ? t.today : `${days}${t.daysAgo}`}
      </span>
    );
  };

  const SortHeader = ({ col, children, className = '' }) => (
    <th
      className={`px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-navy-500 cursor-pointer select-none hover:text-navy-800 transition-colors ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortCol === col ? (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );

  /* ═══════════════════════════════════════════════════════════
     LOGIN SCREEN
     ═══════════════════════════════════════════════════════════ */
  if (!dataMode) {
    return (
      <div className="min-h-screen login-bg login-pattern flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/20 border border-white/10">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white mb-3 tracking-tight">
              {t.loginTitle}
            </h1>
            <p className="text-sm text-navy-300 leading-relaxed max-w-sm mx-auto">
              {t.loginSub}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
            {/* Sign in with Microsoft */}
            <UnauthenticatedTemplate>
              <button
                onClick={handleLogin}
                disabled={!isConfigured()}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-b border-navy-100"
              >
                <LogIn className="w-5 h-5" />
                {t.signIn}
              </button>
              {!isConfigured() && (
                <div className="px-6 py-3 bg-risk-amber/5 border-b border-navy-100">
                  <p className="text-[11px] text-risk-amber font-medium">
                    {lang === 'en'
                      ? 'MSAL not configured. Set VITE_CLIENT_ID and VITE_TENANT_ID in .env to enable live mode.'
                      : 'MSAL non configuré. Définir VITE_CLIENT_ID et VITE_TENANT_ID dans .env pour activer le mode en direct.'}
                  </p>
                </div>
              )}
            </UnauthenticatedTemplate>

            {/* Already authenticated — connect to SharePoint */}
            <AuthenticatedTemplate>
              <div className="px-6 py-5 border-b border-navy-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-navy-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{t.welcomeBack}, {activeAccount?.name || ''}</p>
                    <p className="text-xs text-navy-400">{activeAccount?.username || ''}</p>
                  </div>
                </div>
                {isConfigured() && (
                  <button
                    onClick={startLive}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-blue hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.connecting}
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        {lang === 'en' ? 'Connect to SharePoint' : 'Connecter à SharePoint'}
                      </>
                    )}
                  </button>
                )}
                {loadError && (
                  <div className="mt-3 p-3 bg-risk-red/5 border border-risk-red/20 rounded-xl">
                    <p className="text-xs text-risk-red font-medium mb-2">{t.loadError}</p>
                    <p className="text-[11px] text-navy-500 mb-2">{loadError}</p>
                    <button onClick={startLive} className="text-[11px] font-semibold text-navy-700 hover:text-navy-900 cursor-pointer">
                      {t.retry}
                    </button>
                  </div>
                )}
              </div>
            </AuthenticatedTemplate>

            {/* Demo mode — always available */}
            <button
              onClick={startDemo}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium text-navy-500 hover:text-navy-700 hover:bg-navy-50/50 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {t.startDemo}
              <span className="text-[10px] bg-navy-100 text-navy-500 px-2.5 py-0.5 rounded-full font-semibold ml-1">
                {lang === 'en' ? 'Sample Data' : 'Données fictives'}
              </span>
            </button>
          </div>

          {/* Language toggle */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              {t.langToggle}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     LOADING STATE
     ═══════════════════════════════════════════════════════════ */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-25 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-navy-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-navy-500 font-medium">{t.connecting}</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-25">
      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-navy-900 text-white text-center py-1.5 text-[11px] font-medium flex items-center justify-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t.saving}
        </div>
      )}

      {/* HEADER */}
      <header className="header-gradient">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-[family-name:var(--font-display)] text-lg font-bold tracking-tight leading-tight">
                {t.headerTitle}
              </h1>
              <p className="text-navy-400 text-[11px] font-medium tracking-wide uppercase">
                {t.headerSub}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection status badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
              dataMode === MODE_LIVE
                ? 'bg-risk-green/15 text-risk-green border border-risk-green/20'
                : 'bg-risk-amber/15 text-risk-amber border border-risk-amber/20'
            }`}>
              {dataMode === MODE_LIVE ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {dataMode === MODE_LIVE ? t.liveMode : t.demoMode}
            </div>

            {/* User info & sign out (if authenticated) */}
            {isAuthenticated && activeAccount && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-navy-400 font-medium hidden sm:inline">
                  {activeAccount.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white text-[11px] font-medium transition-all cursor-pointer"
                  title={t.signOut}
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/8 hover:bg-white/15 border border-white/10 rounded text-white text-sm font-medium transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
        {/* Error banner for SharePoint load failure */}
        {loadError && dataMode === MODE_LIVE && (
          <div className="bg-risk-red/5 border border-risk-red/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-semibold text-risk-red">{t.loadError}</p>
              <p className="text-xs text-navy-500 mt-1">{loadError}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={startLive} className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-navy-800 transition-colors">
                {t.retry}
              </button>
              <button onClick={startDemo} className="px-3 py-2 text-xs font-medium text-navy-600 hover:text-navy-800 cursor-pointer">
                {t.startDemo}
              </button>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-blue" />
            <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-navy-800 tracking-tight">
              {t.dashTitle}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="stat-card stat-card-blue bg-white border border-navy-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{t.totalOpen}</div>
                <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-brand-blue" />
                </div>
              </div>
              <div className="text-3xl font-[family-name:var(--font-display)] font-bold text-navy-900">{stats.total}</div>
            </div>
            <div className={`stat-card ${stats.stale > 0 ? 'stat-card-red' : 'stat-card-default'} bg-white border rounded-xl p-5 shadow-sm ${stats.stale > 0 ? 'border-risk-red/20 bg-risk-red-light' : 'border-navy-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider flex items-center gap-1.5">
                  {t.staleItems}
                  {stats.stale > 0 && (
                    <span className="bg-risk-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {stats.stale}
                    </span>
                  )}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.stale > 0 ? 'bg-risk-red/10' : 'bg-navy-100'}`}>
                  <AlertTriangle className={`w-4 h-4 ${stats.stale > 0 ? 'text-risk-red' : 'text-navy-400'}`} />
                </div>
              </div>
              <div className={`text-3xl font-[family-name:var(--font-display)] font-bold ${stats.stale > 0 ? 'text-risk-red' : 'text-navy-900'}`}>
                {stats.stale}
              </div>
            </div>
            <div className="stat-card stat-card-red bg-white border border-navy-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{t.highPriority}</div>
                <div className="w-8 h-8 bg-risk-red/10 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-risk-red" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-risk-red">{stats.high}</span>
                <span className="text-xs text-navy-400">{t.items}</span>
              </div>
            </div>
            <div className="stat-card stat-card-amber bg-white border border-navy-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{t.medPriority}</div>
                <div className="w-8 h-8 bg-risk-amber/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-risk-amber" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-risk-amber">{stats.med}</span>
                <span className="text-xs text-navy-400">{t.items}</span>
              </div>
            </div>
            <div className="stat-card stat-card-green bg-white border border-navy-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{t.lowPriority}</div>
                <div className="w-8 h-8 bg-risk-green/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-risk-green" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-risk-green">{stats.low}</span>
                <span className="text-xs text-navy-400">{t.items}</span>
              </div>
            </div>
          </div>
          {/* Status breakdown with visual bar */}
          <div className="mt-4 bg-white border border-navy-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{t.byStatus}</span>
              <div className="flex items-center gap-4 flex-wrap">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-navy-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            {stats.total > 0 && (
              <div className="status-bar">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const colors = { new: '#3d6191', active: '#2563eb', monitoring: '#c47a1e', escalated: '#6b21a8' };
                  return (
                    <div
                      key={status}
                      className="status-bar-segment"
                      style={{ width: `${(count / stats.total) * 100}%`, backgroundColor: colors[status] || '#8aa3c4' }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* INTAKE */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-risk-amber" />
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-navy-800 tracking-tight">
                  {t.activeTitle}
                </h2>
                <p className="text-xs text-navy-400 mt-0.5">{t.activeSub}</p>
              </div>
            </div>
            <button
              onClick={() => setShowIntakeForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addIssue}
            </button>
          </div>

          {showIntakeForm && (
            <div className="bg-white border border-navy-200 rounded-xl p-5 mb-4 card-enter shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5">{t.issueTitle}</label>
                  <input
                    type="text"
                    value={intakeForm.title}
                    onChange={(e) => setIntakeForm({ ...intakeForm, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5">{t.issueOwner}</label>
                  <input
                    type="text"
                    value={intakeForm.owner}
                    onChange={(e) => setIntakeForm({ ...intakeForm, owner: e.target.value })}
                    className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5">{t.issuePriority}</label>
                  <select
                    value={intakeForm.priority}
                    onChange={(e) => setIntakeForm({ ...intakeForm, priority: e.target.value })}
                    className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 bg-white focus:outline-none focus:border-brand-blue cursor-pointer"
                  >
                    <option value="high">{t.high}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="low">{t.low}</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5">{t.issueDesc}</label>
                <textarea
                  value={intakeForm.description}
                  onChange={(e) => setIntakeForm({ ...intakeForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 resize-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => { setShowIntakeForm(false); setIntakeForm({ title: '', owner: '', priority: 'medium', description: '' }); }}
                  className="px-4 py-2 text-xs font-medium text-navy-600 hover:text-navy-800 cursor-pointer"
                >
                  {t.cancelIssue}
                </button>
                <button
                  onClick={handleIntakeSubmit}
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  {t.submitIssue}
                </button>
              </div>
            </div>
          )}

          {intakeItems.length === 0 && !showIntakeForm ? (
            <div className="bg-white border border-dashed border-navy-200 rounded-xl p-8 text-center text-sm text-navy-400">
              {t.noActiveIssues}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...intakeItems]
                .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(b.date) - new Date(a.date))
                .map((item) => (
                  <div key={item.id} className={`intake-card intake-card-${item.priority} bg-white border border-navy-100 rounded-xl pl-6 pr-4 py-4 card-enter shadow-sm`}>
                    <div className="flex items-start justify-between mb-2">
                      <PriorityBadge priority={item.priority} />
                      <span className="text-[10px] text-navy-400 font-medium">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-navy-900 mb-1.5 leading-snug">{item.title}</h3>
                    <p className="text-xs text-navy-500 mb-4 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-navy-50">
                      <span className="text-xs text-navy-400 font-medium">{item.owner}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveToTracker(item)}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-navy-700 hover:bg-navy-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <ArrowRightToLine className="w-3 h-3" />
                          {t.moveToTracker}
                        </button>
                        <button
                          onClick={() => dismissIntake(item.id)}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-navy-400 hover:text-risk-red hover:bg-risk-red/5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* TRACKER TABLE */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-navy-500" />
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-navy-800 tracking-tight">
                  {t.trackerTitle}
                </h2>
                <p className="text-xs text-navy-400 mt-0.5">{t.trackerSub}</p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              title={t.exportTooltip}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-navy-200 hover:bg-navy-50 hover:border-navy-300 text-navy-700 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              {t.exportCsv}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white border border-navy-100 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-navy-400" />
            {[
              { key: 'all', label: t.filterAll },
              { key: 'stale', label: t.filterStale },
              { key: 'my', label: t.filterMy },
              { key: 'high', label: t.filterHigh },
              { key: 'medium', label: t.filterMed },
              { key: 'low', label: t.filterLow },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`filter-chip px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  activeFilter === f.key
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {f.label}
                {f.key === 'stale' && stats.stale > 0 && (
                  <span className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeFilter === 'stale' ? 'bg-white/20 text-white' : 'bg-risk-red text-white'
                  }`}>
                    {stats.stale}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto relative">
              <Search className="w-3.5 h-3.5 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-9 pr-3 py-2 border border-navy-200 rounded-lg text-xs text-navy-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 w-52 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-navy-100 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="tracker-table w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-navy-100 bg-navy-50/70">
                    <th className="w-8 px-3 py-3" />
                    <SortHeader col="id" className="w-20">{t.colId}</SortHeader>
                    <SortHeader col="topic">{t.colTopic}</SortHeader>
                    <SortHeader col="owner" className="w-32">{t.colOwner}</SortHeader>
                    <SortHeader col="priority" className="w-24">{t.colPriority}</SortHeader>
                    <SortHeader col="status" className="w-28">{t.colStatus}</SortHeader>
                    <SortHeader col="dateRaised" className="w-24">{t.colDateRaised}</SortHeader>
                    <SortHeader col="lastUpdated" className="w-24">{t.colLastUpdated}</SortHeader>
                    <SortHeader col="daysSince" className="w-24">{t.colDaysSince}</SortHeader>
                    <th className="px-3 py-3 w-10" />
                  </tr>
                </thead>
                {filteredItems.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-sm text-navy-400">
                        {t.noResults}
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  filteredItems.map((item) => {
                    const days = daysBetween(item.lastUpdated);
                    const isExpanded = expandedRow === item.id;
                    const isStale = days >= 15;
                    return (
                      <tbody key={item.id}>
                        <tr
                          className={`border-b border-navy-50 cursor-pointer ${
                            isStale ? 'bg-risk-red-light/50 hover:bg-risk-red-light' : 'hover:bg-brand-blue-light/50'
                          } ${isExpanded ? 'bg-navy-50' : ''}`}
                          onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                        >
                          <td className="px-3 py-3.5 text-navy-400">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </td>
                          <td className="px-3 py-3.5 text-[11px] font-mono text-navy-400">{item.id}</td>
                          <td className="px-3 py-3.5">
                            <span className={`font-medium text-[13px] text-navy-900 ${isStale ? 'text-risk-red' : ''}`}>
                              {item.topic}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-navy-600 text-[13px]">{item.owner}</td>
                          <td className="px-3 py-3.5"><PriorityBadge priority={item.priority} /></td>
                          <td className="px-3 py-3.5"><StatusBadge status={item.status} /></td>
                          <td className="px-3 py-3.5 text-xs text-navy-500">{formatDate(item.dateRaised)}</td>
                          <td className="px-3 py-3.5 text-xs text-navy-500">{formatDate(item.lastUpdated)}</td>
                          <td className="px-3 py-3.5"><DaysBadge days={days} /></td>
                          <td className="px-3 py-3.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpdateModal(item.id);
                                setUpdateForm({ text: '', status: '' });
                              }}
                              className="p-1.5 text-navy-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all cursor-pointer"
                              title={t.addUpdate}
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="row-expand">
                            <td colSpan={10} className="p-0">
                              <div className="px-6 py-4 bg-navy-50/30 border-b border-navy-100">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold text-navy-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <CalendarClock className="w-3.5 h-3.5" />
                                    {t.updateHistory}
                                  </h4>
                                  <div className="text-[11px] text-navy-400">
                                    {t.colNextAction}: <span className="text-navy-700 font-medium">{item.nextAction}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {[...item.history].reverse().map((entry, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                      <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-navy-300 mt-1.5 shrink-0" />
                                        {idx < item.history.length - 1 && <div className="w-px flex-1 bg-navy-200 min-h-[20px]" />}
                                      </div>
                                      <div className="pb-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[11px] font-medium text-navy-500">{formatDate(entry.date)}</span>
                                          <StatusBadge status={entry.status} />
                                        </div>
                                        <p className="text-[13px] text-navy-700 leading-relaxed">{entry.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })
                )}
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* UPDATE MODAL */}
      {updateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
          style={{ backgroundColor: 'rgba(10, 22, 40, 0.6)' }}
          onClick={() => setUpdateModal(null)}
        >
          <div className="modal-content bg-white border border-navy-200 rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-navy-900">
                {t.addUpdate}: {trackerItems.find((i) => i.id === updateModal)?.id}
              </h3>
              <button onClick={() => setUpdateModal(null)} className="p-1 text-navy-400 hover:text-navy-700 hover:bg-navy-100 rounded-lg cursor-pointer transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5">{t.updateText}</label>
                <textarea
                  value={updateForm.text}
                  onChange={(e) => setUpdateForm({ ...updateForm, text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 resize-none transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5">{t.changeStatus}</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 bg-white focus:outline-none focus:border-brand-blue cursor-pointer"
                >
                  <option value="">{t.noChange}</option>
                  <option value="new">{t.new}</option>
                  <option value="active">{t.active}</option>
                  <option value="monitoring">{t.monitoring}</option>
                  <option value="escalated">{t.escalated}</option>
                  <option value="closed">{t.closed}</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-navy-100 bg-navy-50/30 rounded-b-2xl">
              <button
                onClick={() => setUpdateModal(null)}
                className="px-4 py-2 text-xs font-medium text-navy-600 hover:text-navy-800 cursor-pointer"
              >
                {t.cancelUpdate}
              </button>
              <button
                onClick={handleUpdate}
                disabled={!updateForm.text.trim() || isSaving}
                className="px-5 py-2 bg-brand-blue hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                {t.submitUpdate}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-[1440px] mx-auto px-6 py-6 border-t border-navy-100 mt-8">
        <p className="text-xs text-navy-400 text-center">
          {dataMode === MODE_DEMO
            ? (lang === 'en'
              ? 'Bright Path Risk Tracker \u2014 Demo Mode with sample data. Sign in to connect to SharePoint.'
              : "Suivi des risques Bright Path \u2014 Mode d\u00e9mo avec donn\u00e9es fictives. Connectez-vous pour acc\u00e9der \u00e0 SharePoint.")
            : (lang === 'en'
              ? 'Bright Path Risk Tracker \u2014 Connected to SharePoint. Data is persisted to your M365 tenant.'
              : 'Suivi des risques \u2014 Connect\u00e9 \u00e0 SharePoint. Les donn\u00e9es sont enregistr\u00e9es dans votre tenant M365.')}
        </p>
      </footer>
    </div>
  );
}
