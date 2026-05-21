import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prestigeIcons, prestigeLevels, requirementGroups, STORAGE_KEY } from './prestigeData';

const panelStyle = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
};

const getRequirementId = (prestigeId, groupKey, itemKey) => `${prestigeId}:${groupKey}:${itemKey}`;

export default function PrestigeModule({ onViewChange }) {
  const { t } = useTranslation();
  const [selectedPrestigeId, setSelectedPrestigeId] = useState(prestigeLevels[0].id);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const selectedPrestige = prestigeLevels.find((prestige) => prestige.id === selectedPrestigeId) || prestigeLevels[0];
  const selectedPrestigeIcon = prestigeIcons[selectedPrestige.level];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const progress = useMemo(() => {
    const allRequirements = requirementGroups.flatMap((group) =>
      selectedPrestige.groups[group.key].map((itemKey) => getRequirementId(selectedPrestige.id, group.key, itemKey))
    );
    const realRequirements = allRequirements.filter((id) => !id.endsWith(':notRequired'));
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
              {t('prestigeModule.eyebrow')}
            </p>
            <div
              style={{
                display: 'inline-flex',
                marginBottom: '0.6rem',
                color: '#ffcf66',
                background: 'rgba(255,207,102,0.08)',
                border: '1px solid rgba(255,207,102,0.28)',
                borderRadius: '999px',
                padding: '0.25rem 0.65rem',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              {t('prestigeModule.pvpOnly')}
            </div>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.7rem', textTransform: 'uppercase' }}>
              {t('prestigeModule.title')}
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '820px', lineHeight: 1.6 }}>
              {t('prestigeModule.subtitle')}
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
            {t('common.backToMenu')}
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
                <strong style={{ display: 'block', fontSize: '1.2rem' }}>
                  {t('prestigeModule.cardTitle', { level: prestige.level })}
                </strong>
                <span style={{ fontWeight: '800', opacity: 0.78 }}>
                  {t('prestigeModule.pmcLevel', { level: prestige.pmcLevel })}
                </span>
              </button>
            );
          })}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem', alignItems: 'start' }}>
          <article style={{ ...panelStyle, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>
                  {t('prestigeModule.cardTitle', { level: selectedPrestige.level })}
                </h2>
                <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0' }}>
                  {t('prestigeModule.detailSubtitle', {
                    level: selectedPrestige.pmcLevel,
                    money: t(`prestigeModule.money.${selectedPrestige.moneyKey}`)
                  })}
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
                  <h3 style={{ color: '#fff', margin: '0 0 0.65rem', fontSize: '1rem', textTransform: 'uppercase' }}>
                    {t(`prestigeModule.groups.${group.labelKey}`)}
                  </h3>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {selectedPrestige.groups[group.key].map((itemKey) => {
                      const id = getRequirementId(selectedPrestige.id, group.key, itemKey);
                      const isDisabled = itemKey === 'notRequired';
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
                          <span>{t(`prestigeModule.requirements.${itemKey}`)}</span>
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
              <h3 style={{ color: '#fff', marginTop: 0 }}>{t('prestigeModule.summaryTitle')}</h3>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55, margin: 0 }}>
                {t('prestigeModule.summaryBody', { done: progress.done, total: progress.total })}
              </p>
            </article>

            <article style={{ ...panelStyle, padding: '1.25rem' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>{t('prestigeModule.rewardsTitle')}</h3>
              <ul style={{ color: 'var(--tk-text-muted)', paddingLeft: '1.1rem', lineHeight: 1.55, marginBottom: 0 }}>
                {selectedPrestige.rewards.map((rewardKey) => (
                  <li key={rewardKey}>{t(`prestigeModule.rewards.${rewardKey}`)}</li>
                ))}
              </ul>
            </article>

            <article style={{ ...panelStyle, padding: '1.25rem' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>{t('prestigeModule.noteTitle')}</h3>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55, margin: 0 }}>
                {t('prestigeModule.noteBody')}
              </p>
            </article>

            <article
              style={{
                ...panelStyle,
                minHeight: '270px',
                padding: '1.25rem',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '18% 12%',
                  background: 'radial-gradient(circle, rgba(187,211,169,0.14), transparent 62%)',
                  filter: 'blur(16px)'
                }}
              />
              <div style={{ position: 'relative', display: 'grid', justifyItems: 'center', gap: '0.65rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--tk-green)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  {t('prestigeModule.insigniaTitle')}
                </span>
                <div
                  style={{
                    width: 'min(220px, 70vw)',
                    aspectRatio: '1',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '8px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.18))',
                    border: '1px solid rgba(255,255,255,0.07)'
                  }}
                >
                  <img
                    src={selectedPrestigeIcon}
                    alt={t('prestigeModule.insigniaAlt', { level: selectedPrestige.level })}
                    style={{
                      width: '88%',
                      height: '88%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 18px rgba(187,211,169,0.18))'
                    }}
                  />
                </div>
                <strong style={{ color: '#fff', fontSize: '1.25rem' }}>
                  {t('prestigeModule.cardTitle', { level: selectedPrestige.level })}
                </strong>
              </div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
