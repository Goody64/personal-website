// Admin Auth Configuration - LOCAL DEVELOPMENT
// This file is created during deploy from GitHub Secrets
// For local dev, copy from admin-config.example.js and update credentials

const AUTH_CONFIG = {
  username: 'jacob',
  password: 'lifeErp2026!',
  sessionKey: 'lifeErp_session',
  sessionDuration: 24 * 60 * 60 * 1000
};

// Optional access key required to create a NEW cloud account (sign up).
// Leave empty to allow open sign-up. In production this is injected from the
// SIGNUP_ACCESS_KEY GitHub Secret during deploy.
const SIGNUP_ACCESS_KEY = '';
