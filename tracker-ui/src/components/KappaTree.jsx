import { useState, useEffect, useRef } from 'react';

export default function KappaTree({ onViewChange }) {
  const [todasLasMisiones, setTodasLasMisiones] = useState([]); 
  const [currentTrader, setCurrentTrader] = useState('Prapor'); 
  const [arbolEstructurado, setArbolEstructurado] = useState({ nodos: [], conexiones: [] });
  const [searchQuery, setSearchQuery] = useState('');           
  const [soloKappa, setSoloKappa] = useState(false);            
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PERSISTENCIA NATAL: Memoria única por navegador (localStorage)
  const [completadas, setCompletadas] = useState(() => {
    try {
      const progresoGuardado = localStorage.getItem('sherpa_progreso_misiones');
      return progresoGuardado ? JSON.parse(progresoGuardado) : [];
    } catch (e) {
      console.error("Error al leer el almacenamiento local:", e);
      return [];
    }
  });

  // Estados del lienzo infinito (Zoom y Pan)
  const matrixRef = useRef(null);
  const [zoom, setZoom] = useState(0.8); 
  const [pan, setPan] = useState({ x: 500, y: 120 }); 
  const [isDown, setIsDown] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const traders = ['Prapor', 'Therapist', 'Skier', 'Peacekeeper', 'Mechanic', 'Ragman', 'Jaeger', 'Fence', 'Lightkeeper'];

  const traderStyles = {
    'Prapor': { color: '#8F9F7F', bgGradient: 'rgba(143, 159, 127, 0.06)' },
    'Therapist': { color: '#4A90E2', bgGradient: 'rgba(74, 144, 226, 0.06)' },
    'Skier': { color: '#D4AF37', bgGradient: 'rgba(212, 175, 55, 0.06)' },
    'Peacekeeper': { color: '#50E3C2', bgGradient: 'rgba(80, 227, 194, 0.06)' },
    'Mechanic': { color: '#9B9B9B', bgGradient: 'rgba(155, 155, 155, 0.06)' },
    'Ragman': { color: '#A5673F', bgGradient: 'rgba(165, 103, 63, 0.06)' },
    'Jaeger': { color: '#7ED321', bgGradient: 'rgba(126, 211, 33, 0.06)' },
    'Fence': { color: '#9013FE', bgGradient: 'rgba(144, 19, 254, 0.06)' },
    'Lightkeeper': { color: '#D16E41', bgGradient: 'rgba(209, 110, 65, 0.06)' },
    'DEFAULT': { color: '#8F9F7F', bgGradient: 'rgba(143, 159, 127, 0.06)' }
  };

  // DETECTOR INTERCEPTOR DE BÚSQUEDA GLOBAL (Colocado arriba para evitar errores de hoisting)
  const handleSearchChange = (e) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);

    if (queryText.trim() === '') return;

    const misionEncontrada = todasLasMisiones.find(m => 
      m.name && m.name.toLowerCase().includes(queryText.toLowerCase()) &&
      (soloKappa ? m.kappaRequired : true)
    );

    if (misionEncontrada && misionEncontrada.trader?.name) {
      const traderDestino = misionEncontrada.trader.name;
      if (traders.includes(traderDestino) && traderDestino !== currentTrader) {
        setCurrentTrader(traderDestino);
      }
    }
  };

  // ESCRIBIR EN DISCO: Guardado automático reactivo ante mutaciones
  useEffect(() => {
    localStorage.setItem('sherpa_progreso_misiones', JSON.stringify(completadas));
  }, [completadas]);

  useEffect(() => {
    const query = `
      {
        tasks {
          id
          name
          wikiLink
          kappaRequired
          trader {
            name
          }
          taskRequirements {
            task {
              id
            }
          }
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
      .then(res => {
        if (!res.ok) throw new Error('Error de comunicación con el servidor');
        return res.json();
      })
      .then(response => {
        if (response.data && response.data.tasks) {
          setTodasLasMisiones(response.data.tasks); 
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error de enlace con la API central.");
        setLoading(false);
      });
  }, []);

  // MOTOR DE LOGÍSTICA DE GRAFOS
  useEffect(() => {
    if (!todasLasMisiones.length) return;

    let misionesDelTrader = todasLasMisiones.filter(m => m.trader?.name === currentTrader);

    if (soloKappa) {
      misionesDelTrader = misionesDelTrader.filter(m => m.kappaRequired);
    }

    const mapaMisiones = new Map(misionesDelTrader.map(m => [m.id, m]));
    const niveles = {};
    const padresMap = {};

    misionesDelTrader.forEach(m => {
      niveles[m.id] = 0;
      padresMap[m.id] = [];
    });

    misionesDelTrader.forEach(m => {
      const prevIds = m.taskRequirements ? m.taskRequirements.map(req => req?.task?.id).filter(id => mapaMisiones.has(id)) : [];
      m._prevIds = prevIds; 
      prevIds.forEach(pId => {
        padresMap[m.id].push(pId);
      });
    });

    let cambio = true;
    for (let i = 0; i < 15 && cambio; i++) {
      cambio = false;
      misionesDelTrader.forEach(m => {
        m._prevIds.forEach(pId => {
          if (niveles[m.id] <= niveles[pId]) {
            niveles[m.id] = niveles[pId] + 1;
            cambio = true;
          }
        });
      });
    }

    const misionesPorNivel = {};
    misionesDelTrader.forEach(m => {
      const lvl = niveles[m.id];
      if (!misionesPorNivel[lvl]) misionesPorNivel[lvl] = [];
      misionesDelTrader.filter(m => niveles[m.id] === Number(lvl));
      misionesPorNivel[lvl].push(m);
    });

    // Limpieza de duplicados accidentales por nivel
    Object.keys(misionesPorNivel).forEach(lvl => {
      const nodosUnicos = [];
      const idsVistos = new Set();
      misionesPorNivel[lvl].forEach(m => {
        if (!idsVistos.has(m.id)) {
          idsVistos.add(m.id);
          nodosUnicos.push(m);
        }
      });
      misionesPorNivel[lvl] = nodosUnicos;
    });

    const nivelesOrdenados = Object.keys(misionesPorNivel).sort((a, b) => Number(a) - Number(b));
    nivelesOrdenados.forEach((lvl, idx) => {
      if (idx === 0) return; 
      const nivelAnterior = misionesPorNivel[nivelesOrdenados[idx - 1]];
      misionesPorNivel[lvl].sort((a, b) => {
        const primerPadreA = a._prevIds.map(pId => nivelAnterior.findIndex(n => n.id === pId)).filter(index => index !== -1)[0];
        const primerPadreB = b._prevIds.map(pId => nivelAnterior.findIndex(n => n.id === pId)).filter(index => index !== -1)[0];
        if (primerPadreA !== undefined && primerPadreB !== undefined) {
          return primerPadreA - primerPadreB;
        }
        return 0;
      });
    });

    const CARD_WIDTH = 340;
    const CARD_HEIGHT = 160;
    const GAP_X = 60;
    const GAP_Y = 120;

    const nodosCalculados = [];
    const conexionesCalculadas = [];

    Object.keys(misionesPorNivel).forEach(lvl => {
      const lista = misionesPorNivel[lvl];
      const totalNivel = lista.length;
      const anchoTotalNivel = (totalNivel * CARD_WIDTH) + ((totalNivel - 1) * GAP_X);
      const inicioX = -anchoTotalNivel / 2; 

      lista.forEach((mision, index) => {
        const posX = inicioX + (index * (CARD_WIDTH + GAP_X));
        const posY = lvl * (CARD_HEIGHT + GAP_Y);

        nodosCalculados.push({
          ...mision,
          x: posX,
          y: posY,
          prevIds: mision._prevIds
        });
      });
    });

    nodosCalculados.forEach(nodo => {
      nodo.prevIds.forEach(pId => {
        const padre = nodosCalculados.find(n => n.id === pId);
        if (padre) {
          conexionesCalculadas.push({
            id: `${padre.id}-${nodo.id}`,
            from: { x: padre.x + CARD_WIDTH / 2, y: padre.y + CARD_HEIGHT },
            to: { x: nodo.x + CARD_WIDTH / 2, y: nodo.y },
            activo: completadas.includes(padre.id)
          });
        }
      });
    });

    setArbolEstructurado({ nodos: nodosCalculados, conexiones: conexionesCalculadas });

    if (searchQuery.trim() !== '') {
      const nodoMatch = nodosCalculados.find(n => n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (nodoMatch) {
        const centroPantallaX = window.innerWidth / 2;
        const centroPantallaY = window.innerHeight / 2;

        setPan({
          x: centroPantallaX - (nodoMatch.x + CARD_WIDTH / 2) * zoom,
          y: centroPantallaY - (nodoMatch.y + CARD_HEIGHT / 2) * zoom
        });
      }
    }
  }, [currentTrader, todasLasMisiones, searchQuery, soloKappa, completadas]);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    let newZoom = zoom - e.deltaY * zoomFactor * 0.01;
    newZoom = Math.max(0.3, Math.min(1.3, newZoom));
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'A') return;
    setIsDown(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseLeaveOrUp = () => setIsDown(false);
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const toggleMision = (id) => {
    if (completadas.includes(id)) {
      setCompletadas(completadas.filter(mId => mId !== id));
    } else {
      setCompletadas([...completadas, id]);
    }
  };

  const activeStyle = traderStyles[currentTrader] || traderStyles['DEFAULT'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'Rajdhani', sans-serif" }}>
        <p style={{ letterSpacing: '2px', color: 'var(--tk-green)', fontSize: '1.5rem', textTransform: 'uppercase' }}>
          COMPILANDO MATRÍZ JERÁRQUICA, ESPERE...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1rem 0 1rem', width: '100%', maxWidth: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* PANEL SUPERIOR DE CONTROLES */}
      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', zIndex: 10, backgroundColor: 'var(--tk-bg)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => onViewChange('home')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--tk-green)', fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', letterSpacing: '1px' }}
        >
          ← VOLVER AL TERMINAL
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', letterSpacing: '1px', margin: 0, fontWeight: '700' }}>
              ORGANIGRAMA ESTRATÉGICO DE ENCARGOS
            </h2>
            <p style={{ color: 'var(--tk-text-muted)', margin: '5px 0 0 0', fontSize: '0.95rem' }}>
              Memoria persistente activa. Tu progreso se guarda localmente en esta terminal.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <input 
              type="text"
              placeholder="BUSCAR GLOBAL (EJ: GUNSMITH)..."
              value={searchQuery}
              onChange={handleSearchChange} 
              style={{ backgroundColor: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '1rem', width: '280px', outline: 'none' }}
            />

            <div onClick={() => setSoloKappa(!soloKappa)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: soloKappa ? 'var(--tk-green)' : 'var(--tk-text-muted)' }}>SOLO KAPPA</span>
              <div style={{ width: '36px', height: '20px', backgroundColor: soloKappa ? 'var(--tk-green)' : '#222', borderRadius: '10px', position: 'relative' }}>
                <div style={{ width: '14px', height: '14px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: soloKappa ? '19px' : '3px', transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* MENÚ DE PESTAÑAS DE TRADERS */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          {traders.map(tName => {
            const esActivo = currentTrader === tName;
            const tStyle = traderStyles[tName] || traderStyles['DEFAULT'];
            return (
              <button
                key={tName}
                onClick={() => {
                  setCurrentTrader(tName);
                  setPan({ x: window.innerWidth / 3, y: 100 }); 
                }}
                style={{
                  backgroundColor: esActivo ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: 'none',
                  borderBottom: esActivo ? `2px solid ${tStyle.color}` : '2px solid transparent',
                  color: esActivo ? '#fff' : 'var(--tk-text-muted)',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  transition: 'all 0.3s'
                }}
              >
                {tName.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* VISOR LIENZO MAPA */}
      <div 
        ref={matrixRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        style={{ flex: 1, width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', position: 'relative', overflow: 'hidden', cursor: isDown ? 'grabbing' : 'grab', backgroundColor: '#030303' }}
      >
        
        <div style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isDown ? 'none' : 'transform 0.25s cubic-bezier(0.1, 0.8, 0.2, 1)', 
          width: '1px', height: '1px' 
        }}>
          
          {/* CAPA DE CONEXIONES SVG */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '8000px', height: '8000px', pointerEvents: 'none', overflow: 'visible' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(255,255,255,0.2)" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill={activeStyle.color} />
              </marker>
            </defs>
            {arbolEstructurado.conexiones.map(linea => (
              <path
                key={linea.id}
                d={`M ${linea.from.x} ${linea.from.y} C ${linea.from.x} ${(linea.from.y + linea.to.y) / 2}, ${linea.to.x} ${(linea.from.y + linea.to.y) / 2}, ${linea.to.x} ${linea.to.y}`}
                fill="none"
                stroke={linea.activo ? activeStyle.color : 'rgba(255,255,255,0.08)'} 
                strokeWidth={linea.activo ? '3' : '2'}
                markerEnd={linea.activo ? "url(#arrow-active)" : "url(#arrow)"}
                style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
              />
            ))}
          </svg>

          {/* CAPA DE NODOS (TARJETAS VISIBLES) */}
          {arbolEstructurado.nodos.map(mision => {
            const esCompletada = completadas.includes(mision.id);
            const esDesbloqueada = mision.prevIds.length === 0 || mision.prevIds.every(id => completadas.includes(id));
            const esMatchBuscador = searchQuery.trim() !== '' && mision.name && mision.name.toLowerCase().includes(searchQuery.toLowerCase());

            return (
              <div
                key={mision.id}
                style={{
                  position: 'absolute',
                  left: mision.x,
                  top: mision.y,
                  width: '340px',
                  height: '160px',
                  backgroundColor: 'rgba(20, 20, 20, 0.85)',
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${activeStyle.bgGradient} 100%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: esMatchBuscador 
                    ? `2px solid ${activeStyle.color}` 
                    : `1px solid ${esCompletada ? activeStyle.color : esDesbloqueada ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: esMatchBuscador
                    ? `0 0 30px ${activeStyle.color}40`
                    : esCompletada ? `0 15px 35px -10px ${activeStyle.color}25` : '0 10px 30px rgba(0,0,0,0.6)',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  transform: esMatchBuscador ? 'scale(1.03)' : 'scale(1)',
                  opacity: 1 
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--tk-green)', letterSpacing: '0.5px' }}>
                      ID: {mision.id.substring(0, 8).toUpperCase()}...
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: esCompletada ? activeStyle.color : esDesbloqueada ? '#8F9F7F' : '#666', 
                      fontWeight: 'bold', 
                      letterSpacing: '1px' 
                    }}>
                      {esCompletada ? '● COMPLETADA' : esDesbloqueada ? '○ DISPONIBLE' : '🔒 REQUISITOS'}
                    </span>
                  </div>

                  <h4 style={{ 
                    fontSize: '1.2rem', 
                    letterSpacing: '0.5px', 
                    margin: 0, 
                    color: esDesbloqueada ? '#ffffff' : '#dddddd', 
                    fontWeight: '600', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {mision.name}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button
                    disabled={!esDesbloqueada && !esCompletada}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMision(mision.id);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: esCompletada ? 'transparent' : esDesbloqueada ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                      color: esCompletada ? activeStyle.color : esDesbloqueada ? '#fff' : '#444',
                      border: `1px solid ${esCompletada ? activeStyle.color : esDesbloqueada ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'}`,
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: esDesbloqueada || esCompletada ? 'pointer' : 'not-allowed',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      transition: 'all 0.3s'
                    }}
                  >
                    {esCompletada ? 'PENDIENTE' : esDesbloqueada ? 'COMPLETAR' : 'BLOQUEADO'}
                  </button>

                  {mision.wikiLink && (
                    <a 
                      href={mision.wikiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        backgroundColor: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        color: '#aaa', 
                        width: '36px', 
                        height: '34px', 
                        borderRadius: '6px', 
                        textDecoration: 'none', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        transition: 'all 0.3s' 
                      }}
                      title="Wiki"
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = activeStyle.color; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#aaa'; }}
                    >
                      ℹ
                    </a>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}