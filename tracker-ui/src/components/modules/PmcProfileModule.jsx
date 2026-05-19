import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'info_tarkov_pmc_profile';

const defaultProfile = {
  nickname: '',
  faction: 'USEC',
  mode: 'PVP',
  level: 1,
  survivalRate: 35,
  raids: 0,
  survivedRaids: 0,
  stashValue: 0,
  completedQuests: 0,
  kappaItems: 0,
  hideoutStations: 0,
  mainGoal: 'kappa'
};

const goals = [
  { id: 'kappa', label: 'Kappa', targetLevel: 48, targetQuests: 190, targetHideout: 18, targetKappaItems: 36 },
  { id: 'lightkeeper', label: 'Lightkeeper', targetLevel: 35, targetQuests: 120, targetHideout: 12, targetKappaItems: 12 },
  { id: 'prestige', label: 'Prestige', targetLevel: 25, targetQuests: 80, targetHideout: 9, targetKappaItems: 0 },
  { id: 'economy', label: 'Economia', targetLevel: 20, targetQuests: 45, targetHideout: 10, targetKappaItems: 0 }
];

const panelStyle = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
};

const inputStyle = {
  width: '100%',
  background: '#18191b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.75rem 0.85rem',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '800'
};

const secondaryButtonStyle = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  color: 'var(--tk-text-muted)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.8rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '900',
  letterSpacing: '1px'
};

const clampNumber = (value, min, max) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
};

const loadProfile = () => {
  try {
    return { ...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return defaultProfile;
  }
};

const formatRoubles = (value) => {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat('es-ES').format(amount)} RUB`;
};

export default function PmcProfileModule({ onViewChange }) {
  const [profile, setProfile] = useState(loadProfile);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const activeGoal = goals.find((goal) => goal.id === profile.mainGoal) || goals[0];

  const progression = useMemo(() => {
    const levelScore = Math.min(100, Math.round((profile.level / activeGoal.targetLevel) * 100));
    const questScore = Math.min(100, Math.round((profile.completedQuests / activeGoal.targetQuests) * 100));
    const hideoutScore = Math.min(100, Math.round((profile.hideoutStations / activeGoal.targetHideout) * 100));
    const kappaScore = activeGoal.targetKappaItems
      ? Math.min(100, Math.round((profile.kappaItems / activeGoal.targetKappaItems) * 100))
      : 100;
    const survivalScore = Math.min(100, profile.survivalRate);
    const overall = Math.round((levelScore * 0.25) + (questScore * 0.3) + (hideoutScore * 0.2) + (kappaScore * 0.15) + (survivalScore * 0.1));

    return { levelScore, questScore, hideoutScore, kappaScore, survivalScore, overall };
  }, [activeGoal, profile]);

  const recommendations = useMemo(() => {
    const next = [];

    if (progression.levelScore < 100) next.push(`Sube a nivel ${activeGoal.targetLevel} para ${activeGoal.label}.`);
    if (progression.questScore < 100) next.push('Prioriza cadenas de traders con varias quests en el mismo mapa.');
    if (progression.hideoutScore < 100) next.push('Reserva materiales clave y empuja estaciones del hideout bloqueantes.');
    if (activeGoal.targetKappaItems && progression.kappaScore < 100) next.push('Guarda items Found in Raid de Collector desde ya.');
    if (profile.survivalRate < 45) next.push('Juega raids de extraccion limpia para estabilizar supervivencia y economia.');
    if (next.length === 0) next.push('Perfil muy solido para el objetivo seleccionado. Mantente en quests de alto impacto.');

    return next.slice(0, 4);
  }, [activeGoal, profile.survivalRate, progression]);

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateNumber = (field, value, min, max) => {
    updateField(field, clampNumber(value, min, max));
  };

  return (
    <div className="fade-in-slide terminal-panel" style={{ minHeight: '100vh', background: '#0a0a0c', padding: '6rem 2rem 8rem', fontFamily: "'Rajdhani', sans-serif" }}>
      <main style={{ width: 'min(1220px, 100%)', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.45rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Identidad operativa
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.7rem', textTransform: 'uppercase' }}>Perfil de PMC</h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '820px', lineHeight: 1.6 }}>
              Panel local para resumir tu wipe, medir progreso contra un objetivo principal y decidir el siguiente bloque de trabajo.
            </p>
          </div>

          <button type="button" onClick={() => onViewChange('home')} style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
            VOLVER AL MENU
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 390px), 1fr))', gap: '1rem', alignItems: 'start' }}>
          <article style={{ ...panelStyle, padding: '1.5rem' }}>
            <h2 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1.35rem', textTransform: 'uppercase' }}>Datos del perfil</h2>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <Field label="Nombre PMC">
                <input value={profile.nickname} onChange={(event) => updateField('nickname', event.target.value)} placeholder="Tu callsign" style={inputStyle} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Faccion">
                  <select value={profile.faction} onChange={(event) => updateField('faction', event.target.value)} style={inputStyle}>
                    <option value="USEC">USEC</option>
                    <option value="BEAR">BEAR</option>
                  </select>
                </Field>
                <Field label="Modo">
                  <select value={profile.mode} onChange={(event) => updateField('mode', event.target.value)} style={inputStyle}>
                    <option value="PVP">PVP</option>
                    <option value="PVE">PVE</option>
                  </select>
                </Field>
              </div>

              <NumberGrid>
                <Field label="Nivel PMC">
                  <input type="number" min="1" max="79" value={profile.level} onChange={(event) => updateNumber('level', event.target.value, 1, 79)} style={inputStyle} />
                </Field>
                <Field label="Supervivencia %">
                  <input type="number" min="0" max="100" value={profile.survivalRate} onChange={(event) => updateNumber('survivalRate', event.target.value, 0, 100)} style={inputStyle} />
                </Field>
              </NumberGrid>

              <NumberGrid>
                <Field label="Raids">
                  <input type="number" min="0" max="9999" value={profile.raids} onChange={(event) => updateNumber('raids', event.target.value, 0, 9999)} style={inputStyle} />
                </Field>
                <Field label="Raids sobrevividas">
                  <input type="number" min="0" max="9999" value={profile.survivedRaids} onChange={(event) => updateNumber('survivedRaids', event.target.value, 0, 9999)} style={inputStyle} />
                </Field>
              </NumberGrid>

              <Field label="Valor del stash">
                <input type="number" min="0" max="999999999" value={profile.stashValue} onChange={(event) => updateNumber('stashValue', event.target.value, 0, 999999999)} style={inputStyle} />
              </Field>

              <NumberGrid>
                <Field label="Quests completadas">
                  <input type="number" min="0" max="400" value={profile.completedQuests} onChange={(event) => updateNumber('completedQuests', event.target.value, 0, 400)} style={inputStyle} />
                </Field>
                <Field label="Items Kappa guardados">
                  <input type="number" min="0" max="80" value={profile.kappaItems} onChange={(event) => updateNumber('kappaItems', event.target.value, 0, 80)} style={inputStyle} />
                </Field>
              </NumberGrid>

              <Field label="Estaciones hideout avanzadas">
                <input type="number" min="0" max="30" value={profile.hideoutStations} onChange={(event) => updateNumber('hideoutStations', event.target.value, 0, 30)} style={inputStyle} />
              </Field>

              <Field label="Objetivo principal">
                <select value={profile.mainGoal} onChange={(event) => updateField('mainGoal', event.target.value)} style={inputStyle}>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.label}</option>
                  ))}
                </select>
              </Field>

              <button type="button" onClick={() => setProfile(defaultProfile)} style={secondaryButtonStyle}>
                REINICIAR PERFIL LOCAL
              </button>
            </div>
          </article>

          <section style={{ display: 'grid', gap: '1rem' }}>
            <article style={{ ...panelStyle, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--tk-text-muted)', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>
                    {profile.nickname || 'PMC sin callsign'} - {profile.faction} - {profile.mode}
                  </p>
                  <h2 style={{ color: '#fff', margin: '0.25rem 0 0', fontSize: '2rem', textTransform: 'uppercase' }}>
                    Objetivo: {activeGoal.label}
                  </h2>
                </div>
                <strong style={{ color: 'var(--tk-green)', fontSize: '2.4rem', lineHeight: 1 }}>{progression.overall}%</strong>
              </div>

              <ProgressBar value={progression.overall} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
                <StatCard label="Nivel" value={profile.level} meta={`${progression.levelScore}% objetivo`} />
                <StatCard label="Quests" value={profile.completedQuests} meta={`${progression.questScore}% objetivo`} />
                <StatCard label="Stash" value={formatRoubles(profile.stashValue)} meta="valor manual" />
                <StatCard label="Supervivencia" value={`${profile.survivalRate}%`} meta={`${profile.survivedRaids}/${profile.raids} raids`} />
              </div>
            </article>

            <article style={{ ...panelStyle, padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', margin: '0 0 1rem', textTransform: 'uppercase' }}>Lectura tactica</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <ScoreRow label="Nivel PMC" value={progression.levelScore} />
                <ScoreRow label="Progreso de quests" value={progression.questScore} />
                <ScoreRow label="Hideout" value={progression.hideoutScore} />
                <ScoreRow label="Items Kappa" value={progression.kappaScore} />
                <ScoreRow label="Supervivencia" value={progression.survivalScore} />
              </div>
            </article>

            <article style={{ ...panelStyle, padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', margin: '0 0 1rem', textTransform: 'uppercase' }}>Siguiente prioridad</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--tk-text-muted)', lineHeight: 1.65 }}>
                {recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--tk-text-muted)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>{children}</div>;
}

function ProgressBar({ value }) {
  return (
    <div style={{ height: '9px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: 'var(--tk-green)' }} />
    </div>
  );
}

function StatCard({ label, value, meta }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '1rem' }}>
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '900', textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ color: '#fff', display: 'block', fontSize: '1.4rem', marginTop: '0.25rem' }}>{value}</strong>
      <span style={{ color: 'var(--tk-green)', display: 'block', marginTop: '0.25rem', fontWeight: '800' }}>{meta}</span>
    </div>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '145px 1fr 42px', gap: '0.75rem', alignItems: 'center' }}>
      <strong style={{ color: '#fff' }}>{label}</strong>
      <ProgressBar value={value} />
      <span style={{ color: 'var(--tk-green)', fontWeight: '900', textAlign: 'right' }}>{value}%</span>
    </div>
  );
}
