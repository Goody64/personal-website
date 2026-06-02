// Example travel-config.js. The deploy workflow generates the real one from
// GitHub Secrets (the SAME SUPABASE_URL / SUPABASE_ANON_KEY used by Life ERP).
// For local testing, copy this to travel-config.js and fill in your values.
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
