// ========================================
// Admin Auth Configuration (EXAMPLE)
// ========================================

const AUTH_CONFIG = {
  username: 'username',
  password: 'password',
  sessionKey: 'lifeErp_session',
  sessionDuration: 24 * 60 * 60 * 1000 // 24 hours
};

// ========================================
// Supabase Cloud Sync (OPTIONAL - for cross-device sync)
// Create free project at https://supabase.com
// Run the SQL in admin/SUPABASE_SETUP.sql in the SQL Editor
// ========================================
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
};
