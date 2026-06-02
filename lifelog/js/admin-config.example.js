// ========================================
// Supabase Configuration (REQUIRED for deployed app)
// Create free project at https://supabase.com
// Run the SQL in admin/SUPABASE_SETUP.sql in the SQL Editor
// Add SUPABASE_URL and SUPABASE_ANON_KEY to GitHub Secrets for deploy
// ========================================
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'  // Use the anon/public key, NOT service_role
};

// Optional access key required to create a NEW cloud account (sign up).
// Leave null/empty to allow open sign-up. This is a client-side deterrent only
// (it ships in the static bundle); for real enforcement disable open signups in
// Supabase and use an invite/allowlist or an Edge Function.
// In production this is injected from the SIGNUP_ACCESS_KEY GitHub Secret.
const SIGNUP_ACCESS_KEY = '';
