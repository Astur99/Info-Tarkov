import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';

const DEFAULT_PUBLIC_SITE_URL = 'https://infotarkov.com';

const getAuthRedirectUrl = () => {
  const configuredUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  const baseUrl = configuredUrl || DEFAULT_PUBLIC_SITE_URL;
  return `${baseUrl.replace(/\/$/, '')}/`;
};

const isSecurePassword = (value) =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /[0-9]/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

export default function Auth({ onViewChange }) {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRequirements = t('auth.passwordRequirements');
  const passwordChecks = [
    { label: t('auth.checks.length'), ok: password.length >= 8 },
    { label: t('auth.checks.uppercase'), ok: /[A-Z]/.test(password) },
    { label: t('auth.checks.lowercase'), ok: /[a-z]/.test(password) },
    { label: t('auth.checks.number'), ok: /[0-9]/.test(password) },
    { label: t('auth.checks.symbol'), ok: /[^A-Za-z0-9]/.test(password) }
  ];

  const handleAuth = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (isRegister && !isSecurePassword(password)) {
      setMensaje(passwordRequirements);
      return;
    }

    setLoading(true);

    const result = isRegister
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl()
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMensaje(result.error.message);
    } else {
      setMensaje(isRegister ? t('auth.confirmEmail') : t('auth.loggedIn'));
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0c' }}>
      <button
        type="button"
        onClick={() => onViewChange('home')}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          color: 'var(--tk-green)',
          fontSize: '1rem',
          cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: '700',
          letterSpacing: '1px'
        }}
      >
        {t('common.backToTerminal')}
      </button>

      <form
        onSubmit={handleAuth}
        style={{
          width: '360px',
          padding: '2rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: "'Rajdhani', sans-serif"
        }}
      >
        <h1 style={{ color: '#fff', marginTop: 0 }}>
          {isRegister ? t('auth.titleRegister') : t('auth.titleLogin')}
        </h1>

        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem' }}
        />

        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isRegister ? 8 : 6}
          pattern={isRegister ? '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$' : undefined}
          title={isRegister ? passwordRequirements : undefined}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem' }}
        />

        {isRegister && (
          <div
            style={{
              display: 'grid',
              gap: '0.35rem',
              margin: '-0.35rem 0 1rem 0',
              fontSize: '0.78rem',
              fontWeight: '800',
              letterSpacing: '0.4px'
            }}
          >
            {passwordChecks.map((check) => (
              <span
                key={check.label}
                style={{
                  color: check.ok ? 'var(--tk-green)' : '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <span style={{ width: '1rem', display: 'inline-block' }}>
                  {check.ok ? '✓' : '×'}
                </span>
                {check.label}
              </span>
            ))}
          </div>
        )}

        <button
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.8rem',
            background: 'var(--tk-green)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '900',
            cursor: 'pointer'
          }}
        >
          {loading ? t('common.processing') : isRegister ? t('auth.submitRegister') : t('auth.submitLogin')}
        </button>

        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          style={{
            marginTop: '1rem',
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--tk-text-muted)',
            cursor: 'pointer'
          }}
        >
          {isRegister ? t('auth.switchToLogin') : t('auth.switchToRegister')}
        </button>

        {mensaje && (
          <p style={{ color: '#ffcf66', marginTop: '1rem' }}>
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}
