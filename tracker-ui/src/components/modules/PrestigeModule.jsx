import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'info_tarkov_prestige_checklist';

const prestigeLevels = [
  {
    id: 'prestige-1',
    level: 1,
    pmcLevel: 25,
    money: '10,000,000 rublos',
    quests: ['New Beginning (Prestige 1)'],
    story: ['No requerido'],
    skills: ['No requerido'],
    hideout: ['Intelligence Center nivel 1', 'Security nivel 2', 'Rest Space nivel 2'],
    rewards: ['Dogtag y armband Prestige 1', 'Logro Prestigious', '+1 Charisma', '5% de skills y weapon mastery', 'Ventana de transferencia 8x3']
  },
  {
    id: 'prestige-2',
    level: 2,
    pmcLevel: 30,
    money: '15,000,000 rublos',
    quests: ['New Beginning (Prestige 2)'],
    story: ['Completar Tour'],
    skills: ['Strength nivel 10', 'Endurance nivel 10', 'Charisma nivel 7'],
    hideout: ['Intelligence Center nivel 1', 'Security nivel 2', 'Rest Space nivel 2'],
    rewards: ['Dogtag y armband Prestige 2', 'Logro More Prestigious', '10% de skills y weapon mastery', 'Ventana de transferencia 8x4', '+1 daily y +1 weekly operational task']
  },
  {
    id: 'prestige-3',
    level: 3,
    pmcLevel: 35,
    money: '15,000,000 rublos',
    quests: ['New Beginning (Prestige 3)'],
    story: ['Completar Tour', 'Completar Falling Skies'],
    skills: ['Strength nivel 10', 'Endurance nivel 10', 'Charisma nivel 7'],
    hideout: ['Intelligence Center nivel 1', 'Security nivel 2', 'Rest Space nivel 2'],
    rewards: ['Dogtag y armband Prestige 3', 'Logro Keeping Up the Pace', '15% de skills y weapon mastery', 'Ventana de transferencia 8x5', 'Voces BEAR/USEC desbloqueables']
  },
  {
    id: 'prestige-4',
    level: 4,
    pmcLevel: 40,
    money: '15,000,000 rublos',
    quests: ['New Beginning (Prestige 4)'],
    story: ['Completar Tour', 'Obtener Ticket from Tarkov'],
    skills: ['Strength nivel 15', 'Endurance nivel 15', 'Charisma nivel 12'],
    hideout: ['Intelligence Center nivel 1', 'Security nivel 2', 'Rest Space nivel 2'],
    rewards: ['Dogtag y armband Prestige 4', 'Logro Higher and Higher', '20% de skills y weapon mastery', 'Ventana de transferencia 8x6', 'Ropa BEAR/USEC Hawaii']
  },
  {
    id: 'prestige-5',
    level: 5,
    pmcLevel: 47,
    money: '20,000,000 rublos',
    quests: ['New Beginning (Prestige 5)', 'Collector'],
    story: ['Completar Tour', 'Completar They Are Already Here', 'Obtener Ticket from Tarkov'],
    skills: ['Strength nivel 20', 'Endurance nivel 20', 'Charisma nivel 20'],
    hideout: ['Intelligence Center nivel 2', 'Security nivel 3', 'Rest Space nivel 3'],
    rewards: ['Dogtag y armband Prestige 5', 'Logro Five Plus', '25% de skills y weapon mastery', 'Ventana de transferencia 8x7', 'NKVD Finka knife']
  },
  {
    id: 'prestige-6',
    level: 6,
    pmcLevel: 47,
    money: '20,000,000 rublos',
    quests: ['New Beginning (Prestige 6)', 'Collector'],
    story: ['Completar The Ticket'],
    skills: ['Strength nivel 20', 'Endurance nivel 20', 'Charisma nivel 20'],
    hideout: ['Intelligence Center nivel 2', 'Security nivel 3', 'Rest Space nivel 3'],
    rewards: ['Dogtag y armband Prestige 6', 'Logro No Limit to Perfection', '30% de skills y weapon mastery', 'Ventana de transferencia 8x8', 'Secure container Gamma (Loui Peeton)']
  }
];

const requirementGroups = [
  { key: 'quests', label: 'Quests' },
  { key: 'story', label: 'Historia' },
  { key: 'skills', label: 'Skills' },
  { key: 'hideout', label: 'Hideout' }
];

const panelStyle = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
};

const getRequirementId = (prestigeId, groupKey, item) => `${prestigeId}:${groupKey}:${item}`;

export default function PrestigeModule({ onViewChange }) {
  const [selectedPrestigeId, setSelectedPrestigeId] = useState(prestigeLevels[0].id);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const selectedPrestige = prestigeLevels.find((prestige) => prestige.id === selectedPrestigeId) || prestigeLevels[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const progress = useMemo(() => {
    const allRequirements = requirementGroups.flatMap((group) =>
      selectedPrestige[group.key].map((item) => getRequirementId(selectedPrestige.id, group.key, item))
    );
    const realRequirements = allRequirements.filter((id) => !id.endsWith(':No requerido'));
    const done = realRequirements.filter((id) => completed[id]).length;
    return {
      done,
      total: realRequirements.length,
      percent: realRequirements.length ? Math.round((done / realRequirements.length) * 100) : 100
    };
  }, [completed, selectedPrestige]);

  const toggleRequirement = (id) => {
    setCompleted((current) => ({
      ...current,
      [id]: !current[id]
    }));
  };

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        padding: '6rem 2rem 8rem',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <main style={{ width: 'min(1180px, 100%)', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '2rem',
            alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 0.45rem',
                color: 'var(--tk-green)',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              Progresion endgame PVP
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.7rem', textTransform: 'uppercase' }}>
              Prestigios
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '820px', lineHeight: 1.6 }}>
              Requisitos, recompensas y checklist local para preparar cada nivel de prestigio. El sistema de prestigio solo esta disponible en modo PVP.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onViewChange('home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '900',
              letterSpacing: '1px',
              whiteSpace: 'nowrap'
            }}
          >
            VOLVER AL MENU
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {prestigeLevels.map((prestige) => {
            const isActive = prestige.id === selectedPrestige.id;
            return (
              <button
                key={prestige.id}
                type="button"
                onClick={() => setSelectedPrestigeId(prestige.id)}
                style={{
                  ...panelStyle,
                  padding: '1rem',
                  color: isActive ? '#061006' : '#fff',
                  background: isActive ? 'var(--tk-green)' : panelStyle.background,
                  borderColor: isActive ? 'var(--tk-green)' : 'rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                <strong style={{ display: 'block', fontSize: '1.2rem' }}>Prestige {prestige.level}</strong>
                <span style={{ fontWeight: '800', opacity: 0.78 }}>PMC {prestige.pmcLevel}</span>
              </button>
            );
          })}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem', alignItems: 'start' }}>
          <article style={{ ...panelStyle, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>Prestige {selectedPrestige.level}</h2>
                <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0' }}>
                  Nivel PMC {selectedPrestige.pmcLevel} · {selectedPrestige.money}
                </p>
              </div>
              <strong style={{ color: 'var(--tk-green)', fontSize: '1.6rem' }}>{progress.percent}%</strong>
            </div>

            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ width: `${progress.percent}%`, height: '100%', background: 'var(--tk-green)' }} />
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {requirementGroups.map((group) => (
                <div key={group.key}>
                  <h3 style={{ color: '#fff', margin: '0 0 0.65rem', fontSize: '1rem', textTransform: 'uppercase' }}>{group.label}</h3>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {selectedPrestige[group.key].map((item) => {
                      const id = getRequirementId(selectedPrestige.id, group.key, item);
                      const isDisabled = item === 'No requerido';
                      const isDone = Boolean(completed[id]) || isDisabled;

                      return (
                        <label
                          key={id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            color: isDone ? 'var(--tk-green)' : '#fff',
                            background: 'rgba(255,255,255,0.035)',
                            border: `1px solid ${isDone ? 'rgba(26,176,21,0.25)' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: '8px',
                            padding: '0.7rem 0.8rem',
                            cursor: isDisabled ? 'default' : 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            disabled={isDisabled}
                            onChange={() => toggleRequirement(id)}
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside style={{ display: 'grid', gap: '1rem' }}>
            <article style={{ ...panelStyle, padding: '1.25rem' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Resumen</h3>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55, margin: 0 }}>
                {progress.done} de {progress.total} requisitos marcados. El dinero requerido se muestra aparte porque no se trackea automaticamente.
              </p>
            </article>

            <article style={{ ...panelStyle, padding: '1.25rem' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Recompensas destacadas</h3>
              <ul style={{ color: 'var(--tk-text-muted)', paddingLeft: '1.1rem', lineHeight: 1.55, marginBottom: 0 }}>
                {selectedPrestige.rewards.map((reward) => (
                  <li key={reward}>{reward}</li>
                ))}
              </ul>
            </article>

            <article style={{ ...panelStyle, padding: '1.25rem' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Nota</h3>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55, margin: 0 }}>
                Los requisitos pueden cambiar con parches. Datos base revisados contra la wiki oficial de Escape From Tarkov.
              </p>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
