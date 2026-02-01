// ========================================
// Admin Auth Configuration (EXAMPLE)
// ========================================
// Copy this file to admin-config.js and set your credentials.
// admin-config.js is in .gitignore and will NOT be committed to git.
//
// 1. Copy: cp admin-config.example.js admin-config.js
// 2. Edit admin-config.js with your username and password
// 3. Never commit admin-config.js

const AUTH_CONFIG = {
  username: 'username',
  password: 'password',
  sessionKey: 'lifeErp_session',
  sessionDuration: 24 * 60 * 60 * 1000 // 24 hours
};
