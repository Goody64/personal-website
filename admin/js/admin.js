// ========================================
// Life ERP - Admin JavaScript
// ========================================
// Requires admin-config.js - credentials loaded from secrets on deploy

// Storage Keys
const STORAGE_KEYS = {
  tasks: 'lifeErp_tasks',
  goals: 'lifeErp_goals',
  habits: 'lifeErp_habits',
  finance: 'lifeErp_finance',
  health: 'lifeErp_health',
  journal: 'lifeErp_journal',
  events: 'lifeErp_events',
  lifeLog: 'lifeErp_lifeLog',
  activityTypes: 'lifeErp_activityTypes',
  theme: 'lifeErp_theme'
};

// Default Activity Types
const DEFAULT_ACTIVITY_TYPES = [
  { id: 'tv', name: 'TV Show', icon: 'fa-tv', color: '#8b5cf6', fields: [
    { key: 'show', label: 'Show Name', type: 'text', required: true },
    { key: 'season', label: 'Season', type: 'number' },
    { key: 'episode', label: 'Episode', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'movie', name: 'Movie', icon: 'fa-film', color: '#ec4899', fields: [
    { key: 'title', label: 'Movie Title', type: 'text', required: true },
    { key: 'rating', label: 'Rating (1-10)', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'sport', name: 'Sport/Activity', icon: 'fa-running', color: '#22c55e', fields: [
    { key: 'activity', label: 'Activity', type: 'text', required: true },
    { key: 'duration', label: 'Duration (min)', type: 'number' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'golf', name: 'Golf Round', icon: 'fa-golf-ball', color: '#10b981', fields: [
    { key: 'course', label: 'Course', type: 'text', required: true },
    { key: 'score', label: 'Score', type: 'number' },
    { key: 'holes', label: 'Holes (9/18)', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'climbing', name: 'Climbing Session', icon: 'fa-mountain', color: '#f97316', fields: [
    { key: 'location', label: 'Gym/Location', type: 'text', required: true },
    { key: 'duration', label: 'Duration (min)', type: 'number' },
    { key: 'hardestGrade', label: 'Hardest Grade', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'purchase', name: 'Purchase', icon: 'fa-shopping-bag', color: '#f59e0b', fields: [
    { key: 'item', label: 'Item', type: 'text', required: true },
    { key: 'amount', label: 'Amount ($)', type: 'number', required: true },
    { key: 'store', label: 'Store', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' }
  ]},
  { id: 'health', name: 'Health Metric', icon: 'fa-heartbeat', color: '#ef4444', fields: [
    { key: 'metric', label: 'Metric Type', type: 'select', options: ['Steps', 'Weight', 'Sleep (hrs)', 'Water (glasses)', 'Calories', 'Other'], required: true },
    { key: 'value', label: 'Value', type: 'number', required: true },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'workout', name: 'Workout', icon: 'fa-dumbbell', color: '#6366f1', fields: [
    { key: 'type', label: 'Workout Type', type: 'text', required: true },
    { key: 'duration', label: 'Duration (min)', type: 'number' },
    { key: 'calories', label: 'Calories Burned', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'meal', name: 'Meal', icon: 'fa-utensils', color: '#14b8a6', fields: [
    { key: 'meal', label: 'Meal Type', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
    { key: 'description', label: 'What you ate', type: 'text' },
    { key: 'restaurant', label: 'Restaurant (if out)', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'event', name: 'Event', icon: 'fa-calendar-check', color: '#3b82f6', fields: [
    { key: 'title', label: 'Event Title', type: 'text', required: true },
    { key: 'time', label: 'Time', type: 'time' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'book', name: 'Reading', icon: 'fa-book', color: '#a855f7', fields: [
    { key: 'title', label: 'Book Title', type: 'text', required: true },
    { key: 'pages', label: 'Pages Read', type: 'number' },
    { key: 'finished', label: 'Finished?', type: 'checkbox' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'social', name: 'Social', icon: 'fa-users', color: '#0ea5e9', fields: [
    { key: 'people', label: 'Who', type: 'text', required: true },
    { key: 'activity', label: 'What', type: 'text' },
    { key: 'location', label: 'Where', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ]},
  { id: 'custom', name: 'Custom Entry', icon: 'fa-sticky-note', color: '#64748b', fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'notes', label: 'Details', type: 'textarea' }
  ]}
];

// ========================================
// Utility Functions
// ========================================
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric'
});

const formatDateShort = (date) => new Date(date).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric'
});

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD'
}).format(amount);

const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Storage read error:', e);
    return null;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Storage write error:', e);
    return false;
  }
};

// ========================================
// Authentication
// ========================================
const getAuthConfig = () => {
  if (typeof AUTH_CONFIG === 'undefined') return null;
  return AUTH_CONFIG;
};

const createSession = () => {
  const config = getAuthConfig();
  if (!config) return false;
  const session = {
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + config.sessionDuration
  };
  saveToStorage(config.sessionKey, session);
  return session;
};

const checkSession = () => {
  const config = getAuthConfig();
  if (!config) return false;
  const session = getFromStorage(config.sessionKey);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    clearSession();
    return false;
  }
  return session.authenticated;
};

const clearSession = () => {
  const config = getAuthConfig();
  if (config) localStorage.removeItem(config.sessionKey);
};

const authenticate = (username, password) => {
  const config = getAuthConfig();
  if (!config) return false;
  if (username === config.username && password === config.password) {
    createSession();
    return true;
  }
  return false;
};

// ========================================
// Login Page Logic
// ========================================
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  
  if (!getAuthConfig()) {
    loginForm.innerHTML = `
      <div class="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
        <h3 class="font-semibold mb-2 flex items-center gap-2">
          <i class="fas fa-exclamation-triangle"></i>
          Admin Not Configured
        </h3>
        <p class="text-sm mb-4">Create <code class="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">admin-config.js</code> from the example file and set your credentials.</p>
      </div>
    `;
  } else if (checkSession()) {
    window.location.href = 'dashboard.html';
  } else {
    togglePassword?.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (authenticate(username, password)) {
        window.location.href = 'dashboard.html';
      } else {
        loginError.classList.remove('hidden');
        loginError.classList.add('shake');
        setTimeout(() => {
          loginError.classList.add('hidden');
          loginError.classList.remove('shake');
        }, 3000);
      }
    });
  }
}

// ========================================
// Dashboard Logic
// ========================================
if (document.getElementById('mainContent')) {
  if (!checkSession()) {
    window.location.href = 'index.html';
  }
  
  // Data stores
  let tasks = getFromStorage(STORAGE_KEYS.tasks) || [];
  let goals = getFromStorage(STORAGE_KEYS.goals) || [];
  let habits = getFromStorage(STORAGE_KEYS.habits) || [];
  let finance = getFromStorage(STORAGE_KEYS.finance) || { transactions: [] };
  let health = getFromStorage(STORAGE_KEYS.health) || { entries: [], workouts: [] };
  let journal = getFromStorage(STORAGE_KEYS.journal) || [];
  let events = getFromStorage(STORAGE_KEYS.events) || [];
  let lifeLog = getFromStorage(STORAGE_KEYS.lifeLog) || [];
  let activityTypes = getFromStorage(STORAGE_KEYS.activityTypes) || DEFAULT_ACTIVITY_TYPES;
  
  // Ensure default activity types exist
  if (!getFromStorage(STORAGE_KEYS.activityTypes)) {
    saveToStorage(STORAGE_KEYS.activityTypes, DEFAULT_ACTIVITY_TYPES);
  }
  
  // ========================================
  // Theme
  // ========================================
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }
  
  themeToggle?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
  });
  
  // ========================================
  // Sidebar & Navigation
  // ========================================
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  
  sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-collapsed');
    mainContent.classList.toggle('ml-64');
    mainContent.classList.toggle('ml-20');
  });
  
  mobileMenuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
  });
  
  const showSection = (sectionId) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active', 'bg-blue-600'));
    
    const section = document.getElementById(sectionId);
    const link = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (section) {
      section.classList.remove('hidden');
      section.classList.add('animate-in');
    }
    if (link) link.classList.add('active', 'bg-blue-600');
    
    if (window.innerWidth < 1024) sidebar.classList.add('-translate-x-full');
  };
  
  window.showSection = showSection;
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.section);
    });
  });
  
  // ========================================
  // Logout
  // ========================================
  const handleLogout = () => {
    clearSession();
    window.location.href = 'index.html';
  };
  
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('logoutSettings')?.addEventListener('click', handleLogout);
  
  // ========================================
  // Modal
  // ========================================
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  
  const openModal = (title, content) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
  };
  
  const closeModal = () => {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
  };
  
  window.openModal = openModal;
  window.closeModal = closeModal;
  
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // ========================================
  // Life Log - Universal Activity Tracking
  // ========================================
  const getActivityType = (typeId) => activityTypes.find(t => t.id === typeId);
  
  const renderLifeLogEntry = (entry) => {
    const type = getActivityType(entry.type);
    if (!type) return '';
    
    const mainValue = entry.data[type.fields[0]?.key] || 'Entry';
    const secondaryValues = type.fields.slice(1, 3)
      .map(f => entry.data[f.key])
      .filter(v => v)
      .join(' • ');
    
    return `
      <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${type.color}20">
          <i class="fas ${type.icon}" style="color: ${type.color}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-slate-900 dark:text-white text-sm truncate">${mainValue}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${type.name}${secondaryValues ? ' • ' + secondaryValues : ''}</p>
        </div>
        <button onclick="deleteLifeLogEntry('${entry.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all">
          <i class="fas fa-trash text-xs"></i>
        </button>
      </div>
    `;
  };
  
  const addLifeLogEntry = (typeId, data, date = new Date().toISOString().split('T')[0]) => {
    const entry = {
      id: generateId(),
      type: typeId,
      date: date,
      data: data,
      createdAt: Date.now()
    };
    lifeLog.push(entry);
    saveToStorage(STORAGE_KEYS.lifeLog, lifeLog);
    renderLifeLog();
    renderCalendar();
    updateDashboardStats();
    return entry;
  };
  
  window.deleteLifeLogEntry = (id) => {
    lifeLog = lifeLog.filter(e => e.id !== id);
    saveToStorage(STORAGE_KEYS.lifeLog, lifeLog);
    renderLifeLog();
    renderCalendar();
    updateDashboardStats();
  };
  
  const openLifeLogModal = (preselectedType = null) => {
    const typeOptions = activityTypes.map(t => 
      `<option value="${t.id}" ${preselectedType === t.id ? 'selected' : ''}>${t.name}</option>`
    ).join('');
    
    openModal('Log Activity', `
      <form id="lifeLogForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Type</label>
          <select id="logType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            ${typeOptions}
          </select>
        </div>
        <div id="dynamicFields"></div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="logDate" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg hover:shadow-lg transition-all">
          <i class="fas fa-plus mr-2"></i>Log Activity
        </button>
      </form>
    `);
    
    const updateDynamicFields = () => {
      const typeId = document.getElementById('logType').value;
      const type = getActivityType(typeId);
      const container = document.getElementById('dynamicFields');
      
      if (!type) return;
      
      container.innerHTML = type.fields.map(field => {
        if (field.type === 'select') {
          return `
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}</label>
              <select id="field_${field.key}" ${field.required ? 'required' : ''} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
                ${field.options.map(o => `<option value="${o}">${o}</option>`).join('')}
              </select>
            </div>
          `;
        } else if (field.type === 'textarea') {
          return `
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}</label>
              <textarea id="field_${field.key}" rows="2" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea>
            </div>
          `;
        } else if (field.type === 'checkbox') {
          return `
            <div class="flex items-center gap-2">
              <input type="checkbox" id="field_${field.key}" class="w-4 h-4 rounded">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">${field.label}</label>
            </div>
          `;
        } else {
          return `
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}</label>
              <input type="${field.type}" id="field_${field.key}" ${field.required ? 'required' : ''} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            </div>
          `;
        }
      }).join('');
    };
    
    document.getElementById('logType').addEventListener('change', updateDynamicFields);
    updateDynamicFields();
    
    document.getElementById('lifeLogForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const typeId = document.getElementById('logType').value;
      const type = getActivityType(typeId);
      const date = document.getElementById('logDate').value;
      
      const data = {};
      type.fields.forEach(field => {
        const el = document.getElementById(`field_${field.key}`);
        if (el) {
          data[field.key] = field.type === 'checkbox' ? el.checked : (field.type === 'number' ? parseFloat(el.value) || 0 : el.value);
        }
      });
      
      addLifeLogEntry(typeId, data, date);
      closeModal();
    });
  };
  
  window.openLifeLogModal = openLifeLogModal;
  
  const renderLifeLog = () => {
    const container = document.getElementById('lifeLogContainer');
    if (!container) return;
    
    if (lifeLog.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-slate-400">
          <i class="fas fa-stream text-5xl mb-4 opacity-50"></i>
          <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No activities logged</h3>
          <p class="mb-4">Start tracking your life by logging activities</p>
          <button onclick="openLifeLogModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-plus mr-2"></i>Log Activity
          </button>
        </div>
      `;
      return;
    }
    
    // Group by date
    const grouped = {};
    lifeLog.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    });
    
    container.innerHTML = Object.entries(grouped).slice(0, 10).map(([date, entries]) => `
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">${formatDate(date)}</h4>
        <div class="space-y-2">
          ${entries.map(renderLifeLogEntry).join('')}
        </div>
      </div>
    `).join('');
  };
  
  document.getElementById('addLifeLogBtn')?.addEventListener('click', () => openLifeLogModal());
  
  // ========================================
  // Calendar with Life Log Integration
  // ========================================
  let currentDate = new Date();
  let selectedDate = null;
  
  const getEntriesForDate = (dateStr) => {
    return lifeLog.filter(e => e.date === dateStr);
  };
  
  const renderCalendar = () => {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    const dayDetail = document.getElementById('dayDetail');
    if (!grid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = days.map(d => `<div class="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">${d}</div>`).join('');
    
    for (let i = 0; i < firstDay; i++) {
      html += '<div></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entries = getEntriesForDate(dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;
      const hasEntries = entries.length > 0;
      
      // Get unique activity type colors for dots
      const uniqueTypes = [...new Set(entries.map(e => e.type))].slice(0, 4);
      const dots = uniqueTypes.map(typeId => {
        const type = getActivityType(typeId);
        return type ? `<div class="w-1.5 h-1.5 rounded-full" style="background: ${type.color}"></div>` : '';
      }).join('');
      
      html += `
        <div onclick="selectCalendarDate('${dateStr}')" class="relative text-center py-2 rounded-xl cursor-pointer transition-all
          ${isToday ? 'gradient-bg text-white font-bold' : ''}
          ${isSelected && !isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
          ${!isToday && !isSelected ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' : ''}">
          <span>${day}</span>
          ${hasEntries ? `<div class="flex justify-center gap-0.5 mt-1">${dots}</div>` : ''}
        </div>
      `;
    }
    
    grid.innerHTML = html;
    
    // Show selected date detail
    if (selectedDate) {
      renderDayDetail(selectedDate);
    }
  };
  
  window.selectCalendarDate = (dateStr) => {
    selectedDate = dateStr;
    renderCalendar();
    renderDayDetail(dateStr);
  };
  
  const renderDayDetail = (dateStr) => {
    const container = document.getElementById('dayDetail');
    if (!container) return;
    
    const entries = getEntriesForDate(dateStr);
    const dateLabel = formatDate(dateStr);
    
    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-900 dark:text-white">${dateLabel}</h3>
        <button onclick="openLifeLogModalForDate('${dateStr}')" class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
          <i class="fas fa-plus mr-1"></i>Add
        </button>
      </div>
      ${entries.length === 0 
        ? '<p class="text-center py-8 text-slate-400 text-sm">No activities on this day</p>'
        : `<div class="space-y-2 max-h-[400px] overflow-y-auto">${entries.map(renderLifeLogEntry).join('')}</div>`
      }
    `;
  };
  
  window.openLifeLogModalForDate = (dateStr) => {
    openLifeLogModal();
    setTimeout(() => {
      const dateInput = document.getElementById('logDate');
      if (dateInput) dateInput.value = dateStr;
    }, 50);
  };
  
  document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  
  document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  
  // ========================================
  // Tasks
  // ========================================
  const renderTasks = () => {
    const todoContainer = document.getElementById('todoTasks');
    const progressContainer = document.getElementById('inProgressTasks');
    const doneContainer = document.getElementById('doneTasks');
    
    if (!todoContainer) return;
    
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');
    
    const renderList = (container, list) => {
      container.innerHTML = list.length === 0 ? '' : list.map(task => `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm group">
          <h4 class="font-medium text-slate-900 dark:text-white text-sm mb-1">${task.title}</h4>
          ${task.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 mb-2">${task.description}</p>` : ''}
          ${task.dueDate ? `<p class="text-xs text-blue-600 dark:text-blue-400"><i class="fas fa-calendar mr-1"></i>${formatDate(task.dueDate)}</p>` : ''}
          <div class="flex gap-2 mt-3">
            <button onclick="deleteTask('${task.id}')" class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('');
    };
    
    renderList(todoContainer, todoTasks);
    renderList(progressContainer, inProgressTasks);
    renderList(doneContainer, doneTasks);
    
    document.getElementById('todoCount').textContent = todoTasks.length;
    document.getElementById('progressCount').textContent = inProgressTasks.length;
    document.getElementById('doneCount').textContent = doneTasks.length;
    document.getElementById('taskBadge').textContent = todoTasks.length + inProgressTasks.length;
  };
  
  window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.tasks, tasks);
    renderTasks();
    updateDashboardStats();
  };
  
  const addTaskModal = () => {
    openModal('Add New Task', `
      <form id="taskForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
          <input type="text" id="taskTitle" required placeholder="What needs to be done?" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea id="taskDesc" rows="2" placeholder="Add details..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select id="taskStatus" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
          <input type="date" id="taskDue" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-plus mr-2"></i>Add Task
        </button>
      </form>
    `);
    
    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      tasks.push({
        id: generateId(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        status: document.getElementById('taskStatus').value,
        dueDate: document.getElementById('taskDue').value,
        createdAt: Date.now()
      });
      saveToStorage(STORAGE_KEYS.tasks, tasks);
      renderTasks();
      updateDashboardStats();
      closeModal();
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
      container.innerHTML = `
        <div class="col-span-full text-center py-16 text-slate-400">
          <i class="fas fa-bullseye text-5xl mb-4 opacity-50"></i>
          <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No goals yet</h3>
          <p class="mb-4">Set your first goal to start tracking progress</p>
          <button onclick="addGoalModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-plus mr-2"></i>Create Goal
          </button>
        </div>
      `;
    } else {
      container.innerHTML = goals.map(goal => `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 group">
          <div class="flex items-start justify-between mb-3">
            <h4 class="font-semibold text-slate-900 dark:text-white">${goal.title}</h4>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">${goal.category}</span>
              <button onclick="deleteGoal('${goal.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">${goal.description || 'No description'}</p>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full gradient-bg rounded-full transition-all" style="width: ${goal.progress}%"></div>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">${goal.progress}%</span>
          </div>
          <p class="text-xs text-slate-400">${goal.deadline ? `Due: ${formatDate(goal.deadline)}` : 'No deadline'}</p>
        </div>
      `).join('');
    }
    
    updateDashboardStats();
  };
  
  window.deleteGoal = (id) => {
    goals = goals.filter(g => g.id !== id);
    saveToStorage(STORAGE_KEYS.goals, goals);
    renderGoals();
  };
  
  window.addGoalModal = () => {
    openModal('Add New Goal', `
      <form id="goalForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
          <input type="text" id="goalTitle" required placeholder="What do you want to achieve?" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select id="goalCategory" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="personal">Personal</option>
            <option value="career">Career</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea id="goalDesc" rows="2" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
          <input type="date" id="goalDeadline" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-plus mr-2"></i>Create Goal
        </button>
      </form>
    `);
    
    document.getElementById('goalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      goals.push({
        id: generateId(),
        title: document.getElementById('goalTitle').value,
        category: document.getElementById('goalCategory').value,
        description: document.getElementById('goalDesc').value,
        deadline: document.getElementById('goalDeadline').value,
        progress: 0,
        createdAt: Date.now()
      });
      saveToStorage(STORAGE_KEYS.goals, goals);
      renderGoals();
      closeModal();
    });
  };
  
  document.getElementById('addGoalBtn')?.addEventListener('click', addGoalModal);
  document.getElementById('addFirstGoal')?.addEventListener('click', addGoalModal);
  
  // ========================================
  // Habits
  // ========================================
  const renderHabits = () => {
    const container = document.getElementById('habitsContainer');
    if (!container) return;
    
    if (habits.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-slate-400">
          <i class="fas fa-sync-alt text-5xl mb-4 opacity-50"></i>
          <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No habits tracked</h3>
          <p class="mb-4">Build better habits by tracking them daily</p>
          <button onclick="addHabitModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-plus mr-2"></i>Create Habit
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="space-y-3">${habits.map(habit => `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4 group">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${habit.color}20">
            <i class="fas fa-check text-lg" style="color: ${habit.color}"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-slate-900 dark:text-white">${habit.name}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">${habit.frequency}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 text-orange-500">
              <i class="fas fa-fire"></i>
              <span class="font-bold">${habit.streak || 0}</span>
            </div>
            <button onclick="deleteHabit('${habit.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      `).join('')}</div>`;
    }
    
    updateDashboardStats();
  };
  
  window.deleteHabit = (id) => {
    habits = habits.filter(h => h.id !== id);
    saveToStorage(STORAGE_KEYS.habits, habits);
    renderHabits();
  };
  
  window.addHabitModal = () => {
    openModal('Add New Habit', `
      <form id="habitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Habit Name</label>
          <input type="text" id="habitName" required placeholder="e.g., Exercise, Read, Meditate" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
          <select id="habitFreq" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="Daily">Daily</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
          <input type="color" id="habitColor" value="#3b82f6" class="w-full h-10 rounded-lg cursor-pointer">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-plus mr-2"></i>Create Habit
        </button>
      </form>
    `);
    
    document.getElementById('habitForm').addEventListener('submit', (e) => {
      e.preventDefault();
      habits.push({
        id: generateId(),
        name: document.getElementById('habitName').value,
        frequency: document.getElementById('habitFreq').value,
        color: document.getElementById('habitColor').value,
        streak: 0,
        completedDates: [],
        createdAt: Date.now()
      });
      saveToStorage(STORAGE_KEYS.habits, habits);
      renderHabits();
      closeModal();
    });
  };
  
  document.getElementById('addHabitBtn')?.addEventListener('click', addHabitModal);
  document.getElementById('addFirstHabit')?.addEventListener('click', addHabitModal);
  
  // ========================================
  // Finance (uses Life Log for purchases)
  // ========================================
  const renderFinance = () => {
    const container = document.getElementById('transactionsContainer');
    const transactions = finance.transactions || [];
    
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Also count purchases from life log
    const purchaseTotal = lifeLog.filter(e => e.type === 'purchase').reduce((sum, e) => sum + (e.data.amount || 0), 0);
    
    document.getElementById('totalIncome')?.textContent && (document.getElementById('totalIncome').textContent = formatCurrency(income));
    document.getElementById('totalExpenses')?.textContent && (document.getElementById('totalExpenses').textContent = formatCurrency(expenses + purchaseTotal));
    document.getElementById('totalBalance')?.textContent && (document.getElementById('totalBalance').textContent = formatCurrency(income - expenses - purchaseTotal));
    
    if (!container) return;
    
    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400">
          <i class="fas fa-receipt text-3xl mb-2 opacity-50"></i>
          <p class="text-sm">No transactions recorded</p>
        </div>
      `;
    } else {
      container.innerHTML = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(t => `
        <div class="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-2 group">
          <div class="w-10 h-10 ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'} rounded-lg flex items-center justify-center">
            <i class="fas fa-arrow-${t.type === 'income' ? 'down' : 'up'}"></i>
          </div>
          <div class="flex-1">
            <p class="font-medium text-slate-900 dark:text-white text-sm">${t.description}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${t.category} • ${formatDate(t.date)}</p>
          </div>
          <p class="font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
            ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
          </p>
          <button onclick="deleteTransaction('${t.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      `).join('');
    }
    
    updateDashboardStats();
  };
  
  window.deleteTransaction = (id) => {
    finance.transactions = finance.transactions.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.finance, finance);
    renderFinance();
  };
  
  const addTransactionModal = () => {
    openModal('Add Transaction', `
      <form id="transForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
          <select id="transType" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <input type="text" id="transDesc" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
          <input type="number" id="transAmount" required min="0" step="0.01" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select id="transCat" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
            <option value="Food">Food & Dining</option>
            <option value="Transport">Transportation</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Salary">Salary</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="transDate" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-plus mr-2"></i>Add Transaction
        </button>
      </form>
    `);
    
    document.getElementById('transForm').addEventListener('submit', (e) => {
      e.preventDefault();
      finance.transactions.push({
        id: generateId(),
        type: document.getElementById('transType').value,
        description: document.getElementById('transDesc').value,
        amount: parseFloat(document.getElementById('transAmount').value),
        category: document.getElementById('transCat').value,
        date: document.getElementById('transDate').value,
        createdAt: Date.now()
      });
      saveToStorage(STORAGE_KEYS.finance, finance);
      renderFinance();
      closeModal();
    });
  };
  
  document.getElementById('addTransactionBtn')?.addEventListener('click', addTransactionModal);
  
  // ========================================
  // Journal
  // ========================================
  const renderJournal = () => {
    const container = document.getElementById('journalContainer');
    if (!container) return;
    
    if (journal.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-slate-400">
          <i class="fas fa-book-open text-5xl mb-4 opacity-50"></i>
          <h3 class="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No journal entries</h3>
          <p class="mb-4">Start writing to capture your thoughts</p>
          <button onclick="addJournalModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-pen mr-2"></i>Start Writing
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="grid gap-4">${journal.sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 group">
          <div class="flex items-start justify-between mb-3">
            <h4 class="font-semibold text-slate-900 dark:text-white">${entry.title}</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 dark:text-slate-400">${formatDate(entry.date)}</span>
              <button onclick="deleteJournalEntry('${entry.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">${entry.content || 'No content'}</p>
        </div>
      `).join('')}</div>`;
    }
  };
  
  window.deleteJournalEntry = (id) => {
    journal = journal.filter(j => j.id !== id);
    saveToStorage(STORAGE_KEYS.journal, journal);
    renderJournal();
  };
  
  window.addJournalModal = () => {
    openModal('New Journal Entry', `
      <form id="journalForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input type="text" id="journalTitle" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="journalDate" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
          <textarea id="journalContent" rows="6" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"></textarea>
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">
          <i class="fas fa-save mr-2"></i>Save Entry
        </button>
      </form>
    `);
    
    document.getElementById('journalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      journal.push({
        id: generateId(),
        title: document.getElementById('journalTitle').value,
        date: document.getElementById('journalDate').value,
        content: document.getElementById('journalContent').value,
        createdAt: Date.now()
      });
      saveToStorage(STORAGE_KEYS.journal, journal);
      renderJournal();
      closeModal();
    });
  };
  
  document.getElementById('addJournalBtn')?.addEventListener('click', addJournalModal);
  document.getElementById('startWriting')?.addEventListener('click', addJournalModal);
  
  // ========================================
  // Event & Health Buttons (use Life Log)
  // ========================================
  document.getElementById('addEventBtn')?.addEventListener('click', () => openLifeLogModal('event'));
  document.getElementById('addHealthBtn')?.addEventListener('click', () => openLifeLogModal('health'));
  
  // ========================================
  // Dashboard Stats
  // ========================================
  const updateDashboardStats = () => {
    const activeTasks = tasks.filter(t => t.status !== 'done').length;
    const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
    
    const transactions = finance.transactions || [];
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('statTasks')?.textContent && (document.getElementById('statTasks').textContent = activeTasks);
    document.getElementById('statGoals')?.textContent && (document.getElementById('statGoals').textContent = avgGoalProgress + '%');
    document.getElementById('statStreak')?.textContent && (document.getElementById('statStreak').textContent = maxStreak);
    document.getElementById('statBalance')?.textContent && (document.getElementById('statBalance').textContent = formatCurrency(income - expenses));
    document.getElementById('statLifeLog')?.textContent && (document.getElementById('statLifeLog').textContent = lifeLog.length);
  };
  
  // ========================================
  // Settings
  // ========================================
  document.getElementById('exportData')?.addEventListener('click', () => {
    const data = { tasks, goals, habits, finance, health, journal, events, lifeLog, activityTypes, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-erp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('clearData')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      tasks = []; goals = []; habits = []; finance = { transactions: [] }; health = { entries: [], workouts: [] }; journal = []; events = []; lifeLog = [];
      renderTasks(); renderGoals(); renderHabits(); renderFinance(); renderCalendar(); renderJournal(); renderLifeLog();
      updateDashboardStats();
      alert('All data has been cleared.');
    }
  });
  
  // ========================================
  // Initialize
  // ========================================
  renderTasks();
  renderGoals();
  renderHabits();
  renderFinance();
  renderCalendar();
  renderJournal();
  renderLifeLog();
  updateDashboardStats();
  
  // Select today by default
  selectCalendarDate(new Date().toISOString().split('T')[0]);
}
