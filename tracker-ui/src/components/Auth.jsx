import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PASSWORD_REQUIREMENTS =
  'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';

const isSecurePassword = (value) =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /[0-9]/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

const getPasswordChecks = (value) => [
  { label: 'Mínimo 8 caracteres', ok: value.length >= 8 },
  { label: 'Una mayúscula', ok: /[A-Z]/.test(value) },
  { label: 'Una minúscula', ok: /[a-z]/.test(value) },
  { label: 'Un número', ok: /[0-9]/.test(value) },
  { label: 'Un símbolo', ok: /[^A-Za-z0-9]/.test(value) }
];

export default function Auth({ onViewChange }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordChecks = getPasswordChecks(password);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (isRegister && !isSecurePassword(password)) {
      setMensaje(PASSWORD_REQUIREMENTS);
      return;
    }

    setLoading(true);

    const result = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMensaje(result.error.message);
    } else {
      setMensaje(isRegister ? 'Cuenta creada correctamente.' : 'Sesión iniciada.');
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
        ← VOLVER AL TERMINAL
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
          {isRegister ? 'Crear cuenta' : 'Login'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem' }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isRegister ? 8 : 6}
          pattern={isRegister ? '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$' : undefined}
          title={isRegister ? PASSWORD_REQUIREMENTS : undefined}
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
          {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Entrar'}
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
          {isRegister ? 'Ya tengo cuenta' : 'Crear una cuenta'}
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
