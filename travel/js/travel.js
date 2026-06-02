// ========================================
// Travel / Trips - shared app logic
// Public browsing (anon) + owner-only editing (signed in).
// Reuses the same Supabase project as Life ERP via travel-config.js.
// ========================================

const TravelApp = (() => {
  const cfg = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
  let client = null;

  function init() {
    try {
      if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes('YOUR_')) return;
      if (typeof supabase === 'undefined') {
        console.warn('Supabase library not loaded.');
        return;
      }
      client = supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    } catch (err) {
      console.warn('Travel init failed:', err);
    }
  }
  init();

  const isConfigured = () => !!client;

  // ---------- Auth ----------
  async function getUser() {
    if (!client) return null;
    try {
      const { data: { user } } = await client.auth.getUser();
      return user;
    } catch { return null; }
  }
  async function signIn(email, password) {
    if (!client) return { error: new Error('Cloud not configured') };
    return client.auth.signInWithPassword({ email, password });
  }
  async function signOut() {
    if (client) await client.auth.signOut();
  }

  // ---------- Data ----------
  async function listPosts() {
    if (!client) return [];
    const { data, error } = await client
      .from('travel_posts')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) { console.warn('listPosts error:', error); return []; }
    return data || [];
  }
  async function getPost(id) {
    if (!client || !id) return null;
    const { data, error } = await client.from('travel_posts').select('*').eq('id', id).maybeSingle();
    if (error) { console.warn('getPost error:', error); return null; }
    return data;
  }
  async function savePost(post) {
    if (!client) return { error: new Error('Cloud not configured') };
    const row = { ...post };
    delete row.created_at;
    delete row.updated_at;
    if (!row.id) delete row.id;
    return client.from('travel_posts').upsert(row).select().maybeSingle();
  }
  async function deletePost(id) {
    if (!client) return { error: new Error('Cloud not configured') };
    return client.from('travel_posts').delete().eq('id', id);
  }
  async function uploadPhoto(file) {
    if (!client) throw new Error('Cloud not configured');
    const safe = (file.name || 'photo').replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const { error } = await client.storage.from('travel').upload(path, file, {
      cacheControl: '31536000', upsert: false, contentType: file.type || undefined
    });
    if (error) throw error;
    const { data } = client.storage.from('travel').getPublicUrl(path);
    return data.publicUrl;
  }

  return { isConfigured, getUser, signIn, signOut, listPosts, getPost, savePost, deletePost, uploadPhoto };
})();

// ========================================
// Shared utilities
// ========================================
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(dt)) return '';
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function ratingStars(rating) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (r >= i) html += '<i class="fas fa-star"></i>';
    else if (r >= i - 0.5) html += '<i class="fas fa-star-half-stroke"></i>';
    else html += '<i class="far fa-star"></i>';
  }
  return `<span class="text-amber-400">${html}</span>`;
}

function typeMeta(type) {
  return type === 'place'
    ? { label: 'Place', icon: 'fa-location-dot', color: 'bg-purple-500' }
    : { label: 'Hike', icon: 'fa-person-hiking', color: 'bg-emerald-500' };
}

// Minimal, safe Markdown-ish renderer (escapes first, then adds limited formatting).
function renderBody(text) {
  if (!text) return '';
  const esc = escapeHtml(text);
  const blocks = esc.split(/\n{2,}/);
  return blocks.map(block => {
    const trimmed = block.trim();
    if (/^###\s+/.test(trimmed)) return `<h3 class="text-xl font-bold mt-6 mb-2">${inline(trimmed.replace(/^###\s+/, ''))}</h3>`;
    if (/^##\s+/.test(trimmed)) return `<h2 class="text-2xl font-bold mt-8 mb-3">${inline(trimmed.replace(/^##\s+/, ''))}</h2>`;
    if (/^(-|\*)\s+/m.test(trimmed) && trimmed.split('\n').every(l => /^(-|\*)\s+/.test(l.trim()))) {
      const items = trimmed.split('\n').map(l => `<li>${inline(l.trim().replace(/^(-|\*)\s+/, ''))}</li>`).join('');
      return `<ul class="list-disc pl-6 space-y-1 my-3">${items}</ul>`;
    }
    if (/^&gt;\s+/.test(trimmed)) return `<blockquote class="border-l-4 border-primary-400 pl-4 italic text-slate-600 dark:text-slate-300 my-4">${inline(trimmed.replace(/^&gt;\s+/, ''))}</blockquote>`;
    return `<p class="my-3 leading-relaxed">${inline(trimmed).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
function inline(s) {
  return s
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-primary-600 dark:text-primary-400 underline">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Theme toggle (shared with the rest of the site; uses localStorage.theme).
function initTheme() {
  const html = document.documentElement;
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  function syncIcon() {
    if (!icon) return;
    const isDark = html.classList.contains('dark');
    icon.classList.remove('theme-icon-light', 'theme-icon-dark');
    icon.classList.add(isDark ? 'theme-icon-dark' : 'theme-icon-light');
  }
  syncIcon();
  if (btn) btn.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    syncIcon();
  });
}

function coverHtml(post, extraClass = '') {
  if (post.cover_url) {
    return `<img src="${escapeHtml(post.cover_url)}" alt="${escapeHtml(post.title)}" class="${extraClass} object-cover w-full h-full" loading="lazy">`;
  }
  const tm = typeMeta(post.type);
  return `<div class="${extraClass} w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
    <i class="fas ${tm.icon} text-white/70 text-5xl"></i></div>`;
}

// ========================================
// HOME / MENU page
// ========================================
async function initHome() {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('emptyState');
  const loading = document.getElementById('loadingState');
  const countLabel = document.getElementById('countLabel');
  const searchInput = document.getElementById('searchInput');
  const tagFilter = document.getElementById('tagFilter');
  const sortSelect = document.getElementById('sortSelect');
  const ratingFilter = document.getElementById('ratingFilter');
  const typeButtons = Array.from(document.querySelectorAll('[data-type-filter]'));

  let all = [];
  const state = { q: '', type: 'all', tag: '', minRating: 0, sort: 'newest' };

  function apply() {
    let list = all.slice();
    if (state.type !== 'all') list = list.filter(p => (p.type || 'hike') === state.type);
    if (state.tag) list = list.filter(p => (p.tags || []).includes(state.tag));
    if (state.minRating) list = list.filter(p => (Number(p.rating) || 0) >= state.minRating);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(p => [p.title, p.location, p.region, p.summary, p.body, (p.tags || []).join(' ')]
        .some(v => (v || '').toLowerCase().includes(q)));
    }
    const cmp = {
      newest: (a, b) => (b.date || '').localeCompare(a.date || '') || (b.created_at || '').localeCompare(a.created_at || ''),
      oldest: (a, b) => (a.date || '').localeCompare(b.date || ''),
      rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
      distance: (a, b) => (Number(b.distance_km) || 0) - (Number(a.distance_km) || 0),
      title: (a, b) => (a.title || '').localeCompare(b.title || '')
    }[state.sort] || (() => 0);
    list.sort(cmp);
    render(list);
  }

  function render(list) {
    if (countLabel) countLabel.textContent = `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`;
    if (!list.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    grid.innerHTML = list.map(cardHtml).join('');
  }

  function cardHtml(p) {
    const tm = typeMeta(p.type);
    const stats = [];
    if ((p.type || 'hike') === 'hike') {
      if (p.distance_km) stats.push(`<span><i class="fas fa-route mr-1"></i>${escapeHtml(p.distance_km)} km</span>`);
      if (p.elevation_m) stats.push(`<span><i class="fas fa-mountain mr-1"></i>${escapeHtml(p.elevation_m)} m</span>`);
    }
    const tags = (p.tags || []).slice(0, 3).map(t =>
      `<span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${escapeHtml(t)}</span>`).join('');
    return `<a href="post.html?id=${encodeURIComponent(p.id)}" class="card-hover group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="relative h-48 overflow-hidden">
        ${coverHtml(p, 'group-hover:scale-105 transition-transform duration-500')}
        <span class="absolute top-3 left-3 ${tm.color} text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow"><i class="fas ${tm.icon} mr-1"></i>${tm.label}</span>
        ${p.rating ? `<span class="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-star text-amber-400 mr-1"></i>${escapeHtml(p.rating)}</span>` : ''}
      </div>
      <div class="p-5">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${escapeHtml(p.title)}</h3>
        ${p.location ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5"><i class="fas fa-location-dot mr-1"></i>${escapeHtml(p.location)}</p>` : ''}
        ${p.summary ? `<p class="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">${escapeHtml(p.summary)}</p>` : ''}
        ${stats.length ? `<div class="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3">${stats.join('')}</div>` : ''}
        ${tags ? `<div class="flex flex-wrap gap-1.5 mt-3">${tags}</div>` : ''}
        ${p.date ? `<p class="text-xs text-slate-400 dark:text-slate-500 mt-3">${fmtDate(p.date)}</p>` : ''}
      </div>
    </a>`;
  }

  function populateTags() {
    if (!tagFilter) return;
    const tags = Array.from(new Set(all.flatMap(p => p.tags || []))).sort((a, b) => a.localeCompare(b));
    tagFilter.innerHTML = '<option value="">All tags</option>' +
      tags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }

  // Wire controls
  if (searchInput) searchInput.addEventListener('input', e => { state.q = e.target.value.trim(); apply(); });
  if (tagFilter) tagFilter.addEventListener('change', e => { state.tag = e.target.value; apply(); });
  if (sortSelect) sortSelect.addEventListener('change', e => { state.sort = e.target.value; apply(); });
  if (ratingFilter) ratingFilter.addEventListener('change', e => { state.minRating = Number(e.target.value) || 0; apply(); });
  typeButtons.forEach(btn => btn.addEventListener('click', () => {
    state.type = btn.dataset.typeFilter;
    typeButtons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('bg-primary-500', on);
      b.classList.toggle('text-white', on);
      b.classList.toggle('bg-slate-100', !on);
      b.classList.toggle('dark:bg-slate-800', !on);
      b.classList.toggle('text-slate-600', !on);
      b.classList.toggle('dark:text-slate-300', !on);
    });
    apply();
  }));

  // Load
  if (!TravelApp.isConfigured()) {
    loading?.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.querySelector('[data-empty-title]') && (empty.querySelector('[data-empty-title]').textContent = 'No trips yet');
    return;
  }
  all = await TravelApp.listPosts();
  loading?.classList.add('hidden');
  populateTags();
  apply();
}

// ========================================
// SINGLE POST page
// ========================================
async function initPost() {
  const container = document.getElementById('postContainer');
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !TravelApp.isConfigured()) {
    container.innerHTML = notFoundHtml();
    return;
  }
  const p = await TravelApp.getPost(id);
  if (!p) { container.innerHTML = notFoundHtml(); return; }
  document.title = `${p.title} | Travels`;

  const tm = typeMeta(p.type);
  const facts = [];
  if (p.date) facts.push(['Date', fmtDate(p.date)]);
  if (p.location) facts.push(['Location', escapeHtml(p.location)]);
  if (p.region) facts.push(['Region', escapeHtml(p.region)]);
  if (p.rating) facts.push(['Rating', `${ratingStars(p.rating)} <span class="text-slate-500 text-sm ml-1">${escapeHtml(p.rating)}/5</span>`]);
  if ((p.type || 'hike') === 'hike') {
    if (p.distance_km) facts.push(['Distance', `${escapeHtml(p.distance_km)} km`]);
    if (p.elevation_m) facts.push(['Elevation gain', `${escapeHtml(p.elevation_m)} m`]);
    if (p.difficulty) facts.push(['Difficulty', escapeHtml(p.difficulty)]);
  }
  if (p.duration) facts.push(['Duration', escapeHtml(p.duration)]);

  const gallery = (p.photos || []).filter(ph => ph && ph.url);
  const user = await TravelApp.getUser();

  container.innerHTML = `
    <div class="relative h-72 sm:h-96 rounded-3xl overflow-hidden mb-8 shadow-lg">
      ${coverHtml(p, '')}
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <span class="${tm.color} text-white text-xs font-semibold px-2.5 py-1 rounded-full"><i class="fas ${tm.icon} mr-1"></i>${tm.label}</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white mt-3 drop-shadow">${escapeHtml(p.title)}</h1>
        ${p.location ? `<p class="text-white/90 mt-1"><i class="fas fa-location-dot mr-1"></i>${escapeHtml(p.location)}</p>` : ''}
      </div>
    </div>

    ${user ? `<div class="mb-6"><a href="editor.html?id=${encodeURIComponent(p.id)}" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium"><i class="fas fa-pen"></i> Edit this entry</a></div>` : ''}

    <div class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 order-2 lg:order-1">
        ${p.summary ? `<p class="text-lg text-slate-700 dark:text-slate-200 font-medium mb-6">${escapeHtml(p.summary)}</p>` : ''}
        <div class="prose-custom text-slate-700 dark:text-slate-300">${renderBody(p.body)}</div>
        ${gallery.length ? `<div class="grid sm:grid-cols-2 gap-4 mt-8">${gallery.map(ph => `
          <figure class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src="${escapeHtml(ph.url)}" alt="${escapeHtml(ph.caption || p.title)}" class="w-full h-56 object-cover" loading="lazy">
            ${ph.caption ? `<figcaption class="text-xs text-slate-500 dark:text-slate-400 p-2">${escapeHtml(ph.caption)}</figcaption>` : ''}
          </figure>`).join('')}</div>` : ''}
      </div>
      <aside class="order-1 lg:order-2">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sticky top-24">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Details</h2>
          <dl class="space-y-3">${facts.map(([k, v]) => `
            <div class="flex justify-between gap-3 text-sm">
              <dt class="text-slate-500 dark:text-slate-400">${k}</dt>
              <dd class="text-slate-900 dark:text-white font-medium text-right">${v}</dd>
            </div>`).join('')}</dl>
          ${(p.tags || []).length ? `<div class="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">${(p.tags || []).map(t => `<span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
          ${(p.lat && p.lng) ? `<a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}" target="_blank" rel="noopener" class="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400"><i class="fas fa-map-location-dot"></i> View on map</a>` : ''}
        </div>
      </aside>
    </div>`;
}

function notFoundHtml() {
  return `<div class="text-center py-24">
    <i class="fas fa-compass text-5xl text-slate-300 dark:text-slate-600 mb-4"></i>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Entry not found</h1>
    <p class="text-slate-500 dark:text-slate-400 mt-2">This trip may have been removed or the link is wrong.</p>
    <a href="index.html" class="inline-block mt-6 px-5 py-2.5 gradient-bg text-white rounded-xl font-semibold">Back to all trips</a>
  </div>`;
}

// ========================================
// EDITOR page (login-gated)
// ========================================
async function initEditor() {
  const loginView = document.getElementById('loginView');
  const editorView = document.getElementById('editorView');
  const notConfigured = document.getElementById('notConfigured');

  if (!TravelApp.isConfigured()) {
    loginView.classList.add('hidden');
    notConfigured.classList.remove('hidden');
    return;
  }

  const OWNER_ID = (typeof TRAVEL_OWNER_ID !== 'undefined' && TRAVEL_OWNER_ID) ? TRAVEL_OWNER_ID : '';
  const OWNER_EMAIL = (typeof TRAVEL_OWNER_EMAIL !== 'undefined' && TRAVEL_OWNER_EMAIL) ? TRAVEL_OWNER_EMAIL.toLowerCase() : '';
  const isOwner = (u) => {
    if (!OWNER_ID && !OWNER_EMAIL) return true; // no lock configured
    if (!u) return false;
    if (OWNER_ID && u.id === OWNER_ID) return true;
    if (OWNER_EMAIL && (u.email || '').toLowerCase() === OWNER_EMAIL) return true;
    return false;
  };

  async function showNotAuthorized() {
    await TravelApp.signOut();
    loginView.classList.remove('hidden');
    editorView.classList.add('hidden');
    const err = document.getElementById('loginError');
    if (err) { err.textContent = 'This account is not authorized to manage Travels.'; err.classList.remove('hidden'); }
  }

  const user = await TravelApp.getUser();
  if (user && isOwner(user)) showEditor();
  else if (user) await showNotAuthorized();
  else showLogin();

  function showLogin() {
    loginView.classList.remove('hidden');
    editorView.classList.add('hidden');
    const form = document.getElementById('loginForm');
    const err = document.getElementById('loginError');
    form.onsubmit = async (e) => {
      e.preventDefault();
      err.classList.add('hidden');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('loginBtn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      const { data, error } = await TravelApp.signIn(email, password);
      btn.disabled = false; btn.textContent = 'Sign In';
      if (error) { err.textContent = error.message; err.classList.remove('hidden'); return; }
      if (!isOwner(data?.user)) { await showNotAuthorized(); return; }
      showEditor();
    };
  }

  async function showEditor() {
    loginView.classList.add('hidden');
    editorView.classList.remove('hidden');
    document.getElementById('signOutBtn').onclick = async () => { await TravelApp.signOut(); location.reload(); };
    document.getElementById('newPostBtn').onclick = () => openForm(null);
    await refreshList();

    const editId = new URLSearchParams(location.search).get('id');
    if (editId) {
      const p = await TravelApp.getPost(editId);
      if (p) openForm(p);
    }
  }

  let posts = [];
  async function refreshList() {
    posts = await TravelApp.listPosts();
    const list = document.getElementById('postList');
    if (!posts.length) {
      list.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400 py-4">No entries yet. Click “New entry” to add your first hike or place.</p>';
      return;
    }
    list.innerHTML = posts.map(p => `
      <div class="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
        <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">${coverHtml(p, '')}</div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-slate-900 dark:text-white truncate">${escapeHtml(p.title)} ${p.published ? '' : '<span class="text-xs text-amber-500">(draft)</span>'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${typeMeta(p.type).label}${p.location ? ' · ' + escapeHtml(p.location) : ''}${p.date ? ' · ' + fmtDate(p.date) : ''}</p>
        </div>
        <button data-edit="${p.id}" class="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><i class="fas fa-pen"></i></button>
        <button data-del="${p.id}" class="px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"><i class="fas fa-trash"></i></button>
      </div>`).join('');
    list.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
      const p = posts.find(x => x.id === b.dataset.edit);
      if (p) openForm(p);
    });
    list.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Delete this entry? This cannot be undone.')) return;
      await TravelApp.deletePost(b.dataset.del);
      await refreshList();
    });
  }

  // Form handling
  let galleryPhotos = []; // [{url, caption}]
  function openForm(p) {
    const f = document.getElementById('postForm');
    document.getElementById('formTitle').textContent = p ? 'Edit entry' : 'New entry';
    f.dataset.id = p?.id || '';
    f.elements.type.value = p?.type || 'hike';
    f.elements.title.value = p?.title || '';
    f.elements.location.value = p?.location || '';
    f.elements.region.value = p?.region || '';
    f.elements.date.value = p?.date || '';
    f.elements.rating.value = p?.rating ?? '';
    f.elements.distance_km.value = p?.distance_km ?? '';
    f.elements.elevation_m.value = p?.elevation_m ?? '';
    f.elements.duration.value = p?.duration || '';
    f.elements.difficulty.value = p?.difficulty || '';
    f.elements.tags.value = (p?.tags || []).join(', ');
    f.elements.summary.value = p?.summary || '';
    f.elements.body.value = p?.body || '';
    f.elements.published.checked = p ? !!p.published : true;
    setCover(p?.cover_url || '');
    galleryPhotos = (p?.photos || []).filter(x => x && x.url).map(x => ({ url: x.url, caption: x.caption || '' }));
    renderGallery();
    toggleHikeFields();
    document.getElementById('formModal').classList.remove('hidden');
    document.getElementById('formModal').classList.add('flex');
    f.elements.title.focus();
  }
  function closeForm() {
    document.getElementById('formModal').classList.add('hidden');
    document.getElementById('formModal').classList.remove('flex');
  }

  let coverUrl = '';
  function setCover(url) {
    coverUrl = url || '';
    const prev = document.getElementById('coverPreview');
    prev.innerHTML = coverUrl
      ? `<img src="${escapeHtml(coverUrl)}" class="w-full h-40 object-cover rounded-xl"><button type="button" id="removeCover" class="absolute top-2 right-2 bg-black/60 text-white w-7 h-7 rounded-full text-xs"><i class="fas fa-times"></i></button>`
      : `<div class="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400"><span><i class="fas fa-image mr-1"></i> No cover</span></div>`;
    const rm = document.getElementById('removeCover');
    if (rm) rm.onclick = () => setCover('');
  }

  function renderGallery() {
    const wrap = document.getElementById('galleryPreview');
    wrap.innerHTML = galleryPhotos.map((ph, i) => `
      <div class="relative">
        <img src="${escapeHtml(ph.url)}" class="w-full h-24 object-cover rounded-lg">
        <button type="button" data-rmphoto="${i}" class="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full text-xs"><i class="fas fa-times"></i></button>
        <input type="text" data-cap="${i}" value="${escapeHtml(ph.caption)}" placeholder="Caption" class="mt-1 w-full text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
      </div>`).join('');
    wrap.querySelectorAll('[data-rmphoto]').forEach(b => b.onclick = () => { galleryPhotos.splice(Number(b.dataset.rmphoto), 1); renderGallery(); });
    wrap.querySelectorAll('[data-cap]').forEach(inp => inp.oninput = () => { galleryPhotos[Number(inp.dataset.cap)].caption = inp.value; });
  }

  function toggleHikeFields() {
    const isHike = document.getElementById('postForm').elements.type.value === 'hike';
    document.querySelectorAll('[data-hike-field]').forEach(el => el.classList.toggle('hidden', !isHike));
  }

  document.getElementById('postForm').elements.type.addEventListener('change', toggleHikeFields);
  document.getElementById('closeFormBtn').onclick = closeForm;
  document.getElementById('cancelFormBtn').onclick = closeForm;

  // Cover upload
  document.getElementById('coverInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const status = document.getElementById('coverStatus');
    status.textContent = 'Uploading…';
    try { setCover(await TravelApp.uploadPhoto(file)); status.textContent = ''; }
    catch (err) { status.textContent = 'Upload failed: ' + err.message; }
    e.target.value = '';
  });

  // Gallery upload (multiple)
  document.getElementById('galleryInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const status = document.getElementById('galleryStatus');
    status.textContent = `Uploading ${files.length}…`;
    for (const file of files) {
      try { const url = await TravelApp.uploadPhoto(file); galleryPhotos.push({ url, caption: '' }); }
      catch (err) { status.textContent = 'Upload failed: ' + err.message; }
    }
    status.textContent = '';
    renderGallery();
    e.target.value = '';
  });

  // Save
  document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const saveBtn = document.getElementById('saveBtn');
    const num = v => v === '' || v == null ? null : Number(v);
    const post = {
      type: f.elements.type.value,
      title: f.elements.title.value.trim(),
      location: f.elements.location.value.trim() || null,
      region: f.elements.region.value.trim() || null,
      date: f.elements.date.value || null,
      rating: num(f.elements.rating.value),
      distance_km: num(f.elements.distance_km.value),
      elevation_m: num(f.elements.elevation_m.value),
      duration: f.elements.duration.value.trim() || null,
      difficulty: f.elements.difficulty.value || null,
      tags: f.elements.tags.value.split(',').map(s => s.trim()).filter(Boolean),
      summary: f.elements.summary.value.trim() || null,
      body: f.elements.body.value || null,
      cover_url: coverUrl || null,
      photos: galleryPhotos,
      published: f.elements.published.checked
    };
    if (f.dataset.id) post.id = f.dataset.id;
    if (!post.title) return;
    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    const { error } = await TravelApp.savePost(post);
    saveBtn.disabled = false; saveBtn.textContent = 'Save entry';
    if (error) { alert('Save failed: ' + error.message); return; }
    closeForm();
    await refreshList();
  });
}

// ========================================
// Router
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  else if (page === 'post') initPost();
  else if (page === 'editor') initEditor();
});
