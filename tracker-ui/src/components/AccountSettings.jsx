import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const USERNAME_RULES =
  'El nombre debe tener entre 3 y 20 caracteres. Usa letras, números, guion bajo o guion.';

const PASSWORD_REQUIREMENTS =
  'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';

const normalizeUsername = (value) => value.trim();

const isValidUsername = (value) =>
  /^[A-Za-z0-9_-]{3,20}$/.test(normalizeUsername(value));

const getPasswordChecks = (value) => [
  { label: 'Mínimo 8 caracteres', ok: value.length >= 8 },
  { label: 'Una mayúscula', ok: /[A-Z]/.test(value) },
  { label: 'Una minúscula', ok: /[a-z]/.test(value) },
  { label: 'Un número', ok: /[0-9]/.test(value) },
  { label: 'Un símbolo', ok: /[^A-Za-z0-9]/.test(value) }
];

const isSecurePassword = (value) =>
  getPasswordChecks(value).every((check) => check.ok);

const panelStyle = {
  width: '420px',
  padding: '2rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontFamily: "'Rajdhani', sans-serif"
};

const inputStyle = {
  width: '100%',
  marginBottom: '0.65rem',
  padding: '0.8rem'
};

const primaryButtonStyle = {
  width: '100%',
  padding: '0.8rem',
  background: 'var(--tk-green)',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '900',
  cursor: 'pointer'
};

const sectionTitleStyle = {
  color: '#fff',
  margin: '0 0 0.85rem 0',
  fontSize: '1.25rem'
};

const helperStyle = {
  color: 'var(--tk-text-muted)',
  fontSize: '0.78rem',
  lineHeight: 1.45,
  margin: '0 0 1rem 0'
};

export default function AccountSettings({
  onViewChange,
  session,
  userProfile,
  userRole,
  onProfileUpdated,
  onAccountDeleted
}) {
  const [username, setUsername] = useState(userProfile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const passwordChecks = getPasswordChecks(newPassword);

  const handleSaveUsername = async (event) => {
    event.preventDefault();
    setProfileMessage('');

    const cleanUsername = normalizeUsername(username);

    if (!session?.user?.id) {
      setProfileMessage('Necesitas iniciar sesión para configurar tu usuario.');
      return;
    }

    if (!isValidUsername(cleanUsername)) {
      setProfileMessage(USERNAME_RULES);
      return;
    }

    setProfileLoading(true);

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: session.user.id,
          username: cleanUsername,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select('username')
      .single();

    setProfileLoading(false);

    if (error) {
      if (error.code === '23505') {
        setProfileMessage('Ese nombre de usuario ya está en uso.');
        return;
      }

      console.error(error);
      setProfileMessage('No se pudo guardar el nombre de usuario.');
      return;
    }

    onProfileUpdated(data);
    setProfileMessage('Nombre de usuario guardado.');
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage('');

    if (!isSecurePassword(newPassword)) {
      setPasswordMessage(PASSWORD_REQUIREMENTS);
      return;
    }

    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setPasswordLoading(false);

    if (error) {
      console.error(error);
      setPasswordMessage('No se pudo cambiar la contraseña.');
      return;
    }

    setNewPassword('');
    setPasswordMessage('Contraseña actualizada.');
  };

  const handleDeleteAccount = async () => {
    setDeleteMessage('');

    if (deleteConfirm !== 'BORRAR') {
      setDeleteMessage('Escribe BORRAR para confirmar.');
      return;
    }

    setDeleteLoading(true);

    const { error } = await supabase.rpc('delete_own_account');

    setDeleteLoading(false);

    if (error) {
      console.error(error);
      setDeleteMessage('No se pudo borrar la cuenta.');
      return;
    }

    await supabase.auth.signOut();
    onAccountDeleted();
    onViewChange('home');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0a0c',
        padding: '6rem 1rem'
      }}
    >
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

      <div style={{ display: 'grid', gap: '1rem', width: 'min(420px, 100%)' }}>
        <section style={panelStyle}>
          <h1 style={{ color: '#fff', marginTop: 0 }}>Cuenta</h1>

          <p style={{ color: 'var(--tk-text-muted)', marginTop: '-0.5rem', fontSize: '0.9rem' }}>
            {userRole === 'admin' ? 'Perfil administrador' : 'Perfil de usuario'}
          </p>
        </section>

        <form onSubmit={handleSaveUsername} style={panelStyle}>
          <h2 style={sectionTitleStyle}>Nombre de usuario</h2>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Tu usuario"
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_-]{3,20}"
            title={USERNAME_RULES}
            required
            style={inputStyle}
          />

          <p style={helperStyle}>
            3-20 caracteres. Letras, números, guion bajo o guion. No puede repetirse.
          </p>

          <button
            disabled={profileLoading}
            style={{ ...primaryButtonStyle, cursor: profileLoading ? 'wait' : 'pointer' }}
          >
            {profileLoading ? 'Guardando...' : 'Guardar usuario'}
          </button>

          {profileMessage && (
            <p style={{ color: profileMessage.includes('guardado') ? 'var(--tk-green)' : '#ffcf66', marginTop: '1rem' }}>
              {profileMessage}
            </p>
          )}
        </form>

        <form onSubmit={handleChangePassword} style={panelStyle}>
          <h2 style={sectionTitleStyle}>Cambiar contraseña</h2>

          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Nueva contraseña"
            minLength={8}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
            title={PASSWORD_REQUIREMENTS}
            required
            style={inputStyle}
          />

          <div
            style={{
              display: 'grid',
              gap: '0.35rem',
              marginBottom: '1rem',
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

          <button
            disabled={passwordLoading}
            style={{ ...primaryButtonStyle, cursor: passwordLoading ? 'wait' : 'pointer' }}
          >
            {passwordLoading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>

          {passwordMessage && (
            <p style={{ color: passwordMessage.includes('actualizada') ? 'var(--tk-green)' : '#ffcf66', marginTop: '1rem' }}>
              {passwordMessage}
            </p>
          )}
        </form>

        <section
          style={{
            ...panelStyle,
            border: '1px solid rgba(255,107,107,0.35)',
            background: 'rgba(255,107,107,0.045)'
          }}
        >
          <h2 style={sectionTitleStyle}>Borrar cuenta</h2>

          <p style={{ ...helperStyle, color: '#ffcf66' }}>
            Esta acción borrará tu cuenta y perderás el progreso asociado a ella. No se puede deshacer.
          </p>

          <input
            type="text"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder="Escribe BORRAR"
            style={inputStyle}
          />

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            style={{
              ...primaryButtonStyle,
              background: '#ff6b6b',
              color: '#170707',
              cursor: deleteLoading ? 'wait' : 'pointer'
            }}
          >
            {deleteLoading ? 'Borrando...' : 'Borrar cuenta'}
          </button>

          {deleteMessage && (
            <p style={{ color: '#ffcf66', marginTop: '1rem' }}>
              {deleteMessage}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
