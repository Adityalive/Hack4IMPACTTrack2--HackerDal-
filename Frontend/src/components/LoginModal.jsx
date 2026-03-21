import { useState } from 'react';
import { login, register } from '../api/authService';
import { useLang } from '../context/LangContext';

export default function LoginModal({ onSuccess, onClose }) {
  const { t, lang, toggleLang } = useLang();
  const [mode,        setMode]        = useState('login');
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', village: '',
  });

  const handleChange = (e) => {
    const val = e.target.name === 'phone'
      ? e.target.value.replace(/\D/g, '').slice(0, 10)
      : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
    setError('');
  };

  const handleSubmit = async () => {
    // Validate phone if using phone method
    if (loginMethod === 'phone' && form.phone.length !== 10) {
      setError(t.phoneError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'login') {
        // Login by phone or email
        const credential = loginMethod === 'phone'
          ? { phone: form.phone, password: form.password }
          : { email: form.email, password: form.password };
        result = await login(credential);
      } else {
        if (!form.name) { setError(lang === 'hi' ? 'नाम आवश्यक है' : 'Name is required'); setLoading(false); return; }
        if (form.phone.length !== 10) { setError(t.phoneError); setLoading(false); return; }
        result = await register({ ...form });
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
      style={{ minHeight: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0f172a',
        borderRadius: '20px',
        padding: '28px',
        width: '100%',
        maxWidth: '400px',
        margin: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '18px', margin: 0 }}>
              {mode === 'login' ? t.loginTitle : t.registerTitle}
            </h2>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              VoiceGuard
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '20px',
                padding: '4px 12px',
                color: '#a5b4fc',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
            <button
              onClick={onClose}
              style={{ color: '#64748b', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Phone / Email toggle — only on login */}
        {mode === 'login' && (
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {['phone', 'email'].map(m => (
              <button
                key={m}
                onClick={() => setLoginMethod(m)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: loginMethod === m ? '#3b82f6' : 'transparent',
                  color: loginMethod === m ? 'white' : '#94a3b8',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'phone'
                  ? (lang === 'hi' ? '📞 फ़ोन' : '📞 Phone')
                  : (lang === 'hi' ? '✉️ ईमेल' : '✉️ Email')}
              </button>
            ))}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.nameLabel}
              </label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder={lang === 'hi' ? 'आपका पूरा नाम' : 'Your full name'}
                style={inputStyle}
              />
            </div>
          )}

          {/* Phone — always show on register, show on login if phone method */}
          {(mode === 'register' || loginMethod === 'phone') && (
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.phoneLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: '#64748b', fontSize: '14px', pointerEvents: 'none',
                }}>+91</span>
                <input
                  name="phone" value={form.phone} onChange={handleChange}
                  placeholder={t.phonePlaceholder}
                  inputMode="numeric"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                />
              </div>
              {form.phone.length > 0 && form.phone.length < 10 && (
                <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>
                  {10 - form.phone.length} {lang === 'hi' ? 'अंक और बाकी' : 'digits remaining'}
                </p>
              )}
            </div>
          )}

          {/* Email — always show on register, show on login if email method */}
          {(mode === 'register' || loginMethod === 'email') && (
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {mode === 'register' ? t.emailLabel : (lang === 'hi' ? 'ईमेल' : 'Email')}
              </label>
              <input
                name="email" value={form.email} onChange={handleChange}
                type="email"
                placeholder={lang === 'hi' ? 'आपका ईमेल' : 'your@email.com'}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t.passwordLabel}
            </label>
            <input
              name="password" value={form.password} onChange={handleChange}
              type="password"
              placeholder={lang === 'hi' ? 'कम से कम 6 अक्षर' : 'Min 6 characters'}
              style={inputStyle}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.villageLabel}
              </label>
              <input
                name="village" value={form.village} onChange={handleChange}
                placeholder={lang === 'hi' ? 'आपका गांव या शहर' : 'Your village or city'}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '10px 14px',
            color: '#fca5a5', fontSize: '13px', marginTop: '14px',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', marginTop: '20px',
            padding: '14px',
            background: loading ? '#334155' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none', borderRadius: '14px',
            color: 'white', fontWeight: 700, fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          {loading
            ? (lang === 'hi' ? 'लोड हो रहा है...' : 'Please wait...')
            : mode === 'login' ? t.loginBtn : t.registerBtn}
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '16px', marginBottom: 0 }}>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setLoginMethod('phone'); }}
            style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            {mode === 'login' ? t.switchToRegister : t.switchToLogin}
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#f1f5f9',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};