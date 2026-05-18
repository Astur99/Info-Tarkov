import { useEffect, useMemo, useState } from 'react';

const SERVICES = [
  'Website',
  'Forum',
  'Authentication',
  'Launcher',
  'Group lobby',
  'Trading',
  'Matchmaking',
  'Friends and msg',
  'Inventory operations'
];

export default function ServerStatus({ onViewChange }) {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consulta limpia al nodo oficial de estados de tarkov.dev
  const loadStatus = () => {
    setLoading(true);
    setError(null);

    const queryStatus = JSON.stringify({
      query: `
        query GetServerStatus {
          vanguardStatus {
            name
            status
          }
        }
      `
    });

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: queryStatus
    })
      .then(res => res.json())
      .then(result => {
        const statuses = result?.data?.vanguardStatus;
        
        if (Array.isArray(statuses) && statuses.length > 0) {
          setApiData(statuses);
          setError(null);
        } else {
          setApiData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener el estado:", err);
        setError("Error de red al conectar con el radar de servidores.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Mapeamos tus servicios emparejándolos con la respuesta real de la API
  const parsedServices = useMemo(() => {
    const traduccionServicios = {
      'website': 'SITIO WEB',
      'forum': 'FORO OFICIAL',
      'authentication': 'AUTENTICACIÓN / LOGIN',
      'launcher': 'LANZADOR (LAUNCHER)',
      'group lobby': 'CREACIÓN DE GRUPOS',
      'trading': 'COMERCIO / TRADERS',
      'matchmaking': 'BUSQUEDA DE PARTIDA',
      'friends and msg': 'MENSAJERÍA Y AMIGOS',
      'inventory operations': 'ACCIONES DE INVENTARIO'
    };

    return SERVICES.map(serviceName => {
      const matched = apiData.find(
        item => item?.name?.toLowerCase() === serviceName.toLowerCase()
      );

      const rawStatus = matched ? matched.status.toLowerCase() : 'ok';

      let label = 'OPERATIVO';
      let color = 'var(--tk-green)';
      let level = 'good';

      if (rawStatus.includes('outage') || rawStatus.includes('down') || rawStatus.includes('issue')) {
        label = 'CAÍDO';
        color = '#ff4d4d';
        level = 'bad';
      } else if (rawStatus.includes('maintenance') || rawStatus.includes('update')) {
        label = 'MANTENIMIENTO';
        color = '#7ab7ff';
        level = 'warn';
      } else if (rawStatus.includes('degraded') || rawStatus.includes('slow')) {
        label = 'DEGRADADO';
        color = '#ffcf66';
        level = 'warn';
      }

      const keyLimpia = serviceName.toLowerCase();
      const nameTraducido = traduccionServicios[keyLimpia] || serviceName.toUpperCase();

      return {
        name: nameTraducido,
        label,
        color,
        level
      };
    });
  }, [apiData]);

  // Cálculo en tiempo real de cuántos servidores están en estado 'good' (OPERATIVO)
  const servidoresOperativos = useMemo(() => {
    return parsedServices.filter(s => s.level === 'good').length;
  }, [parsedServices]);

  if (loading && apiData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '12rem', color: 'var(--tk-green)', fontSize: '1.2rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
        EXTRAYENDO DATOS DE ESTADO DE SERVICIO / RECOPILANDO TELEMETRÍA...
      </div>
    );
  }

  return (
    <div className="fade-in-slide" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif", position: 'relative' }}>
      
      {/* COMPONENTE: RELOJ Y CONTADOR DE PUNTOS TÁCTICO */}
      <TacticalHeaderTracker activos={servidoresOperativos} totales={SERVICES.length} />

      {/* CABECERA DE OPERACIONES */}
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '70%' }}>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>TELEMETRÍA DE RED / BATTLEYE</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Estado en tiempo real de los servidores centrales, pasarelas de autenticación y servicios lógicos de Battlestate Games.
          </p>
        </div>
        <button 
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', zIndex: 10 }}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(255,77,77,0.05)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', fontWeight: '600', letterSpacing: '0.5px' }}>
          ⚠️ ADVERTENCIA: {error}
        </div>
      )}

      {/* REJILLA DE ESTADOS CRISTALIZADA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {parsedServices.map((service, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--tk-glass)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: `1px solid ${service.level !== 'good' ? service.color : 'var(--tk-glass-border)'}`,
              borderRadius: '8px',
              padding: '1.75rem',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: service.level !== 'good' ? `0 0 15px ${service.color}05` : '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{service.name}</h3>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: service.color,
                  boxShadow: `0 0 12px ${service.color}`,
                  flexShrink: 0,
                  marginTop: '4px'
                }}
              />
            </div>

            <strong style={{ color: service.color, letterSpacing: '1.5px', fontSize: '1.1rem', fontWeight: '800' }}>
              {service.label}
            </strong>
          </div>
        ))}
      </div>

      {/* BOTÓN DE ACTUALIZACIÓN MANUAL */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button
          onClick={loadStatus}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#222' : 'var(--tk-green)',
            border: 'none',
            borderRadius: '6px',
            color: loading ? '#aaa' : '#000',
            fontWeight: '800',
            letterSpacing: '1px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Rajdhani', sans-serif",
            padding: '1rem 2rem',
            fontSize: '1rem',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: loading ? 'none' : '0 0 20px rgba(26, 176, 21, 0.2)'
          }}
          onMouseEnter={(e) => { if(!loading) e.target.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { if(!loading) e.target.style.opacity = '1'; }}
        >
          {loading ? 'RE-SINCRONIZANDO...' : 'REFRESCAR ESTADO DE SERVICIO'}
        </button>
      </div>

    </div>
  );
}

// SUBCOMPONENTE DE ENTORNO: RECONSTRUIBLE CON RELOJ LOCAL Y PUNTUACIÓN DE RED
function TacticalHeaderTracker({ activos, totales }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHora = (t) => {
    return t.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatFecha = (t) => {
    return t.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  };

  const todoOperacional = activos === totales;

  return (
    <div style={{
      position: 'absolute',
      top: '2.5rem',
      right: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2.5rem',
      fontFamily: "'Rajdhani', sans-serif",
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      padding: '0.6rem 1.5rem',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.03)'
    }}>
      {/* CRONÓMETRO DE HORA LOCAL */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--tk-text-muted)', letterSpacing: '1.5px' }}>HORA // ZONA_LOCAL</span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '1px' }}>
          {formatHora(time)} <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)', fontWeight: '500' }}>{formatFecha(time)}</span>
        </span>
      </div>

      {/* SEPARADOR INDUSTRIAL */}
      <div style={{ width: '1px', height: '26px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* MARCADOR DE PUNTOS / SERVIDORES OPERATIVOS */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--tk-text-muted)', letterSpacing: '1.5px' }}>ESTADO DE SERVICIOS</span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: todoOperacional ? 'var(--tk-green)' : '#ffcf66', letterSpacing: '1px', marginTop: '1px' }}>
          SISTEMAS {activos} OF {totales}
        </span>
      </div>
    </div>
  );
}