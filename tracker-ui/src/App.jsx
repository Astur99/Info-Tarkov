import { useState } from 'react';
import './index.css';
// Módulo unificado de misiones jerárquicas en 2D
import KappaTree from './components/KappaTree';

function App() {
  const [currentView, setCurrentView] = useState('home');

  // Cuadrícula refundada (Misiones y Kappa unificados en un solo bloque operativo)
  const modules = [
    { id: 'maps', title: 'MAPAS TÁCTICOS', desc: 'Cartografía interactiva de alto detalle, extracciones y puntos de interés.' },
    { id: 'kappa', title: 'MISIONES / KAPPA', desc: 'Organigrama global v1.0 con motor de dependencias, auto-enfoque y guías tácticas en vivo.' },
    { id: 'story', title: 'DECISIONES / FINALES', desc: 'Puntos de no retorno y rutas narrativas (Savior, Escape, Abandon).' },
    { id: 'bosses', title: 'INTEL: BOSSES', desc: 'Parámetros de combate, patrones de patrulla y equipamiento táctico.' },
    { id: 'goons', title: 'TRACKER DE GOONS', desc: 'Estado y localización en tiempo real de la escuadra Rogue (Knight, Birdeye, Big Pipe).' },
    { id: 'events', title: 'ESTADO DE EVENTOS', desc: 'Monitorización de alteraciones climáticas y eventos globales activos.' },
    { id: 'flea', title: 'FLEA MARKET INTELLIGENCE', desc: 'Análisis de fluctuación económica y valores de intercambio en vivo.' }
  ];

  // RENDERIZADO CONDICIONAL DE LAS VISTAS
  
  // VISTA 1: HOME (Menú de operaciones unificado)
  if (currentView === 'home') {
    return (
      <div style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <header className="fade-in-slide" style={{ marginBottom: '6rem', textAlign: 'center' }}>
          <TitleGlow />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--tk-green)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px var(--tk-green)' }}></span>
            <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '500' }}>
              Terminal de asistencia táctica e inteligencia operativa
            </p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {modules.map((mod, index) => (
            <ModuleCard key={mod.id} mod={mod} index={index} onViewChange={setCurrentView} />
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', color: 'var(--tk-text-muted)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.5 }}>
          By Astur
        </div>
      </div>
    );
  }

  // VISTA 2: NÚCLEO OPERATIVO DE MISIONES UNIFICADAS
  if (currentView === 'kappa') {
    return <KappaTree onViewChange={setCurrentView} />;
  }

  // CUALQUIER OTRA VISTA EN DESARROLLO
  return (
    <div style={{ padding: '6rem 2rem', textAlign: 'center', fontFamily: "'Rajdhani', sans-serif" }}>
      <h2 style={{ fontSize: '2rem', letterSpacing: '1px' }}>MÓDULO EN CONSTRUCCIÓN</h2>
      <p style={{ color: 'var(--tk-text-muted)', marginTop: '0.5rem' }}>La terminal de inteligencia para esta sección se encuentra actualmente cifrada.</p>
      <button onClick={() => setCurrentView('home')} style={{ marginTop: '2rem', backgroundColor: '#222', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: '700', letterSpacing: '1px' }}>
        VOLVER AL INICIO
      </button>
    </div>
  );
}

// COMPONENTE: EFECTO DE LUZ EN EL TÍTULO
function TitleGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{ position: 'relative', display: 'inline-block', cursor: 'default', padding: '10px' }}>
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '4.5rem', fontWeight: '700', letterSpacing: '-1px', margin: '0', color: 'rgba(255, 255, 255, 0.12)', textTransform: 'lowercase' }}>
        sherpa.com
      </h1>
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '4.5rem', fontWeight: '700', letterSpacing: '-1px', margin: '0', textTransform: 'lowercase', position: 'absolute', top: '10px', left: '10px', width: 'calc(100% - 20px)', height: 'calc(100% - 20px)', color: 'transparent', pointerEvents: 'none', backgroundImage: `radial-gradient(circle 250px at ${pos.x}px ${pos.y}px, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.6) 30%, rgba(255, 255, 255, 0.15) 65%, transparent 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', opacity: isHovered ? 1 : 0, transition: 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        sherpa.com
      </h1>
    </div>
  );
}

// COMPONENTE: TARJETA DE MÓDULO INDIVIDUAL
function ModuleCard({ mod, index, onViewChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const delayClass = `delay-${(index % 7) + 1}`; // Ajustado el factor de delay al reducir módulos

  return (
    <div 
      className={`fade-in-slide ${delayClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewChange(mod.id)}
      style={{
        backgroundColor: 'var(--tk-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isHovered ? 'rgba(255,255,255, 0.15)' : 'var(--tk-glass-border)'}`,
        borderRadius: '16px',
        padding: '2.5rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.5s var(--tk-ease)',
        transform: isHovered ? 'scale(1.02) translateY(-5px)' : 'scale(1) translateY(0)',
        boxShadow: isHovered ? '0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 18px 36px -18px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '2.5rem', width: '40px', height: '2px', backgroundColor: isHovered ? 'var(--tk-green)' : 'transparent', boxShadow: isHovered ? '0 0 15px var(--tk-green)' : 'none', transition: 'all 0.5s var(--tk-ease)' }}></div>
      <h3 style={{ color: isHovered ? 'var(--tk-text-main)' : '#ccc', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'color 0.5s ease' }}>
        {mod.title}
      </h3>
      <p style={{ color: isHovered ? 'var(--tk-text-main)' : 'var(--tk-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '400', transition: 'color 0.5s ease' }}>
        {mod.desc}
      </p>
    </div>
  );
}

export default App;