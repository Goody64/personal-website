// ========================================
// Life ERP - Admin JavaScript
// ========================================

// Storage Keys (dataService uses these for localStorage fallback)
const STORAGE_KEYS = {
  tasks: 'lifeErp_tasks',
  goals: 'lifeErp_goals',
  habits: 'lifeErp_habits',
  finance: 'lifeErp_finance',
  journal: 'lifeErp_journal',
  lifeLog: 'lifeErp_lifeLog',
  theme: 'lifeErp_theme',
  notifications: 'lifeErp_notifications',
  collapsedAccounts: 'lifeErp_collapsedAccounts'
};

// Activity Types Configuration
const ACTIVITY_TYPES = {
  tv: { name: 'TV Show', icon: 'fa-tv', color: '#8b5cf6', plural: 'episodes', 
    fields: [
      { key: 'show', label: 'Show Name', type: 'text', required: true },
      { key: 'season', label: 'Season', type: 'number' },
      { key: 'episode', label: 'Episode', type: 'number' },
      { key: 'repeat', label: 'Rewatch # (0=first, 1+=which rewatch)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  movie: { name: 'Movie', icon: 'fa-film', color: '#ec4899', plural: 'movies',
    fields: [
      { key: 'title', label: 'Movie Title', type: 'text', required: true },
      { key: 'rating', label: 'Rating (1-10)', type: 'number' },
      { key: 'repeat', label: 'Rewatch # (0=first, 1+=which rewatch)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  game: { name: 'Gaming', icon: 'fa-gamepad', color: '#22c55e', plural: 'sessions',
    fields: [
      { key: 'game', label: 'Game', type: 'text', required: true },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'repeat', label: 'Replay # (0=first, 1+=which replay)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  golf: { name: 'Golf', icon: 'fa-golf-ball', color: '#10b981', plural: 'rounds',
    fields: [
      { key: 'course', label: 'Course', type: 'text', required: true },
      { key: 'score', label: 'Score', type: 'number' },
      { key: 'holes', label: 'Holes', type: 'select', options: ['9', '18'] },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  climbing: { name: 'Climbing', icon: 'fa-mountain', color: '#f97316', plural: 'sessions',
    fields: [
      { key: 'location', label: 'Gym/Location', type: 'text', required: true },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'hardestGrade', label: 'Hardest Grade', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  workout: { name: 'Workout', icon: 'fa-dumbbell', color: '#6366f1', plural: 'workouts',
    fields: [
      { key: 'type', label: 'Workout Type', type: 'text', required: true },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  run: { name: 'Run', icon: 'fa-running', color: '#0ea5e9', plural: 'runs',
    fields: [
      { key: 'distance', label: 'Distance (mi)', type: 'number', required: true },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  purchase: { name: 'Purchase', icon: 'fa-shopping-bag', color: '#f59e0b', plural: 'purchases',
    fields: [
      { key: 'item', label: 'Item', type: 'text', required: true },
      { key: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { key: 'store', label: 'Store', type: 'text' },
      { key: 'addToFinance', label: 'Also add to Finance', type: 'checkbox' },
      { key: 'financeCategory', label: 'Finance category', type: 'select', options: ['Food', 'Shopping', 'Entertainment', 'Transport', 'Housing', 'Utilities', 'Other'] },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  meal: { name: 'Meal', icon: 'fa-utensils', color: '#14b8a6', plural: 'meals',
    fields: [
      { key: 'meal', label: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
      { key: 'description', label: 'What you ate', type: 'text' },
      { key: 'restaurant', label: 'Restaurant', type: 'text' },
      { key: 'amount', label: 'Amount ($)', type: 'number' },
      { key: 'addToFinance', label: 'Also add to Finance', type: 'checkbox' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  book: { name: 'Reading', icon: 'fa-book', color: '#a855f7', plural: 'sessions',
    fields: [
      { key: 'title', label: 'Book Title', type: 'text', required: true },
      { key: 'pages', label: 'Pages Read', type: 'number' },
      { key: 'finished', label: 'Finished Book', type: 'checkbox' },
      { key: 'repeat', label: 'Re-read # (0=first, 1+=which re-read)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  social: { name: 'Social', icon: 'fa-users', color: '#0ea5e9', plural: 'hangouts',
    fields: [
      { key: 'people', label: 'Who', type: 'text', required: true },
      { key: 'activity', label: 'What', type: 'text' },
      { key: 'location', label: 'Where', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  health: { name: 'Health', icon: 'fa-heartbeat', color: '#ef4444', plural: 'entries',
    fields: [
      { key: 'metric', label: 'Metric', type: 'select', options: ['Weight', 'Steps', 'Sleep (hrs)', 'Water (glasses)', 'Calories', 'Blood Pressure', 'Other'], required: true },
      { key: 'value', label: 'Value', type: 'number', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  sports: { name: 'Sports', icon: 'fa-trophy', color: '#eab308', plural: 'events',
    fields: [
      { key: 'event', label: 'Event / Match', type: 'text', required: true },
      { key: 'sport', label: 'Sport / Game', type: 'text', required: true },
      { key: 'venue', label: 'How', type: 'select', options: ['In Person', 'TV', 'Stream', 'Online'], required: true },
      { key: 'location', label: 'Location / Platform', type: 'text' },
      { key: 'teams', label: 'Teams / Competitors', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  event: { name: 'Event', icon: 'fa-calendar-check', color: '#3b82f6', plural: 'events',
    fields: [
      { key: 'title', label: 'Event', type: 'text', required: true },
      { key: 'time', label: 'Time', type: 'time' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  note: { name: 'Note', icon: 'fa-sticky-note', color: '#64748b', plural: 'notes',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'textarea' }
    ]},
  work: { name: 'Work', icon: 'fa-briefcase', color: '#475569', plural: 'sessions',
    fields: [
      { key: 'category', label: 'Category', type: 'select', options: ['Job', 'School', 'Personal'], required: true },
      { key: 'subtype', label: 'Subtype', type: 'select', options: [], required: true },
      { key: 'title', label: 'What you worked on', type: 'text', required: true },
      { key: 'project', label: 'Project / Course', type: 'text' },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]}
};

// Work subtypes per category (used for dynamic subtype options)
const WORK_SUBTYPES = {
  Job: ['Meeting', 'Coding', 'Admin', 'Email', 'Review', 'Planning', 'Documentation', 'Interview', 'Other'],
  School: ['Assignment', 'Exam', 'Lecture', 'Study', 'Reading', 'Lab', 'Research', 'Group project', 'Other'],
  Personal: ['Side project', 'Hobby', 'Research', 'Learning', 'Building', 'Writing', 'Design', 'Other']
};

// ========================================
// Utility Functions
// ========================================
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
// Parse YYYY-MM-DD as local date (avoids timezone offset bug)
const parseLocalDate = (dateStr) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
// Today's date in local timezone (avoids UTC bug - PST shows next day)
const getLocalDateString = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const formatDate = (date) => {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocalDate(date) : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatDateShort = (date) => {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocalDate(date) : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const parseAmount = (val) => Math.round((parseFloat(val) || 0) * 100) / 100;
// repeat: supports old boolean (true=1) and new numeric counter
const getRepeatCount = (e) => e.data?.repeat === true ? 1 : Math.max(0, parseInt(e.data?.repeat, 10) || 0);
const getRepeatLabel = (count, type) => {
  if (!count || count < 1) return '';
  const base = { tv: 'rewatch', game: 'replay', movie: 'rewatch', book: 're-read' }[type] || 'repeat';
  const ord = count === 1 ? '1st' : count === 2 ? '2nd' : count === 3 ? '3rd' : `${count}th`;
  return `${ord} ${base}`;
};

const getFromStorage = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } 
  catch { return null; }
};
const saveToStorage = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; } 
  catch { return false; }
};
// Data service: uses Supabase when signed in, localStorage otherwise
const loadData = async (domain) => {
  if (window.dataService?.get) return await window.dataService.get(domain);
  return getFromStorage(STORAGE_KEYS[domain] || 'lifeErp_' + domain);
};
const saveData = async (domain, data) => {
  if (window.dataService?.save) await window.dataService.save(domain, data);
  else saveToStorage(STORAGE_KEYS[domain] || 'lifeErp_' + domain, data);
};

// ========================================
// Authentication
// ========================================
const getAuthConfig = () => typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG : null;

const createSession = () => {
  const config = getAuthConfig();
  if (!config) return false;
  const session = { authenticated: true, createdAt: Date.now(), expiresAt: Date.now() + config.sessionDuration };
  saveToStorage(config.sessionKey, session);
  return session;
};

const checkSession = () => {
  const config = getAuthConfig();
  if (!config) return false;
  const session = getFromStorage(config.sessionKey);
  if (!session || Date.now() > session.expiresAt) { clearSession(); return false; }
  return session.authenticated;
};

const clearSession = () => {
  const config = getAuthConfig();
  if (config) localStorage.removeItem(config.sessionKey);
};

const authenticate = (u, p) => {
  const config = getAuthConfig();
  if (config && u === config.username && p === config.password) { createSession(); return true; }
  return false;
};

// ========================================
// Login Page (Supabase-only when configured)
// ========================================
if (document.getElementById('loginForm')) {
  (async () => {
    const config = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
    const configured = config?.url && config?.anonKey && !config.url.includes('YOUR_') && !config.anonKey.includes('YOUR_');
    
    if (configured && typeof supabase !== 'undefined') {
      await (window.dataService?.init?.() ?? Promise.resolve());
      const session = await window.dataService?.getSession?.();
      if (session) {
        window.location.href = 'dashboard.html';
        return;
      }
      document.getElementById('supabaseLoginForm')?.classList.remove('hidden');
      if (new URLSearchParams(window.location.search).get('logout')) {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginDisplayName').value = '';
        document.getElementById('loginError').classList.add('hidden');
        window.history.replaceState({}, '', 'index.html');
      }
      
      let isSignUpMode = false;
      const displayNameGroup = document.getElementById('displayNameGroup');
      const primaryBtn = document.getElementById('primaryAuthBtn');
      const secondaryBtn = document.getElementById('secondaryAuthBtn');
      
      secondaryBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (isSignUpMode) {
          isSignUpMode = false;
          displayNameGroup?.classList.add('hidden');
          primaryBtn.textContent = 'Sign In';
          secondaryBtn.textContent = 'Sign Up';
          document.getElementById('signUpHint')?.classList.remove('hidden');
          document.getElementById('switchToSignIn')?.classList.add('hidden');
        } else {
          isSignUpMode = true;
          displayNameGroup?.classList.remove('hidden');
          primaryBtn.textContent = 'Create Account';
          secondaryBtn.textContent = 'Back';
          document.getElementById('signUpHint')?.classList.add('hidden');
          document.getElementById('switchToSignIn')?.classList.remove('hidden');
          document.getElementById('loginDisplayName')?.focus();
        }
      });
      document.getElementById('switchToSignIn')?.addEventListener('click', (e) => {
        e.preventDefault();
        secondaryBtn?.click();
      });
      
      document.getElementById('togglePassword')?.addEventListener('click', function() {
        const pw = document.getElementById('loginPassword');
        pw.type = pw.type === 'password' ? 'text' : 'password';
        this.innerHTML = `<i class="fas fa-eye${pw.type === 'password' ? '' : '-slash'}"></i>`;
      });
      
      const showAuthError = (errEl, msg) => {
        const friendly = /rate limit|rate_limit|email.*exceed/i.test(msg)
          ? 'Email rate limit hit. Disable "Confirm email" in Supabase (Auth → Providers → Email) or wait an hour.'
          : msg;
        errEl.textContent = friendly;
        errEl.classList.remove('hidden');
      };
      document.getElementById('supabaseLoginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const err = document.getElementById('loginError');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const displayName = document.getElementById('loginDisplayName')?.value?.trim();
        
        if (isSignUpMode) {
          if (!displayName) { err.textContent = 'Display name is required for sign up'; err.classList.remove('hidden'); return; }
          const { error } = await window.dataService.signUp(email, password, displayName);
          if (error) showAuthError(err, error.message);
          else window.location.href = 'dashboard.html';
        } else {
          const { error } = await window.dataService.signIn(email, password);
          if (error) showAuthError(err, error.message);
          else window.location.href = 'dashboard.html';
        }
      });
    } else {
      document.getElementById('directAccess')?.classList.remove('hidden');
    }
  })();
}

// ========================================
// Dashboard
// ========================================
if (document.getElementById('mainContent')) {
  (async () => {
  const config = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
  const supabaseConfigured = config?.url && config?.anonKey && !config.url.includes('YOUR_') && !config.anonKey.includes('YOUR_');
  
  if (supabaseConfigured && typeof supabase !== 'undefined') {
    await (window.dataService?.init?.() ?? Promise.resolve());
    const session = await window.dataService?.getSession?.();
    if (!session) {
      window.location.href = 'index.html';
      return;
    }
    const displayName = session.user?.user_metadata?.display_name || session.user?.email?.split('@')[0] || 'User';
    const email = session.user?.email || '';
    const initials = displayName.split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || (email[0] || '?').toUpperCase();
    document.getElementById('userDisplayName').textContent = displayName;
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('userEmail').textContent = email;
    document.getElementById('welcomeText').textContent = `Welcome back, ${displayName}! Here's your life at a glance.`;
  } else {
    document.getElementById('userDisplayName').textContent = 'Local';
    document.getElementById('userInitials').textContent = 'L';
    document.getElementById('userEmail').textContent = 'No account';
  }
  
  let data = null;
  try {
    await (window.dataService?.init?.() ?? Promise.resolve());
    data = window.dataService?.loadAll ? await window.dataService.loadAll() : null;
  } catch (err) {
    console.warn('Cloud sync init failed, using localStorage:', err);
  }
  
  // Data (from cloud if signed in, else localStorage)
  let tasks = data ? (data.tasks ?? []) : (getFromStorage(STORAGE_KEYS.tasks) || []);
  let goals = data ? (data.goals ?? []) : (getFromStorage(STORAGE_KEYS.goals) || []);
  let habits = data ? (data.habits ?? []) : (getFromStorage(STORAGE_KEYS.habits) || []);
  let finance = data ? (data.finance ?? { transactions: [], accounts: [] }) : (getFromStorage(STORAGE_KEYS.finance) || { transactions: [], accounts: [] });
  finance.transactions = finance.transactions || [];
  finance.accounts = finance.accounts || [];
  let journal = data ? (data.journal ?? []) : (getFromStorage(STORAGE_KEYS.journal) || []);
  let lifeLog = data ? (data.lifeLog ?? []) : (getFromStorage(STORAGE_KEYS.lifeLog) || []);
  
  // State
  let currentDate = new Date();
  let selectedDate = getLocalDateString();
  let currentLibraryType = 'tv';
  
  // ========================================
  // Theme
  // ========================================
  const html = document.documentElement;
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
  });

  // ========================================
  // Notifications
  // ========================================
  const getNotifications = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '[]'); } catch { return []; }
  };
  const saveNotifications = (list) => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));
  };
  const addNotification = (title, message, type = 'info') => {
    const list = getNotifications();
    list.unshift({ id: generateId(), title, message, type, read: false, createdAt: Date.now() });
    saveNotifications(list);
    updateNotifUI();
  };
  const markAllRead = () => {
    const list = getNotifications().map(n => ({ ...n, read: true }));
    saveNotifications(list);
    updateNotifUI();
  };
  window.addNotification = addNotification;
  const updateNotifUI = () => {
    const list = getNotifications();
    const unread = list.filter(n => !n.read).length;
    const dot = document.getElementById('notifDot');
    const listEl = document.getElementById('notifList');
    const emptyEl = document.getElementById('notifEmpty');
    if (dot) dot.classList.toggle('hidden', unread === 0);
    if (listEl && emptyEl) {
      const items = list.filter(n => n).map(n => `
        <div class="p-3 rounded-xl ${n.read ? 'bg-transparent' : 'bg-blue-50 dark:bg-blue-900/20'} border border-slate-200 dark:border-slate-700 mb-2">
          <p class="font-medium text-slate-900 dark:text-white text-sm">${(n.title || '').replace(/</g, '&lt;')}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${(n.message || '').replace(/</g, '&lt;')}</p>
          <p class="text-xs text-slate-400 mt-1">${formatDate(new Date(n.createdAt).toISOString().slice(0, 10))}</p>
        </div>
      `).join('');
      listEl.innerHTML = items.length ? items : '';
      if (!items.length) listEl.appendChild(emptyEl);
      emptyEl.classList.toggle('hidden', items.length > 0);
    }
  };
  document.getElementById('notifBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.toggle('hidden');
  });
  document.getElementById('notifPanelClose')?.addEventListener('click', () => {
    document.getElementById('notifPanel')?.classList.add('hidden');
  });
  document.getElementById('notifMarkAllRead')?.addEventListener('click', () => {
    markAllRead();
  });
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifPanel');
    const btn = document.getElementById('notifBtn');
    if (panel && !panel.classList.contains('hidden') && !panel.contains(e.target) && !btn?.contains(e.target)) {
      panel.classList.add('hidden');
    }
  });
  updateNotifUI();

  // ========================================
  // Navigation
  // ========================================
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-collapsed');
    document.getElementById('mainContent').classList.toggle('ml-64');
    document.getElementById('mainContent').classList.toggle('ml-20');
  });
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
  
  const showSection = (id) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active', 'bg-blue-600'));
    document.getElementById(id)?.classList.remove('hidden');
    document.querySelector(`[data-section="${id}"]`)?.classList.add('active', 'bg-blue-600');
    if (window.innerWidth < 1024) sidebar.classList.add('-translate-x-full');
    
    // Render section-specific content
    if (id === 'lifelog') { renderCalendar(); renderDayDetail(); }
    if (id === 'library') renderLibrary();
    if (id === 'finance') renderFinance();
    if (id === 'settings') { updateCloudSyncStatus(); updateProfileSection(); }
  };
  window.showSection = showSection;
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showSection(link.dataset.section); });
  });
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash)) showSection(hash);
  window.addEventListener('hashchange', () => { const h = window.location.hash.slice(1); if (h && document.getElementById(h)) showSection(h); });
  
  // Logout - sign out of Supabase and clear local cache so next user doesn't see old data
  const handleLogout = async () => {
    await (window.dataService?.signOut?.() ?? Promise.resolve());
    (window.dataService?.clearLocalCache?.() ?? (() => {
      ['tasks','goals','habits','finance','journal','lifeLog'].forEach(d => localStorage.removeItem('lifeErp_' + d));
    }))();
    clearSession();
    window.location.href = 'index.html?logout=1';
  };
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('logoutSettings')?.addEventListener('click', handleLogout);
  
  // ========================================
  // Modal
  // ========================================
  const modalOverlay = document.getElementById('modalOverlay');
  const openModal = (title, content) => {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
  };
  const closeModal = () => { modalOverlay.classList.add('hidden'); modalOverlay.classList.remove('flex'); };
  window.openModal = openModal;
  window.closeModal = closeModal;
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  
  // ========================================
  // Life Log - Core Functions
  // ========================================
  const getEntriesForDate = (dateStr) => lifeLog.filter(e => e.date === dateStr);
  
  const getAggregatedCounts = (dateStr) => {
    const entries = getEntriesForDate(dateStr);
    const counts = {};
    entries.forEach(e => {
      if (!counts[e.type]) counts[e.type] = 0;
      counts[e.type]++;
    });
    return counts;
  };
  
  // Group consecutive episodes for a show on a given date
  const groupTVEpisodes = (entries) => {
    const tvEntries = entries.filter(e => e.type === 'tv');
    if (tvEntries.length === 0) return [];
    
    // Group by show+season
    const groups = {};
    tvEntries.forEach(e => {
      const key = `${e.data.show}|S${e.data.season || 1}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    
    // For each group, find consecutive episode ranges
    const result = [];
    Object.entries(groups).forEach(([key, eps]) => {
      const [show, season] = key.split('|');
      eps.sort((a, b) => (a.data.episode || 0) - (b.data.episode || 0));
      
      let ranges = [];
      let start = eps[0];
      let end = eps[0];
      
      for (let i = 1; i < eps.length; i++) {
        const curr = eps[i];
        const prevEp = end.data.episode || 0;
        const currEp = curr.data.episode || 0;
        
        if (currEp === prevEp + 1) {
          end = curr;
        } else {
          ranges.push({ show, season, start, end, entries: eps.slice(ranges.length === 0 ? 0 : ranges[ranges.length-1].endIdx + 1, i) });
          start = curr;
          end = curr;
        }
      }
      ranges.push({ show, season, start, end, count: eps.length });
      
      ranges.forEach(r => {
        const startEp = r.start.data.episode || 0;
        const endEp = r.end.data.episode || 0;
        const epRange = startEp === endEp ? `E${startEp}` : `E${startEp}-${endEp}`;
        const count = endEp - startEp + 1;
        const rangeEntries = eps.filter(e => (e.data.episode || 0) >= startEp && (e.data.episode || 0) <= endEp);
        result.push({
          type: 'tv',
          show: r.show,
          season: r.season,
          episodeRange: epRange,
          count: count,
          entries: rangeEntries,
          hasNotes: rangeEntries.some(e => e.data.notes),
          rewatchCount: rangeEntries.filter(e => getRepeatCount(e) > 0).length
        });
      });
    });
    
    return result;
  };
  
  // Group other entry types for display
  const groupEntriesByType = (entries, type) => {
    const typeEntries = entries.filter(e => e.type === type);
    if (type === 'tv') return groupTVEpisodes(entries);
    
    // For games, group by game name
    if (type === 'game') {
      const groups = {};
      typeEntries.forEach(e => {
        const key = e.data.game;
        if (!groups[key]) groups[key] = { entries: [], totalDuration: 0 };
        groups[key].entries.push(e);
        groups[key].totalDuration += e.data.duration || 0;
      });
      return Object.entries(groups).map(([game, data]) => ({
        type: 'game', game, count: data.entries.length, duration: data.totalDuration, entries: data.entries
      }));
    }
    
    // Default: return as-is
    return typeEntries.map(e => ({ type, entry: e, entries: [e] }));
  };
  
  // ========================================
  // Calendar Rendering
  // ========================================
  const renderCalendar = () => {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    if (!grid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = getLocalDateString();
    
    let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => 
      `<div class="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-3">${d}</div>`
    ).join('');
    
    for (let i = 0; i < firstDay; i++) html += '<div></div>';
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const counts = getAggregatedCounts(dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const hasEntries = Object.keys(counts).length > 0;
      const totalEntries = Object.values(counts).reduce((a, b) => a + b, 0);
      
      // Build summary badges
      let badges = '';
      if (hasEntries) {
        const badgeItems = Object.entries(counts).slice(0, 3).map(([type, count]) => {
          const t = ACTIVITY_TYPES[type];
          return `<span class="inline-flex items-center gap-1 text-[10px]" style="color: ${t?.color || '#666'}">
            <i class="fas ${t?.icon || 'fa-circle'} text-[8px]"></i>${count}
          </span>`;
        }).join('');
        badges = `<div class="flex flex-wrap justify-center gap-1 mt-1">${badgeItems}</div>`;
        if (Object.keys(counts).length > 3) {
          badges += `<div class="text-[9px] text-slate-400">+${Object.keys(counts).length - 3} more</div>`;
        }
      }
      
      html += `
        <div onclick="selectDate('${dateStr}')" class="relative min-h-[70px] p-1 rounded-xl cursor-pointer transition-all border-2
          ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}
          ${isToday ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900' : ''}">
          <div class="text-center">
            <span class="text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}">${day}</span>
            ${badges}
          </div>
        </div>
      `;
    }
    
    grid.innerHTML = html;
  };
  
  window.selectDate = (dateStr) => {
    selectedDate = dateStr;
    renderCalendar();
    renderDayDetail();
  };
  
  document.getElementById('prevMonth')?.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
  document.getElementById('nextMonth')?.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
  
  // ========================================
  // Day Detail Panel
  // ========================================
  const renderDayDetail = () => {
    const container = document.getElementById('dayDetail');
    if (!container) return;
    
    const entries = getEntriesForDate(selectedDate);
    const dateLabel = formatDate(selectedDate);
    
    if (entries.length === 0) {
      container.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">${dateLabel}</h3>
          <button onclick="openLogModal()" class="px-3 py-1.5 gradient-bg text-white text-sm rounded-lg"><i class="fas fa-plus mr-1"></i>Log</button>
        </div>
        <div class="text-center py-12 text-slate-400">
          <i class="fas fa-calendar-day text-4xl mb-3 opacity-50"></i>
          <p>Nothing logged for this day</p>
          <button onclick="openLogModal()" class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <i class="fas fa-plus mr-2"></i>Add Entry
          </button>
        </div>
      `;
      return;
    }
    
    // Group entries by type
    const groupedByType = {};
    entries.forEach(e => {
      if (!groupedByType[e.type]) groupedByType[e.type] = [];
      groupedByType[e.type].push(e);
    });
    
    let html = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">${dateLabel}</h3>
        <button onclick="openLogModal()" class="px-3 py-1.5 gradient-bg text-white text-sm rounded-lg"><i class="fas fa-plus mr-1"></i>Log</button>
      </div>
      <div class="space-y-4 overflow-y-auto overscroll-contain pr-2" style="max-height: 400px;">
    `;
    
    Object.entries(groupedByType).forEach(([type, typeEntries]) => {
      const t = ACTIVITY_TYPES[type];
      
      if (type === 'tv') {
        // Smart grouping for TV
        const grouped = groupTVEpisodes(entries);
        grouped.forEach(g => {
          const showEsc = (g.show || '').replace(/'/g, "\\'");
          html += `
            <div onclick="showEntriesDetail('${type}', '${showEsc}', '${selectedDate}')" class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                  <i class="fas ${t.icon}" style="color: ${t.color}"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white">${g.show}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">${g.season} ${g.episodeRange} · ${g.count} episode${g.count > 1 ? 's' : ''}${g.rewatchCount ? ` · <span class="text-amber-600 dark:text-amber-400">${g.rewatchCount} rewatch${g.rewatchCount !== 1 ? 'es' : ''}</span>` : ''}${g.hasNotes ? ' · <i class="fas fa-sticky-note text-xs"></i>' : ''}</p>
                </div>
                <i class="fas fa-chevron-right text-slate-400 text-sm flex-shrink-0"></i>
              </div>
            </div>
          `;
        });
      } else if (type === 'game') {
        // Group games
        const gameGroups = {};
        typeEntries.forEach(e => {
          if (!gameGroups[e.data.game]) gameGroups[e.data.game] = { entries: [], duration: 0 };
          gameGroups[e.data.game].entries.push(e);
          gameGroups[e.data.game].duration += e.data.duration || 0;
        });
        
        Object.entries(gameGroups).forEach(([game, data]) => {
          const gameEsc = (game || '').replace(/'/g, "\\'");
          html += `
            <div onclick="showEntriesDetail('${type}', '${gameEsc}', '${selectedDate}')" class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                  <i class="fas ${t.icon}" style="color: ${t.color}"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white">${game}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">${data.entries.length} session${data.entries.length > 1 ? 's' : ''}${data.duration ? ` · ${Math.round(data.duration / 60 * 10) / 10}h` : ''}</p>
                </div>
                <i class="fas fa-chevron-right text-slate-400 text-sm flex-shrink-0"></i>
              </div>
            </div>
          `;
        });
      } else {
        // Individual entries for other types
        typeEntries.forEach(e => {
          const mainField = t.fields[0]?.key;
          const mainValue = (e.data[mainField] || 'Entry').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const secondaryInfo = t.fields.slice(1, 3).map(f => e.data[f.key]).filter(Boolean).join(' · ');
          const hasNotes = e.data.notes || (t.fields.some(f => f.key === 'content') && e.data.content);
          
          html += `
            <div onclick="showEntryDetail('${e.id}')" class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                  <i class="fas ${t.icon}" style="color: ${t.color}"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white">${mainValue}</p>
                  ${secondaryInfo ? `<p class="text-sm text-slate-500 dark:text-slate-400">${secondaryInfo}</p>` : ''}
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                  <button onclick="openEditModal('${e.id}')" class="p-2 text-blue-400 hover:text-blue-600 rounded-lg" title="Edit"><i class="fas fa-pen text-xs"></i></button>
                  <button onclick="deleteEntry('${e.id}')" class="p-2 text-red-400 hover:text-red-600 rounded-lg" title="Delete"><i class="fas fa-trash text-xs"></i></button>
                </div>
                ${hasNotes ? '<i class="fas fa-chevron-right text-slate-400 text-sm"></i>' : ''}
              </div>
            </div>
          `;
        });
      }
    });
    
    html += '</div>';
    container.innerHTML = html;
  };
  
  window.showEntriesDetail = (type, groupKey, date) => {
    const entries = getEntriesForDate(date).filter(e => {
      if (type === 'tv') return e.type === 'tv' && e.data.show === groupKey;
      if (type === 'game') return e.type === 'game' && e.data.game === groupKey;
      return e.type === type;
    });
    
    const t = ACTIVITY_TYPES[type];
    let html = `<div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">`;
    const repeatLabel = { tv: 'rewatch', game: 'replay', movie: 'rewatch', book: 're-read' }[type];
    entries.forEach(e => {
      let detail = '';
      if (type === 'tv') detail = `S${e.data.season || 1} E${e.data.episode || 1}`;
      else detail = t.fields.slice(1).filter(f => f.key !== 'repeat').map(f => e.data[f.key]).filter(Boolean).join(' · ');
      const rc = getRepeatCount(e);
      const repeatBadge = rc > 0 && repeatLabel ? ` <span class="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">${getRepeatLabel(rc, type)}</span>` : '';
      
      html += `
        <div class="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
          <div class="flex-1 min-w-0 cursor-pointer" onclick="openEditModal('${e.id}')">
            <p class="font-medium text-slate-900 dark:text-white">${detail}${repeatBadge}</p>
            ${e.data.notes ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">${String(e.data.notes).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button onclick="openEditModal('${e.id}')" class="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg" title="Edit"><i class="fas fa-pen text-xs"></i></button>
            <button onclick="deleteEntry('${e.id}'); closeModal();" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg" title="Delete"><i class="fas fa-trash text-xs"></i></button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    openModal(`${groupKey} - ${formatDateShort(date)}`, html);
  };
  
  window.showEntryDetail = (id) => {
    const e = lifeLog.find(x => x.id === id);
    if (!e) return;
    const t = ACTIVITY_TYPES[e.type];
    const mainField = t?.fields[0]?.key;
    const mainValue = e.data[mainField] || 'Entry';
    const details = t?.fields.slice(1).filter(f => !['repeat', 'notes', 'content'].includes(f.key)).map(f => ({ label: f.label, value: e.data[f.key] })).filter(d => d.value !== undefined && d.value !== '' && d.value !== false) || [];
    const repeatLabel = { tv: 'Rewatch', game: 'Replay', movie: 'Rewatch', book: 'Re-read' }[e.type];
    
    let html = `
      <div class="space-y-4">
        <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <p class="font-semibold text-slate-900 dark:text-white text-lg">${String(mainValue).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${t?.name || e.type} · ${formatDateShort(e.date)}</p>
        </div>
        ${details.length ? `<div class="space-y-2">${details.map(d => `
          <div><span class="text-xs text-slate-500 dark:text-slate-400">${d.label}</span><p class="text-sm text-slate-900 dark:text-white">${String(d.value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>
        `).join('')}</div>` : ''}
        ${getRepeatCount(e) > 0 ? `<div><span class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-lg"><i class="fas fa-redo text-xs"></i>${getRepeatLabel(getRepeatCount(e), e.type)}</span></div>` : ''}
        ${e.data.notes ? `<div><span class="text-xs text-slate-500 dark:text-slate-400">Notes</span><p class="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">${String(e.data.notes).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}
        ${e.data.content ? `<div><span class="text-xs text-slate-500 dark:text-slate-400">Content</span><p class="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">${String(e.data.content).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}
        <div class="flex gap-2 pt-2">
          <button onclick="openEditModal('${e.id}')" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><i class="fas fa-pen mr-2"></i>Edit</button>
          <button onclick="deleteEntry('${e.id}'); closeModal();" class="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"><i class="fas fa-trash mr-2"></i>Delete</button>
        </div>
      </div>
    `;
    openModal(mainValue, html);
  };
  
  // ========================================
  // Log Entry Modal
  // ========================================
  const openLogModal = (preselectedType = null) => {
    const typeOptions = Object.entries(ACTIVITY_TYPES).map(([id, t]) => 
      `<option value="${id}" ${preselectedType === id ? 'selected' : ''}>${t.name}</option>`
    ).join('');
    
    openModal('Log Activity', `
      <form id="logForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="logType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            ${typeOptions}
          </select>
        </div>
        <div id="dynamicFields"></div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="logDate" value="${selectedDate}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-plus mr-2"></i>Log Entry
        </button>
      </form>
    `);
    
    const updateFields = () => {
      const type = document.getElementById('logType').value;
      const t = ACTIVITY_TYPES[type];
      const category = document.getElementById('field_category')?.value || 'Job';
      document.getElementById('dynamicFields').innerHTML = t.fields.map(f => {
        if (f.type === 'select') {
          let opts = f.options;
          if (type === 'work' && f.key === 'subtype') opts = WORK_SUBTYPES[category] || WORK_SUBTYPES.Job;
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <select id="field_${f.key}" ${f.required ? 'required' : ''} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
              ${opts.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select></div>`;
        } else if (f.type === 'textarea') {
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <textarea id="field_${f.key}" rows="2" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea></div>`;
        } else if (f.type === 'checkbox') {
          const defaultChecked = (f.key === 'addToFinance' && type === 'purchase') ? ' checked' : '';
          return `<div class="flex items-center gap-2"><input type="checkbox" id="field_${f.key}" class="w-4 h-4 rounded"${defaultChecked}>
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">${f.label}</label></div>`;
        } else {
          let stepMin = '';
          if (f.key === 'amount') stepMin = ' min="0" step="0.01"';
          else if (f.key === 'repeat') stepMin = ' min="0" step="1"';
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <input type="${f.type}" id="field_${f.key}" ${f.required ? 'required' : ''}${stepMin} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>`;
        }
      }).join('');
    };
    
    document.getElementById('logType').addEventListener('change', updateFields);
    updateFields();
    
    document.getElementById('dynamicFields').addEventListener('change', (e) => {
      if (e.target.id === 'field_category' && document.getElementById('logType').value === 'work') {
        const cat = e.target.value;
        const sub = document.getElementById('field_subtype');
        if (sub) {
          const opts = WORK_SUBTYPES[cat] || WORK_SUBTYPES.Job;
          sub.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
        }
      }
    });
    
    document.getElementById('logForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('logType').value;
      const t = ACTIVITY_TYPES[type];
      const data = {};
      t.fields.forEach(f => {
        const el = document.getElementById(`field_${f.key}`);
        if (el) data[f.key] = f.type === 'checkbox' ? el.checked : (f.type === 'number' ? (f.key === 'amount' ? parseAmount(el.value) : f.key === 'repeat' ? Math.max(0, parseInt(el.value, 10) || 0) : parseFloat(el.value) || 0) : el.value);
      });
      
      const date = document.getElementById('logDate').value;
      const addToFinance = data.addToFinance;
      
      if (type === 'meal' && addToFinance && (!data.amount || data.amount <= 0)) {
        alert('Enter an amount to add to Finance.');
        return;
      }
      
      const entryId = generateId();
      lifeLog.push({ id: entryId, type, date, data, createdAt: Date.now() });
      
      if (addToFinance && (type === 'meal' || type === 'purchase')) {
        const amount = type === 'meal' ? (data.amount || 0) : (data.amount || 0);
        if (amount > 0) {
          let desc = '';
          if (type === 'meal') {
            const parts = [data.meal];
            if (data.restaurant) parts.push(`at ${data.restaurant}`);
            desc = parts.join(' ');
          } else {
            desc = data.item + (data.store ? ` (${data.store})` : '');
          }
          const category = type === 'meal' ? 'Food' : (data.financeCategory || 'Shopping');
          finance.transactions = finance.transactions || [];
          finance.transactions.push({
            id: generateId(),
            type: 'expense',
            description: desc,
            amount: amount,
            category: category,
            date: date,
            createdAt: Date.now(),
            _fromLifeLog: type,
            _lifeLogEntryId: entryId
          });
          saveData('finance', finance);
        }
      }
      
      saveData('lifeLog', lifeLog);
      renderCalendar();
      renderDayDetail();
      renderFinance();
      updateStats();
      closeModal();
    });
  };
  
  window.openLogModal = openLogModal;
  
  window.openEditModal = (id) => {
    const entry = lifeLog.find(e => e.id === id);
    if (!entry) return;
    
    const t = ACTIVITY_TYPES[entry.type];
    const typeOptions = Object.entries(ACTIVITY_TYPES).map(([tid, type]) => 
      `<option value="${tid}" ${entry.type === tid ? 'selected' : ''}>${type.name}</option>`
    ).join('');
    
    openModal('Edit Entry', `
      <form id="editLogForm" class="space-y-4">
        <input type="hidden" id="editEntryId" value="${entry.id}">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="editLogType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm" disabled>
            ${typeOptions}
          </select>
        </div>
        <div id="editDynamicFields"></div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="editLogDate" value="${entry.date}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-save mr-2"></i>Save Changes
        </button>
      </form>
    `);
    
    const renderFields = () => {
      const type = entry.type;
      const t = ACTIVITY_TYPES[type];
      const data = entry.data;
      document.getElementById('editDynamicFields').innerHTML = t.fields.map(f => {
        const val = data[f.key];
        const valStr = f.key === 'repeat' ? String(getRepeatCount(entry)) : (val === undefined || val === null ? '' : String(val));
        if (f.type === 'select') {
          let opts = f.options;
          if (type === 'work' && f.key === 'subtype') opts = WORK_SUBTYPES[data.category] || WORK_SUBTYPES.Job;
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <select id="edit_field_${f.key}" ${f.required ? 'required' : ''} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
              ${opts.map(o => `<option value="${o}" ${valStr === o ? 'selected' : ''}>${o}</option>`).join('')}
            </select></div>`;
        } else if (f.type === 'textarea') {
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <textarea id="edit_field_${f.key}" rows="2" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">${valStr.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea></div>`;
        } else if (f.type === 'checkbox') {
          return `<div class="flex items-center gap-2"><input type="checkbox" id="edit_field_${f.key}" ${val ? 'checked' : ''} class="w-4 h-4 rounded">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">${f.label}</label></div>`;
        } else {
          let stepMin = '';
          if (f.key === 'amount') stepMin = ' min="0" step="0.01"';
          else if (f.key === 'repeat') stepMin = ' min="0" step="1"';
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <input type="${f.type}" id="edit_field_${f.key}" ${f.required ? 'required' : ''}${stepMin} value="${valStr.replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>`;
        }
      }).join('');
    };
    
    renderFields();
    
    if (entry.type === 'work') {
      document.getElementById('editDynamicFields').addEventListener('change', (e) => {
        if (e.target.id === 'edit_field_category') {
          const cat = e.target.value;
          const sub = document.getElementById('edit_field_subtype');
          if (sub) {
            const opts = WORK_SUBTYPES[cat] || WORK_SUBTYPES.Job;
            const cur = sub.value;
            sub.innerHTML = opts.map(o => `<option value="${o}" ${cur === o ? 'selected' : ''}>${o}</option>`).join('');
          }
        }
      });
    }
    
    document.getElementById('editLogForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const entryId = document.getElementById('editEntryId').value;
      const idx = lifeLog.findIndex(x => x.id === entryId);
      if (idx === -1) return;
      
      const type = lifeLog[idx].type;
      const t = ACTIVITY_TYPES[type];
      const data = {};
      t.fields.forEach(f => {
        const el = document.getElementById(`edit_field_${f.key}`);
        if (el) data[f.key] = f.type === 'checkbox' ? el.checked : (f.type === 'number' ? (f.key === 'amount' ? parseAmount(el.value) : f.key === 'repeat' ? Math.max(0, parseInt(el.value, 10) || 0) : parseFloat(el.value) || 0) : el.value);
      });
      
      const date = document.getElementById('editLogDate').value;
      if (type === 'meal' && data.addToFinance && (!data.amount || data.amount <= 0)) {
        alert('Enter an amount to add to Finance.');
        return;
      }
      
      lifeLog[idx] = { ...lifeLog[idx], date, data, updatedAt: Date.now() };
      
      // Sync linked finance entry for meal/purchase
      if (type === 'meal' || type === 'purchase') {
        finance.transactions = finance.transactions || [];
        const linkedIdx = finance.transactions.findIndex(tx => tx._lifeLogEntryId === entryId);
        const addToFinance = data.addToFinance;
        const amount = type === 'meal' ? (data.amount || 0) : (data.amount || 0);
        
        if (addToFinance && amount > 0) {
          let desc = '';
          if (type === 'meal') {
            const parts = [data.meal];
            if (data.restaurant) parts.push(`at ${data.restaurant}`);
            desc = parts.join(' ');
          } else {
            desc = data.item + (data.store ? ` (${data.store})` : '');
          }
          const category = type === 'meal' ? 'Food' : (data.financeCategory || 'Shopping');
          if (linkedIdx >= 0) {
            finance.transactions[linkedIdx] = { ...finance.transactions[linkedIdx], description: desc, amount, category, date };
          } else {
            finance.transactions.push({
              id: generateId(),
              type: 'expense',
              description: desc,
              amount,
              category,
              date,
              createdAt: Date.now(),
              _fromLifeLog: type,
              _lifeLogEntryId: entryId
            });
          }
        } else if (linkedIdx >= 0) {
          finance.transactions.splice(linkedIdx, 1);
        }
        saveData('finance', finance);
        renderFinance();
      }
      
      saveData('lifeLog', lifeLog);
      renderCalendar();
      renderDayDetail();
      updateStats();
      closeModal();
    });
  };
  
  window.deleteEntry = (id) => {
    // Remove linked finance entry if any
    finance.transactions = finance.transactions || [];
    finance.transactions = finance.transactions.filter(tx => tx._lifeLogEntryId !== id);
    saveData('finance', finance);
    if (document.getElementById('finance')) renderFinance();
    
    lifeLog = lifeLog.filter(e => e.id !== id);
    saveData('lifeLog', lifeLog);
    renderCalendar();
    renderDayDetail();
    updateStats();
  };
  
  // ========================================
  // Library - Detail Modal
  // ========================================
  window.showLibraryDetail = (type, groupKey, label) => {
    const t = ACTIVITY_TYPES[type];
    let filtered = [];
    if (type === 'work') {
      if (groupKey.includes('|')) {
        const [cat, sub] = groupKey.split('|');
        filtered = lifeLog.filter(e => e.type === type && (e.data.category || 'Job') === cat && (e.data.subtype || 'Other') === sub);
      } else {
        if (groupKey === 'Uncategorized') {
          filtered = lifeLog.filter(e => e.type === type && !(e.data.project || '').trim());
        } else {
          filtered = lifeLog.filter(e => e.type === type && (e.data.project || '').trim() === groupKey);
        }
      }
    } else if (type === 'tv') {
      filtered = lifeLog.filter(e => e.type === type && e.data.show === groupKey);
    } else if (type === 'game') {
      filtered = lifeLog.filter(e => e.type === type && e.data.game === groupKey);
    } else if (type === 'book') {
      filtered = lifeLog.filter(e => e.type === type && e.data.title === groupKey);
    } else if (type === 'golf') {
      filtered = lifeLog.filter(e => e.type === type && e.data.course === groupKey);
    } else if (type === 'climbing') {
      filtered = lifeLog.filter(e => e.type === type && e.data.location === groupKey);
    } else if (type === 'sports') {
      filtered = lifeLog.filter(e => e.type === type && (e.data.sport || 'Other') === groupKey);
    } else {
      filtered = lifeLog.filter(e => e.type === type);
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    const thisYear = new Date().getFullYear();
    const thisYearCount = filtered.filter(e => e.date.startsWith(String(thisYear))).length;
    const repeatCount = filtered.filter(e => getRepeatCount(e) > 0).length;
    const repeatLabelSingular = { tv: 'rewatch', game: 'replay', movie: 'rewatch', book: 're-read' };
    const repeatLabelPlural = { tv: 'rewatches', game: 'replays', movie: 'rewatches', book: 're-reads' };
    const entriesHtml = filtered.map(e => {
      const mainField = t?.fields[0]?.key;
      const mainValue = (e.data[mainField] || 'Entry').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const details = t?.fields.slice(1, 5).filter(f => f.key !== 'repeat').map(f => e.data[f.key]).filter(Boolean).join(' · ');
      const rc = getRepeatCount(e);
      const repeatBadge = rc > 0 ? ` <span class="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">${getRepeatLabel(rc, type)}</span>` : '';
      return `<div onclick="showEntryDetail('${e.id}')" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-slate-900 dark:text-white">${mainValue}${repeatBadge}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">${details ? details + ' · ' : ''}${formatDateShort(e.date)}</p>
        </div>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
          <button onclick="openEditModal('${e.id}')" class="p-2 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg" title="Edit"><i class="fas fa-pen text-xs"></i></button>
          <button onclick="deleteEntry('${e.id}'); closeModal();" class="p-2 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg" title="Delete"><i class="fas fa-trash text-xs"></i></button>
        </div>
        <i class="fas fa-chevron-right text-slate-400 text-sm ml-2"></i>
      </div>`;
    }).join('');
    
    let statsParts = [filtered.length + ' total'];
    if (thisYearCount > 0 && thisYearCount !== filtered.length) statsParts.push(thisYearCount + ' this year');
    if (repeatCount > 0 && repeatLabelPlural[type]) statsParts.push(repeatCount + ' ' + repeatLabelPlural[type]);
    const statsHtml = `<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${statsParts.join(' · ')}</p>`;
    
    const content = `
      <div>
        ${statsHtml}
        <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          ${entriesHtml}
        </div>
      </div>
    `;
    
    openModal(label || groupKey, content);
  };
  
  // ========================================
  // Library - Aggregate Views
  // ========================================
  const renderLibrary = () => {
    const container = document.getElementById('libraryContent');
    const typeSelect = document.getElementById('libraryType');
    if (!container) return;
    
    const type = currentLibraryType;
    const t = ACTIVITY_TYPES[type];
    const entries = lifeLog.filter(e => e.type === type);
    
    if (entries.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-slate-400">
          <i class="fas ${t.icon} text-5xl mb-4 opacity-50"></i>
          <p>No ${t.name.toLowerCase()} entries yet</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    if (type === 'tv') {
      // Group by show, then by season
      const shows = {};
      entries.forEach(e => {
        const show = e.data.show;
        const season = e.data.season || 1;
        if (!shows[show]) shows[show] = { seasons: {}, totalEpisodes: 0, lastWatched: e.date };
        if (!shows[show].seasons[season]) shows[show].seasons[season] = [];
        shows[show].seasons[season].push(e);
        shows[show].totalEpisodes++;
        if (e.date > shows[show].lastWatched) shows[show].lastWatched = e.date;
      });
      
      // Sort by last watched
      const sortedShows = Object.entries(shows).sort((a, b) => new Date(b[1].lastWatched) - new Date(a[1].lastWatched));
      
      html = `<div class="space-y-4">`;
      sortedShows.forEach(([show, data]) => {
        const seasonCount = Object.keys(data.seasons).length;
        const seasonSummary = Object.entries(data.seasons).map(([s, eps]) => {
          eps.sort((a, b) => (a.data.episode || 0) - (b.data.episode || 0));
          const first = eps[0].data.episode || 1;
          const last = eps[eps.length - 1].data.episode || 1;
          return `S${s}: E${first}${first !== last ? `-${last}` : ''}`;
        }).join(', ');
        
        const showEsc = (show || '').replace(/'/g, "\\'");
        const rewatchCount = Object.values(data.seasons).flat().filter(e => getRepeatCount(e) > 0).length;
        const rewatchStr = rewatchCount > 0 ? ` · ${rewatchCount} rewatch${rewatchCount !== 1 ? 'es' : ''}` : '';
        html += `
          <div onclick="showLibraryDetail('tv', '${showEsc}', '${show}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-slate-900 dark:text-white">${show}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${data.totalEpisodes} episodes across ${seasonCount} season${seasonCount > 1 ? 's' : ''}${rewatchStr}</p>
                <p class="text-xs text-slate-400 mt-2">${seasonSummary}</p>
                <p class="text-xs text-slate-400 mt-1">Last watched: ${formatDateShort(data.lastWatched)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600 mt-2"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'game') {
      // Group by game
      const games = {};
      entries.forEach(e => {
        const game = e.data.game;
        if (!games[game]) games[game] = { sessions: 0, totalTime: 0, lastPlayed: e.date, entries: [] };
        games[game].sessions++;
        games[game].totalTime += e.data.duration || 0;
        games[game].entries.push(e);
        if (e.date > games[game].lastPlayed) games[game].lastPlayed = e.date;
      });
      
      const sorted = Object.entries(games).sort((a, b) => new Date(b[1].lastPlayed) - new Date(a[1].lastPlayed));
      
      html = `<div class="space-y-4">`;
      sorted.forEach(([game, data]) => {
        const hours = Math.round(data.totalTime / 60 * 10) / 10;
        const gameEsc = (game || '').replace(/'/g, "\\'");
        const replayCount = data.entries.filter(e => getRepeatCount(e) > 0).length;
        const replayStr = replayCount > 0 ? ` · ${replayCount} replay${replayCount !== 1 ? 's' : ''}` : '';
        html += `
          <div onclick="showLibraryDetail('game', '${gameEsc}', '${game}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${game}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${data.sessions} sessions · ${hours}h total${replayStr}</p>
                <p class="text-xs text-slate-400 mt-1">Last played: ${formatDateShort(data.lastPlayed)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'book') {
      // Group by book
      const books = {};
      entries.forEach(e => {
        const title = e.data.title;
        if (!books[title]) books[title] = { sessions: 0, pages: 0, finished: false, lastRead: e.date, entries: [] };
        books[title].sessions++;
        books[title].pages += e.data.pages || 0;
        books[title].entries.push(e);
        if (e.data.finished) books[title].finished = true;
        if (e.date > books[title].lastRead) books[title].lastRead = e.date;
      });
      
      const sorted = Object.entries(books).sort((a, b) => new Date(b[1].lastRead) - new Date(a[1].lastRead));
      
      html = `<div class="space-y-4">`;
      sorted.forEach(([title, data]) => {
        const titleEsc = (title || '').replace(/'/g, "\\'");
        const rereadCount = (data.entries || []).filter(e => getRepeatCount(e) > 0).length;
        const rereadStr = rereadCount > 0 ? ` · ${rereadCount} re-read${rereadCount !== 1 ? 's' : ''}` : '';
        html += `
          <div onclick="showLibraryDetail('book', '${titleEsc}', '${title}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${title}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${data.pages} pages · ${data.sessions} sessions ${data.finished ? '· <span class="text-green-500">Finished</span>' : ''}${rereadStr}</p>
                <p class="text-xs text-slate-400 mt-1">Last read: ${formatDateShort(data.lastRead)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'sports') {
      // Group by sport
      const sports = {};
      entries.forEach(e => {
        const sport = e.data.sport || 'Other';
        if (!sports[sport]) sports[sport] = { events: [], lastWatched: e.date };
        sports[sport].events.push(e);
        if (e.date > sports[sport].lastWatched) sports[sport].lastWatched = e.date;
      });
      
      const sorted = Object.entries(sports).sort((a, b) => new Date(b[1].lastWatched) - new Date(a[1].lastWatched));
      
      html = `<div class="space-y-4">`;
      sorted.forEach(([sport, data]) => {
        const inPerson = data.events.filter(e => e.data.venue === 'In Person').length;
        const watched = data.events.length - inPerson;
        const sportEsc = (sport || '').replace(/'/g, "\\'");
        html += `
          <div onclick="showLibraryDetail('sports', '${sportEsc}', '${sport}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-slate-900 dark:text-white">${sport}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${data.events.length} event${data.events.length !== 1 ? 's' : ''}${inPerson ? ` · ${inPerson} in person` : ''}${watched ? ` · ${watched} watched` : ''}</p>
                <p class="text-xs text-slate-400 mt-2">${data.events.slice(0, 3).map(e => e.data.event).join(', ')}${data.events.length > 3 ? '...' : ''}</p>
                <p class="text-xs text-slate-400 mt-1">Last: ${formatDateShort(data.lastWatched)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600 mt-2"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'work') {
      // Group by project/course (e.g. "Project A", "Class A")
      const byProject = {};
      entries.forEach(e => {
        const proj = (e.data.project || '').trim() || '__uncategorized__';
        if (!byProject[proj]) byProject[proj] = { entries: [], totalMins: 0, lastWorked: e.date };
        byProject[proj].entries.push(e);
        byProject[proj].totalMins += e.data.duration || 0;
        if (e.date > byProject[proj].lastWorked) byProject[proj].lastWorked = e.date;
      });
      const sortedProjects = Object.entries(byProject).sort((a, b) => new Date(b[1].lastWorked) - new Date(a[1].lastWorked));
      
      html = `<div class="space-y-4">`;
      sortedProjects.forEach(([projKey, data]) => {
        const label = projKey === '__uncategorized__' ? 'Uncategorized' : projKey;
        const projEsc = (label || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const hours = Math.round(data.totalMins / 60 * 10) / 10;
        const catBreakdown = {};
        data.entries.forEach(e => { const c = e.data.category || 'Job'; catBreakdown[c] = (catBreakdown[c] || 0) + 1; });
        const catStr = Object.entries(catBreakdown).map(([c, n]) => `${c}: ${n}`).join(', ');
        html += `
          <div onclick="showLibraryDetail('work', '${projEsc}', '${projEsc}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-slate-900 dark:text-white">${label.replace(/</g, '&lt;')}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${data.entries.length} session${data.entries.length !== 1 ? 's' : ''}${hours ? ` · ${hours}h total` : ''}</p>
                <p class="text-xs text-slate-400 mt-1">${catStr}</p>
                <p class="text-xs text-slate-400 mt-1">Last worked: ${formatDateShort(data.lastWorked)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600 mt-2"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'golf') {
      // Group by course
      const courses = {};
      entries.forEach(e => {
        const course = e.data.course || 'Unknown';
        if (!courses[course]) courses[course] = { rounds: [], lastPlayed: e.date };
        courses[course].rounds.push(e);
        if (e.date > courses[course].lastPlayed) courses[course].lastPlayed = e.date;
      });
      
      const sorted = Object.entries(courses).sort((a, b) => new Date(b[1].lastPlayed) - new Date(a[1].lastPlayed));
      const thisYear = new Date().getFullYear();
      
      html = `<div class="space-y-4">`;
      sorted.forEach(([course, data]) => {
        const thisYearRounds = data.rounds.filter(e => e.date.startsWith(String(thisYear))).length;
        const courseEsc = (course || '').replace(/'/g, "\\'");
        html += `
          <div onclick="showLibraryDetail('golf', '${courseEsc}', '${course}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${course}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${data.rounds.length} round${data.rounds.length !== 1 ? 's' : ''}${thisYearRounds > 0 ? ` · ${thisYearRounds} this year` : ''}</p>
                <p class="text-xs text-slate-400 mt-1">Last played: ${formatDateShort(data.lastPlayed)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'movie') {
      const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      html = `<div class="space-y-4">`;
      sorted.forEach(e => {
        const rc = getRepeatCount(e);
        const rewatchBadge = rc > 0 ? `<span class="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded ml-2">${getRepeatLabel(rc, 'movie')}</span>` : '';
        html += `
          <div onclick="showEntryDetail('${e.id}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${e.data.title}${rewatchBadge}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${e.data.rating ? `★ ${e.data.rating}/10 · ` : ''}${formatDateShort(e.date)}</p>
                ${e.data.notes ? `<p class="text-xs text-slate-400 mt-1">${e.data.notes}</p>` : ''}
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else {
      // Generic list for other types
      const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      html = `<div class="space-y-3">`;
      sorted.forEach(e => {
        const mainField = t.fields[0]?.key;
        const mainValue = (e.data[mainField] || 'Entry').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const secondaryInfo = t.fields.slice(1, 3).map(f => e.data[f.key]).filter(Boolean).join(' · ');
        
        html += `
          <div onclick="showEntryDetail('${e.id}')" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon}" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">${mainValue}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">${secondaryInfo ? secondaryInfo + ' · ' : ''}${formatDateShort(e.date)}</p>
              </div>
              <i class="fas fa-chevron-right text-slate-400 group-hover:text-slate-600"></i>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    container.innerHTML = html;
  };
  
  window.setLibraryType = (type) => {
    currentLibraryType = type;
    // Update active state on type buttons
    document.querySelectorAll('.library-type-btn').forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
    });
    document.querySelector(`[data-library-type="${type}"]`)?.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
    document.querySelector(`[data-library-type="${type}"]`)?.classList.add('bg-blue-600', 'text-white');
    renderLibrary();
  };
  
  // ========================================
  // Tasks
  // ========================================
  const renderTasks = () => {
    const todo = document.getElementById('todoTasks');
    const progress = document.getElementById('inProgressTasks');
    const done = document.getElementById('doneTasks');
    if (!todo) return;
    
    const render = (container, list) => {
      container.innerHTML = list.map(t => `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm group">
          <h4 class="font-medium text-slate-900 dark:text-white text-sm mb-1">${t.title}</h4>
          ${t.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 mb-2">${t.description}</p>` : ''}
          ${t.dueDate ? `<p class="text-xs text-blue-600"><i class="fas fa-calendar mr-1"></i>${formatDate(t.dueDate)}</p>` : ''}
          <div class="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onclick="deleteTask('${t.id}')" class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('') || '';
    };
    
    const todoList = tasks.filter(t => t.status === 'todo');
    const progressList = tasks.filter(t => t.status === 'in-progress');
    const doneList = tasks.filter(t => t.status === 'done');
    
    render(todo, todoList);
    render(progress, progressList);
    render(done, doneList);
    
    document.getElementById('todoCount').textContent = todoList.length;
    document.getElementById('progressCount').textContent = progressList.length;
    document.getElementById('doneCount').textContent = doneList.length;
    document.getElementById('taskBadge').textContent = todoList.length + progressList.length;
  };
  
  window.deleteTask = (id) => { tasks = tasks.filter(t => t.id !== id); saveData('tasks', tasks); renderTasks(); };
  
  const addTaskModal = () => {
    openModal('Add Task', `
      <form id="taskForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input type="text" id="taskTitle" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea id="taskDesc" rows="2" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select id="taskStatus" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
          <input type="date" id="taskDue" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-plus mr-2"></i>Add Task</button>
      </form>
    `);
    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      tasks.push({ id: generateId(), title: document.getElementById('taskTitle').value, description: document.getElementById('taskDesc').value, status: document.getElementById('taskStatus').value, dueDate: document.getElementById('taskDue').value, createdAt: Date.now() });
      saveData('tasks', tasks); renderTasks(); updateStats(); closeModal();
    });
  };
  document.getElementById('addTaskBtn')?.addEventListener('click', addTaskModal);
  
  // ========================================
  // Goals
  // ========================================
  const renderGoals = () => {
    const container = document.getElementById('goalsContainer');
    if (!container) return;
    
    if (goals.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center py-16 text-slate-400">
        <i class="fas fa-bullseye text-5xl mb-4 opacity-50"></i>
        <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No goals yet</h3>
        <button onclick="addGoalModal()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-plus mr-2"></i>Add Goal</button>
      </div>`;
      return;
    }
    
    container.innerHTML = goals.map(g => `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 group">
        <div class="flex items-start justify-between mb-3">
          <h4 class="font-semibold text-slate-900 dark:text-white">${g.title}</h4>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">${g.category}</span>
            <button onclick="deleteGoal('${g.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-red-500"><i class="fas fa-trash text-xs"></i></button>
          </div>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">${g.description || 'No description'}</p>
        <div class="flex items-center gap-3 mb-2">
          <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full gradient-bg rounded-full" style="width: ${g.progress}%"></div>
          </div>
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300">${g.progress}%</span>
        </div>
      </div>
    `).join('');
  };
  
  window.deleteGoal = (id) => { goals = goals.filter(g => g.id !== id); saveData('goals', goals); renderGoals(); };
  
  window.addGoalModal = () => {
    openModal('Add Goal', `
      <form id="goalForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input type="text" id="goalTitle" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select id="goalCategory" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="personal">Personal</option><option value="career">Career</option><option value="health">Health</option><option value="finance">Finance</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea id="goalDesc" rows="2" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-plus mr-2"></i>Add Goal</button>
      </form>
    `);
    document.getElementById('goalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      goals.push({ id: generateId(), title: document.getElementById('goalTitle').value, category: document.getElementById('goalCategory').value, description: document.getElementById('goalDesc').value, progress: 0, createdAt: Date.now() });
      saveData('goals', goals); renderGoals(); closeModal();
    });
  };
  document.getElementById('addGoalBtn')?.addEventListener('click', addGoalModal);
  
  // ========================================
  // Habits
  // ========================================
  const renderHabits = () => {
    const container = document.getElementById('habitsContainer');
    if (!container) return;
    
    if (habits.length === 0) {
      container.innerHTML = `<div class="text-center py-16 text-slate-400">
        <i class="fas fa-sync-alt text-5xl mb-4 opacity-50"></i>
        <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No habits tracked</h3>
        <button onclick="addHabitModal()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-plus mr-2"></i>Add Habit</button>
      </div>`;
      return;
    }
    
    container.innerHTML = `<div class="space-y-3">${habits.map(h => `
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4 group">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${h.color}20">
          <i class="fas fa-check text-lg" style="color: ${h.color}"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-slate-900 dark:text-white">${h.name}</h4>
          <p class="text-sm text-slate-500 dark:text-slate-400">${h.frequency}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-orange-500"><i class="fas fa-fire"></i><span class="font-bold">${h.streak || 0}</span></div>
          <button onclick="deleteHabit('${h.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-500"><i class="fas fa-trash text-xs"></i></button>
        </div>
      </div>
    `).join('')}</div>`;
  };
  
  window.deleteHabit = (id) => { habits = habits.filter(h => h.id !== id); saveData('habits', habits); renderHabits(); };
  
  window.addHabitModal = () => {
    openModal('Add Habit', `
      <form id="habitForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
          <input type="text" id="habitName" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
          <select id="habitFreq" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="Daily">Daily</option><option value="Weekdays">Weekdays</option><option value="Weekly">Weekly</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
          <input type="color" id="habitColor" value="#3b82f6" class="w-full h-10 rounded-lg cursor-pointer"></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-plus mr-2"></i>Add Habit</button>
      </form>
    `);
    document.getElementById('habitForm').addEventListener('submit', (e) => {
      e.preventDefault();
      habits.push({ id: generateId(), name: document.getElementById('habitName').value, frequency: document.getElementById('habitFreq').value, color: document.getElementById('habitColor').value, streak: 0, createdAt: Date.now() });
      saveData('habits', habits); renderHabits(); closeModal();
    });
  };
  document.getElementById('addHabitBtn')?.addEventListener('click', addHabitModal);
  
  // ========================================
  // Finance
  // ========================================
  const TXN_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Housing', 'Utilities', 'Salary', 'Interest', 'Other'];
  const ACCOUNT_TYPES = ['checking', 'savings', 'brokerage', 'cash', 'other'];
  const getTxnSortKey = (t) => [t.date, (t.sortOrder ?? t.createdAt ?? 0)];
  const sortTxns = (arr) => [...arr].sort((a, b) => {
    const [da, oa] = getTxnSortKey(a);
    const [db, ob] = getTxnSortKey(b);
    if (da !== db) return new Date(db) - new Date(da);
    return (oa || 0) - (ob || 0);
  });

  const showFinanceTab = (tab) => {
    document.querySelectorAll('.finance-tab-btn').forEach(b => {
      const isActive = b.dataset.financeTab === tab;
      // Remove all state classes first
      b.classList.remove('bg-blue-600', 'text-white', 'bg-slate-100', 'text-slate-600');
      b.className = b.className.replace(/dark:bg-slate-700|dark:text-slate-300/g, '').replace(/\s+/g, ' ').trim();
      // Add appropriate classes
      if (isActive) {
        b.classList.add('bg-blue-600', 'text-white');
      } else {
        b.classList.add('bg-slate-100', 'text-slate-600');
        b.className += ' dark:bg-slate-700 dark:text-slate-300';
      }
    });
    document.getElementById('financeStats')?.classList.toggle('hidden', tab !== 'transactions');
    document.getElementById('financePanelTransactions')?.classList.toggle('hidden', tab !== 'transactions');
    document.getElementById('financePanelAccounts')?.classList.toggle('hidden', tab !== 'accounts');
    document.getElementById('financePanelAnalytics')?.classList.toggle('hidden', tab !== 'analytics');
    if (tab === 'accounts') renderAccounts();
    if (tab === 'analytics') renderAnalytics();
  };

  const renderFinance = () => {
    const container = document.getElementById('transactionsContainer');
    const txns = finance.transactions || [];
    
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
    document.getElementById('totalBalance').textContent = formatCurrency(income - expenses);
    
    if (!container) return;
    if (txns.length === 0) {
      container.innerHTML = `<div class="text-center py-8 text-slate-400"><i class="fas fa-receipt text-3xl mb-2 opacity-50"></i><p class="text-sm">No transactions</p><p class="text-xs mt-1">Drag to reorder within a day</p></div>`;
      return;
    }
    
    const sorted = sortTxns(txns);
    const byDate = {};
    sorted.forEach(t => {
      const d = t.date || '1970-01-01';
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(t);
    });
    
    let html = '';
    Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a)).forEach(dateStr => {
      const dayTxns = byDate[dateStr];
      html += `<div class="mb-4"><div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-1">${formatDate(dateStr)}</div>`;
      html += `<div class="space-y-2 txn-date-group" data-date="${dateStr}">`;
      dayTxns.forEach((t, idx) => {
        html += `
      <div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group txn-row" data-txn-id="${t.id}" draggable="true">
        <span class="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical text-sm"></i></span>
        <div class="w-10 h-10 flex-shrink-0 ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'} rounded-lg flex items-center justify-center">
          <i class="fas fa-arrow-${t.type === 'income' ? 'down' : 'up'}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-slate-900 dark:text-white text-sm truncate">${t.description}</p>
          <p class="text-xs text-slate-500">${t.category}${t.receiptUrl ? ` · <a href="${(t.receiptUrl || '').replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">Receipt</a>` : ''}</p>
        </div>
        <p class="font-bold flex-shrink-0 ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</p>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <button onclick="editTxn('${t.id}')" class="p-2 text-blue-500 hover:text-blue-600" title="Edit"><i class="fas fa-pen text-xs"></i></button>
          <button onclick="deleteTxn('${t.id}')" class="p-2 text-red-400 hover:text-red-500" title="Delete"><i class="fas fa-trash text-xs"></i></button>
        </div>
      </div>`;
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
    attachTxnDragListeners();
    if (document.getElementById('accountsContainer')) renderAccounts();
  };

  let txnPanelDragoverAttached = false;
  const attachTxnDragListeners = () => {
    if (!txnPanelDragoverAttached) {
      const panel = document.getElementById('financePanelTransactions');
      if (panel) { panel.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }); txnPanelDragoverAttached = true; }
    }
    const rows = document.querySelectorAll('.txn-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', row.dataset.txnId);
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('opacity-50', 'dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('opacity-50', 'dragging'));
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = row.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        row.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
        row.classList.add(e.clientY < mid ? 'border-t-2 border-blue-500' : 'border-b-2 border-blue-500');
      });
      row.addEventListener('dragleave', (e) => {
        if (!row.contains(e.relatedTarget)) row.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
      });
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = e.currentTarget.dataset.txnId;
        if (!draggedId || draggedId === targetId) return;
        const group = e.currentTarget.closest('.txn-date-group');
        if (!group) return;
        const draggedRow = document.querySelector(`.txn-row[data-txn-id="${draggedId}"]`);
        if (!draggedRow || draggedRow.closest('.txn-date-group') !== group) return;
        const dateStr = group.dataset.date;
        const dayTxns = [...group.querySelectorAll('.txn-row')].map(r => r.dataset.txnId);
        const fromIdx = dayTxns.indexOf(draggedId);
        let toIdx = dayTxns.indexOf(targetId);
        const rect = e.currentTarget.getBoundingClientRect();
        const insertBefore = e.clientY < rect.top + rect.height / 2;
        if (insertBefore && toIdx > fromIdx) toIdx--;
        if (!insertBefore && toIdx < fromIdx) toIdx++;
        if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
        const dayList = finance.transactions.filter(t => (t.date || '') === dateStr);
        dayList.sort((a, b) => (a.sortOrder ?? a.createdAt ?? 0) - (b.sortOrder ?? b.createdAt ?? 0));
        const [moved] = dayList.splice(fromIdx, 1);
        dayList.splice(toIdx, 0, moved);
        dayList.forEach((t, i) => { t.sortOrder = i; });
        saveData('finance', finance);
        renderFinance();
      });
    });
  };

  const getAccountOpts = (selectedId) => {
    const opts = finance.accounts.map(a => `<option value="${a.id}" ${a.id === selectedId ? 'selected' : ''}>${(a.name || 'Account').replace(/</g, '&lt;')} (${a.type})</option>`).join('');
    return `<option value="">— None —</option>${opts}`;
  };

  window.editTxn = (id) => {
    const t = finance.transactions.find(x => x.id === id);
    if (!t) return;
    const catOpts = TXN_CATEGORIES.map(c => `<option value="${c}" ${t.category === c ? 'selected' : ''}>${c}</option>`).join('');
    const acctOpts = getAccountOpts(t.accountId);
    openModal('Edit Transaction', `
      <form id="txnForm" class="space-y-4">
        <input type="hidden" id="txnEditId" value="${t.id}">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="txnType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="expense" ${t.type === 'expense' ? 'selected' : ''}>Expense</option>
            <option value="income" ${t.type === 'income' ? 'selected' : ''}>Income</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <input type="text" id="txnDesc" required value="${(t.description || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
          <input type="number" id="txnAmount" required min="0" step="0.01" value="${t.amount}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select id="txnCat" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">${catOpts}</select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account (optional)</label>
          <select id="txnAccount" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">${acctOpts}</select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt URL (optional)</label>
          <input type="url" id="txnReceiptUrl" placeholder="https://..." value="${(t.receiptUrl || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="txnDate" value="${t.date || getLocalDateString()}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-save mr-2"></i>Save</button>
      </form>
    `);
    document.getElementById('txnForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('txnEditId')?.value;
      if (editId) {
        const tx = finance.transactions.find(x => x.id === editId);
        if (tx) {
          tx.type = document.getElementById('txnType').value;
          tx.description = document.getElementById('txnDesc').value;
          tx.amount = parseAmount(document.getElementById('txnAmount').value);
          tx.category = document.getElementById('txnCat').value;
          tx.accountId = document.getElementById('txnAccount')?.value || null;
          tx.receiptUrl = (document.getElementById('txnReceiptUrl')?.value || '').trim() || null;
          tx.date = document.getElementById('txnDate').value;
          saveData('finance', finance);
          renderFinance();
          closeModal();
        }
      }
    });
  };

  window.deleteTxn = (id) => { finance.transactions = finance.transactions.filter(t => t.id !== id); saveData('finance', finance); renderFinance(); };
  
  document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
    const catOpts = TXN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    const acctOpts = getAccountOpts(null);
    openModal('Add Transaction', `
      <form id="txnForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="txnType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="expense">Expense</option><option value="income">Income</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <input type="text" id="txnDesc" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
          <input type="number" id="txnAmount" required min="0" step="0.01" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select id="txnCat" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">${catOpts}</select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account (optional)</label>
          <select id="txnAccount" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">${acctOpts}</select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt URL (optional)</label>
          <input type="url" id="txnReceiptUrl" placeholder="https://..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="txnDate" value="${getLocalDateString()}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-plus mr-2"></i>Add</button>
      </form>
    `);
    document.getElementById('txnForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('txnDate').value;
      const sameDay = (finance.transactions || []).filter(t => (t.date || '') === date);
      const maxOrder = sameDay.length ? Math.max(...sameDay.map(t => t.sortOrder ?? t.createdAt ?? 0)) : -1;
      finance.transactions = finance.transactions || [];
      finance.transactions.push({
        id: generateId(),
        type: document.getElementById('txnType').value,
        description: document.getElementById('txnDesc').value,
        amount: parseAmount(document.getElementById('txnAmount').value),
        category: document.getElementById('txnCat').value,
        accountId: document.getElementById('txnAccount')?.value || null,
        receiptUrl: (document.getElementById('txnReceiptUrl')?.value || '').trim() || null,
        date,
        sortOrder: maxOrder + 1,
        createdAt: Date.now()
      });
      saveData('finance', finance);
      renderFinance();
      closeModal();
    });
  });

  // Finance tab switching
  document.querySelectorAll('.finance-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showFinanceTab(btn.dataset.financeTab));
  });

  // Accounts - unified slot structure (single account or group header, same look)
  const sortAccounts = (arr) => [...arr].sort((a, b) => (a.sortOrder ?? a.createdAt ?? 0) - (b.sortOrder ?? b.createdAt ?? 0));
  const getCollapsedInstitutions = () => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.collapsedAccounts) || '[]')); } catch { return new Set(); }
  };
  const setCollapsedInstitution = (inst, collapsed) => {
    const s = getCollapsedInstitutions();
    if (collapsed) s.add(inst); else s.delete(inst);
    localStorage.setItem(STORAGE_KEYS.collapsedAccounts, JSON.stringify([...s]));
  };
  window._setCollapsedInst = setCollapsedInstitution;
  const accountSlotHtml = (opts) => {
    const { isGroup, dragData, icon, title, subtitle, balance, extra, startCollapsed } = opts;
    const collapsed = isGroup && startCollapsed;
    const chevron = isGroup ? `<button type="button" onclick="var w=this.closest('.account-slot-wrapper'); var exp=w.querySelector('.account-slot-expand'); var inst=w.dataset.drag?w.dataset.drag.replace('inst:',''):''; exp.classList.toggle('hidden'); var c=exp.classList.contains('hidden'); if(inst)window._setCollapsedInst(inst,c); var i=this.querySelector('i'); i.classList.toggle('fa-chevron-down',!c); i.classList.toggle('fa-chevron-right',c);" class="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><i class="fas fa-chevron-${collapsed?'right':'down'} text-sm"></i></button>` : '';
    return `<div class="account-slot flex items-center gap-2 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group mb-2" data-drag="${dragData}" draggable="true">
      <span class="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical text-sm"></i></span>
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <i class="fas fa-${icon} text-blue-600 dark:text-blue-400"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-slate-900 dark:text-white truncate">${title}</p>
          <p class="text-xs text-slate-500">${subtitle}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <p class="font-bold text-slate-900 dark:text-white">${balance}</p>
        ${chevron}
        ${extra || ''}
      </div>
    </div>`;
  };

  const renderAccounts = () => {
    const container = document.getElementById('accountsContainer');
    if (!container) return;
    const accounts = finance.accounts || [];
    if (accounts.length === 0) {
      container.innerHTML = `<div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
        <i class="fas fa-university text-4xl mb-3 opacity-50"></i>
        <p>No accounts yet. Add checking, savings, brokerage, etc.</p>
      </div>`;
      return;
    }
    const sorted = sortAccounts(accounts);
    const byInstitution = {};
    sorted.forEach(a => {
      const inst = (a.institution || '').trim() || '__ungrouped__';
      if (!byInstitution[inst]) byInstitution[inst] = [];
      byInstitution[inst].push(a);
    });
    const instOrder = [...new Set(sorted.map(a => (a.institution || '').trim() || '__ungrouped__'))];
    let html = '';
    instOrder.forEach(instKey => {
      const group = byInstitution[instKey] || [];
      const instLabel = instKey === '__ungrouped__' ? null : instKey;
      const totalBal = group.reduce((s, a) => s + (parseFloat(a.currentBalance) || 0), 0);
      if (instLabel && group.length >= 2) {
        const groupId = 'inst-' + instLabel.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        const collapsed = getCollapsedInstitutions().has(instLabel);
        html += `<div class="account-slot-wrapper mb-2" data-drag="inst:${instLabel.replace(/"/g, '&quot;')}">
          ${accountSlotHtml({
            isGroup: true,
            dragData: `inst:${instLabel.replace(/"/g, '&quot;')}`,
            icon: 'building-columns',
            title: instLabel.replace(/</g, '&lt;'),
            subtitle: `${group.length} accounts`,
            balance: formatCurrency(totalBal),
            startCollapsed: collapsed
          })}
          <div class="account-slot-expand mt-2 space-y-2 ${collapsed ? 'hidden' : ''}" id="${groupId}">`;
        group.forEach(a => {
          html += renderAccountRow(a, parseFloat(a.currentBalance) || 0);
        });
        html += '</div></div>';
      } else {
        group.forEach(a => {
          const bal = parseFloat(a.currentBalance) || 0;
          const extra = `<button onclick="editAccountModal('${a.id}')" class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Edit"><i class="fas fa-pen text-sm"></i></button>
            <button onclick="updateAccountBalanceModal('${a.id}')" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Update balance"><i class="fas fa-sync-alt text-sm"></i></button>
            <button onclick="deleteAccount('${a.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><i class="fas fa-trash text-sm"></i></button>`;
          html += `<div class="account-slot-wrapper" data-drag="acc:${a.id}">${accountSlotHtml({
            isGroup: false,
            dragData: `acc:${a.id}`,
            icon: a.type === 'brokerage' ? 'chart-line' : a.type === 'cash' ? 'money-bill' : 'university',
            title: (a.name || 'Account').replace(/</g, '&lt;'),
            subtitle: (a.type || 'other').replace(/</g, '&lt;'),
            balance: formatCurrency(bal),
            extra
          })}</div>`;
        });
      }
    });
    container.innerHTML = html;
    attachAccountDragListeners();
  };

  const renderAccountRow = (a, bal) => {
    return `<div class="flex items-center gap-2 p-5 pl-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group account-subrow">
      <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
        <i class="fas fa-${a.type === 'brokerage' ? 'chart-line' : a.type === 'cash' ? 'money-bill' : 'university'} text-blue-600 dark:text-blue-400"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-900 dark:text-white truncate">${(a.name || 'Account').replace(/</g, '&lt;')}</p>
        <p class="text-xs text-slate-500 capitalize">${a.type || 'other'}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <p class="font-bold text-slate-900 dark:text-white">${formatCurrency(bal)}</p>
        <button onclick="editAccountModal('${a.id}')" class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Edit"><i class="fas fa-pen text-sm"></i></button>
        <button onclick="updateAccountBalanceModal('${a.id}')" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Update balance"><i class="fas fa-sync-alt text-sm"></i></button>
        <button onclick="deleteAccount('${a.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><i class="fas fa-trash text-sm"></i></button>
      </div>
    </div>`;
  };

  const attachAccountDragListeners = () => {
    const container = document.getElementById('accountsContainer');
    if (!container) return;
    let placeholder = null;
    let lastDropIndex = -1;
    let currentDragData = null;

    const getSlots = () => [...container.querySelectorAll('.account-slot-wrapper')];
    const removePlaceholder = () => {
      if (placeholder && placeholder.parentNode) placeholder.remove();
      placeholder = null;
      lastDropIndex = -1;
    };
    const showPlaceholder = (index) => {
      const slots = getSlots();
      if (index < 0 || index > slots.length) return;
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'drop-placeholder';
        placeholder.setAttribute('data-placeholder', '1');
        placeholder.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
        });
        placeholder.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAccountDrop(e, lastDropIndex);
        });
      }
      if (lastDropIndex !== index) {
        lastDropIndex = index;
        const target = slots[index];
        if (target) container.insertBefore(placeholder, target);
        else container.appendChild(placeholder);
      }
    };

    const handleAccountDrop = (e, toIdx) => {
      e.preventDefault();
      e.stopPropagation();
      const dragData = e.dataTransfer?.getData?.('text/plain') || currentDragData;
      if (!dragData) return;
      removePlaceholder();
      const slots = getSlots();
      const draggedWrapper = slots.find(s => s.dataset.drag === dragData);
      if (!draggedWrapper) return;
      const fromIdx = slots.indexOf(draggedWrapper);
      if (toIdx === fromIdx || toIdx === fromIdx + 1) return;

      const sorted = sortAccounts(finance.accounts);
      const slotOrder = slots.map(s => s.dataset.drag);
      const movedIds = dragData.startsWith('inst:') ? finance.accounts.filter(a => ((a.institution || '').trim() || '__ungrouped__') === dragData.slice(5)).map(a => a.id) : [dragData.slice(4)];
      const reordered = sorted.filter(a => !movedIds.includes(a.id));
      const toInsert = sorted.filter(a => movedIds.includes(a.id));
      let accountInsertPos = 0;
      for (let i = 0; i < toIdx && i < slotOrder.length; i++) {
        const d = slotOrder[i];
        if (d === dragData) continue;
        if (d.startsWith('inst:')) {
          const instName = d.slice(5);
          accountInsertPos += finance.accounts.filter(a => ((a.institution || '').trim() || '__ungrouped__') === instName).length;
        } else {
          accountInsertPos += 1;
        }
      }
      reordered.splice(accountInsertPos, 0, ...toInsert);
      reordered.forEach((a, i) => { a.sortOrder = i; });
      finance.accounts = reordered;
      saveData('finance', finance);
      renderFinance();
    };

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    container.addEventListener('drop', (e) => {
      if (!currentDragData) return;
      const target = e.target;
      const placeholderEl = container.querySelector('.drop-placeholder');
      let toIdx;
      if (placeholderEl && (target === placeholderEl || placeholderEl.contains(target))) {
        toIdx = lastDropIndex;
      } else {
        const wrapper = target.closest('.account-slot-wrapper');
        if (!wrapper) return;
        const slots = getSlots();
        const rect = wrapper.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const idx = slots.indexOf(wrapper);
        toIdx = e.clientY < mid ? idx : idx + 1;
      }
      handleAccountDrop(e, toIdx);
    });

    container.querySelectorAll('.account-slot').forEach(slot => {
      slot.addEventListener('dragstart', (e) => {
        const wrapper = slot.closest('.account-slot-wrapper');
        if (!wrapper) return;
        currentDragData = wrapper.dataset.drag;
        e.dataTransfer.setData('text/plain', currentDragData);
        e.dataTransfer.effectAllowed = 'move';
        wrapper.classList.add('opacity-50', 'dragging');
      });
      slot.addEventListener('dragend', () => {
        const wrapper = slot.closest('.account-slot-wrapper');
        if (wrapper) wrapper.classList.remove('opacity-50', 'dragging');
        currentDragData = null;
        removePlaceholder();
      });
    });

    container.querySelectorAll('.account-slot-wrapper').forEach(wrapper => {
      wrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const dragData = e.dataTransfer.getData('text/plain') || currentDragData;
        if (!dragData) return;
        const slots = getSlots();
        const draggedWrapper = slots.find(s => s.dataset.drag === dragData);
        if (!draggedWrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const idx = slots.indexOf(wrapper);
        const insertIdx = e.clientY < mid ? idx : idx + 1;
        if (draggedWrapper === wrapper) return;
        const fromIdx = slots.indexOf(draggedWrapper);
        if (insertIdx === fromIdx || insertIdx === fromIdx + 1) return;
        showPlaceholder(insertIdx);
      });
    });
    container.addEventListener('dragleave', (e) => {
      if (!container.contains(e.relatedTarget)) removePlaceholder();
    });
  };

  window.editAccountModal = (id) => {
    const a = finance.accounts.find(x => x.id === id);
    if (!a) return;
    openModal('Edit Account', `
      <form id="accountEditForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
          <input type="text" id="accountEditName" required value="${(a.name || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="accountEditType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="checking" ${a.type === 'checking' ? 'selected' : ''}>Checking</option>
            <option value="savings" ${a.type === 'savings' ? 'selected' : ''}>Savings</option>
            <option value="brokerage" ${a.type === 'brokerage' ? 'selected' : ''}>Brokerage</option>
            <option value="cash" ${a.type === 'cash' ? 'selected' : ''}>Cash</option>
            <option value="other" ${a.type === 'other' ? 'selected' : ''}>Other</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institution (optional)</label>
          <input type="text" id="accountEditInstitution" placeholder="e.g. Fidelity, Wealthfront" value="${(a.institution || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <p class="text-xs text-slate-500">Same institution = grouped with combined balance</p>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-save mr-2"></i>Save</button>
      </form>
    `);
    document.getElementById('accountEditForm').addEventListener('submit', (e) => {
      e.preventDefault();
      a.name = document.getElementById('accountEditName').value.trim();
      a.type = document.getElementById('accountEditType').value;
      a.institution = (document.getElementById('accountEditInstitution')?.value || '').trim() || null;
      saveData('finance', finance);
      renderFinance();
      closeModal();
    });
  };

  window.updateAccountBalanceModal = (id) => {
    const a = finance.accounts.find(x => x.id === id);
    if (!a) return;
    const bal = parseFloat(a.currentBalance) || 0;
    openModal('Update Balance: ' + (a.name || 'Account'), `
      <form id="accountBalanceForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current balance (as of today)</label>
          <input type="number" id="accountBalance" step="0.01" value="${bal}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <p class="text-xs text-slate-500">This adds a snapshot for the net worth graph. Brokerage = enter current value; interest = log as income in Transactions.</p>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-save mr-2"></i>Save</button>
      </form>
    `);
    document.getElementById('accountBalanceForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseAmount(document.getElementById('accountBalance').value);
      a.currentBalance = val;
      a.balanceHistory = a.balanceHistory || [];
      a.balanceHistory.push({ date: getLocalDateString(), balance: val });
      saveData('finance', finance);
      renderFinance();
      closeModal();
    });
  };

  window.deleteAccount = (id) => {
    if (!confirm('Delete this account?')) return;
    finance.accounts = finance.accounts.filter(a => a.id !== id);
    saveData('finance', finance);
    renderFinance();
  };

  document.getElementById('addAccountBtn')?.addEventListener('click', () => {
    openModal('Add Account', `
      <form id="accountForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
          <input type="text" id="accountName" required placeholder="e.g. Chase Checking" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="accountType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="brokerage">Brokerage</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institution (optional)</label>
          <input type="text" id="accountInstitution" placeholder="e.g. Fidelity, Wealthfront" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current balance</label>
          <input type="number" id="accountBalance" step="0.01" value="0" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-plus mr-2"></i>Add</button>
      </form>
    `);
    document.getElementById('accountForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const bal = parseAmount(document.getElementById('accountBalance').value);
      const maxOrder = finance.accounts.length ? Math.max(...finance.accounts.map(a => a.sortOrder ?? 0), -1) : -1;
      finance.accounts.push({
        id: generateId(),
        name: document.getElementById('accountName').value.trim(),
        type: document.getElementById('accountType').value,
        institution: (document.getElementById('accountInstitution')?.value || '').trim() || null,
        currentBalance: bal,
        balanceHistory: [{ date: getLocalDateString(), balance: bal }],
        sortOrder: maxOrder + 1,
        createdAt: Date.now()
      });
      saveData('finance', finance);
      renderFinance();
      closeModal();
    });
  });

  // Analytics
  let chartIncomeExpenses = null, chartCategories = null, chartNetWorth = null;
  const CAT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#64748b', '#ef4444', '#22c55e'];

  const getDateRange = (val) => {
    const today = getLocalDateString();
    if (val === 'month') return { min: today.slice(0, 7) + '-01', max: today };
    if (val === 'ytd') return { min: today.slice(0, 4) + '-01-01', max: today };
    if (val === 'year') {
      const d = new Date();
      d.setMonth(d.getMonth() - 12);
      const min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      return { min, max: today };
    }
    return { min: '1970-01-01', max: '2099-12-31' };
  };

  const filterTxnsByRange = (txns, range) => txns.filter(t => {
    const d = t.date || '';
    return d >= range.min && d <= range.max;
  });

  const filterBalanceHistoryByRange = (accounts, range) => {
    const allDates = new Set();
    accounts.forEach(a => {
      (a.balanceHistory || []).forEach(h => {
        if (h.date >= range.min && h.date <= range.max) allDates.add(h.date);
      });
    });
    return [...allDates].sort();
  };

  const renderChartIncomeExpenses = () => {
    if (typeof Chart === 'undefined') return;
    const rangeVal = document.getElementById('rangeIncomeExpenses')?.value || 'all';
    const range = getDateRange(rangeVal);
    const allTxns = finance.transactions || [];
    const txns = filterTxnsByRange(allTxns, range);
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.1)';

    const byMonth = {};
    txns.forEach(t => {
      const d = t.date || '';
      const m = d.slice(0, 7);
      if (m) {
        if (!byMonth[m]) byMonth[m] = { income: 0, byCat: {} };
        if (t.type === 'income') byMonth[m].income += t.amount || 0;
        else {
          const c = t.category || 'Other';
          byMonth[m].byCat[c] = (byMonth[m].byCat[c] || 0) + (t.amount || 0);
        }
      }
    });
    const months = Object.keys(byMonth).sort();
    const allCats = [...new Set(txns.filter(t => t.type === 'expense').map(t => t.category || 'Other'))].sort();
    
    // Build labels and datasets
    let monthLabels, datasets;
    if (months.length === 0) {
      monthLabels = ['No data'];
      datasets = [{ label: 'Income', data: [0], backgroundColor: 'rgba(34,197,94,0.7)', stack: 'income' }];
    } else {
      monthLabels = months.map(m => {
        const [y, mo] = m.split('-');
        return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      });
      const incomeData = months.map(m => byMonth[m].income);
      datasets = [{ label: 'Income', data: incomeData, backgroundColor: 'rgba(34,197,94,0.7)', borderColor: 'rgb(34,197,94)', borderWidth: 1, stack: 'income' }];
      allCats.forEach((cat, i) => {
        const data = months.map(m => byMonth[m].byCat[cat] || 0);
        datasets.push({ label: cat, data, backgroundColor: CAT_COLORS[i % CAT_COLORS.length], stack: 'expense' });
      });
    }

    const ctx = document.getElementById('chartIncomeExpenses');
    if (ctx) {
      if (chartIncomeExpenses) chartIncomeExpenses.destroy();
      chartIncomeExpenses = new Chart(ctx, {
        type: 'bar',
        data: { labels: monthLabels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor }, stacked: true },
            y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => '$' + v }, stacked: true }
          }
        }
      });
    }
  };

  const renderChartCategories = () => {
    if (typeof Chart === 'undefined') return;
    const rangeVal = document.getElementById('rangeCategories')?.value || 'month';
    const range = getDateRange(rangeVal);
    const allTxns = finance.transactions || [];
    const txns = filterTxnsByRange(allTxns, range);
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const byCat = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      const c = t.category || 'Other';
      byCat[c] = (byCat[c] || 0) + (t.amount || 0);
    });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const hasData = cats.length > 0;

    const ctx = document.getElementById('chartCategories');
    if (ctx) {
      if (chartCategories) chartCategories.destroy();
      chartCategories = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: hasData ? cats.map(([c]) => c) : ['No expenses'],
          datasets: [{ data: hasData ? cats.map(([, v]) => v) : [1], backgroundColor: hasData ? CAT_COLORS : ['#cbd5e1'] }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: { callbacks: { label: (tooltipCtx) => hasData ? `${tooltipCtx.label}: ${formatCurrency(tooltipCtx.raw)}` : 'No data' } }
          }
        }
      });
    }
  };

  const renderChartNetWorth = () => {
    if (typeof Chart === 'undefined') return;
    const rangeVal = document.getElementById('rangeNetWorth')?.value || 'all';
    const range = getDateRange(rangeVal);
    const accounts = finance.accounts || [];
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.1)';

    const sortedDates = filterBalanceHistoryByRange(accounts, range);
    const netWorthByDate = {};
    sortedDates.forEach(d => {
      let total = 0;
      accounts.forEach(a => {
        const hist = (a.balanceHistory || []).filter(h => h.date <= d).sort((x, y) => x.date.localeCompare(y.date));
        const last = hist[hist.length - 1];
        if (last) total += parseFloat(last.balance) || 0;
      });
      netWorthByDate[d] = total;
    });
    const hasData = sortedDates.length > 0;
    const nwLabels = hasData ? sortedDates.map(d => formatDateShort(d)) : ['No data'];
    const nwData = hasData ? sortedDates.map(d => netWorthByDate[d]) : [0];

    const ctx = document.getElementById('chartNetWorth');
    if (ctx) {
      if (chartNetWorth) chartNetWorth.destroy();
      chartNetWorth = new Chart(ctx, {
        type: 'line',
        data: {
          labels: nwLabels,
          datasets: [{ label: 'Net Worth', data: nwData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3, pointRadius: hasData ? 4 : 0, pointBackgroundColor: '#3b82f6' }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: { callbacks: { label: (tooltipCtx) => hasData ? `Net Worth: ${formatCurrency(tooltipCtx.raw)}` : 'No data' } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => '$' + v } }
          }
        }
      });
    }
  };

  const renderAnalytics = () => {
    renderChartIncomeExpenses();
    renderChartCategories();
    renderChartNetWorth();
  };

  document.getElementById('rangeIncomeExpenses')?.addEventListener('change', () => renderChartIncomeExpenses());
  document.getElementById('rangeCategories')?.addEventListener('change', () => renderChartCategories());
  document.getElementById('rangeNetWorth')?.addEventListener('change', () => renderChartNetWorth());
  
  // ========================================
  // Journal
  // ========================================
  const renderJournal = () => {
    const container = document.getElementById('journalContainer');
    if (!container) return;
    
    if (journal.length === 0) {
      container.innerHTML = `<div class="text-center py-16 text-slate-400">
        <i class="fas fa-book-open text-5xl mb-4 opacity-50"></i>
        <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No journal entries</h3>
        <button onclick="addJournalModal()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-pen mr-2"></i>Start Writing</button>
      </div>`;
      return;
    }
    
    container.innerHTML = `<div class="grid gap-4">${journal.sort((a, b) => new Date(b.date) - new Date(a.date)).map(j => `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 group">
        <div class="flex items-start justify-between mb-3">
          <h4 class="font-semibold text-slate-900 dark:text-white">${j.title}</h4>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">${formatDate(j.date)}</span>
            <button onclick="deleteJournal('${j.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-red-500"><i class="fas fa-trash text-xs"></i></button>
          </div>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">${j.content || ''}</p>
      </div>
    `).join('')}</div>`;
  };
  
  window.deleteJournal = (id) => { journal = journal.filter(j => j.id !== id); saveData('journal', journal); renderJournal(); };
  
  window.addJournalModal = () => {
    openModal('New Journal Entry', `
      <form id="journalForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input type="text" id="journalTitle" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="journalDate" value="${getLocalDateString()}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
          <textarea id="journalContent" rows="6" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-save mr-2"></i>Save</button>
      </form>
    `);
    document.getElementById('journalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      journal.push({ id: generateId(), title: document.getElementById('journalTitle').value, date: document.getElementById('journalDate').value, content: document.getElementById('journalContent').value, createdAt: Date.now() });
      saveData('journal', journal); renderJournal(); closeModal();
    });
  };
  document.getElementById('addJournalBtn')?.addEventListener('click', addJournalModal);
  
  // ========================================
  // Stats
  // ========================================
  const updateStats = () => {
    const activeTasks = tasks.filter(t => t.status !== 'done').length;
    const avgGoals = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
    const maxStreak = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
    const txns = finance.transactions || [];
    const balance = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    document.getElementById('statTasks')?.textContent && (document.getElementById('statTasks').textContent = activeTasks);
    document.getElementById('statGoals')?.textContent && (document.getElementById('statGoals').textContent = avgGoals + '%');
    document.getElementById('statStreak')?.textContent && (document.getElementById('statStreak').textContent = maxStreak);
    document.getElementById('statBalance')?.textContent && (document.getElementById('statBalance').textContent = formatCurrency(balance));
    document.getElementById('statLifeLog')?.textContent && (document.getElementById('statLifeLog').textContent = lifeLog.length);
  };
  
  // ========================================
  // Settings
  // ========================================
  document.getElementById('exportData')?.addEventListener('click', () => {
    const data = { tasks, goals, habits, finance, journal, lifeLog, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `life-erp-${getLocalDateString()}.json`; a.click();
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('clearData')?.addEventListener('click', async () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      tasks = []; goals = []; habits = []; finance = { transactions: [], accounts: [] }; journal = []; lifeLog = [];
      await saveData('tasks', []); await saveData('goals', []); await saveData('habits', []);
      await saveData('finance', { transactions: [], accounts: [] }); await saveData('journal', []); await saveData('lifeLog', []);
      renderTasks(); renderGoals(); renderHabits(); renderFinance(); renderJournal(); renderCalendar(); renderDayDetail();
      updateStats(); alert('All data cleared.');
    }
  });
  
  // ========================================
  // Quick Log Buttons & Section Buttons
  // ========================================
  document.querySelectorAll('[data-log-type]').forEach(btn => {
    btn.addEventListener('click', () => openLogModal(btn.dataset.logType));
  });
  
  // Health section button
  document.getElementById('addHealthBtn')?.addEventListener('click', () => openLogModal('health'));
  
  // Alias for backwards compatibility
  window.openLifeLogModal = openLogModal;
  
  // ========================================
  // Initialize
  // ========================================
  renderTasks();
  renderGoals();
  renderHabits();
  renderFinance();
  renderJournal();
  renderCalendar();
  renderDayDetail();
  updateStats();

  // Profile section (Settings page)
  const updateProfileSection = async () => {
    const nameEl = document.getElementById('profileDisplayName');
    const emailEl = document.getElementById('profileEmail');
    const saveBtn = document.getElementById('saveDisplayName');
    if (!nameEl || !emailEl) return;
    const session = await window.dataService?.getSession?.();
    if (session?.user) {
      const displayName = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '';
      nameEl.value = displayName;
      emailEl.value = session.user.email || '';
      nameEl.disabled = false;
      saveBtn.style.display = '';
      saveBtn.onclick = async () => {
        const name = nameEl.value.trim();
        if (!name) return;
        const { error } = await window.dataService?.updateDisplayName?.(name);
        if (error) alert('Failed to update: ' + error.message);
        else {
          document.getElementById('userDisplayName').textContent = name;
          document.getElementById('userInitials').textContent = name.split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || name[0].toUpperCase();
          document.getElementById('welcomeText').textContent = `Welcome back, ${name}! Here's your life at a glance.`;
        }
      };
    } else {
      nameEl.value = '';
      emailEl.value = 'Local mode';
      nameEl.disabled = true;
      saveBtn.style.display = 'none';
    }
  };

  // Cloud sync status (Settings page)
  const updateCloudSyncStatus = async () => {
    const el = document.getElementById('cloudSyncStatus');
    if (!el) return;
    const config = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
    const configured = !!(config?.url && config?.anonKey && !config.url.includes('YOUR_') && !config.anonKey.includes('YOUR_'));
    if (!configured) {
      el.innerHTML = `
        <p class="text-amber-600 dark:text-amber-400"><i class="fas fa-exclamation-triangle mr-2"></i>Supabase not configured</p>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Add SUPABASE_URL and SUPABASE_ANON_KEY to GitHub Secrets. See admin/SUPABASE_SETUP.md</p>
        <p class="text-slate-500 dark:text-slate-400 mt-2"><strong>Storage:</strong> Local only (browser)</p>
      `;
      return;
    }
    if (!window.dataService?.isCloudEnabled?.()) {
      el.innerHTML = `
        <p class="text-amber-600 dark:text-amber-400"><i class="fas fa-exclamation-triangle mr-2"></i>Supabase client failed to init</p>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Check browser console for errors. Supabase script may have failed to load.</p>
        <p class="text-slate-500 dark:text-slate-400 mt-2"><strong>Storage:</strong> Local only (fallback)</p>
      `;
      return;
    }
    const session = await window.dataService.getSession();
    if (!session) {
      el.innerHTML = `
        <p class="text-slate-600 dark:text-slate-300"><i class="fas fa-cloud mr-2"></i>Supabase configured</p>
        <p class="text-amber-600 dark:text-amber-400 mt-2">Not signed in – using local storage</p>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Sign in below to sync your data across devices.</p>
        <p class="text-slate-500 dark:text-slate-400 mt-2"><strong>Storage:</strong> Local only</p>
        <button id="settingsSignInBtn" class="mt-4 w-full py-2.5 gradient-bg text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <i class="fas fa-cloud-upload-alt mr-2"></i>Sign in to sync
        </button>
      `;
      el.querySelector('#settingsSignInBtn')?.addEventListener('click', () => {
        document.getElementById('cloudSyncContainer')?.querySelector('#cloudSignIn')?.click() || window.openCloudModal?.();
      });
      return;
    }
    let testOk = false;
    let testErr = '';
    try {
      const d = await window.dataService.get('tasks');
      testOk = Array.isArray(d);
    } catch (e) { testErr = e.message || String(e); }
    el.innerHTML = `
      <p class="text-emerald-600 dark:text-emerald-400"><i class="fas fa-cloud mr-2"></i>Supabase connected</p>
      <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Signed in as ${(session.user?.email || 'unknown').replace(/</g, '&lt;')}</p>
      <p class="text-slate-500 dark:text-slate-400 mt-2"><strong>Storage:</strong> ${testOk ? 'Cloud sync active' : 'Cloud sync (fetch test failed: ' + testErr + ')'}</p>
    `;
  };

  // Cloud sync UI
  const cloudEl = document.getElementById('cloudSyncContainer');
  if (cloudEl && window.dataService?.isCloudEnabled?.()) {
    const renderCloudUI = async () => {
      const signedIn = await window.dataService.getSession();
      if (signedIn) {
        const displayName = signedIn.user?.user_metadata?.display_name || signedIn.user?.email?.split('@')[0] || 'Signed in';
        const email = signedIn.user?.email || '';
        cloudEl.innerHTML = `
          <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm">
            <i class="fas fa-cloud text-emerald-500"></i>
            <span class="hidden sm:inline truncate max-w-[120px]" title="${email}">${displayName}</span>
            <button id="cloudSignOut" class="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 rounded" title="Sign out"><i class="fas fa-sign-out-alt text-xs"></i></button>
          </div>
        `;
        cloudEl.querySelector('#cloudSignOut')?.addEventListener('click', async () => {
          await window.dataService.signOut();
          window.location.reload();
        });
      } else {
        cloudEl.innerHTML = `
          <button id="cloudSignIn" class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-sm">
            <i class="fas fa-cloud"></i>
            <span class="hidden sm:inline">Sign in to sync</span>
          </button>
        `;
        cloudEl.querySelector('#cloudSignIn')?.addEventListener('click', () => window.openCloudModal());
      }
    };
    window.openCloudModal = () => {
      openModal('Cloud Sync', `
        <div class="space-y-4">
          <p class="text-sm text-slate-600 dark:text-slate-400">Sign in to sync your data across devices. Free with Supabase.</p>
          <form id="cloudAuthForm" class="space-y-3">
            <input type="email" id="cloudEmail" placeholder="Email" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <input type="password" id="cloudPassword" placeholder="Password" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <p id="cloudAuthError" class="text-sm text-red-500 hidden"></p>
            <div class="flex gap-2">
              <button type="submit" id="cloudSignInBtn" class="flex-1 py-2 gradient-bg text-white text-sm rounded-lg">Sign in</button>
              <button type="button" id="cloudSignUpBtn" class="flex-1 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg">Sign up</button>
            </div>
          </form>
          <p class="text-xs text-slate-500 dark:text-slate-400">Local data is imported to cloud when you sign in.</p>
        </div>
      `);
      const doAuth = async (isSignUp) => {
        const email = document.getElementById('cloudEmail').value;
        const password = document.getElementById('cloudPassword').value;
        const err = document.getElementById('cloudAuthError');
        const { error } = isSignUp ? await window.dataService.signUp(email, password, email.split('@')[0]) : await window.dataService.signIn(email, password);
        if (error) {
          err.textContent = /rate limit|rate_limit|email.*exceed/i.test(error.message)
            ? 'Email rate limit. Disable "Confirm email" in Supabase (Auth → Providers → Email).'
            : error.message;
          err.classList.remove('hidden');
          return;
        }
        const hasLocal = (window.DATA_DOMAINS || []).some(d => localStorage.getItem(STORAGE_KEYS[d] || 'lifeErp_' + d));
        if (hasLocal) await window.dataService.importLocalToCloud();
        closeModal(); window.location.reload();
      };
      document.getElementById('cloudAuthForm')?.addEventListener('submit', async (e) => { e.preventDefault(); await doAuth(false); });
      document.getElementById('cloudSignUpBtn')?.addEventListener('click', async () => await doAuth(true));
    };
    renderCloudUI();
  }
  })();
}
