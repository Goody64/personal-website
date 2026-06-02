// ========================================
// Life ERP - Data Service
// Abstracts storage: localStorage (local) or Supabase (cloud sync)
// ========================================

const DATA_DOMAINS = ['tasks', 'goals', 'habits', 'chores', 'finance', 'journal', 'lifeLog'];
const STORAGE_PREFIX = 'lifeErp_';
const DATA_KEYS = {
  tasks: STORAGE_PREFIX + 'tasks',
  goals: STORAGE_PREFIX + 'goals',
  habits: STORAGE_PREFIX + 'habits',
  chores: STORAGE_PREFIX + 'chores',
  finance: STORAGE_PREFIX + 'finance',
  journal: STORAGE_PREFIX + 'journal',
  lifeLog: STORAGE_PREFIX + 'lifeLog'
};

function getDefault(domain) {
  if (domain === 'finance') return { transactions: [], accounts: [] };
  return [];
}

function countDomainRecords(domain, data) {
  if (data == null) return 0;
  if (domain === 'finance') {
    if (typeof data !== 'object') return 0;
    return (data.transactions?.length || 0) + (data.accounts?.length || 0);
  }
  return Array.isArray(data) ? data.length : 0;
}

function domainHasContent(domain, data) {
  return countDomainRecords(domain, data) > 0;
}

function mergeArraysById(a, b) {
  const map = new Map();
  const add = (item) => {
    if (!item || typeof item !== 'object') return;
    const id = item.id;
    if (!id) {
      const key = '_noid_' + JSON.stringify(item).slice(0, 240);
      if (!map.has(key)) map.set(key, item);
      return;
    }
    const existing = map.get(id);
    if (!existing) {
      map.set(id, item);
      return;
    }
    const tsA = item.updatedAt || item.createdAt || 0;
    const tsB = existing.updatedAt || existing.createdAt || 0;
    map.set(id, tsA >= tsB ? { ...existing, ...item } : { ...item, ...existing });
  };
  (b || []).forEach(add);
  (a || []).forEach(add);
  return Array.from(map.values());
}

function mergeFinance(local, cloud) {
  const l = local && typeof local === 'object' ? local : { transactions: [], accounts: [] };
  const c = cloud && typeof cloud === 'object' ? cloud : { transactions: [], accounts: [] };
  return {
    ...c,
    ...l,
    transactions: mergeArraysById(l.transactions, c.transactions),
    accounts: mergeArraysById(l.accounts, c.accounts),
    recurring: mergeArraysById(l.recurring, c.recurring),
    budgets: { ...(c.budgets || {}), ...(l.budgets || {}) },
    settings: { ...(c.settings || {}), ...(l.settings || {}) },
    accountSlotOrder: l.accountSlotOrder || c.accountSlotOrder
  };
}

function mergeDomain(domain, local, cloud) {
  const hasLocal = domainHasContent(domain, local);
  const hasCloud = domainHasContent(domain, cloud);
  if (!hasLocal) return cloud ?? getDefault(domain);
  if (!hasCloud) return local;
  if (domain === 'finance') return mergeFinance(local, cloud);
  if (Array.isArray(local) || Array.isArray(cloud)) {
    return mergeArraysById(Array.isArray(local) ? local : [], Array.isArray(cloud) ? cloud : []);
  }
  return countDomainRecords(domain, local) >= countDomainRecords(domain, cloud) ? local : cloud;
}

function mergeAllPayloads(localPayload, cloudPayload) {
  const result = {};
  DATA_DOMAINS.forEach(domain => {
    result[domain] = mergeDomain(domain, localPayload?.[domain], cloudPayload?.[domain]);
  });
  return result;
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
  _userId: null,

  // Local cache key. When signed in, namespace by user id so different accounts
  // (or anonymous use) never share a cache — prevents data bleeding across accounts.
  _key(domain) {
    const base = DATA_KEYS[domain] || STORAGE_PREFIX + domain;
    return this._userId ? base + '__' + this._userId : base;
  },

  init() {
    try {
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
    } catch (err) {
      console.warn('Supabase init failed:', err);
      this._useCloud = false;
      return Promise.resolve();
    }
  },

  async _checkSession() {
    if (!this._supabase) return;
    const { data: { session } } = await this._supabase.auth.getSession();
    this._useCloud = !!session;
    this._userId = session?.user?.id || null;
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
    if (!error) { this._useCloud = true; this._userId = data?.user?.id || null; }
    return { data, error };
  },

  async signUp(email, password, displayName) {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const redirectTo = typeof window !== 'undefined' ? (window.location.href.replace(/[^/]*$/, '') + 'dashboard.html') : undefined;
    const { data, error } = await this._supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
        emailRedirectTo: redirectTo
      }
    });
    if (!error) { this._useCloud = true; this._userId = data?.user?.id || null; }
    return { data, error };
  },

  async updateDisplayName(name) {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const { data, error } = await this._supabase.auth.updateUser({ data: { display_name: name } });
    return { data, error };
  },

  async resetPasswordForEmail(email) {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const redirectTo = typeof window !== 'undefined' ? (window.location.href.replace(/[^/]*$/, '') + 'dashboard.html') : undefined;
    const { data, error } = await this._supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { data, error };
  },

  async signOut() {
    if (this._supabase) await this._supabase.auth.signOut();
    this._useCloud = false;
    this.clearLocalCache();
    this._userId = null;
  },
  clearLocalCache() {
    // Clear base keys AND every per-user namespaced key (lifeErp_<domain>__<uid>).
    const prefixes = DATA_DOMAINS.map(d => DATA_KEYS[d] || STORAGE_PREFIX + d);
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (prefixes.some(p => k === p || k.startsWith(p + '__'))) localStorage.removeItem(k);
      }
    } catch {
      prefixes.forEach(p => { try { localStorage.removeItem(p); } catch {} });
    }
  },

  countDomainRecords(domain, data) {
    return countDomainRecords(domain, data);
  },

  domainHasContent(domain, data) {
    return domainHasContent(domain, data);
  },

  mergeDomain(domain, local, cloud) {
    return mergeDomain(domain, local, cloud);
  },

  mergeAllPayloads(localPayload, cloudPayload) {
    return mergeAllPayloads(localPayload, cloudPayload);
  },

  async getCloudOnly(domain) {
    try {
      if (!this._useCloud || !this._supabase) return null;
      const { data: { user } } = await this._supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await this._supabase
        .from('user_data')
        .select('data')
        .eq('user_id', user.id)
        .eq('domain', domain)
        .maybeSingle();
      if (error) {
        console.warn('Supabase getCloudOnly error:', error);
        return null;
      }
      return data?.data ?? null;
    } catch (err) {
      console.warn('DataService getCloudOnly error:', err);
      return null;
    }
  },

  async get(domain) {
    try {
      if (!this._useCloud || !this._supabase) {
        return getLocal(this._key(domain)) ?? getDefault(domain);
      }
      const { data: { user } } = await this._supabase.auth.getUser();
      if (!user) return getLocal(this._key(domain)) ?? getDefault(domain);
      this._userId = user.id;
      const cloud = await this.getCloudOnly(domain);
      const local = getLocal(this._key(domain)); // this user's own cached copy
      if (cloud != null && domainHasContent(domain, local)) {
        const merged = mergeDomain(domain, local, cloud);
        setLocal(this._key(domain), merged);
        return merged;
      }
      const result = cloud ?? local ?? getDefault(domain);
      if (result != null) setLocal(this._key(domain), result);
      return result;
    } catch (err) {
      console.warn('DataService get error:', err);
      return getLocal(this._key(domain)) ?? getDefault(domain);
    }
  },

  async save(domain, data) {
    let user = null;
    if (this._useCloud && this._supabase) {
      try { ({ data: { user } } = await this._supabase.auth.getUser()); } catch {}
      if (user) this._userId = user.id;
    }
    setLocal(this._key(domain), data); // cache locally (namespaced per user when signed in)
    try {
      if (!this._useCloud || !this._supabase || !user) return;
      await this._supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          domain,
          data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,domain' });
    } catch (err) {
      console.warn('DataService save error:', err);
    }
  },

  async loadAll() {
    const result = {};
    for (const domain of DATA_DOMAINS) {
      result[domain] = await this.get(domain);
    }
    return result;
  },

  /** Merge this browser's localStorage with cloud — union by id, never wipe the larger dataset. */
  async mergeLocalWithCloud() {
    if (!this._supabase) return { error: new Error('Supabase not configured') };
    const { data: { user } } = await this._supabase.auth.getUser();
    if (!user) return { error: new Error('Not signed in') };
    this._useCloud = true;
    this._userId = user.id;
    const summary = {};
    for (const domain of DATA_DOMAINS) {
      const key = this._key(domain);
      const local = getLocal(key);
      const cloud = await this.getCloudOnly(domain);
      const merged = mergeDomain(domain, local, cloud);
      summary[domain] = {
        local: countDomainRecords(domain, local),
        cloud: countDomainRecords(domain, cloud),
        merged: countDomainRecords(domain, merged)
      };
      await this.save(domain, merged);
    }
    return { summary };
  },

  async importLocalToCloud() {
    return this.mergeLocalWithCloud();
  }
};

// Expose for admin.js
window.dataService = dataService;
window.DATA_DOMAINS = DATA_DOMAINS;
