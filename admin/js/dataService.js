// ========================================
// Life ERP - Data Service
// Abstracts storage: localStorage (local) or Supabase (cloud sync)
// ========================================

const DATA_DOMAINS = ['tasks', 'goals', 'habits', 'finance', 'journal', 'lifeLog'];
const STORAGE_PREFIX = 'lifeErp_';
const STORAGE_KEYS = {
  tasks: STORAGE_PREFIX + 'tasks',
  goals: STORAGE_PREFIX + 'goals',
  habits: STORAGE_PREFIX + 'habits',
  finance: STORAGE_PREFIX + 'finance',
  journal: STORAGE_PREFIX + 'journal',
  lifeLog: STORAGE_PREFIX + 'lifeLog'
};

function getDefault(domain) {
  if (domain === 'finance') return { transactions: [] };
  return [];
}

// Local storage helpers
function getLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch { return false; }
}

// ========================================
// Data Service API
// ========================================
const dataService = {
  _supabase: null,
  _useCloud: false,

  init() {
    const config = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
    if (!config?.url || !config?.anonKey || config.url.includes('YOUR_') || config.anonKey.includes('YOUR_')) {
      this._useCloud = false;
      return Promise.resolve();
    }
    if (typeof supabase === 'undefined') {
      console.warn('Supabase not loaded. Using localStorage.');
      return Promise.resolve();
    }
    this._supabase = supabase.createClient(config.url, config.anonKey);
    return this._checkSession();
  },

  async _checkSession() {
    if (!this._supabase) return;
    const { data: { session } } = await this._supabase.auth.getSession();
    this._useCloud = !!session;
    return session;
  },

  isCloudEnabled() {
    return !!this._supabase;
  },

  isSignedIn() {
    return this._useCloud;
  },

  async getSession() {
    if (!this._supabase) return null;
    const { data: { session } } = await this._supabase.auth.getSession();
    return session;
  },

  async signIn(email, password) {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const { data, error } = await this._supabase.auth.signInWithPassword({ email, password });
    if (!error) this._useCloud = true;
    return { data, error };
  },

  async signUp(email, password) {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const { data, error } = await this._supabase.auth.signUp({ email, password });
    if (!error) this._useCloud = true;
    return { data, error };
  },

  async signOut() {
    if (this._supabase) await this._supabase.auth.signOut();
    this._useCloud = false;
  },

  async get(domain) {
    const key = STORAGE_KEYS[domain] || STORAGE_PREFIX + domain;
    if (!this._useCloud || !this._supabase) {
      return getLocal(key) ?? getDefault(domain);
    }
    const { data: { user } } = await this._supabase.auth.getUser();
    if (!user) return getLocal(key) ?? getDefault(domain);
    const { data, error } = await this._supabase
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .eq('domain', domain)
      .maybeSingle();
    if (error) {
      console.warn('Supabase get error:', error);
      return getLocal(key) ?? getDefault(domain);
    }
    return data?.data ?? getLocal(key) ?? getDefault(domain);
  },

  async save(domain, data) {
    const key = STORAGE_KEYS[domain] || STORAGE_PREFIX + domain;
    setLocal(key, data); // always cache locally
    if (!this._useCloud || !this._supabase) return;
    const { data: { user } } = await this._supabase.auth.getUser();
    if (!user) return;
    await this._supabase
      .from('user_data')
      .upsert({
        user_id: user.id,
        domain,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,domain' });
  },

  async loadAll() {
    const result = {};
    for (const domain of DATA_DOMAINS) {
      result[domain] = await this.get(domain);
    }
    return result;
  },

  async importLocalToCloud() {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const { data: { user } } = await this._supabase.auth.getUser();
    if (!user) return { error: new Error('Not signed in') };
    for (const domain of DATA_DOMAINS) {
      const key = STORAGE_KEYS[domain];
      const local = getLocal(key);
      if (local != null) await this.save(domain, local);
    }
    return {};
  }
};

// Expose for admin.js
window.dataService = dataService;
window.DATA_DOMAINS = DATA_DOMAINS;
window.STORAGE_KEYS = STORAGE_KEYS;
