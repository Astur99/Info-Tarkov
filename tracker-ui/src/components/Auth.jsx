import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

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
          minLength={6}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem' }}
        />

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