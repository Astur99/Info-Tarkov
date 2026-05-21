import { useEffect, useMemo, useState } from 'react';

const bossImageModules = import.meta.glob('../../assets/bosses/*', {
  eager: true,
  query: '?url',
  import: 'default'
});

const getBossImage = (boss) => bossImageModules[`../../assets/bosses/${boss.fileName}`] || '';

const BOSS_SPAWN_ZONES = {
  bigpipe: {
    Customs: ['Stronghold', 'New gas station', 'Dorms approach', 'Crackhouse route'],
    Lighthouse: ['Water treatment plant', 'Chalet ridge', 'Village approach'],
    Shoreline: ['Weather station', 'Cottages', 'Pier approach'],
    Woods: ['Scav bunker', 'USEC camp route', 'Sawmill outskirts']
  },
  birdeye: {
    Customs: ['Stronghold overwatch', 'Crackhouse sightlines', 'Dorms approach'],
    Lighthouse: ['Long road cliffs', 'Water treatment overwatch', 'Chalet ridge'],
    Shoreline: ['Weather station ridge', 'Cottages sightlines', 'Pier approach'],
    Woods: ['Sawmill ridges', 'USEC camp route', 'Scav bunker woods']
  },
  knight: {
    Customs: ['Stronghold', 'Crackhouse push', 'Dorms approach'],
    Lighthouse: ['Water treatment plant', 'Chalet', 'Long road approach'],
    Shoreline: ['Weather station', 'Cottages', 'Pier approach'],
    Woods: ['Sawmill edge', 'USEC camp route', 'Scav bunker']
  },
  glukhar: {
    Reserve: ['Train station', 'Knight buildings', 'Pawn buildings', 'K buildings', 'Underground bunker access']
  },
  kaban: {
    'Streets of Tarkov': ['LexOs dealership', 'LexOs courtyard', 'Machine gun positions', 'Collapsed crane side']
  },
  killa: {
    Interchange: ['Goshan', 'IDEA', 'OLI', 'Central mall', 'Parking transitions']
  },
  kollontay: {
    'Streets of Tarkov': ['Klimov shopping mall', 'Pinewood hotel', 'Police areas', 'Central streets patrol']
  },
  partisan: {
    Customs: ['Wooded approaches', 'Dorms exterior', 'Smuggler routes'],
    Woods: ['Forest traps', 'Sawmill outskirts', 'USEC camp route'],
    Shoreline: ['Village woods', 'Cottages approach', 'Weather station route'],
    Factory: ['Expansion tunnels', 'Gate routes', 'Office approaches']
  },
  reshala: {
    Customs: ['Dorms', 'New gas station', 'Stronghold', 'Scav checkpoint routes']
  },
  sanitar: {
    Shoreline: ['Health resort', 'Cottages', 'Pier', 'Ambulance routes']
  },
  shturman: {
    Woods: ['Sawmill', 'Wood piles', 'Sniper rock sightlines', 'Outer lumber routes']
  },
  tagilla: {
    Factory: ['Office area', 'Underground', 'Gate 0/3 routes', 'Expansion corridors']
  },
  Zryachiy: {
    Lighthouse: ['Lightkeeper island', 'Bridge approach', 'Island ridgelines']
  }
};

const getBossSpawnZones = (boss) => {
  if (!boss) return [];
  const zoneMap = BOSS_SPAWN_ZONES[boss.id] || {};

  return (boss.spawnDetails || []).map((spawn) => ({
    ...spawn,
    zones: zoneMap[spawn.name] || zoneMap[spawn.name.replace('The Lab', 'Laboratory')] || ['Zona exacta pendiente de confirmar']
  }));
};

function BossImage({ boss, style }) {
  const [failed, setFailed] = useState(false);
  const src = getBossImage(boss);

  if (!src || failed) {
    return (
      <div
        style={{
          ...style,
          display: 'grid',
          placeItems: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(26,176,21,0.12), rgba(0,0,0,0.55))',
          color: 'var(--tk-green)',
          fontWeight: 900,
          letterSpacing: '1px',
          textAlign: 'center'
        }}
      >
        {boss.name}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={boss.name}
      onError={() => setFailed(true)}
      style={style}
    />
  );
}

export default function BossesView({ onViewChange }) {
  const [busqueda, setBusqueda] = useState('');
  const [mapaFiltro, setMapaFiltro] = useState('ALL');
  const [dificultadFiltro, setDificultadFiltro] = useState('ALL');
  const [bossSeleccionado, setBossSeleccionado] = useState(null);
  const [bossesData, setBossesData] = useState([]);
  const [cargando, setCargando] = useState(true);

  // BASE DE DATOS LOCAL CON REFERENCIAS RELATIVAS A SRC/ASSETS/BOSSES/
  const poolBossesEstatico = useMemo(() => [
    {
      id: 'bigpipe',
      name: 'BIG PIPE',
      fileName: 'bigpipe.jpg',
      mapaDefault: 'Customs, Lighthouse, Shoreline, Woods',
      spawnDefault: '30%',
      dificultad: 'Medium',
      colorDificultad: '#ffcc00',
      guardias: 'Acompañado por Knight y Birdeye (The Goons)',
      fisico: 'Complexión masiva, tatuajes extensos, fuma una pipa mecánica.',
      actitud: 'Ultra agresivo, avanza flanqueando a corta distancia mientras Knight da fuego de cobertura.',
      armas: 'MGL 40mm, Remington 870, Colt M4A1',
      municion: '40x46mm HE, 12/70 AP-20, 5.56x45mm M855A1',
      debiles: 'Cabeza desprotegida (no lleva casco), zonas de articulaciones.',
      loot: 'Lanzagranadas MGL, Pipe Mochila especial, llaves de alta prioridad.'
    },
    {
      id: 'birdeye',
      name: 'BIRDEYE',
      fileName: 'birdeye.jpg',
      mapaDefault: 'Customs, Lighthouse, Shoreline, Woods',
      spawnDefault: '30%',
      dificultad: 'Medium',
      colorDificultad: '#ffcc00',
      guardias: 'Acompañado por Knight y Big Pipe (The Goons)',
      fisico: 'Equipamiento ligero de camuflaje, auriculares tácticos avanzados.',
      actitud: 'Francotirador sigiloso, cambia de posición constantemente y sus pasos no emiten sonido.',
      armas: 'Remington M700, SR-25, M4A1',
      municion: '7.62x51mm M61 / M993, 5.56x45mm SSA AP',
      debiles: 'Zonas expuestas del torso, carece de blindaje pesado en extremidades.',
      loot: 'Rifle de cerrojo modificado, tarjetas de acceso, munición militar premium.'
    },
    {
      id: 'glukhar',
      name: 'GLUKHAR',
      fileName: 'glukhar.jpg',
      mapaDefault: 'Reserve',
      spawnDefault: '75%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: 'De 6 a 7 guardias fuertemente blindados',
      fisico: 'Uniforme militar de camuflaje urbano ruso, complexión robusta, sin casco.',
      actitud: 'Estratégico y defensivo. Sus guardias se dividen en asaltantes y exploradores tácticos.',
      armas: 'AS VAL, M1A, ASH-12',
      municion: '9x39mm SP-6 / BP, 7.62x51mm M62, 12.7x55mm PS12B',
      debiles: 'Cabeza (fácil de abatir si se le aísla de sus guardias de asalto).',
      loot: 'Llaves militares de Reserve, ASH-12 FIR, cargadores de alta capacidad.'
    },
    {
      id: 'kaban',
      name: 'KABAN',
      fileName: 'kaban.jpg',
      mapaDefault: 'Streets of Tarkov',
      spawnDefault: '75%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: 'Grupo masivo de guardias blindados y francotiradores inmóviles',
      fisico: 'Tamaño descomunal, viste ropa civil pesada, se atrinchera en el taller de coches.',
      actitud: 'Estático pero letal. Usa ametralladoras pesadas fijas y fuego sostenido implacable.',
      armas: 'PKP Pecheneg, PKM, Tokarev TT-33',
      municion: '7.62x54mmR SNB / BT, 7.62x25mm PST',
      debiles: 'Movilidad extremadamente reducida, vulnerable al flanqueo con granadas.',
      loot: 'Ametralladora PKP/PKM, llaves de Streets, maletines de munición completa.'
    },
    {
      id: 'killa',
      name: 'KILLA',
      fileName: 'killa.jpg',
      mapaDefault: 'Interchange',
      spawnDefault: '75%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: 'Sale completamente solo',
      fisico: 'Chándal negro de tres rayas con chaleco blindado 6B13 y casco Maska con visera.',
      actitud: 'Cazador implacable. Corre directo hacia el sonido de pasos y dispara ráfagas prolongadas.',
      armas: 'RPK-16, PP-19-01 Vityaz, AK-74M',
      municion: '5.45x39mm 7N40 / Igolnik, 9x19mm PBP',
      debiles: 'Puntos ciegos laterales, la nuca y las piernas.',
      loot: 'Famoso casco Maska-1Sch, blindaje corporal Killa de polietileno nivel 5.'
    },
    {
      id: 'knight',
      name: 'KNIGHT',
      fileName: 'knight.jpg',
      mapaDefault: 'Customs, Lighthouse, Shoreline, Woods',
      spawnDefault: '30%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: 'Líder del trío (Acompañado por Big Pipe y Birdeye)',
      fisico: 'Máscara de calavera balística, chaleco táctico modular de asalto.',
      actitud: 'Punta de lanza. Detecta objetivos a distancias extremas e inicia persecuciones letales.',
      armas: 'FN SCAR-H, MDR 5.56, Glock 18C',
      municion: '7.62x51mm BCP FMJ / M80, 5.56x45mm M855A1',
      debiles: 'Visor de la máscara balística, extremidades inferiores.',
      loot: 'Máscara de calavera, portaplacas de asalto, estimulantes avanzados.'
    },
    {
      id: 'kollontay',
      name: 'KOLLONTAY',
      fileName: 'kollontay.jpg',
      mapaDefault: 'Streets of Tarkov',
      spawnDefault: '75%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: 'De 3 a 5 guardias con equipo policial ruso',
      fisico: 'Antiguo uniforme de la policía militar, gorra oficial, porta una porra antidisturbios.',
      actitud: 'Presión sicológica. Si se acerca demasiado, saca la porra forzando tu bloqueo de armas.',
      armas: 'RPK-16, Stechkin APS, Porra de goma',
      municion: '5.45x39mm PPBS / BP, 9x18mm PM PBM',
      debiles: 'Zonas laterales del torso, vulnerable mientras avanza corriendo con la porra.',
      loot: 'Porra de Kollontay única, llaves de las comisarías de Streets, equipo policial.'
    },
    {
      id: 'partisan',
      name: 'PARTISAN',
      fileName: 'partisan.jpg',
      mapaDefault: 'Customs, Woods, Shoreline, Factory',
      spawnDefault: '25%',
      dificultad: 'Medium',
      colorDificultad: '#ffcc00',
      guardias: 'Sale completamente solo',
      fisico: 'Ropa de camuflaje forestal deshilachada, barba tupida, mochila táctica grande.',
      actitud: 'Trampero hostil. Coloca granadas con cables de trampa y acecha oculto en la maleza.',
      armas: 'AKM modificado, SKS, trampas de cable',
      municion: '7.62x39mm BP / PP, granadas F-1 / VOG-25',
      debiles: 'Fácilmente abatible en terreno abierto si se detectan sus trampas previas.',
      loot: 'Kit de cables de trampa, AKM de coleccionista, dogtags de contrabando.'
    },
    {
      id: 'reshala',
      name: 'RESHALA',
      fileName: 'reshala.jpg',
      mapaDefault: 'Customs',
      spawnDefault: '75%',
      dificultad: 'Medium',
      colorDificultad: '#ffcc00',
      guardias: '4 guardias de élite (Zavodskoy)',
      fisico: 'Chaqueta de cuero marrón con patrones dorados, sin blindaje visible.',
      actitud: 'Cobarde y evasivo. Se esconde en las habitaciones mientras sus guardias asaltan.',
      armas: 'Pistola TT dorada, AK-101, AK-74N',
      municion: 'PST Gzh, 5.56x45mm M856A1, 5.45x39mm BT',
      debiles: 'Torso y cabeza por completo (no tiene ningún tipo de blindaje corporal nativo).',
      loot: 'Pistola TT dorada de colección, llave de la oficina de aduanas, bitcoins.'
    },
    {
      id: 'sanitar',
      name: 'SANITAR',
      fileName: 'sanitar.jpg',
      mapaDefault: 'Shoreline',
      spawnDefault: '75%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: '2 guardias fuertemente armados',
      fisico: 'Bata médica azul sobre ropa civil, bolsa de material quirúrgico al hombro.',
      actitud: 'Soporte dinámico. Se cura constantemente en combate y sobrepotencia a sus guardias.',
      armas: 'VSS Vintorez, OP-SKS, Kedr-B',
      municion: '9x39mm SP-5, 7.62x39mm PS, 9x18mm SP7',
      debiles: 'Cabeza desprotegida, vulnerable durante las animaciones de inyección de jeringuillas.',
      loot: 'Maletín médico con estimulantes raros (Ophthalmoscope, LedX, jeringas xg).'
    },
    {
      id: 'shturman',
      name: 'SHTURMAN',
      fileName: 'shturman.jpg',
      mapaDefault: 'Woods',
      spawnDefault: '75%',
      dificultad: 'Hard',
      colorDificultad: '#ffaa00',
      guardias: '2 guardias equipados con rifles de largo alcance',
      fisico: 'Abrigo de invierno con capucha de piel, rostro descubierto, posicionamiento en aserradero.',
      actitud: 'Francotirador de zona. Te dispara a distancias extremas con una cadencia calculada.',
      armas: 'SVDS, AK-105',
      municion: '7.62x54mmR 7N1 / SNB, 5.45x39mm BT',
      debiles: 'Cabeza y extremidades desprotegidas de blindajes balísticos rígidos.',
      loot: 'Llave del alijo de Shturman, rifle SVDS modificado, tarjetas de acceso rojas.'
    },
    {
      id: 'tagilla',
      name: 'TAGILLA',
      fileName: 'tagilla.jpg',
      mapaDefault: 'Factory',
      spawnDefault: '75%',
      dificultad: 'Medium',
      colorDificultad: '#ffcc00',
      guardias: 'Sale completamente solo',
      fisico: 'Pantalones de soldador caídos, torso desnudo tatuado, máscara de soldar pesada.',
      actitud: 'Asalto implacable a corta distancia. Te persigue con un mazo de demolición industrial.',
      armas: 'Mazo de Tagilla, Saiga-12, MP-155 Ultima',
      municion: '12/70 Flechette / AP-20, perdigón Magnum',
      debiles: 'La espalda descubierta y las piernas (tienen multiplicador de daño por carne).',
      loot: 'Máscara de soldar nivel 5, chaleco portaplacas rígido de Tagilla, mazo de desguace.'
    },
    {
      id: 'Zryachiy',
      name: 'Zryachiy',
      fileName: 'zryachiy.jpg',
      mapaDefault: 'Lighthouse',
      spawnDefault: '100%',
      dificultad: 'Very Hard',
      colorDificultad: '#ff4444',
      guardias: '2 francotiradores de apoyo ocultos en las laderas de la isla',
      fisico: 'Pasamontañas blanco con patrón de costuras, mira óptica acoplada en el ojo.',
      actitud: 'Francotirador defensivo absoluto. Abre fuego instantáneo si cruzas el puente sin el transpondedor activo.',
      armas: 'AXMC .338, SV-98',
      municion: '.338 Lapua Magnum AP, 7.62x54mmR BS',
      debiles: 'Inmóvil en su puesto defensivo, vulnerable si consigues romper su línea visual inicial.',
      loot: 'Rifle táctico AXMC .338, munición Lapua AP de coleccionista, telemetría militar.'
    }
  ], []);

  // FETCH GRAPHQL PARA MAPAS Y SPAWNS
  useEffect(() => {
    const queryGraphQL = JSON.stringify({
      query: `{
        bosses {
          name
          maps {
            name
            spawnChance
          }
        }
      }`
    });

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: queryGraphQL,
    })
      .then(res => res.json())
      .then(result => {
        if (result?.data?.bosses) {
          const poolActualizado = poolBossesEstatico.map(bossLocal => {
            const bossAPI = result.data.bosses.find(b => b.name.toLowerCase() === bossLocal.name.toLowerCase());
            
            if (bossAPI && bossAPI.maps && bossAPI.maps.length > 0) {
              const listaMapas = bossAPI.maps.map(m => m.name).join(', ');
              const ratioPorcentaje = `${Math.round(bossAPI.maps[0].spawnChance * 100)}%`;
              
              return {
                ...bossLocal,
                mapa: listaMapas,
                spawn: ratioPorcentaje,
                spawnDetails: bossAPI.maps.map((map) => ({
                  name: map.name,
                  chance: Math.round(map.spawnChance * 100)
                })).sort((a, b) => b.chance - a.chance)
              };
            }
            return {
              ...bossLocal,
              mapa: bossLocal.mapaDefault,
              spawn: bossLocal.spawnDefault,
              spawnDetails: bossLocal.mapaDefault.split(', ').map((name) => ({
                name,
                chance: Number.parseInt(bossLocal.spawnDefault, 10) || 0
              }))
            };
          });
          setBossesData(poolActualizado);
        } else {
          setBossesData(poolBossesEstatico.map(b => ({
            ...b,
            mapa: b.mapaDefault,
            spawn: b.spawnDefault,
            spawnDetails: b.mapaDefault.split(', ').map((name) => ({ name, chance: Number.parseInt(b.spawnDefault, 10) || 0 }))
          })));
        }
        setCargando(false);
      })
      .catch(() => {
        setBossesData(poolBossesEstatico.map(b => ({
          ...b,
          mapa: b.mapaDefault,
          spawn: b.spawnDefault,
          spawnDetails: b.mapaDefault.split(', ').map((name) => ({ name, chance: Number.parseInt(b.spawnDefault, 10) || 0 }))
        })));
        setCargando(false);
      });
  }, [poolBossesEstatico]);

  const bossesFiltrados = bossesData.filter(boss => {
    const coincideBusqueda = boss.name.toLowerCase().includes(busqueda.toLowerCase());
    const coincideMapa = mapaFiltro === 'ALL' || boss.mapa.toLowerCase().includes(mapaFiltro.toLowerCase());
    const coincideDificultad = dificultadFiltro === 'ALL' || boss.dificultad === dificultadFiltro;
    return coincideBusqueda && coincideMapa && coincideDificultad;
  });

  const getBossPlan = (boss) => {
    if (!boss) return [];

    const base = [
      `Prioridad de apertura: confirmar spawn en ${boss.spawnDetails?.[0]?.name || boss.mapa}.`,
      `Evita duelos largos: ${boss.debiles}`,
      `Municion esperada: ${boss.municion}. Entra con cobertura real y salida clara.`
    ];

    if (boss.dificultad === 'Very Hard') {
      return ['No cruces lineas abiertas sin informacion previa.', 'Usa opticas, rango y cobertura; asumir contacto frontal suele ser muerte.', ...base].slice(0, 5);
    }

    if (boss.dificultad === 'Hard') {
      return ['Limpia guardias o angulos secundarios antes de empujar.', 'Granadas y reposicionamiento valen mas que tradear cara a cara.', ...base].slice(0, 5);
    }

    return ['Aisla al objetivo y corta rutas de empuje.', 'No te quedes quieto tras el primer disparo; reposiciona y fuerza otro angulo.', ...base].slice(0, 5);
  };

  const styles = {
    card: {
      backgroundColor: 'var(--tk-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    badge: (bg = 'rgba(255,255,255,0.06)', col = '#fff') => ({
      backgroundColor: bg,
      color: col,
      fontSize: '0.7rem',
      fontWeight: '800',
      padding: '4px 10px',
      borderRadius: '4px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      display: 'inline-block'
    }),
    input: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '1rem',
      fontFamily: "'Rajdhani', sans-serif",
      width: '100%',
      maxWidth: '300px',
      outline: 'none'
    },
    selector: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      border: '1px solid var(--tk-glass-border)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '1rem',
      fontFamily: "'Rajdhani', sans-serif",
      cursor: 'pointer',
      outline: 'none'
    }
  };

  return (
    <div className="fade-in-slide terminal-panel" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      <style>{`
        @keyframes desgloseFicha {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .boss-card:hover {
          border-color: var(--tk-green) !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(26,176,21,0.08);
        }
      `}</style>

      {/* CABECERA */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>INTEL: BOSSES</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Información vital de todos los bosses del juego.
          </p>
        </div>
        
        <button 
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.3s', fontSize: '0.85rem' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {/* FILTROS TÁCTICOS */}
      <section style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="BUSCAR OBJETIVO..." 
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setBossSeleccionado(null); }}
          style={styles.input}
          disabled={cargando}
        />
        
        <select 
          value={mapaFiltro} 
          onChange={(e) => { setMapaFiltro(e.target.value); setBossSeleccionado(null); }}
          style={styles.selector}
          disabled={cargando}
        >
          <option value="ALL">TODOS LOS MAPAS</option>
          <option value="Customs">CUSTOMS</option>
          <option value="Factory">FACTORY</option>
          <option value="Interchange">INTERCHANGE</option>
          <option value="Lighthouse">LIGHTHOUSE</option>
          <option value="Reserve">RESERVE</option>
          <option value="Shoreline">SHORELINE</option>
          <option value="Streets">STREETS OF TARKOV</option>
          <option value="Woods">WOODS</option>
        </select>

        <select
          value={dificultadFiltro}
          onChange={(e) => { setDificultadFiltro(e.target.value); setBossSeleccionado(null); }}
          style={styles.selector}
          disabled={cargando}
        >
          <option value="ALL">TODAS LAS DIFICULTADES</option>
          <option value="Medium">MEDIUM</option>
          <option value="Hard">HARD</option>
          <option value="Very Hard">VERY HARD</option>
        </select>

        <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800', letterSpacing: '1px' }}>
          {bossesFiltrados.length} objetivos visibles
        </span>
      </section>

      {/* MONITOR DE CARGA */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--tk-text-muted)', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: '700' }}>
          SINCRONIZANDO INTEL DESDE EL SERVIDOR...
        </div>
      ) : (
        <>
          {/* GRID DE CARDS GENERAL */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {bossesFiltrados.map((boss) => {
              const activo = bossSeleccionado?.id === boss.id;
              return (
                <div
                  key={boss.id}
                  onClick={() => setBossSeleccionado(boss)}
                  style={{
                    ...styles.card,
                    border: activo ? '1px solid var(--tk-green)' : '1px solid var(--tk-glass-border)',
                    backgroundColor: activo ? 'rgba(255,255,255,0.04)' : 'var(--tk-glass)'
                  }}
                  className="boss-card"
                >
                  {/* COMPILADOR DINÁMICO DE VITE: Resuelve la imagen en local y producción */}
                  <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#09090a' }}>
                    <BossImage
                      boss={boss}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.85', filter: 'contrast(102%) brightness(95%)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{boss.name}</h3>
                    <span style={styles.badge('rgba(26,176,21,0.08)', 'var(--tk-green)')}>{boss.spawn}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={styles.badge('rgba(255,255,255,0.04)', boss.colorDificultad)}>{boss.dificultad}</span>
                    <span style={styles.badge('rgba(255,207,102,0.07)', '#ffcf66')}>
                      {boss.guardias?.includes('solo') ? 'SOLO' : 'SQUAD'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '-0.3rem' }}>{boss.mapa}</p>
                </div>
              );
            })}
          </section>

          {/* PANEL DETALLADO DEL OBJETIVO */}
          {bossSeleccionado && (
            <section style={{ animation: 'desgloseFicha 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', backgroundColor: 'var(--tk-glass)', border: '1px solid var(--tk-glass-border)', borderRadius: '16px', padding: '2.5rem' }}>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--tk-glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', flexShrink: 0, backgroundColor: '#000' }}>
                  <BossImage
                    boss={bossSeleccionado}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={styles.badge('rgba(26,176,21,0.1)', 'var(--tk-green)')}>INFORME TÁCTICO REVISADO</span>
                    <span style={styles.badge('rgba(255,255,255,0.04)', bossSeleccionado.colorDificultad)}>{bossSeleccionado.dificultad}</span>
                  </div>
                  <h3 style={{ fontSize: '2.4rem', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginTop: '0.3rem' }}>{bossSeleccionado.name}</h3>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem', color: '#fff' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>SPAWN POR MAPA</span>
                    <div style={{ display: 'grid', gap: '0.45rem' }}>
                      {(bossSeleccionado.spawnDetails || []).map((spawn) => (
                        <div key={spawn.name} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 46px', alignItems: 'center', gap: '0.75rem' }}>
                          <strong style={{ color: '#fff' }}>{spawn.name}</strong>
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, spawn.chance)}%`, height: '100%', background: 'var(--tk-green)' }} />
                          </div>
                          <span style={{ color: 'var(--tk-green)', fontWeight: '900', textAlign: 'right' }}>{spawn.chance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>ZONAS DE SPAWN CONOCIDAS</span>
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                      {getBossSpawnZones(bossSeleccionado).map((spawn) => (
                        <div
                          key={`${spawn.name}-zones`}
                          style={{
                            background: 'rgba(0,0,0,0.22)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            padding: '0.85rem'
                          }}
                        >
                          <div style={{ marginBottom: '0.65rem' }}>
                            <strong style={{ color: '#fff', fontSize: '1rem' }}>{spawn.name}</strong>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '0.8rem', alignItems: 'stretch' }}>
                            <div
                              aria-hidden="true"
                              style={{
                                minHeight: '72px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                background:
                                  'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), radial-gradient(circle at 62% 38%, rgba(26,176,21,0.38), transparent 9px), rgba(0,0,0,0.28)',
                                backgroundSize: '22px 22px, 22px 22px, auto, auto',
                                boxShadow: 'inset 0 0 18px rgba(0,0,0,0.35)'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignContent: 'flex-start' }}>
                              {spawn.zones.map((zone) => (
                                <span
                                  key={zone}
                                  style={{
                                    color: '#d7d7d7',
                                    background: 'rgba(255,255,255,0.045)',
                                    border: '1px solid rgba(255,255,255,0.075)',
                                    borderRadius: '999px',
                                    padding: '0.28rem 0.55rem',
                                    fontSize: '0.82rem',
                                    fontWeight: '800'
                                  }}
                                >
                                  {zone}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>LOCALIZACIONES REGISTRADAS</span>
                    <p style={{ fontSize: '1.05rem', color: '#fff' }}>{bossSeleccionado.mapa}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>SQUAD / ESCALADA DE GUARDIAS</span>
                    <p style={{ fontSize: '1.05rem', color: '#fff' }}>{bossSeleccionado.guardias}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>DETALLES VISUALES Y FÍSICOS</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-text-muted)', lineHeight: '1.5' }}>{bossSeleccionado.fisico}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>MECÁNICA Y ACTITUD DE COMBATE</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-text-muted)', lineHeight: '1.5' }}>{bossSeleccionado.actitud}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>PLAN DE ENTRADA RECOMENDADO</span>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--tk-text-muted)', lineHeight: 1.55 }}>
                      {getBossPlan(bossSeleccionado).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>ARMAMENTO PRINCIPAL ASIGNADO</span>
                    <p style={{ fontSize: '1.05rem', color: '#fff' }}>{bossSeleccionado.armas}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>TIPO DE MUNICIÓN DETECTADA</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-red)' }}>{bossSeleccionado.municion}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>PUNTOS DE IMPACTO CRÍTICO / DEBILIDADES</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-green)' }}>{bossSeleccionado.debiles}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>LOOT DE ALTO VALOR</span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--tk-text-muted)', lineHeight: '1.5' }}>{bossSeleccionado.loot}</p>
                  </div>
                </div>

              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}
