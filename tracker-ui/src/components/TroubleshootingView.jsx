// src/components/TroubleshootingView.jsx
export default function TroubleshootingView({ onViewChange }) {
    const incidentes = [
      {
        code: 'ERR_GRAPH_ISO_V1',
        title: 'Aislamiento de Coincidencias en Buscador',
        symptom: 'Al buscar términos compartidos (como por ejemplo "Crisis"), la app filtra correctamente pero solo expone la primera misión con la que hace concordancia de datos.',
        fix: 'Por ahora, Si buscas una misión con un nombre común o compartido (como "Crisis"), escribe la palabra en el buscador y ve haciendo clic en las pestañas de los diferentes comerciantes (Traders) para revisar las coincidencias de cada uno.'
      },
      {
        code: 'SYS_LOCALSTORAGE_SYNC',
        title: 'Persistencia del Progreso Táctico',
        symptom: 'Las misiones marcadas como completadas desaparecen al borrar cookies o cambiar de buscador. El registro persistente del árbol se procesa exclusivamente de forma local utilizando la memoria local (localStorage) del navegador web activo, sin sincronización del lado del servidor.',
        fix: 'Evita borrar cookies, el uso de extensiones de limpieza agresiva de caché o la navegación en modo incógnito si deseas conservar tu historial de incursiones de cara al Kappa.'
      }
    ];
  
    return (
      <div className="fade-in-slide" style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>LOG DE ERRORES CONOCIDOS</h2>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>Reporte de anomalías conocidas en la app y de soluciones aplicables. Se sigue trabajando en los fixes.</p>
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
  
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {incidentes.map((inc) => (
            <div 
              key={inc.code}
              style={{ backgroundColor: 'var(--tk-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--tk-glass-border)', borderRadius: '12px', padding: '2.5rem', position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: '1.5rem', right: '2.5rem', color: 'var(--tk-red)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', border: '1px solid var(--tk-red)', padding: '3px 8px', borderRadius: '4px' }}>
                {inc.code}
              </div>
              
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {inc.title}
              </h3>
  
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p><strong style={{ color: '#fff', letterSpacing: '0.5px' }}>SÍNTOMA:</strong> <span style={{ color: 'var(--tk-text-muted)' }}>{inc.symptom}</span></p>
                <p><strong style={{ color: 'var(--tk-green)', letterSpacing: '0.5px' }}>FIX:</strong> <span style={{ color: '#eee' }}>{inc.fix}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }