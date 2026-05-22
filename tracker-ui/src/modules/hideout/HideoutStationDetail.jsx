import { useTranslation } from 'react-i18next';
import {
  formatRublos,
  getRequirementCount,
  getRequirementKey,
  getRequirementPrice,
  isFirRequirement
} from './hideoutUtils';

export default function HideoutStationDetail({
  estacionSeleccionada,
  modoMercado,
  nivelObjetivo,
  setNivelObjetivo,
  nivelesConstruidos,
  setStationBuiltLevel,
  stationAvailability,
  itemStats,
  datosNivel,
  itemRequirements,
  stationRequirements,
  skillRequirements,
  traderRequirements,
  itemsMarcados,
  toggleItem
}) {
  const { t } = useTranslation();

  if (!estacionSeleccionada) return null;

  return (
    <section
      style={{
        backgroundColor: 'var(--tk-glass)',
        backdropFilter: 'blur(25px)',
        border: '1px solid var(--tk-glass-border)',
        borderRadius: '12px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '1.25rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              color: 'var(--tk-green)',
              letterSpacing: '1.5px'
            }}
          >
            {t('hideoutModule.detail.targetLevel', { mode: modoMercado })}
          </span>

          <h3
            style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#fff',
              margin: '0.2rem 0 0 0'
            }}
          >
            {estacionSeleccionada.name.toUpperCase()}
          </h3>
          {stationAvailability(estacionSeleccionada).blockedBy.length > 0 && (
            <p style={{ color: '#ffcf66', margin: '0.45rem 0 0', fontWeight: '800' }}>
              {t('hideoutModule.detail.blockedBy')}{' '}
              {stationAvailability(estacionSeleccionada).blockedBy
                .map((req) => t('hideoutModule.detail.stationLevel', { name: req.station?.name, level: req.level }))
                .join(', ')}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.65rem', justifyItems: 'end' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {estacionSeleccionada.levels?.map((level) => (
              <button
                key={level.level}
                onClick={() => setNivelObjetivo(level.level)}
                style={{
                  backgroundColor: nivelObjetivo === level.level ? 'var(--tk-green)' : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${
                    nivelObjetivo === level.level ? 'var(--tk-green)' : 'var(--tk-glass-border)'
                  }`,
                  color: nivelObjetivo === level.level ? '#000' : '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                L{level.level}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{ color: 'var(--tk-text-muted)', fontWeight: '900', letterSpacing: '0.8px' }}>
              {t('hideoutModule.detail.built')}:
            </span>
            <select
              value={nivelesConstruidos[estacionSeleccionada.id] || 0}
              onChange={(event) => setStationBuiltLevel(estacionSeleccionada.id, Number(event.target.value))}
              style={{
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                padding: '0.45rem 0.65rem',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: '900'
              }}
            >
              <option value={0}>{t('hideoutModule.detail.notBuilt')}</option>
              {estacionSeleccionada.levels?.map((level) => (
                <option key={level.level} value={level.level}>
                  {t('hideoutModule.detail.levelOption', { level: level.level })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.02)'
        }}
      >
        <StatBlock
          label={t('hideoutModule.detail.budget', { mode: modoMercado })}
          value={itemStats.total > 0 ? formatRublos(itemStats.total) : t('hideoutModule.detail.noCost')}
          highlight={itemStats.total > 0}
        />
        <StatBlock
          label={t('hideoutModule.detail.pendingChecklist')}
          value={itemStats.pending > 0 ? formatRublos(itemStats.pending) : t('hideoutModule.detail.completeNoCost')}
          highlight={itemStats.pending > 0}
        />
        <StatBlock
          label={t('hideoutModule.detail.constructionTime')}
          value={formatConstructionTimeLabel(datosNivel?.constructionTime, t)}
        />
        <StatBlock
          label={t('hideoutModule.detail.materials')}
          value={t('hideoutModule.detail.materialsMarked', {
            completed: itemStats.completed,
            total: itemRequirements.length
          })}
          detail={
            itemStats.fir > 0
              ? t('hideoutModule.detail.firRequirementCount', { count: itemStats.fir })
              : t('hideoutModule.detail.noFir')
          }
        />
      </div>

      <RequirementSection
        title={t('hideoutModule.detail.requiredStations')}
        empty={t('hideoutModule.detail.noRequiredStations')}
      >
        {stationRequirements.map((req) => (
          <RequirementPill key={req.id} tone="green">
            {req.station?.name} <strong>{t('hideoutModule.detail.levelShort', { level: req.level })}</strong>
          </RequirementPill>
        ))}
      </RequirementSection>

      <RequirementSection
        title={t('hideoutModule.detail.tradersSkills')}
        empty={t('hideoutModule.detail.noTradersSkills')}
      >
        {traderRequirements.map((req) => (
          <RequirementPill key={req.id || `${req.trader?.name}-${req.value}`} tone="amber">
            {req.trader?.name} <strong>{t('hideoutModule.detail.levelShort', { level: req.value || req.level })}</strong>
          </RequirementPill>
        ))}
        {skillRequirements.map((req) => (
          <RequirementPill key={req.id || `${req.skill?.name}-${req.level}`} tone="green">
            {req.skill?.name || req.name} <strong>{t('hideoutModule.detail.levelShort', { level: req.level })}</strong>
          </RequirementPill>
        ))}
      </RequirementSection>

      <div>
        <h4
          style={{
            fontSize: '0.85rem',
            color: 'var(--tk-text-muted)',
            fontWeight: '800',
            letterSpacing: '1px',
            marginBottom: '1rem',
            textTransform: 'uppercase'
          }}
        >
          {t('hideoutModule.detail.requiredObjects')}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {itemRequirements.map((req) => {
            const precioUnidad = getRequirementPrice(req);
            const count = getRequirementCount(req);
            const key = getRequirementKey(modoMercado, estacionSeleccionada.id, nivelObjetivo, req);
            const checked = Boolean(itemsMarcados[key]);
            const requiresFir = isFirRequirement(req);

            return (
              <button
                type="button"
                key={key}
                onClick={() => toggleItem(req)}
                style={{
                  backgroundColor: checked ? 'rgba(26,176,21,0.08)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${checked ? 'rgba(26,176,21,0.34)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Rajdhani', sans-serif",
                  opacity: checked ? 0.72 : 1,
                  transition: 'all 0.18s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1px solid ${checked ? 'var(--tk-green)' : 'rgba(255,255,255,0.26)'}`,
                      background: checked ? 'var(--tk-green)' : 'rgba(255,255,255,0.04)',
                      color: '#061006',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      flexShrink: 0
                    }}
                  >
                    {checked ? '✓' : ''}
                  </span>

                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      flexShrink: 0
                    }}
                  >
                    {req.item?.iconLink ? (
                      <img
                        src={req.item.iconLink}
                        alt={req.item?.shortName || req.item?.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ color: 'var(--tk-text-muted)', fontWeight: '900' }}>?</span>
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '1.05rem',
                        textDecoration: checked ? 'line-through' : 'none'
                      }}
                    >
                      {req.item?.name}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginTop: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--tk-text-muted)',
                        fontWeight: '800'
                      }}
                    >
                      <span>
                        {t('hideoutModule.detail.priceEach', {
                          mode: modoMercado,
                          price: precioUnidad > 0 ? formatRublos(precioUnidad) : '-'
                        })}
                      </span>
                      <span
                        style={{
                          color: requiresFir ? '#ffcf66' : 'var(--tk-green)',
                          border: `1px solid ${requiresFir ? 'rgba(255,207,102,0.28)' : 'rgba(26,176,21,0.22)'}`,
                          background: requiresFir ? 'rgba(255,207,102,0.08)' : 'rgba(26,176,21,0.07)',
                          borderRadius: '999px',
                          padding: '0 0.45rem'
                        }}
                      >
                        {requiresFir ? t('hideoutModule.detail.firRequired') : t('hideoutModule.detail.fleaOk')}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                  <span style={{ color: 'var(--tk-green)' }}>x{count}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    {precioUnidad > 0 ? formatRublos(precioUnidad * count) : '-'}
                  </div>
                </div>
              </button>
            );
          })}

          {itemRequirements.length === 0 && (
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem' }}>
              {t('hideoutModule.detail.noMaterials')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function formatConstructionTimeLabel(seconds, t) {
  if (!seconds) return t('hideoutModule.detail.immediate');

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours <= 0) return t('hideoutModule.detail.minutes', { minutes });
  if (minutes <= 0) return t('hideoutModule.detail.hours', { hours });
  return t('hideoutModule.detail.hoursMinutes', { hours, minutes });
}

function StatBlock({ label, value, detail, highlight = false }) {
  return (
    <div>
      <span
        style={{
          fontSize: '0.78rem',
          color: 'var(--tk-text-muted)',
          fontWeight: '800',
          display: 'block',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </span>
      <div
        style={{
          fontSize: '1.55rem',
          fontWeight: '900',
          color: highlight ? 'var(--tk-green)' : '#fff',
          marginTop: '0.3rem'
        }}
      >
        {value}
      </div>
      {detail && <p style={{ color: 'var(--tk-text-muted)', margin: '0.15rem 0 0', fontWeight: '700' }}>{detail}</p>}
    </div>
  );
}

function RequirementSection({ title, empty, children }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div>
      <h4
        style={{
          fontSize: '0.85rem',
          color: 'var(--tk-text-muted)',
          fontWeight: '800',
          letterSpacing: '1px',
          marginBottom: '0.8rem',
          textTransform: 'uppercase'
        }}
      >
        {title}
      </h4>
      {hasChildren ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>{children}</div>
      ) : (
        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{empty}</p>
      )}
    </div>
  );
}

function RequirementPill({ children, tone = 'green' }) {
  const isAmber = tone === 'amber';

  return (
    <div
      style={{
        backgroundColor: isAmber ? 'rgba(255,207,102,0.08)' : 'rgba(26,176,21,0.07)',
        border: `1px solid ${isAmber ? 'rgba(255,207,102,0.2)' : 'rgba(26,176,21,0.18)'}`,
        padding: '0.6rem 1rem',
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: '#fff',
        fontWeight: '800'
      }}
    >
      {children}
    </div>
  );
}
