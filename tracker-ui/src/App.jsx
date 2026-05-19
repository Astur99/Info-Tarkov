import { useEffect, useState } from 'react';
import './index.css';

import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';

import MapsView from './components/MapsView';
import KappaTree from './components/KappaTree';
import StoryDecisions from './components/StoryDecisions';
import BossesIntel from './components/BossesIntel';
import GoonsTracker from './components/GoonsTracker';
import FleaTracker from './components/FleaTracker';
import HideoutModule from './components/HideoutModule';
import ArmorSimulator from './components/ArmorSimulator';
import TroubleshootingView from './components/TroubleshootingView';
import ServerStatus from './components/ServerStatus';
import LiveEvents from './components/LiveEvents';

import mapasImage from './assets/backgrounds/mapas.png';
import kappaCaseImage from './assets/backgrounds/kappa.png';
import finalesImage from './assets/backgrounds/finales.png';
import bossesImage from './assets/backgrounds/bosses.png';
import goonsImage from './assets/backgrounds/goons.png';
import fleaImage from './assets/backgrounds/flea.png';
import hideoutImage from './assets/backgrounds/hideout.png';
import simuladorImage from './assets/backgrounds/simulador.png';
import troubleshootingImage from './assets/backgrounds/troubleshooting.png';
import liveEventsImage from './assets/backgrounds/liveevents.png';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setCurrentView('home');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a0a0c',
          color: '#fff',
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: '2px'
        }}
      >
        INICIALIZANDO TERMINAL...
      </div>
    );
  }

  const handleMouseMoveGlobal = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const modules = [
    {
      id: 'maps',
      title: 'MAPAS TÁCTICOS',
      desc: 'Cartografía interactiva de alto detalle, extracciones y puntos de interés.',
      bgImage: mapasImage,
      imagePosition: { right: '-50px', bottom: '0px', width: '270px', maxWidth: '64%' }
    },
    {
      id: 'kappa',
      title: 'MISIONES / KAPPA',
      desc: 'Organigrama global con filtrado de misiones, misiones para Kappa y checklist de completado.',
      bgImage: kappaCaseImage,
      imagePosition: { right: '-50px', bottom: '-30px', width: '270px', maxWidth: '68%' }
    },
    {
      id: 'story',
      title: 'DECISIONES / FINALES',
      desc: 'Puntos de no retorno y decisiones a tomar para llegar a los distintos finales.',
      bgImage: finalesImage,
      imagePosition: { right: '-55px', bottom: '-5px', width: '260px', maxWidth: '65%' }
    },
    {
      id: 'bosses',
      title: 'INTEL: BOSSES',
      desc: 'Información completa, ubicaciones, gear, puntos débiles y loot de los distintos bosses.',
      bgImage: bossesImage,
      imagePosition: { right: '-30px', bottom: '0px', width: '235px', maxWidth: '58%' }
    },
    {
      id: 'goons',
      title: 'TRACKER DE GOONS',
      desc: 'Estado de rotación, avistamientos de la comunidad y localización en tiempo real de los Goons.',
      bgImage: goonsImage,
      imagePosition: { right: '-10px', bottom: '-20px', width: '250px', maxWidth: '78%' }
    },
    {
      id: 'flea',
      title: 'FLEA MARKET TRACKER',
      desc: 'Buscador de precios en vivo por API, gráficas de fluctuación y cálculo de rentabilidad.',
      bgImage: fleaImage,
      imagePosition: { right: '0px', bottom: '35px', width: '150px', maxWidth: '55%' }
    },
    {
      id: 'hideout',
      title: 'GESTIÓN DEL REFUGIO',
      desc: 'Planificador de infraestructura, checklist de materiales unificado y cálculo de costes con precios en vivo.',
      bgImage: hideoutImage,
      imagePosition: { right: '-35px', bottom: '20px', width: '480px', maxWidth: '52%' }
    },
    {
      id: 'simulador',
      title: 'SIMULADOR BALÍSTICO',
      desc: 'Cálculo de probabilidad de penetración y simulación de rotura de placas e impactos TTK.',
      bgImage: simuladorImage,
      imagePosition: { right: '-85px', bottom: '-30px', width: '330px', maxWidth: '76%' }
    },
    {
      id: 'live-events',
      title: 'EVENTOS EN DIRECTO',
      desc: 'Seguimiento de anuncios, eventos temporales, parches y transmisiones activas de Tarkov.',
      bgImage: liveEventsImage,
      imagePosition: { right: '-5px', bottom: '0px', width: '145px', maxWidth: '62%' }
    },
    {
      id: 'trouble',
      title: 'TROUBLESHOOTING',
      desc: 'Reporte de anomalías conocidas en la app, registros de depuración y soluciones aplicables.',
      bgImage: troubleshootingImage,
      imagePosition: { right: '-5px', bottom: '0px', width: '130px', maxWidth: '58%' }
    }
  ];

  if (currentView === 'auth') return <Auth onViewChange={setCurrentView} />;
  if (currentView === 'maps') return <MapsView onViewChange={setCurrentView} />;
  if (currentView === 'kappa') return <KappaTree onViewChange={setCurrentView} session={session} />;
  if (currentView === 'story') return <StoryDecisions onViewChange={setCurrentView} />;
  if (currentView === 'bosses') return <BossesIntel onViewChange={setCurrentView} />;
  if (currentView === 'goons') return <GoonsTracker onViewChange={setCurrentView} />;
  if (currentView === 'flea') return <FleaTracker onViewChange={setCurrentView} />;
  if (currentView === 'hideout') return <HideoutModule onViewChange={setCurrentView} />;
  if (currentView === 'simulador') return <ArmorSimulator onViewChange={setCurrentView} />;
  if (currentView === 'trouble') return <TroubleshootingView onViewChange={setCurrentView} />;
  if (currentView === 'server-status') return <ServerStatus onViewChange={setCurrentView} />;
  if (currentView === 'live-events') return <LiveEvents onViewChange={setCurrentView} />;

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
      <button
        onClick={() => setCurrentView('server-status')}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 2000,
          backgroundColor: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px',
          color: 'var(--tk-text-muted)',
          padding: '0.55rem 0.85rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '0.75rem',
          fontWeight: '800',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'all 0.25s ease'
        }}
      >
        Estado de Servidores
      </button>

      <button
        onClick={async () => {
          if (session) {
            await supabase.auth.signOut();
            setCurrentView('home');
          } else {
            setCurrentView('auth');
          }
        }}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '12.5rem',
          zIndex: 2000,
          backgroundColor: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px',
          color: session ? 'var(--tk-green)' : 'var(--tk-text-muted)',
          padding: '0.55rem 0.85rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '0.75rem',
          fontWeight: '800',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'all 0.25s ease'
        }}
      >
        {session ? 'Cerrar sesión' : 'Login / Crear cuenta'}
      </button>

      <div style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <header className="fade-in-slide" style={{ marginBottom: '6rem', textAlign: 'center' }}>
          <TitleGlowPro />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '1.5rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: session ? 'var(--tk-green)' : '#ffcf66',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: session
                  ? '0 0 10px var(--tk-green)'
                  : '0 0 10px rgba(255,207,102,0.45)'
              }}
            />

            <p
              style={{
                color: 'var(--tk-text-muted)',
                fontSize: '0.85rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: '600',
                fontFamily: "'Rajdhani', sans-serif"
              }}
            >
              {session
                ? `SESIÓN INICIADA · ${session.user?.email || 'USUARIO AUTENTICADO'}`
                : 'MODO INVITADO · EL PROGRESO LOCAL PUEDE PERDERSE'}
            </p>
          </div>
        </header>

        {!session && (
          <div
            style={{
              margin: '-3.5rem auto 3rem auto',
              maxWidth: '900px',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,207,102,0.075)',
              border: '1px solid rgba(255,207,102,0.28)',
              color: '#ffcf66',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.95rem',
              fontWeight: '800',
              letterSpacing: '0.5px',
              textAlign: 'center',
              boxShadow: '0 0 24px rgba(255,207,102,0.05)'
            }}
          >
            ⚠ AVISO: Estás en modo invitado. El progreso de las quests se guardará en la información local del navegador y puede perderse. Crea una cuenta para tener progreso persistente.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {modules.map((mod, index) => (
            <ModuleCard key={mod.id} mod={mod} index={index} onViewChange={setCurrentView} />
          ))}
        </div>

        <a
          href="https://myurls.co/juankar"
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
        >
          BY ASTUR
        </a>
      </div>
    </div>
  );
}

function TitleGlowPro() {
  const [relPos, setRelPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveLocal = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRelPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      onMouseMove={handleMouseMoveLocal}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', display: 'inline-block', padding: '20px 40px', zIndex: 1, cursor: 'default' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle 180px at ${relPos.x}px ${relPos.y}px, rgba(26, 176, 21, 0.18) 0%, transparent 80%)`,
          pointerEvents: 'none',
          filter: 'blur(30px)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 0
        }}
      />

      <h1
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '4.8rem',
          fontWeight: '800',
          letterSpacing: '4px',
          margin: 0,
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.08)'
        }}
      >
        Info Tarkov
      </h1>

      <h1
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '4.8rem',
          fontWeight: '800',
          letterSpacing: '4px',
          margin: 0,
          textTransform: 'uppercase',
          position: 'absolute',
          top: '20px',
          left: '40px',
          width: 'calc(100% - 80px)',
          color: 'transparent',
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle 150px at ${relPos.x}px ${relPos.y}px, rgba(255,255,255,0.95) 0%, rgba(26,176,21,0.5) 45%, transparent 85%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          zIndex: 2
        }}
      >
        Info Tarkov
      </h1>
    </div>
  );
}

function ModuleCard({ mod, index, onViewChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const delayClass = `delay-${(index % 7) + 1}`;
  const hasBgImage = Boolean(mod.bgImage);

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
        minHeight: '170px',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(26,176,21,0.05)'
          : '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      {hasBgImage && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.82) 42%, rgba(5,5,6,0.28) 100%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 0
            }}
          />

          <img
            src={mod.bgImage}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: mod.imagePosition?.right ?? '-45px',
              bottom: mod.imagePosition?.bottom ?? '-25px',
              width: mod.imagePosition?.width ?? '300px',
              maxWidth: mod.imagePosition?.maxWidth ?? '68%',
              opacity: isHovered ? 0.88 : 0,
              transform: isHovered
                ? 'translateX(0) translateY(0) scale(1)'
                : 'translateX(28px) translateY(16px) scale(0.94)',
              filter: 'drop-shadow(0 0 30px rgba(255,190,40,0.16))',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          <div
            style={{
              position: 'absolute',
              right: '-120px',
              bottom: '-120px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,185,30,0.16) 0%, transparent 68%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 1s ease',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 3, maxWidth: hasBgImage ? '68%' : '100%' }}>
        <h3
          style={{
            color: isHovered ? '#fff' : '#bbb',
            fontFamily: "'Rajdhani', sans-serif",
            marginBottom: '0.75rem',
            fontSize: '1.15rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            transition: 'color 0.3s'
          }}
        >
          {mod.title}
        </h3>

        <p
          style={{
            color: isHovered ? 'rgba(255,255,255,0.85)' : 'var(--tk-text-muted)',
            fontSize: '0.88rem',
            lineHeight: '1.5',
            fontFamily: "'Rajdhani', sans-serif",
            transition: 'color 0.3s'
          }}
        >
          {mod.desc}
        </p>
      </div>
    </div>
  );
}

export default App;