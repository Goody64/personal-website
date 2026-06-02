// Owner lock for the Travel editor (the UX gate; the database RLS is the real
// security boundary — see SUPABASE_TRAVEL_SETUP.sql).
//
// Set ONE of these to identify you, so only you can use the editor:
//   - TRAVEL_OWNER_EMAIL: the email you sign in with (easiest)
//   - TRAVEL_OWNER_ID:    your Supabase user UID (Authentication -> Users)
//
// While both are empty, any signed-in account can use the editor (no lock).
// A deploy-generated `travel-owner-config.js` can override these at build time.
window.TRAVEL_OWNER_EMAIL = (typeof window.TRAVEL_OWNER_EMAIL !== 'undefined') ? window.TRAVEL_OWNER_EMAIL : '';
window.TRAVEL_OWNER_ID = (typeof window.TRAVEL_OWNER_ID !== 'undefined') ? window.TRAVEL_OWNER_ID : '';
