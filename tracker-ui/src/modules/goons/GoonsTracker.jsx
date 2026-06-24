import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';

const PERFILES_GOONS = [
  {
    id: 'knight',
    name: 'KNIGHT',
    avatar: 'https://assets.tarkov.dev/knight-portrait.png'
  },
  {
    id: 'bigPipe',
    name: 'BIG PIPE',
    avatar: 'https://assets.tarkov.dev/big-pipe-portrait.png'
  },
  {
    id: 'birdeye',
    name: 'BIRDEYE',
    avatar: 'https://assets.tarkov.dev/birdeye-portrait.png'
  }
];

const MAPAS_OBJETIVO = [
  { id: 'customs', name: 'Customs' },
  { id: 'woods', name: 'Woods' },
  { id: 'shoreline', name: 'Shoreline' },
  { id: 'lighthouse', name: 'Lighthouse' }
];

export default function GoonsTracker({ onViewChange }) {
  const { t } = useTranslation();
  const [goonData, setGoonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorRadar, setErrorRadar] = useState(null);
  const [modoJuego, setModoJuego] = useState(() => readDefaultPlayableMode().toLowerCase());

  useEffect(() => {
    const controller = new AbortController();

    const escanearUbicacionGoons = async () => {
      setErrorRadar(null);

      try {
        const res = await fetch(`/api/goons-tracker?mode=${modoJuego}`, {
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const payload = await res.json();
        if (!res.ok || payload?.status === 'error') {
          throw new Error(payload?.error || `HTTP ${res.status}`);
        }

        setGoonData(payload);
        if (payload?.status === 'cached' && payload?.warning) {
          setErrorRadar(payload.warning);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(t('goonsModule.consoleCaptureError', { mode: modoJuego.toUpperCase() }), err);
          setErrorRadar(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const initialScan = window.setTimeout(() => {
      setLoading(true);
      escanearUbicacionGoons();
    }, 0);

    const intervaloRadar = setInterval(escanearUbicacionGoons, 120000);

    return () => {
      controller.abort();
      window.clearTimeout(initialScan);
      clearInterval(intervaloRadar);
    };
  }, [modoJuego, t]);

  const comprobarPresencia = (mapId) => {
    return goonData?.activeMapId === mapId;
  };

  const obtenerUltimoReporte = () => {
    if (!goonData?.lastDetected) return t('goonsModule.noReports');

    const fecha = new Date(goonData.lastDetected);

    return fecha.toLocaleString(t('goonsModule.dateLocale'), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const mapaActivoActualmente = () => {
    const mapa = MAPAS_OBJETIVO.find(m => m.id === goonData?.activeMapId);
    return mapa ? mapa.name.toUpperCase() : t('goonsModule.unknownMap');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        fontFamily: "'Rajdhani', sans-serif"
      }}>
        <p style={{
          letterSpacing: '2px',
          color: 'var(--tk-green)',
          fontSize: '1.5rem',
          textTransform: 'uppercase'
        }}>
          {t('goonsModule.loading', { mode: modoJuego.toUpperCase() })}
        </p>
      </div>
    );
  }

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        padding: '6rem 2rem 10rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <header style={{
        marginBottom: '4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '2.2rem',
            letterSpacing: '1.5px',
            fontWeight: '700',
            color: '#fff'
          }}>
            {t('goonsModule.title')}
          </h2>

          <p style={{
            color: 'var(--tk-text-muted)',
            fontSize: '1rem',
            marginTop: '0.3rem'
          }}>
            {t('goonsModule.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '4px',
            borderRadius: '8px'
          }}>
            <button
              onClick={() => setModoJuego('pvp')}
              style={{
                backgroundColor: modoJuego === 'pvp' ? 'var(--tk-red)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                transition: 'all 0.3s var(--tk-ease)',
                boxShadow: modoJuego === 'pvp' ? '0 0 15px rgba(176,21,21,0.4)' : 'none'
              }}
            >
              {t('goonsModule.channel', { mode: 'PVP' })}
            </button>

            <button
              onClick={() => setModoJuego('pve')}
              style={{
                backgroundColor: modoJuego === 'pve' ? 'var(--tk-green)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                transition: 'all 0.3s var(--tk-ease)',
                boxShadow: modoJuego === 'pve' ? '0 0 15px rgba(26,176,21,0.3)' : 'none'
              }}
            >
              {t('goonsModule.channel', { mode: 'PVE' })}
            </button>
          </div>

          <button
            onClick={() => onViewChange('home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '12px 22px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '700',
              letterSpacing: '1px',
              transition: 'all 0.3s',
              fontSize: '0.85rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
          >
            {t('common.backToMenu')}
          </button>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        marginBottom: '5rem'
      }}>
        {PERFILES_GOONS.map((goon) => (
          <div
            key={goon.name}
            style={{
              backgroundColor: 'var(--tk-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '16px',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative'
            }}
          >
            <div style={{
              width: '85px',
              height: '85px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
            }}>
              <img
                src={goon.avatar}
                alt={goon.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(35%) contrast(115%)',
                  transition: 'filter 0.4s var(--tk-ease)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'none'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'grayscale(35%) contrast(115%)'}
              />
            </div>

            <div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#fff',
                margin: '0.1rem 0',
                letterSpacing: '1px'
              }}>
                {goon.name}
              </h3>

              <span style={{
                fontSize: '0.85rem',
                color: 'var(--tk-green)',
                fontWeight: '700',
                letterSpacing: '1px'
              }}>
                {t(`goonsModule.profiles.${goon.id}.role`)}
              </span>
            </div>

            <p style={{
              color: 'var(--tk-text-muted)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              {t(`goonsModule.profiles.${goon.id}.desc`)}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          letterSpacing: '1px',
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
          color: '#fff'
        }}>
          {t('goonsModule.activeChannelGeolocation')}
        </h3>

        <div style={{
          backgroundColor: 'rgba(10,11,14,0.5)',
          border: '1px solid rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div>
            <span style={{
              color: 'var(--tk-text-muted)',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              {t('goonsModule.detectedLocation')}
            </span>

            <div style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              color: 'var(--tk-red)',
              marginTop: '0.3rem',
              letterSpacing: '1px',
              textShadow: '0 0 15px rgba(176,21,21,0.2)'
            }}>
              {mapaActivoActualmente()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              color: 'var(--tk-text-muted)',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              {t('goonsModule.gameMode')}:
            </span>

            <div style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: errorRadar
                ? 'var(--tk-red)'
                : modoJuego === 'pvp'
                  ? 'var(--tk-red)'
                  : 'var(--tk-green)',
              marginTop: '0.3rem',
              letterSpacing: '0.5px'
            }}>
              {errorRadar
                ? t('goonsModule.telemetryError')
                : t('goonsModule.telemetryOk', { mode: modoJuego.toUpperCase() })}
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: 'var(--tk-text-muted)',
              marginTop: '0.2rem'
            }}>
              {errorRadar
                ? t('goonsModule.cachedReport', { report: obtenerUltimoReporte() })
                : t('goonsModule.lastReport', { report: obtenerUltimoReporte() })}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {MAPAS_OBJETIVO.map((mapa) => {
          const bajoAtaque = comprobarPresencia(mapa.id);

          return (
            <div
              key={mapa.id}
              style={{
                backgroundColor: 'var(--tk-glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: bajoAtaque
                  ? '1px solid rgba(176, 21, 21, 0.4)'
                  : '1px solid var(--tk-glass-border)',
                borderRadius: '12px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: bajoAtaque
                  ? '0 0 35px rgba(176, 21, 21, 0.15)'
                  : '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s var(--tk-ease)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '2rem',
                width: '40px',
                height: '2px',
                backgroundColor: bajoAtaque ? 'var(--tk-red)' : 'rgba(255,255,255,0.05)',
                boxShadow: bajoAtaque ? '0 0 10px var(--tk-red)' : 'none'
              }} />

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: bajoAtaque ? 'var(--tk-red)' : 'var(--tk-text-muted)',
                  fontWeight: '700',
                  letterSpacing: '1px'
                }}>
                  {t(`goonsModule.maps.${mapa.id}.label`)}
                </span>

                <h4 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0.3rem 0 0 0',
                  letterSpacing: '0.5px'
                }}>
                  {mapa.name.toUpperCase()}
                </h4>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '2rem'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: bajoAtaque ? 'var(--tk-red)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  boxShadow: bajoAtaque ? '0 0 8px var(--tk-red)' : 'none'
                }} />

                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: bajoAtaque ? 'var(--tk-red)' : 'var(--tk-text-muted)',
                  letterSpacing: '1px'
                }}>
                  {bajoAtaque ? t('goonsModule.confirmedLocation') : t('goonsModule.cleanTransmission')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
