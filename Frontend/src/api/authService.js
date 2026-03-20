// src/api/authService.js
// ─────────────────────────────────────────────────────────────────
// Register, Login, Logout — token localStorage mein store hota hai
// Used by App.jsx + LoginModal.jsx
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Register new user
 */
export async function register({ name, email, password, village = '', phone = '' }) {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email, password, village, phone }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed.');

  // Save token + user to localStorage
  localStorage.setItem('vg_token', data.token);
  localStorage.setItem('vg_user',  JSON.stringify(data.user));

  return data;
}

/**
 * Login existing user
 */
export async function login({ email, password }) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed.');

  localStorage.setItem('vg_token', data.token);
  localStorage.setItem('vg_user',  JSON.stringify(data.user));

  return data;
}

/**
 * Logout — clear localStorage
 */
export function logout() {
  localStorage.removeItem('vg_token');
  localStorage.removeItem('vg_user');
}

/**
 * Get current logged-in user from localStorage
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('vg_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return !!localStorage.getItem('vg_token');
}