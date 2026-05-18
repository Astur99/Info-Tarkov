import { useState, useEffect } from 'react';

export default function GoonsTracker({ onViewChange }) {
  const [goonData, setGoonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pool de mapas donde pueden spawnear los Goons para renderizar la cuadrícula táctica
  const mapasObjetivo = [
    { id: 'customs', name: 'Customs', label: 'ZONA: ADUANA / DORMITORIOS' },
    { id: 'woods', name: 'Woods', label: 'ZONA: BASE MILITAR SCANAV' },
    { id: 'shoreline', name: 'Shoreline', label: 'ZONA: ESTACIÓN DE RADAR / RESORT' },
    { id: 'lighthouse', name: 'Lighthouse', label: 'ZONA: CHALETS / PLANTA DE TRATAMIENTO' }
  ];

  useEffect(() => {
    const query = `
      {
        goonOutbreaks {
          maps {
            name
          }
          lastDetected
        }
      }
    `;

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query })
    })
      .then(res => res.json())
      .then(response => {
        if (response.data && response.data.goonOutbreaks) {
          setGoonData(response.data.goonOutbreaks);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error de enlace con el radar de Goons:", err);
        setLoading(false);
      });
  }, []);

  // Función lógica para verificar si un mapa concreto tiene presencia Rogue activa
  const comprobarPresencia = (mapName) => {
    if (!goonData || !goonData.length) return false;
    // La API devuelve un array de brotes (outbreaks), miramos si coincide el nombre del mapa
    return goonData.some(outbreak => 
      outbreak.maps.some(m => m.name.toLowerCase() === mapName.toLowerCase())
    );
  };

  // Formateador rápido para la última detección
  const obtenerUltimoReporte = () => {
    if (!goonData || !goonData.length) return "SIN REPORTES RECIENTES";
    const fecha = new Date(goonData[0].lastDetected);
    return fecha.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'Rajdhani', sans-serif" }}>
        <p style={{ letterSpacing: '2px', color: 'var(--tk-green)', fontSize: '1.5rem', textTransform: 'uppercase' }}>
          Sincronizando satélite de telemetría Rogue...
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in-slide" style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* CABECERA TÁCTICA */}
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>DETECTOR OPERATIVO: THE GOONS</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Monitorización de despliegue de Knight, Big Pipe y Birdeye en tiempo real.
          </p>
        </div>
        <button 
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {/* REPORTE GENERAL DE ESTADO */}
      <div style={{ backgroundColor: 'rgba(10,11,14,0.4)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: 'var(--tk-text-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' }}>ÚLTIMA TRANSMISIÓN CAPTADA</span>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--tk-green)', marginTop: '0.2rem', letterSpacing: '0.5px' }}>
            {obtenerUltimoReporte()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--tk-green)', borderRadius: '50%', boxShadow: '0 0 10px var(--tk-green)' }}></span>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>ENLACE SATELITAL ACTIVO</span>
        </div>
      </div>

      {/* REJILLA DE ESCANEO DE MAPAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {mapasObjetivo.map((mapa) => {
          const bajoAtaque = comprobarPresencia(mapa.name);
          return (
            <div 
              key={mapa.id}
              style={{
                backgroundColor: 'var(--tk-glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: bajoAtaque ? '1px solid rgba(176, 21, 21, 0.4)' : '1px solid var(--tk-glass-border)',
                borderRadius: '12px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: bajoAtaque ? '0 0 30px rgba(176, 21, 21, 0.15)' : '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s'
              }}
            >
              {/* Línea decorativa superior superior */}
              <div style={{ position: 'absolute', top: 0, left: '2rem', width: '40px', height: '2px', backgroundColor: bajoAtaque ? 'var(--tk-red)' : 'rgba(255,255,255,0.05)', boxShadow: bajoAtaque ? '0 0 10px var(--tk-red)' : 'none' }}></div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: bajoAtaque ? 'var(--tk-red)' : 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px' }}>
                  {mapa.label}
                </span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff', margin: '0.3rem 0 0 0', letterSpacing: '0.5px' }}>
                  {mapa.name.toUpperCase()}
                </h3>
              </div>

              {/* Indicador Operativo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2rem' }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  backgroundColor: bajoAtaque ? 'var(--tk-red)' : 'rgba(255,255,255,0.1)', 
                  borderRadius: '50%',
                  boxShadow: bajoAtaque ? '0 0 8px var(--tk-red)' : 'none'
                }}></span>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  color: bajoAtaque ? 'var(--tk-red)' : 'var(--tk-text-muted)',
                  letterSpacing: '1px'
                }}>
                  {bajoAtaque ? '⚠️ PRESENCIA CONFIRMADA' : '✓ ZONA DESPEJADA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}