import { useState, useEffect } from 'react';

const PERFILES_GOONS = [
  {
    name: 'KNIGHT',
    role: 'LÍDER DE ESCUADRA / ASALTO',
    desc: 'El cerebro táctico del grupo. Es extremadamente agresivo, viste una icónica máscara de calavera y cargará directo hacia tu posición flanqueando con fuego de sumisión implacable en cuanto detecte tu presencia o la de tu escuadra.',
    avatar: 'https://assets.tarkov.dev/knight-portrait.png'
  },
  {
    name: 'BIG PIPE',
    role: 'SOPORTE PESADO / ARTILLERÍA',
    desc: 'Especialista en demoliciones y fuego de cobertura. Va armado habitualmente con un lanzagranadas múltiple de 40mm M32A1 o ametralladoras pesadas. Proporciona fuego de supresión devastador mientras Knight avanza.',
    avatar: 'https://assets.tarkov.dev/big-pipe-portrait.png'
  },
  {
    name: 'BIRDEYE',
    role: 'RECONOCIMIENTO / TIRADOR',
    desc: 'El francotirador silencioso del trío. Sus pasos se oyen muy poco y abrirá fuego desde largas distancias.',
    avatar: 'https://assets.tarkov.dev/birdeye-portrait.png'
  }
];

const MAPAS_OBJETIVO = [
  { id: 'customs', name: 'Customs', label: 'ZONA: FORTALEZA / DORMITORIOS' },
  { id: 'woods', name: 'Woods', label: 'ZONA: ANTENA / CAMPAMENTO SCAV' },
  { id: 'shoreline', name: 'Shoreline', label: 'ZONA: ESTACIÓN DE RADAR / RESORT' },
  { id: 'lighthouse', name: 'Lighthouse', label: 'ZONA: CHALETS / PLANTA DE TRATAMIENTO' }
];

const URLS_TRACKER = {
  pvp: 'https://www.tarkov-goon-tracker.com/',
  pve: 'https://www.tarkov-goon-tracker.com/pve'
};

function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function extraerMapaDesdeHtml(html) {
  const textoPlano = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizado = normalizarTexto(textoPlano);

  const match = normalizado.match(
    /the goons were last seen on:\s*(customs|woods|shoreline|lighthouse)/i
  );

  if (match?.[1]) return match[1];

  for (const mapa of MAPAS_OBJETIVO) {
    if (normalizado.includes(mapa.id)) return mapa.id;
  }

  return null;
}

function extraerUltimoReporteDesdeHtml(html) {
  const textoPlano = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const matchFecha = textoPlano.match(
    /(?:Customs|Woods|Shoreline|Lighthouse)\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)\s+z/i
  );

  if (!matchFecha?.[1]) return new Date().toISOString();

  const fecha = new Date(`${matchFecha[1]} UTC`);
  return Number.isNaN(fecha.getTime()) ? new Date().toISOString() : fecha.toISOString();
}

export default function GoonsTracker({ onViewChange }) {
  const [goonData, setGoonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorRadar, setErrorRadar] = useState(null);
  const [modoJuego, setModoJuego] = useState('pvp');

  useEffect(() => {
    const controller = new AbortController();

    const escanearUbicacionGoons = async () => {
      setErrorRadar(null);

      try {
        const targetUrl = URLS_TRACKER[modoJuego];
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

        const res = await fetch(proxyUrl, {
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const html = await res.text();
        const activeMapId = extraerMapaDesdeHtml(html);
        const lastDetected = extraerUltimoReporteDesdeHtml(html);

        if (!activeMapId) {
          throw new Error('No se pudo extraer el mapa activo desde el HTML del tracker');
        }

        setGoonData({
          activeMapId,
          lastDetected,
          sourceUrl: targetUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(`Fallo de captura en modo ${modoJuego.toUpperCase()}:`, err);
          setErrorRadar(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    escanearUbicacionGoons();

    const intervaloRadar = setInterval(escanearUbicacionGoons, 120000);

    return () => {
      controller.abort();
      clearInterval(intervaloRadar);
    };
  }, [modoJuego]);

  const comprobarPresencia = (mapId) => {
    return goonData?.activeMapId === mapId;
  };

  const obtenerUltimoReporte = () => {
    if (!goonData?.lastDetected) return 'SIN REPORTES OPERATIVOS';

    const fecha = new Date(goonData.lastDetected);

    return fecha.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const mapaActivoActualmente = () => {
    const mapa = MAPAS_OBJETIVO.find(m => m.id === goonData?.activeMapId);
    return mapa ? mapa.name.toUpperCase() : 'DESCONOCIDO (FUERA DE COBERTURA)';
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
          Extrayendo datos de los Goons en modo {modoJuego.toUpperCase()}...
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
            GOONS TRACKER
          </h2>

          <p style={{
            color: 'var(--tk-text-muted)',
            fontSize: '1rem',
            marginTop: '0.3rem'
          }}>
            Información de los Goons y de su última ubicación conocida.
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
              CANAL PVP
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
              CANAL PVE
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
            VOLVER
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
                {goon.role}
              </span>
            </div>

            <p style={{
              color: 'var(--tk-text-muted)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              {goon.desc}
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
          GEOLOCALIZACIÓN EN CANAL ACTIVO
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
              UBICACIÓN ACTUAL DETECTADA
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
              MODO DE JUEGO:
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
                ? '⚠ ERROR DE TELEMETRÍA'
                : `✓ ${modoJuego.toUpperCase()}`}
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: 'var(--tk-text-muted)',
              marginTop: '0.2rem'
            }}>
              {errorRadar ? errorRadar : `Último Reporte: ${obtenerUltimoReporte()}`}
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
                  {mapa.label}
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
                  {bajoAtaque ? '⚠️ REPORTE: UBICACIÓN CONFIRMADA' : '✓ TRANSMISIÓN LIMPIA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}