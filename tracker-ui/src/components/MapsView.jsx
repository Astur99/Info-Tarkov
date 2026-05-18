import { useState } from 'react';

export default function MapsView({ onViewChange }) {
  // Estado inicial fijado en Ground Zero como punto de partida oficial en la versión 1.0
  const [mapaActivo, setMapaActivo] = useState('groundzero');

  // Pool cartográfico definitivo ordenado por progresión de la 1.0 sin labels redundantes
  const mapasDisponibles = [
    { id: 'groundzero', name: 'GROUND ZERO', url: 'https://reemr.se/ground-zero/#gid=1&pid=2' },
    { id: 'streets', name: 'STREETS', url: 'https://reemr.se/streetsoftarkov/#gid=1&pid=2' },
    { id: 'factory', name: 'FACTORY', url: 'https://reemr.se/factory/#gid=1&pid=2' },
    { id: 'customs', name: 'CUSTOMS', url: 'https://reemr.se/customs/#gid=1&pid=2' },
    { id: 'woods', name: 'WOODS', url: 'https://reemr.se/woods/#gid=1&pid=2' },
    { id: 'interchange', name: 'INTERCHANGE', url: 'https://reemr.se/interchange/#gid=1&pid=2' },
    { id: 'reserve', name: 'RESERVE', url: 'https://reemr.se/reserve/#gid=1&pid=2' },
    { id: 'shoreline', name: 'SHORELINE', url: 'https://reemr.se/shoreline/#gid=1&pid=2' },
    { id: 'lighthouse', name: 'LIGHTHOUSE', url: 'https://reemr.se/lighthouse/#gid=1&pid=2' },
    { id: 'labyrinth', name: 'LABYRINTH', url: 'https://reemr.se/labyrinth/#gid=1&pid=2' },
    { id: 'terminal', name: 'TERMINAL', url: 'https://reemr.se/terminal/#gid=1&pid=2' },
    { id: 'transits', name: 'TRANSITS', url: 'https://reemr.se/transit/#gid=1&pid=2' }
  ];

  // Buscamos los metadatos del mapa seleccionado para proyectar el visor
  const datosMapaActual = mapasDisponibles.find(m => m.id === mapaActivo) || mapasDisponibles[0];

  return (
    <div className="fade-in-slide" style={{ padding: '6rem 2rem 4rem 2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* CABECERA TÁCTICA */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>CARTOGRAFÍA TÁCTICA</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Mapas interactivos, zonas de interes, spots de misiones, spawns y rutas de extracción.
          </p>
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
          VOLVER AL MENÚ
        </button>
      </header>

      {/* REJILLA DE SELECCIÓN DE MAPAS (SOLO NOMBRES EN GRANDE) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {mapasDisponibles.map((mapa) => {
          const seleccionado = mapa.id === mapaActivo;
          return (
            <button
              key={mapa.id}
              onClick={() => setMapaActivo(mapa.id)}
              style={{
                backgroundColor: seleccionado ? 'rgba(255,255,255,0.04)' : 'var(--tk-glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: seleccionado ? '1px solid var(--tk-green)' : '1px solid var(--tk-glass-border)',
                borderRadius: '10px',
                padding: '1.5rem 1.2rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s var(--tk-ease)',
                boxShadow: seleccionado ? '0 0 20px rgba(26,176,21,0.12)' : '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '700', color: seleccionado ? 'var(--tk-green)' : '#fff', letterSpacing: '1px' }}>
                {mapa.name}
              </span>
            </button>
          );
        })}
      </section>

      {/* VISOR SATELITAL PRINCIPAL */}
      <section 
        style={{ 
          backgroundColor: 'var(--tk-glass)', 
          border: '1px solid var(--tk-glass-border)', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 15px 45px rgba(0,0,0,0.4)'
        }}
      >
        {/* Barra de estado */}
        <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--tk-green)', borderRadius: '50%', boxShadow: '0 0 8px var(--tk-green)' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', letterSpacing: '1px' }}>
              PROYECTANDO FEED: {datosMapaActual.name}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
            SISTEMA INTERACTIVO DE NAVEGACIÓN
          </span>
        </div>

        {/* Visor Iframe */}
        <div style={{ width: '100%', height: '75vh', backgroundColor: '#0d0e12' }}>
          <iframe
            src={datosMapaActual.url}
            title={`Mapa de ${datosMapaActual.name}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
            allow="fullscreen"
          />
        </div>
      </section>

    </div>
  );
}