import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const STORAGE_PREFIX = 'sherpa_progreso_misiones_';
const MODE_STORAGE_KEY = 'sherpa_modo_misiones_activo';

const normalizedMapNames = {
  bigmap: 'Customs',
  customs: 'Customs',
  shoreline: 'Shoreline',
  woods: 'Woods',
  interchange: 'Interchange',
  reserve: 'Reserve',
  laboratory: 'Labs',
  labs: 'Labs',
  factory4_day: 'Factory',
  factory4_night: 'Factory',
  factory: 'Factory',
  lighthouse: 'Lighthouse',
  tarkovstreets: 'Streets',
  streets: 'Streets',
  sandbox: 'Ground Zero',
  terminal: 'Terminal'
};

const fallbackPlans = [
  {
    map: 'Customs',
    reason: 'Mapa temprano con muchas cadenas de Prapor, Therapist y Skier.',
    tasks: ['Checking', 'Operation Aquarius - Part 1', 'Pharmacist', 'Delivery from the Past'],
    keys: ['Machinery key', 'Dorm room 206 key', 'Dorm room 114 key', 'Factory emergency exit key'],
    risk: 'Alto en Dorms y construccion',
    score: 18
  },
  {
    map: 'Shoreline',
    reason: 'Fuerte concentracion de quests de resort y progresion de Peacekeeper/Therapist.',
    tasks: ['Health Care Privacy', 'Spa Tour', 'Colleagues', 'Anesthesia'],
    keys: ['Health Resort west wing 216', 'West wing 220', 'Cottage back door key'],
    risk: 'Alto en resort',
    score: 16
  },
  {
    map: 'Interchange',
    reason: 'Buen mapa para Ragman, items de hideout y rutas de tiendas.',
    tasks: ['Database - Part 1', 'Vitamins - Part 1', 'Big Sale', 'Make ULTRA Great Again'],
    keys: ['OLI logistics key', 'EMERCOM medical unit key'],
    risk: 'Medio/alto en centro comercial',
    score: 14
  }
];

const keyHintsByMap = {
  Customs: ['Machinery key', 'Dorm room 206 key', 'Dorm room 114 key', 'Factory emergency exit key'],
  Shoreline: ['Health Resort west wing 216', 'Health Resort west wing 220', 'Cottage back door key'],
  Reserve: ['RB-ST key', 'RB-KPRL key'],
  Interchange: ['OLI logistics department office key', 'EMERCOM medical unit key'],
  Woods: ['ZB-014 key'],
  Streets: ['Conference room key'],
  Factory: ['Factory emergency exit key'],
  Labs: ['Labs access keycard', 'TerraGroup Labs keycards']
};

const riskByMap = {
  Customs: 'Alto en Dorms, construccion y gasolinera',
  Shoreline: 'Alto en resort, medio en exteriores',
  Reserve: 'Alto por raiders, bunker y jugadores de loot',
  Interchange: 'Medio/alto por KIBA, tech stores y extracciones',
  Woods: 'Medio, peligro por lineas largas y bosses',
  Lighthouse: 'Alto en water treatment y chalets',
  Streets: 'Alto por densidad de jugadores y rutas interiores',
  Factory: 'Muy alto, combate inmediato',
  Labs: 'Muy alto, raiders y jugadores endgame',
  'Ground Zero': 'Medio, concentrado para progresion temprana',
  Terminal: 'Pendiente de datos estables'
};

const getStorageKey = (mode) => `${STORAGE_PREFIX}${mode.toLowerCase()}`;

const readLocalProgress = (mode) => {
  try {
    const saved = localStorage.getItem(getStorageKey(mode));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const normalizeMapName = (map) => {
  if (!map) return null;
  const rawName = map.normalizedName || map.name || map;
  return normalizedMapNames[String(rawName).toLowerCase()] || rawName;
};

const getTaskMaps = (task) => {
  const maps = new Set();
  const directMap = normalizeMapName(task.map);
  if (directMap) maps.add(directMap);

  (task.objectives || []).forEach((objective) => {
    (objective.maps || []).forEach((map) => {
      const normalized = normalizeMapName(map);
      if (normalized) maps.add(normalized);
    });
  });

  return [...maps].filter((map) => map && map !== 'Any');
};

const taskQuery = `
  query {
    tasks {
      id
      name
      wikiLink
      kappaRequired
      trader {
        name
      }
      map {
        name
        normalizedName
      }
      objectives {
        id
        type
        description
        maps {
          name
          normalizedName
        }
      }
    }
  }
`;

export default function QuestOptimizerModule({ onViewChange, session }) {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_STORAGE_KEY) || 'PVP');
  const [tasks, setTasks] = useState([]);
  const [completedIds, setCompletedIds] = useState(() => readLocalProgress(mode));
  const [selectedMap, setSelectedMap] = useState('Todos');
  const [kappaOnly, setKappaOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      if (!session?.user?.id) {
        setCompletedIds(readLocalProgress(mode));
        return;
      }

      const { data, error } = await supabase
        .from('quest_progress')
        .select('completed_task_ids')
        .eq('user_id', session.user.id)
        .eq('mode', mode)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(error);
        setCompletedIds(readLocalProgress(mode));
        return;
      }

      setCompletedIds(Array.isArray(data?.completed_task_ids) ? data.completed_task_ids : readLocalProgress(mode));
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [mode, session?.user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      setLoading(true);
      setStatus('');

      try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ query: taskQuery })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!payload.data?.tasks) throw new Error('Respuesta sin tasks');

        if (!cancelled) setTasks(payload.data.tasks);
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus('No se pudo conectar con tarkov.dev. Mostrando recomendaciones base.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const plans = useMemo(() => {
    if (!tasks.length) return fallbackPlans;

    const completed = new Set(completedIds);
    const byMap = new Map();

    tasks.forEach((task) => {
      if (completed.has(task.id)) return;
      if (kappaOnly && !task.kappaRequired) return;

      const taskMaps = getTaskMaps(task);
      if (!taskMaps.length) return;

      taskMaps.forEach((map) => {
        if (!byMap.has(map)) {
          byMap.set(map, {
            map,
            reason: 'Agrupa quests pendientes detectadas por mapa desde tarkov.dev.',
            tasks: [],
            kappaCount: 0,
            traders: new Set(),
            keys: keyHintsByMap[map] || [],
            risk: riskByMap[map] || 'Riesgo variable segun ruta',
            score: 0
          });
        }

        const plan = byMap.get(map);
        plan.tasks.push(task);
        if (task.kappaRequired) plan.kappaCount += 1;
        if (task.trader?.name) plan.traders.add(task.trader.name);
      });
    });

    return [...byMap.values()]
      .map((plan) => ({
        ...plan,
        score: plan.tasks.length * 3 + plan.kappaCount * 2 + Math.min(plan.keys.length, 3),
        traders: [...plan.traders],
        tasks: plan.tasks
          .sort((a, b) => Number(b.kappaRequired) - Number(a.kappaRequired) || a.name.localeCompare(b.name))
          .slice(0, 8)
      }))
      .sort((a, b) => b.score - a.score);
  }, [completedIds, kappaOnly, tasks]);

  const visiblePlans = selectedMap === 'Todos'
    ? plans
    : plans.filter((plan) => plan.map === selectedMap);

  const availableMaps = ['Todos', ...new Set(plans.map((plan) => plan.map))];
  const bestPlan = visiblePlans[0];

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        padding: '6rem 2rem 8rem',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <main style={{ width: 'min(1220px, 100%)', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '2rem',
            alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.45rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Siguiente mejor raid
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.7rem', textTransform: 'uppercase' }}>
              Quest Optimizer
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '820px', lineHeight: 1.6 }}>
              Analiza quests pendientes, mapas, Kappa y llaves recomendadas para sugerirte donde aprovechar mejor la siguiente raid.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onViewChange('home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '900',
              letterSpacing: '1px',
              whiteSpace: 'nowrap'
            }}
          >
            VOLVER AL MENU
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            style={selectStyle}
          >
            <option value="PVP">PVP</option>
            <option value="PVE">PVE</option>
          </select>

          <select
            value={selectedMap}
            onChange={(event) => setSelectedMap(event.target.value)}
            style={selectStyle}
          >
            {availableMaps.map((map) => (
              <option key={map} value={map}>{map}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setKappaOnly((current) => !current)}
            style={{
              ...buttonStyle,
              background: kappaOnly ? 'var(--tk-green)' : 'rgba(255,255,255,0.055)',
              color: kappaOnly ? '#061006' : '#fff',
              borderColor: kappaOnly ? 'var(--tk-green)' : 'rgba(255,255,255,0.1)'
            }}
          >
            {kappaOnly ? 'Solo Kappa activo' : 'Priorizar Kappa'}
          </button>
        </section>

        {loading && <p style={{ color: 'var(--tk-green)' }}>Analizando quests...</p>}
        {status && <p style={{ color: '#ffcf66' }}>{status}</p>}

        {bestPlan && (
          <section
            style={{
              background: 'rgba(26,176,21,0.07)',
              border: '1px solid rgba(26,176,21,0.2)',
              borderRadius: '8px',
              padding: '1.4rem',
              marginBottom: '1rem'
            }}
          >
            <span style={{ color: 'var(--tk-green)', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Recomendacion principal
            </span>
            <h2 style={{ color: '#fff', margin: '0.35rem 0' }}>{bestPlan.map}</h2>
            <p style={{ color: 'var(--tk-text-muted)', margin: 0, lineHeight: 1.55 }}>
              {bestPlan.reason} Score tactico: {bestPlan.score}. Riesgo: {bestPlan.risk}.
            </p>
          </section>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1rem' }}>
          {visiblePlans.map((plan) => (
            <article
              key={plan.map}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '1.25rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ color: '#fff', margin: 0 }}>{plan.map}</h2>
                  <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0' }}>
                    {plan.tasks.length} quests visibles · {plan.kappaCount || 0} Kappa
                  </p>
                </div>
                <strong style={{ color: 'var(--tk-green)', fontSize: '1.5rem' }}>{plan.score}</strong>
              </div>

              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55 }}>{plan.risk}</p>

              <InfoBlock title="Quests sugeridas">
                {plan.tasks.map((task) => (
                  <li key={task.id}>
                    {task.name}
                    {task.kappaRequired && <strong style={{ color: 'var(--tk-green)' }}> · Kappa</strong>}
                    {task.trader?.name && <span style={{ color: 'var(--tk-text-muted)' }}> · {task.trader.name}</span>}
                  </li>
                ))}
              </InfoBlock>

              <InfoBlock title="Llaves a revisar">
                {(plan.keys.length ? plan.keys : ['Sin llaves criticas detectadas para esta ruta']).map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </InfoBlock>

              {plan.traders?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
                  {plan.traders.slice(0, 6).map((trader) => (
                    <span key={trader} style={tagStyle}>{trader}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>

        {!loading && visiblePlans.length === 0 && (
          <p style={{ color: 'var(--tk-text-muted)', marginTop: '2rem' }}>
            No hay rutas disponibles con estos filtros. Prueba a desactivar Kappa o cambiar de mapa.
          </p>
        )}
      </main>
    </div>
  );
}

const selectStyle = {
  background: '#18191b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.85rem 1rem',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900'
};

const buttonStyle = {
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '0.85rem 1rem',
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900'
};

const tagStyle = {
  color: 'var(--tk-green)',
  background: 'rgba(26,176,21,0.07)',
  border: '1px solid rgba(26,176,21,0.16)',
  borderRadius: '999px',
  padding: '0.2rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: '800'
};

function InfoBlock({ title, children }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ color: '#fff', margin: '0 0 0.45rem', fontSize: '1rem', textTransform: 'uppercase' }}>{title}</h3>
      <ul style={{ color: '#eee', margin: 0, paddingLeft: '1.1rem', lineHeight: 1.55 }}>
        {children}
      </ul>
    </div>
  );
}
