// src/components/LoginModal.jsx
// ─────────────────────────────────────────────────────────────────
// Login + Register modal — shown when user clicks Login button
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { login, register } from '../api/authService';

export default function LoginModal({ onSuccess, onClose }) {
  const [mode,    setMode]    = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', village: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: form.email, password: form.password });
      } else {
        if (!form.name) { setError('Name is required'); setLoading(false); return; }
        result = await register(form);
      }
      onSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ minHeight: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 border border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {mode === 'register' && (
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Full Name"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          )}
          <input
            name="email" value={form.email} onChange={handleChange}
            type="email" placeholder="Email"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <input
            name="password" value={form.password} onChange={handleChange}
            type="password" placeholder="Password (min 6 characters)"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {mode === 'register' && (
            <input
              name="village" value={form.village} onChange={handleChange}
              placeholder="Village / City (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        {/* Toggle mode */}
        <p className="text-center text-gray-500 text-sm mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>

      </div>
    </div>
  );
}