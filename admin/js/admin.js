// ========================================
// Life ERP - Admin JavaScript
// ========================================

// Auth Configuration - CHANGE THESE CREDENTIALS!
const AUTH_CONFIG = {
  username: 'jacob',
  password: 'lifeErp2026!',
  sessionKey: 'lifeErp_session',
  sessionDuration: 24 * 60 * 60 * 1000 // 24 hours
};

// Storage Keys
const STORAGE_KEYS = {
  tasks: 'lifeErp_tasks',
  goals: 'lifeErp_goals',
  habits: 'lifeErp_habits',
  finance: 'lifeErp_finance',
  health: 'lifeErp_health',
  journal: 'lifeErp_journal',
  events: 'lifeErp_events',
  theme: 'lifeErp_theme'
};

// ========================================
// Utility Functions
// ========================================
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric'
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
const createSession = () => {
  const session = {
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + AUTH_CONFIG.sessionDuration
  };
  saveToStorage(AUTH_CONFIG.sessionKey, session);
  return session;
};

const checkSession = () => {
  const session = getFromStorage(AUTH_CONFIG.sessionKey);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    clearSession();
    return false;
  }
  return session.authenticated;
};

const clearSession = () => localStorage.removeItem(AUTH_CONFIG.sessionKey);

const authenticate = (username, password) => {
  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
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
  
  // Redirect if already logged in
  if (checkSession()) {
    window.location.href = 'dashboard.html';
  }
  
  // Toggle password visibility
  togglePassword?.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.innerHTML = type === 'password' 
      ? '<i class="fas fa-eye"></i>' 
      : '<i class="fas fa-eye-slash"></i>';
  });
  
  // Handle login
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

// ========================================
// Dashboard Logic
// ========================================
if (document.getElementById('mainContent')) {
  // Auth check
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
  // Sidebar
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
  
  // ========================================
  // Navigation
  // ========================================
  const showSection = (sectionId) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active', 'bg-blue-600'));
    
    const section = document.getElementById(sectionId);
    const link = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (section) {
      section.classList.remove('hidden');
      section.classList.add('animate-in');
    }
    if (link) {
      link.classList.add('active', 'bg-blue-600');
    }
    
    // Close mobile menu
    if (window.innerWidth < 1024) {
      sidebar.classList.add('-translate-x-full');
    }
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
  
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
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
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
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
    document.getElementById('statTasks').textContent = todoTasks.length + inProgressTasks.length;
  };
  
  window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.tasks, tasks);
    renderTasks();
  };
  
  const addTaskModal = () => {
    openModal('Add New Task', `
      <form id="taskForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
          <input type="text" id="taskTitle" required placeholder="What needs to be done?" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea id="taskDesc" rows="2" placeholder="Add details..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"></textarea>
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
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg hover:shadow-lg transition-all">
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
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div class="flex items-start justify-between mb-3">
            <h4 class="font-semibold text-slate-900 dark:text-white">${goal.title}</h4>
            <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">${goal.category}</span>
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
    
    const avgProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
    document.getElementById('statGoals').textContent = avgProgress + '%';
  };
  
  window.addGoalModal = () => {
    openModal('Add New Goal', `
      <form id="goalForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
          <input type="text" id="goalTitle" required placeholder="What do you want to achieve?" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
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
          <textarea id="goalDesc" rows="2" placeholder="Describe your goal..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
          <input type="date" id="goalDeadline" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg hover:shadow-lg transition-all">
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
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${habit.color}20">
            <i class="fas fa-check text-lg" style="color: ${habit.color}"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-slate-900 dark:text-white">${habit.name}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">${habit.frequency}</p>
          </div>
          <div class="flex items-center gap-2 text-orange-500">
            <i class="fas fa-fire"></i>
            <span class="font-bold">${habit.streak || 0}</span>
          </div>
        </div>
      `).join('')}</div>`;
    }
    
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
    document.getElementById('statStreak').textContent = maxStreak;
  };
  
  window.addHabitModal = () => {
    openModal('Add New Habit', `
      <form id="habitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Habit Name</label>
          <input type="text" id="habitName" required placeholder="e.g., Exercise, Read, Meditate" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
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
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg hover:shadow-lg transition-all">
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
  // Finance
  // ========================================
  const renderFinance = () => {
    const container = document.getElementById('transactionsContainer');
    const transactions = finance.transactions || [];
    
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
    document.getElementById('totalBalance').textContent = formatCurrency(income - expenses);
    document.getElementById('statBalance').textContent = formatCurrency(income - expenses);
    
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
        <div class="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-2">
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
        </div>
      `).join('');
    }
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
          <input type="text" id="transDesc" required placeholder="What was it for?" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
          <input type="number" id="transAmount" required min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
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
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg hover:shadow-lg transition-all">
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
  // Calendar
  // ========================================
  let currentDate = new Date();
  
  const renderCalendar = () => {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    if (!grid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = days.map(d => `<div class="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">${d}</div>`).join('');
    
    for (let i = 0; i < firstDay; i++) {
      html += '<div></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      html += `<div class="text-center py-2 rounded-lg ${isToday ? 'gradient-bg text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'} cursor-pointer transition-colors">${day}</div>`;
    }
    
    grid.innerHTML = html;
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
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div class="flex items-start justify-between mb-3">
            <h4 class="font-semibold text-slate-900 dark:text-white">${entry.title}</h4>
            <span class="text-xs text-slate-500 dark:text-slate-400">${formatDate(entry.date)}</span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">${entry.content || 'No content'}</p>
        </div>
      `).join('')}</div>`;
    }
  };
  
  window.addJournalModal = () => {
    openModal('New Journal Entry', `
      <form id="journalForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input type="text" id="journalTitle" required placeholder="Entry title..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="journalDate" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
          <textarea id="journalContent" rows="6" placeholder="Write your thoughts..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"></textarea>
        </div>
        <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg hover:shadow-lg transition-all">
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
  // Settings
  // ========================================
  document.getElementById('exportData')?.addEventListener('click', () => {
    const data = { tasks, goals, habits, finance, health, journal, events, exportedAt: Date.now() };
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
      tasks = []; goals = []; habits = []; finance = { transactions: [] }; health = { entries: [], workouts: [] }; journal = []; events = [];
      renderTasks(); renderGoals(); renderHabits(); renderFinance(); renderCalendar(); renderJournal();
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
}
