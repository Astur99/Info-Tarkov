import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { GAME_MODE_OPTIONS, GAME_MODE_PVP } from '../../lib/gameModePreferences';
import { loadModuleState } from '../../lib/moduleStateSync';
import {
  isValidTarkovUsername,
  normalizeTarkovUsername,
  saveUserProfilePreferences
} from '../../lib/userProfilePreferences';

const getPasswordChecks = (value, t) => [
  { label: t('auth.checks.length'), ok: value.length >= 8 },
  { label: t('auth.checks.uppercase'), ok: /[A-Z]/.test(value) },
  { label: t('auth.checks.lowercase'), ok: /[a-z]/.test(value) },
  { label: t('auth.checks.number'), ok: /[0-9]/.test(value) },
  { label: t('auth.checks.symbol'), ok: /[^A-Za-z0-9]/.test(value) }
];

const isSecurePassword = (value, t) =>
  getPasswordChecks(value, t).every((check) => check.ok);

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

const getModeLabel = (mode) => (mode === 'BOTH' ? 'Ambos' : mode);

const countObjectValues = (value) => {
  if (!value || typeof value !== 'object') return 0;
  return Object.values(value).filter(Boolean).length;
};

const readLocalObject = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

export default function AccountSettings({
  onViewChange,
  session,
  userProfile,
  userRole,
  onProfileUpdated,
  onAccountDeleted
}) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(userProfile?.tarkov_username || userProfile?.username || '');
  const [primaryGameMode, setPrimaryGameMode] = useState(userProfile?.primary_game_mode || GAME_MODE_PVP);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [accountSummary, setAccountSummary] = useState({
    questPvp: 0,
    questPve: 0,
    collectorPvp: 0,
    collectorPve: 0,
    hideoutPvp: 0,
    hideoutPve: 0,
    loading: true
  });

  const usernameRules = t('account.username.rules');
  const passwordRequirements = t('auth.passwordRequirements');
  const passwordChecks = getPasswordChecks(newPassword, t);
  const displayUsername = userProfile?.tarkov_username || userProfile?.username || username || 'Sin usuario';
  const linkedProfileUrl = `https://tarkov.dev/players`;
  const summaryCards = useMemo(() => [
    { label: 'Modo principal', value: getModeLabel(primaryGameMode), meta: 'Preferencia global' },
    { label: 'Misiones PVP', value: accountSummary.questPvp, meta: 'Completadas cloud' },
    { label: 'Misiones PVE', value: accountSummary.questPve, meta: 'Completadas cloud' },
    { label: 'Collector', value: `${accountSummary.collectorPvp}/${accountSummary.collectorPve}`, meta: 'PVP / PVE marcados' },
    { label: 'Hideout', value: `${accountSummary.hideoutPvp}/${accountSummary.hideoutPve}`, meta: 'Materiales PVP / PVE' }
  ], [accountSummary, primaryGameMode]);

  useEffect(() => {
    let cancelled = false;

    const loadAccountSummary = async () => {
      if (!session?.user?.id) {
        setAccountSummary((current) => ({ ...current, loading: false }));
        return;
      }

      const [
        questProgress,
        collectorPvp,
        collectorPve,
        hideoutPvp,
        hideoutPve
      ] = await Promise.all([
        supabase
          .from('quest_progress')
          .select('mode, completed_task_ids')
          .eq('user_id', session.user.id),
        Promise.resolve({ data: readLocalObject('info_tarkov_collector_items_pvp') }),
        Promise.resolve({ data: readLocalObject('info_tarkov_collector_items_pve') }),
        loadModuleState({ userId: session.user.id, moduleKey: 'hideout_progress', mode: 'PVP' }),
        loadModuleState({ userId: session.user.id, moduleKey: 'hideout_progress', mode: 'PVE' })
      ]);

      if (cancelled) return;

      const questRows = questProgress.data || [];
      const getQuestCount = (mode) => questRows.find((row) => row.mode === mode)?.completed_task_ids?.length || 0;

      setAccountSummary({
        questPvp: getQuestCount('PVP'),
        questPve: getQuestCount('PVE'),
        collectorPvp: countObjectValues(collectorPvp.data),
        collectorPve: countObjectValues(collectorPve.data),
        hideoutPvp: countObjectValues(hideoutPvp.data?.items || hideoutPvp.data),
        hideoutPve: countObjectValues(hideoutPve.data?.items || hideoutPve.data),
        loading: false
      });
    };

    loadAccountSummary();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const handleSaveUsername = async (event) => {
    event.preventDefault();
    setProfileMessage('');

    const cleanUsername = normalizeTarkovUsername(username);

    if (!session?.user?.id) {
      setProfileMessage(t('account.messages.loginRequired'));
      return;
    }

    if (!isValidTarkovUsername(cleanUsername)) {
      setProfileMessage(usernameRules);
      return;
    }

    setProfileLoading(true);

    const { data, error, legacyFallback } = await saveUserProfilePreferences({
      userId: session.user.id,
      username: cleanUsername,
      tarkovUsername: cleanUsername,
      primaryGameMode
    });

    setProfileLoading(false);

    if (error) {
      if (error.code === '23505') {
        setProfileMessage(t('account.messages.usernameTaken'));
        return;
      }

      console.error(error);
      setProfileMessage(t('account.messages.usernameSaveError'));
      return;
    }

    onProfileUpdated(data);
    setProfileMessage(legacyFallback ? t('account.messages.profileSavedLocalMode') : t('account.messages.usernameSaved'));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage('');

    if (!isSecurePassword(newPassword, t)) {
      setPasswordMessage(passwordRequirements);
      return;
    }

    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setPasswordLoading(false);

    if (error) {
      console.error(error);
      setPasswordMessage(t('account.messages.passwordSaveError'));
      return;
    }

    setNewPassword('');
    setPasswordMessage(t('account.messages.passwordSaved'));
  };

  const handleDeleteAccount = async () => {
    setDeleteMessage('');

    if (deleteConfirm !== 'BORRAR') {
      setDeleteMessage(t('account.messages.deleteConfirmRequired'));
      return;
    }

    setDeleteLoading(true);

    const { error } = await supabase.rpc('delete_own_account');

    setDeleteLoading(false);

    if (error) {
      console.error(error);
      setDeleteMessage(t('account.messages.deleteError'));
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
        {t('common.backToTerminal')}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 420px)', gap: '1rem', width: 'min(1120px, 100%)', margin: '0 auto', alignItems: 'start' }}>
        <section style={{ display: 'grid', gap: '1rem' }}>
          <article style={{ ...panelStyle, width: '100%' }}>
            <p style={{ color: 'var(--tk-green)', margin: 0, fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Centro de cuenta
            </p>
            <h1 style={{ color: '#fff', margin: '0.25rem 0 0', fontSize: '2.2rem' }}>{displayUsername}</h1>

            <p style={{ color: 'var(--tk-text-muted)', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
              {userRole === 'admin' ? t('account.adminProfile') : t('account.userProfile')} - {session?.user?.email}
            </p>
          </article>

          <article style={{ ...panelStyle, width: '100%' }}>
            <h2 style={sectionTitleStyle}>Resumen operativo</h2>
            {accountSummary.loading ? (
              <p style={{ color: 'var(--tk-green)', margin: 0, fontWeight: '800' }}>Cargando progreso...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.75rem' }}>
                {summaryCards.map((card) => (
                  <SummaryCard key={card.label} {...card} />
                ))}
              </div>
            )}
          </article>

          <article style={{ ...panelStyle, width: '100%' }}>
            <h2 style={sectionTitleStyle}>Accesos rápidos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
              <QuickAction label="Misiones / Kappa" meta="Continuar progreso" onClick={() => onViewChange('kappa')} />
              <QuickAction label="Hideout" meta="Gestionar materiales" onClick={() => onViewChange('hideout')} />
              <QuickAction label="Flea Market" meta="Consultar economía" onClick={() => onViewChange('flea')} />
              <QuickAction label="Perfil oficial" meta="Abrir tarkov.dev" as="a" href={linkedProfileUrl} />
            </div>
          </article>
        </section>

        <section style={{ display: 'grid', gap: '1rem' }}>
        <form onSubmit={handleSaveUsername} style={{ ...panelStyle, width: '100%' }}>
          <h2 style={sectionTitleStyle}>{t('account.username.title')}</h2>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={t('account.username.placeholder')}
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_-]{3,20}"
            title={usernameRules}
            required
            style={inputStyle}
          />

          <p style={helperStyle}>{t('account.username.helper')}</p>

          <label
            style={{
              display: 'grid',
              gap: '0.35rem',
              color: 'var(--tk-text-muted)',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '1rem'
            }}
          >
            {t('account.username.primaryMode')}
            <select
              value={primaryGameMode}
              onChange={(event) => setPrimaryGameMode(event.target.value)}
              style={inputStyle}
            >
              {GAME_MODE_OPTIONS.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {t(`auth.modes.${mode.value.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </label>

          <button
            disabled={profileLoading}
            style={{ ...primaryButtonStyle, cursor: profileLoading ? 'wait' : 'pointer' }}
          >
            {profileLoading ? t('account.username.saving') : t('account.username.save')}
          </button>

          {profileMessage && (
            <p style={{ color: profileMessage === t('account.messages.usernameSaved') ? 'var(--tk-green)' : '#ffcf66', marginTop: '1rem' }}>
              {profileMessage}
            </p>
          )}
        </form>

        <form onSubmit={handleChangePassword} style={{ ...panelStyle, width: '100%' }}>
          <h2 style={sectionTitleStyle}>{t('account.password.title')}</h2>

          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder={t('account.password.placeholder')}
            minLength={8}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
            title={passwordRequirements}
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
            {passwordLoading ? t('account.password.saving') : t('account.password.save')}
          </button>

          {passwordMessage && (
            <p style={{ color: passwordMessage === t('account.messages.passwordSaved') ? 'var(--tk-green)' : '#ffcf66', marginTop: '1rem' }}>
              {passwordMessage}
            </p>
          )}
        </form>

        <section
          style={{
            ...panelStyle,
            width: '100%',
            border: '1px solid rgba(255,107,107,0.35)',
            background: 'rgba(255,107,107,0.045)'
          }}
        >
          <h2 style={sectionTitleStyle}>{t('account.delete.title')}</h2>

          <p style={{ ...helperStyle, color: '#ffcf66' }}>
            {t('account.delete.warning')}
          </p>

          <input
            type="text"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder={t('account.delete.placeholder')}
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
            {deleteLoading ? t('account.delete.deleting') : t('account.delete.button')}
          </button>

          {deleteMessage && (
            <p style={{ color: '#ffcf66', marginTop: '1rem' }}>
              {deleteMessage}
            </p>
          )}
        </section>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, meta }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.9rem' }}>
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '900', textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ color: '#fff', display: 'block', fontSize: '1.35rem', marginTop: '0.25rem' }}>{value}</strong>
      <span style={{ color: 'var(--tk-green)', display: 'block', fontWeight: '800', marginTop: '0.25rem' }}>{meta}</span>
    </div>
  );
}

function QuickAction({ label, meta, onClick, as, href }) {
  const content = (
    <>
      <strong style={{ color: '#fff', display: 'block', textTransform: 'uppercase' }}>{label}</strong>
      <span style={{ color: 'var(--tk-green)', display: 'block', fontWeight: '800', marginTop: '0.25rem' }}>{meta}</span>
    </>
  );
  const style = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.95rem',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
    textDecoration: 'none'
  };

  if (as === 'a') {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} style={style}>
      {content}
    </button>
  );
}
