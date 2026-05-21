export default function HideoutStationList({
  hideoutProgress,
  estaciones,
  estacionSeleccionada,
  stationAvailability,
  nivelesConstruidos,
  setEstacionSeleccionada,
  setNivelObjetivo
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3
        style={{
          fontSize: '0.85rem',
          color: 'var(--tk-text-muted)',
          fontWeight: '800',
          letterSpacing: '2px',
          marginBottom: '0.5rem',
          textTransform: 'uppercase'
        }}
      >
        SECCIONES
      </h3>

      <div
        style={{
          background: 'rgba(0,0,0,0.28)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '0.9rem',
          display: 'grid',
          gap: '0.45rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: '900' }}>
          <span>Progreso</span>
          <span style={{ color: 'var(--tk-green)' }}>{hideoutProgress.builtLevels}/{hideoutProgress.totalLevels}</span>
        </div>
        <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${hideoutProgress.totalLevels ? Math.round((hideoutProgress.builtLevels / hideoutProgress.totalLevels) * 100) : 0}%`,
              height: '100%',
              background: 'var(--tk-green)'
            }}
          />
        </div>
        <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800', fontSize: '0.78rem' }}>
          {hideoutProgress.available} mejora(s) desbloqueada(s)
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.65rem',
          maxHeight: '700px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {estaciones.map((est) => {
          const activo = estacionSeleccionada?.id === est.id;
          const availability = stationAvailability(est);
          const builtLevel = nivelesConstruidos[est.id] || 0;

          return (
            <button
              key={est.id}
              onClick={() => {
                setEstacionSeleccionada(est);
                setNivelObjetivo(est.levels?.[0]?.level || 1);
              }}
              title={est.name}
              style={{
                minHeight: '110px',
                backgroundColor: activo ? 'rgba(26,176,21,0.10)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${activo ? 'var(--tk-green)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px',
                padding: '0.75rem 0.5rem',
                color: '#fff',
                fontFamily: "'Rajdhani', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.18s ease-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: activo ? '0 0 18px rgba(26,176,21,0.18)' : 'none'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {est.imageLink ? (
                  <img
                    src={est.imageLink}
                    alt={est.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      filter: activo ? 'brightness(1.15)' : 'brightness(0.85)'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '1.4rem' }}>H</span>
                )}
              </div>

              <span
                style={{
                  maxWidth: '100%',
                  fontSize: '0.76rem',
                  fontWeight: '800',
                  lineHeight: '1.05',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  color: activo ? '#fff' : 'rgba(255,255,255,0.78)',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {est.name}
              </span>

              <span
                style={{
                  fontSize: '0.68rem',
                  color: availability.status === 'blocked' ? '#ffcf66' : activo ? 'var(--tk-green)' : 'var(--tk-text-muted)',
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  fontWeight: '800'
                }}
              >
                {builtLevel}/{est.levels?.length || 0} - {availability.text}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
