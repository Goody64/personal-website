// ========================================
// Life ERP - Admin JavaScript
// ========================================

// Storage Keys
const STORAGE_KEYS = {
  tasks: 'lifeErp_tasks',
  goals: 'lifeErp_goals',
  habits: 'lifeErp_habits',
  finance: 'lifeErp_finance',
  journal: 'lifeErp_journal',
  lifeLog: 'lifeErp_lifeLog',
  theme: 'lifeErp_theme'
};

// Activity Types Configuration
const ACTIVITY_TYPES = {
  tv: { name: 'TV Show', icon: 'fa-tv', color: '#8b5cf6', plural: 'episodes', 
    fields: [
      { key: 'show', label: 'Show Name', type: 'text', required: true },
      { key: 'season', label: 'Season', type: 'number' },
      { key: 'episode', label: 'Episode', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  movie: { name: 'Movie', icon: 'fa-film', color: '#ec4899', plural: 'movies',
    fields: [
      { key: 'title', label: 'Movie Title', type: 'text', required: true },
      { key: 'rating', label: 'Rating (1-10)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  game: { name: 'Gaming', icon: 'fa-gamepad', color: '#22c55e', plural: 'sessions',
    fields: [
      { key: 'game', label: 'Game', type: 'text', required: true },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
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
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  meal: { name: 'Meal', icon: 'fa-utensils', color: '#14b8a6', plural: 'meals',
    fields: [
      { key: 'meal', label: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
      { key: 'description', label: 'What you ate', type: 'text' },
      { key: 'restaurant', label: 'Restaurant', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]},
  book: { name: 'Reading', icon: 'fa-book', color: '#a855f7', plural: 'sessions',
    fields: [
      { key: 'title', label: 'Book Title', type: 'text', required: true },
      { key: 'pages', label: 'Pages Read', type: 'number' },
      { key: 'finished', label: 'Finished Book', type: 'checkbox' },
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
const formatDate = (date) => {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocalDate(date) : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatDateShort = (date) => {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocalDate(date) : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const getFromStorage = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } 
  catch { return null; }
};
const saveToStorage = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; } 
  catch { return false; }
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
// Login Page
// ========================================
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  
  if (!getAuthConfig()) {
    loginForm.innerHTML = `<div class="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
      <h3 class="font-semibold mb-2"><i class="fas fa-exclamation-triangle mr-2"></i>Admin Not Configured</h3>
      <p class="text-sm">Create admin-config.js from the example file.</p></div>`;
  } else if (checkSession()) {
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('togglePassword')?.addEventListener('click', function() {
      const pw = document.getElementById('password');
      pw.type = pw.type === 'password' ? 'text' : 'password';
      this.innerHTML = `<i class="fas fa-eye${pw.type === 'password' ? '' : '-slash'}"></i>`;
    });
    
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (authenticate(document.getElementById('username').value, document.getElementById('password').value)) {
        window.location.href = 'dashboard.html';
      } else {
        const err = document.getElementById('loginError');
        err.classList.remove('hidden');
        setTimeout(() => err.classList.add('hidden'), 3000);
      }
    });
  }
}

// ========================================
// Dashboard
// ========================================
if (document.getElementById('mainContent')) {
  if (!checkSession()) window.location.href = 'index.html';
  
  // Data
  let tasks = getFromStorage(STORAGE_KEYS.tasks) || [];
  let goals = getFromStorage(STORAGE_KEYS.goals) || [];
  let habits = getFromStorage(STORAGE_KEYS.habits) || [];
  let finance = getFromStorage(STORAGE_KEYS.finance) || { transactions: [] };
  let journal = getFromStorage(STORAGE_KEYS.journal) || [];
  let lifeLog = getFromStorage(STORAGE_KEYS.lifeLog) || [];
  
  // State
  let currentDate = new Date();
  let selectedDate = new Date().toISOString().split('T')[0];
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
  };
  window.showSection = showSection;
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showSection(link.dataset.section); });
  });
  
  // Logout
  const handleLogout = () => { clearSession(); window.location.href = 'index.html'; };
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
        result.push({
          type: 'tv',
          show: r.show,
          season: r.season,
          episodeRange: epRange,
          count: count,
          entries: eps.filter(e => (e.data.episode || 0) >= startEp && (e.data.episode || 0) <= endEp),
          hasNotes: eps.some(e => e.data.notes)
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
    const today = new Date().toISOString().split('T')[0];
    
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
                  <p class="text-sm text-slate-500 dark:text-slate-400">${g.season} ${g.episodeRange} · ${g.count} episode${g.count > 1 ? 's' : ''}${g.hasNotes ? ' · <i class="fas fa-sticky-note text-xs"></i>' : ''}</p>
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
    entries.forEach(e => {
      let detail = '';
      if (type === 'tv') detail = `S${e.data.season || 1} E${e.data.episode || 1}`;
      else detail = t.fields.slice(1).map(f => e.data[f.key]).filter(Boolean).join(' · ');
      
      html += `
        <div class="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
          <div class="flex-1 min-w-0 cursor-pointer" onclick="openEditModal('${e.id}')">
            <p class="font-medium text-slate-900 dark:text-white">${detail}</p>
            ${e.data.notes ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">${String(e.data.notes).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button onclick="openEditModal('${e.id}'); closeModal();" class="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg" title="Edit"><i class="fas fa-pen text-xs"></i></button>
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
    const details = t?.fields.slice(1).map(f => ({ label: f.label, value: e.data[f.key] })).filter(d => d.value !== undefined && d.value !== '') || [];
    
    let html = `
      <div class="space-y-4">
        <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <p class="font-semibold text-slate-900 dark:text-white text-lg">${String(mainValue).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${t?.name || e.type} · ${formatDateShort(e.date)}</p>
        </div>
        ${details.length ? `<div class="space-y-2">${details.map(d => `
          <div><span class="text-xs text-slate-500 dark:text-slate-400">${d.label}</span><p class="text-sm text-slate-900 dark:text-white">${String(d.value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>
        `).join('')}</div>` : ''}
        ${e.data.notes ? `<div><span class="text-xs text-slate-500 dark:text-slate-400">Notes</span><p class="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">${String(e.data.notes).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}
        ${e.data.content ? `<div><span class="text-xs text-slate-500 dark:text-slate-400">Content</span><p class="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">${String(e.data.content).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}
        <div class="flex gap-2 pt-2">
          <button onclick="openEditModal('${e.id}'); closeModal();" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><i class="fas fa-pen mr-2"></i>Edit</button>
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
          return `<div class="flex items-center gap-2"><input type="checkbox" id="field_${f.key}" class="w-4 h-4 rounded">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">${f.label}</label></div>`;
        } else {
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <input type="${f.type}" id="field_${f.key}" ${f.required ? 'required' : ''} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>`;
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
        if (el) data[f.key] = f.type === 'checkbox' ? el.checked : (f.type === 'number' ? parseFloat(el.value) || 0 : el.value);
      });
      
      lifeLog.push({ id: generateId(), type, date: document.getElementById('logDate').value, data, createdAt: Date.now() });
      saveToStorage(STORAGE_KEYS.lifeLog, lifeLog);
      renderCalendar();
      renderDayDetail();
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
        const valStr = val === undefined || val === null ? '' : String(val);
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
          return `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${f.label}</label>
            <input type="${f.type}" id="edit_field_${f.key}" ${f.required ? 'required' : ''} value="${valStr.replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>`;
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
        if (el) data[f.key] = f.type === 'checkbox' ? el.checked : (f.type === 'number' ? parseFloat(el.value) || 0 : el.value);
      });
      
      lifeLog[idx] = { ...lifeLog[idx], date: document.getElementById('editLogDate').value, data, updatedAt: Date.now() };
      saveToStorage(STORAGE_KEYS.lifeLog, lifeLog);
      renderCalendar();
      renderDayDetail();
      updateStats();
      closeModal();
    });
  };
  
  window.deleteEntry = (id) => {
    lifeLog = lifeLog.filter(e => e.id !== id);
    saveToStorage(STORAGE_KEYS.lifeLog, lifeLog);
    renderCalendar();
    renderDayDetail();
    updateStats();
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
        
        html += `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-slate-900 dark:text-white">${show}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${data.totalEpisodes} episodes across ${seasonCount} season${seasonCount > 1 ? 's' : ''}</p>
                <p class="text-xs text-slate-400 mt-2">${seasonSummary}</p>
                <p class="text-xs text-slate-400 mt-1">Last watched: ${formatDateShort(data.lastWatched)}</p>
              </div>
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
        if (!games[game]) games[game] = { sessions: 0, totalTime: 0, lastPlayed: e.date };
        games[game].sessions++;
        games[game].totalTime += e.data.duration || 0;
        if (e.date > games[game].lastPlayed) games[game].lastPlayed = e.date;
      });
      
      const sorted = Object.entries(games).sort((a, b) => new Date(b[1].lastPlayed) - new Date(a[1].lastPlayed));
      
      html = `<div class="space-y-4">`;
      sorted.forEach(([game, data]) => {
        const hours = Math.round(data.totalTime / 60 * 10) / 10;
        html += `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${game}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${data.sessions} sessions · ${hours}h total</p>
                <p class="text-xs text-slate-400 mt-1">Last played: ${formatDateShort(data.lastPlayed)}</p>
              </div>
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
        if (!books[title]) books[title] = { sessions: 0, pages: 0, finished: false, lastRead: e.date };
        books[title].sessions++;
        books[title].pages += e.data.pages || 0;
        if (e.data.finished) books[title].finished = true;
        if (e.date > books[title].lastRead) books[title].lastRead = e.date;
      });
      
      const sorted = Object.entries(books).sort((a, b) => new Date(b[1].lastRead) - new Date(a[1].lastRead));
      
      html = `<div class="space-y-4">`;
      sorted.forEach(([title, data]) => {
        html += `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${title}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${data.pages} pages · ${data.sessions} sessions ${data.finished ? '· <span class="text-green-500">Finished</span>' : ''}</p>
                <p class="text-xs text-slate-400 mt-1">Last read: ${formatDateShort(data.lastRead)}</p>
              </div>
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
        html += `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
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
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'work') {
      // Group by category, then by subtype
      const byCategory = { Job: [], School: [], Personal: [] };
      entries.forEach(e => {
        const cat = e.data.category || 'Job';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(e);
      });
      
      html = `<div class="space-y-6">`;
      ['Job', 'School', 'Personal'].forEach(cat => {
        const list = byCategory[cat] || [];
        if (list.length === 0) return;
        const bySubtype = {};
        list.forEach(e => {
          const sub = e.data.subtype || 'Other';
          if (!bySubtype[sub]) bySubtype[sub] = [];
          bySubtype[sub].push(e);
        });
        html += `
          <div>
            <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">${cat}</h3>
            <div class="space-y-3">
              ${Object.entries(bySubtype).sort((a, b) => b[1].length - a[1].length).map(([sub, items]) => {
                const subMins = items.reduce((s, e) => s + (e.data.duration || 0), 0);
                return `
                <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: ${t.color}20">
                      <i class="fas ${t.icon}" style="color: ${t.color}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-semibold text-slate-900 dark:text-white">${sub}</h4>
                      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${items.length} session${items.length !== 1 ? 's' : ''}${subMins ? ` · ${Math.round(subMins / 60 * 10) / 10}h` : ''}</p>
                      <p class="text-xs text-slate-400 mt-2">${items.slice(0, 2).map(e => e.data.title).join(', ')}${items.length > 2 ? '...' : ''}</p>
                    </div>
                  </div>
                </div>
              `;
              }).join('')}
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else if (type === 'movie') {
      const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      html = `<div class="space-y-4">`;
      sorted.forEach(e => {
        html += `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon} text-lg" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-white">${e.data.title}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">${e.data.rating ? `★ ${e.data.rating}/10 · ` : ''}${formatDateShort(e.date)}</p>
                ${e.data.notes ? `<p class="text-xs text-slate-400 mt-1">${e.data.notes}</p>` : ''}
              </div>
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
        const mainValue = e.data[mainField] || 'Entry';
        const secondaryInfo = t.fields.slice(1, 3).map(f => e.data[f.key]).filter(Boolean).join(' · ');
        
        html += `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${t.color}20">
                <i class="fas ${t.icon}" style="color: ${t.color}"></i>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">${mainValue}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">${secondaryInfo ? secondaryInfo + ' · ' : ''}${formatDateShort(e.date)}</p>
              </div>
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
  
  window.deleteTask = (id) => { tasks = tasks.filter(t => t.id !== id); saveToStorage(STORAGE_KEYS.tasks, tasks); renderTasks(); };
  
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
      saveToStorage(STORAGE_KEYS.tasks, tasks); renderTasks(); updateStats(); closeModal();
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
  
  window.deleteGoal = (id) => { goals = goals.filter(g => g.id !== id); saveToStorage(STORAGE_KEYS.goals, goals); renderGoals(); };
  
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
      saveToStorage(STORAGE_KEYS.goals, goals); renderGoals(); closeModal();
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
  
  window.deleteHabit = (id) => { habits = habits.filter(h => h.id !== id); saveToStorage(STORAGE_KEYS.habits, habits); renderHabits(); };
  
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
      saveToStorage(STORAGE_KEYS.habits, habits); renderHabits(); closeModal();
    });
  };
  document.getElementById('addHabitBtn')?.addEventListener('click', addHabitModal);
  
  // ========================================
  // Finance
  // ========================================
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
      container.innerHTML = `<div class="text-center py-8 text-slate-400"><i class="fas fa-receipt text-3xl mb-2 opacity-50"></i><p class="text-sm">No transactions</p></div>`;
      return;
    }
    
    container.innerHTML = txns.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(t => `
      <div class="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-2 group">
        <div class="w-10 h-10 ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'} rounded-lg flex items-center justify-center">
          <i class="fas fa-arrow-${t.type === 'income' ? 'down' : 'up'}"></i>
        </div>
        <div class="flex-1">
          <p class="font-medium text-slate-900 dark:text-white text-sm">${t.description}</p>
          <p class="text-xs text-slate-500">${t.category} · ${formatDateShort(t.date)}</p>
        </div>
        <p class="font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</p>
        <button onclick="deleteTxn('${t.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-400"><i class="fas fa-trash text-xs"></i></button>
      </div>
    `).join('');
  };
  
  window.deleteTxn = (id) => { finance.transactions = finance.transactions.filter(t => t.id !== id); saveToStorage(STORAGE_KEYS.finance, finance); renderFinance(); };
  
  document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
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
          <select id="txnCat" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option>Food</option><option>Transport</option><option>Entertainment</option><option>Shopping</option><option>Salary</option><option>Other</option>
          </select></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="txnDate" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-plus mr-2"></i>Add</button>
      </form>
    `);
    document.getElementById('txnForm').addEventListener('submit', (e) => {
      e.preventDefault();
      finance.transactions.push({ id: generateId(), type: document.getElementById('txnType').value, description: document.getElementById('txnDesc').value, amount: parseFloat(document.getElementById('txnAmount').value), category: document.getElementById('txnCat').value, date: document.getElementById('txnDate').value, createdAt: Date.now() });
      saveToStorage(STORAGE_KEYS.finance, finance); renderFinance(); closeModal();
    });
  });
  
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
  
  window.deleteJournal = (id) => { journal = journal.filter(j => j.id !== id); saveToStorage(STORAGE_KEYS.journal, journal); renderJournal(); };
  
  window.addJournalModal = () => {
    openModal('New Journal Entry', `
      <form id="journalForm" class="space-y-4">
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input type="text" id="journalTitle" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="journalDate" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></div>
        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
          <textarea id="journalContent" rows="6" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea></div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg"><i class="fas fa-save mr-2"></i>Save</button>
      </form>
    `);
    document.getElementById('journalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      journal.push({ id: generateId(), title: document.getElementById('journalTitle').value, date: document.getElementById('journalDate').value, content: document.getElementById('journalContent').value, createdAt: Date.now() });
      saveToStorage(STORAGE_KEYS.journal, journal); renderJournal(); closeModal();
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
    const a = document.createElement('a'); a.href = url; a.download = `life-erp-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('clearData')?.addEventListener('click', () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      tasks = []; goals = []; habits = []; finance = { transactions: [] }; journal = []; lifeLog = [];
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
}
