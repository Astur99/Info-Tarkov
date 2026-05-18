import { useState } from 'react';
import './index.css';

// IMPORTACIÓN DE COMPONENTES DE OPERACIONES MODULARIZADOS
import MapsView from './components/MapsView';
import KappaTree from './components/KappaTree';
import StoryDecisions from './components/StoryDecisions';
import BossesIntel from './components/BossesIntel';
import GoonsTracker from './components/GoonsTracker';
import FleaTracker from './components/FleaTracker';
import ArmorSimulator from './components/ArmorSimulator'; // NUEVO: Importación del simulador balístico
import TroubleshootingView from './components/TroubleshootingView';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mapea las coordenadas en base a todo el Viewport de la pantalla
  const handleMouseMoveGlobal = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Matriz de módulos operativos con el Simulador Balístico integrado en su posición exacta
  const modules = [
    { id: 'maps', title: 'MAPAS TÁCTICOS', desc: 'Cartografía interactiva de alto detalle, extracciones y puntos de interés.' },
    { id: 'kappa', title: 'MISIONES / KAPPA', desc: 'Organigrama global con filtrado de misiones, misiones para Kappa y checklist de completado.' },
    { id: 'story', title: 'DECISIONES / FINALES', desc: 'Puntos de no retorno y decisiones a tomar para llegar a los distintos finales (Survivor, Savior, Debtor y Fallen).' },
    { id: 'bosses', title: 'INTEL: BOSSES', desc: 'Información completa, ubicaciones, gear, puntos débiles y alijos de botín estratégico.' },
    { id: 'goons', title: 'TRACKER DE GOONS', desc: 'Estado de rotación, avistamientos de la comunidad y localización en tiempo real de la patrulla rogue.' },
    { id: 'flea', title: 'FLEA MARKET TRACKER', desc: 'Buscador de precios en vivo por API, gráficas de fluctuación y cálculo analítico de rentabilidad por slot.' },
    { id: 'simulador', title: 'SIMULADOR BALÍSTICO', desc: 'Cálculo de probabilidad de penetración y simulación de rotura de placas e impactos TTK en tiempo real.' }, // AÑADIDO AQUÍ
    { id: 'trouble', title: 'TROUBLESHOOTING', desc: 'Reporte de anomalías conocidas en la app, registros de depuración y soluciones aplicables.' }
  ];

  // ==========================================
  // ENRUTAMIENTO DE PANELES SECUNDARIOS
  // ==========================================
  if (currentView === 'maps') return <MapsView onViewChange={setCurrentView} />;
  if (currentView === 'kappa') return <KappaTree onViewChange={setCurrentView} />;
  if (currentView === 'story') return <StoryDecisions onViewChange={setCurrentView} />;
  if (currentView === 'bosses') return <BossesIntel onViewChange={setCurrentView} />;
  if (currentView === 'goons') return <GoonsTracker onViewChange={setCurrentView} />;
  if (currentView === 'flea') return <FleaTracker onViewChange={setCurrentView} />;
  if (currentView === 'simulador') return <ArmorSimulator onViewChange={setCurrentView} />; // MAPEADO AQUÍ
  if (currentView === 'trouble') return <TroubleshootingView onViewChange={setCurrentView} />;

  // MENU PRINCIPAL (HOME)
  return (
    <div 
      className="viewport-wrapper"
      onMouseMove={handleMouseMoveGlobal}
      style={{ 
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundImage: `radial-gradient(circle 1000px at ${mousePos.x}px ${mousePos.y}px, rgba(26, 176, 21, 0.018) 0%, rgba(10, 10, 12, 1) 100%)`,
        backgroundAttachment: 'fixed',
        backgroundColor: '#0a0a0c',
        transition: 'background-image 0.2s ease-out'
      }}
    >
      {/* CONTENEDOR CENTRAL MAQUETADO A 1400PX */}
      <div style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* CABECERA */}
        <header className="fade-in-slide" style={{ marginBottom: '6rem', textAlign: 'center' }}>
          <TitleGlowPro />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '1.5rem' }}>
            <span style={{ width: '7px', height: '7px', backgroundColor: 'var(--tk-green)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px var(--tk-green)' }}></span>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.85rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '600', fontFamily: "'Rajdhani', sans-serif" }}>
              TERMINAL DE DATOS OPERATIVA // CONEXIÓN CIFRADA
            </p>
          </div>
        </header>

        {/* REJILLA DE SECCIONES CON LOS 8 MÓDULOS ACTIVOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {modules.map((mod, index) => (
            <ModuleCard key={mod.id} mod={mod} index={index} onViewChange={setCurrentView} />
          ))}
        </div>

        {/* FIRMA DE AUTOR */}
        <a 
          href="https://x.com/juankar_hh" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            position: 'fixed', 
            bottom: '2.5rem', 
            right: '2.5rem', 
            color: 'var(--tk-text-muted)', 
            fontSize: '0.75rem', 
            letterSpacing: '3px', 
            textTransform: 'uppercase', 
            opacity: 0.5,
            textDecoration: 'none',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '700',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1000,
            borderBottom: '1px solid transparent',
            paddingBottom: '2px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.color = 'var(--tk-green)';
            e.currentTarget.style.borderBottom = '1px solid var(--tk-green)';
            e.currentTarget.style.textShadow = '0 0 10px var(--tk-green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5';
            e.currentTarget.style.color = 'var(--tk-text-muted)';
            e.currentTarget.style.borderBottom = '1px solid transparent';
            e.currentTarget.style.textShadow = 'none';
          }}
        >
          SYS_AUTH: BY ASTUR
        </a>
      </div>
    </div>
  );
}

// COMPONENTE: LOGO CON ILUMINACIÓN DIRECCIONAL FLUIDA
function TitleGlowPro() {
  const [relPos, setRelPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveLocal = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRelPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      onMouseMove={handleMouseMoveLocal}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      style={{ position: 'relative', display: 'inline-block', padding: '20px 40px', zIndex: 1, cursor: 'default' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle 180px at ${relPos.x}px ${relPos.y}px, rgba(26, 176, 21, 0.18) 0%, transparent 80%)`,
        pointerEvents: 'none', filter: 'blur(30px)', opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 0
      }} />

      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '4.8rem', fontWeight: '800', letterSpacing: '4px', margin: '0', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.08)' }}>
        Tarkov Info
      </h1>

      <h1 style={{ 
        fontFamily: "'Rajdhani', sans-serif", fontSize: '4.8rem', fontWeight: '800', letterSpacing: '4px', margin: '0', textTransform: 'uppercase',
        position: 'absolute', top: '20px', left: '40px', width: 'calc(100% - 80px)', height: 'calc(100% - 40px)', color: 'transparent', pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle 150px at ${relPos.x}px ${relPos.y}px, rgba(255, 255, 255, 0.95) 0%, rgba(26, 176, 21, 0.5) 45%, transparent 85%)`,
        WebkitBackgroundClip: 'text', backgroundClip: 'text', opacity: isHovered ? 1 : 0, transition: 'opacity 0.4s ease-out', zIndex: 2
      }}>
        Tarkov Info
      </h1>
    </div>
  );
}

function ModuleCard({ mod, index, onViewChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const delayClass = `delay-${(index % 7) + 1}`;

  return (
    <div 
      className={`fade-in-slide ${delayClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewChange(mod.id)}
      style={{
        backgroundColor: 'var(--tk-glass)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: `1px solid ${isHovered ? 'rgba(26, 176, 21, 0.4)' : 'var(--tk-glass-border)'}`,
        borderRadius: '8px',
        padding: '2.5rem 2.25rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(26, 176, 21, 0.05)' : '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ 
        position: 'absolute', top: '12px', left: '12px', width: '6px', height: '6px', 
        borderTop: `2px solid ${isHovered ? 'var(--tk-green)' : 'rgba(255,255,255,0.1)'}`, 
        borderLeft: `2px solid ${isHovered ? 'var(--tk-green)' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.3s' 
      }}></div>

      <h3 style={{ color: isHovered ? '#fff' : '#bbb', fontFamily: "'Rajdhani', sans-serif", marginBottom: '0.75rem', fontSize: '1.15rem', fontWeight: '700', letterSpacing: '1.5px', transition: 'color 0.3s' }}>
        {mod.title}
      </h3>
      
      <p style={{ color: isHovered ? 'rgba(255,255,255,0.85)' : 'var(--tk-text-muted)', fontSize: '0.88rem', lineHeight: '1.5', fontWeight: '400', fontFamily: "'Rajdhani', sans-serif", transition: 'color 0.3s' }}>
        {mod.desc}
      </p>
    </div>
  );
}

export default App;