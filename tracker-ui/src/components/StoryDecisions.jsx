export default function StoryDecisions({ onViewChange }) {
    return (
      <div className="fade-in-slide" style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
          <div><h2 style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fff' }}>DECISIONES / FINALES</h2><p style={{ color: 'var(--tk-text-muted)', marginTop: '0.3rem' }}>Rutas narrativas críticas.</p></div>
          <button onClick={() => onViewChange('home')} style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>VOLVER</button>
        </header>
        <div style={{ backgroundColor: 'var(--tk-glass)', border: '1px solid var(--tk-glass-border)', borderRadius: '12px', padding: '2.5rem', color: 'var(--tk-text-muted)' }}>En construcción. Próximamente disponible.</div>
      </div>
    );
  }