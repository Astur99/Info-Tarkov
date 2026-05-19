import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import QuestOptimizerModule from './QuestOptimizerModule';

const STORAGE_PREFIX = 'sherpa_progreso_misiones_';
const MODE_STORAGE_KEY = 'sherpa_modo_misiones_activo';
const COLLECTOR_STORAGE_PREFIX = 'info_tarkov_collector_items_';

const collectorItemsList = [
  { id: '42-tea', name: '42 Signature Blend English Tea', hint: 'Food spawns, ration crates' },
  { id: 'antique-axe', name: 'Antique axe', hint: 'Scavs, safes, stashes' },
  { id: 'evasion-armband', name: 'Armband (Evasion)', apiName: 'Armband (Evasion)', hint: 'Stashes, weapon boxes, marked rooms' },
  { id: 'axel-parrot', name: 'Axel parrot figurine', hint: 'Safes, valuables, stashes' },
  { id: 'bear-buddy', name: 'BEAR Buddy plush toy', hint: 'Duffles, stashes, loose loot' },
  { id: 'baddie-beard', name: "Baddie's red beard", hint: 'Scavs, duffles, stashes' },
  { id: 'bakeezy-book', name: 'BakeEzy cook book', hint: 'Filing cabinets, shelves, stashes' },
  { id: 'battered-antique-book', name: 'Battered antique book', hint: 'Safes, jackets, filing cabinets' },
  { id: 'ratcola', name: 'Can of RatCola soda', hint: 'Food spawns, ration crates' },
  { id: 'sprats', name: 'Can of sprats', hint: 'Food spawns, ration crates' },
  { id: 'drd-armor', name: 'DRD body armor', hint: 'Stashes, armor spawns, Scavs' },
  { id: 'deadlyslob-beard-oil', name: 'Deadlyslob beard oil', hint: 'Interchange, shelves, stashes' },
  { id: 'domontovich-ushanka', name: 'Domontovich ushanka hat', hint: 'Scavs, clothing spawns, stashes' },
  { id: 'fake-mustache', name: 'Fake mustache', hint: 'Scavs, stashes, jackets' },
  { id: 'fireklean', name: '#FireKlean gun lube', hint: 'Technical crates, shelves, stashes' },
  { id: 'gingy-keychain', name: 'Gingy keychain', hint: 'Safes, jackets, stashes' },
  { id: 'glorious-mask', name: 'Glorious E lightweight armored mask', hint: 'Scavs, bosses, stashes' },
  { id: 'golden-1gphone', name: 'Golden 1GPhone smartphone', hint: 'Safes, tech spawns, filing cabinets' },
  { id: 'golden-egg', name: 'Golden egg', hint: 'Safes, valuables, stashes' },
  { id: 'golden-rooster', name: 'Golden rooster figurine', hint: 'Safes, valuables, Labs' },
  { id: 'inseq-wrench', name: 'Inseq gas pipe wrench', hint: 'Technical crates, toolboxes, shelves' },
  { id: 'devildog-mayo', name: 'Jar of DevilDog mayo', hint: 'Food spawns, ration crates' },
  { id: 'johnb-glasses', name: 'JohnB Liquid DNB glasses', hint: 'Scavs, jackets, stashes' },
  { id: 'kotton-beanie', name: 'Kotton beanie', hint: 'Scavs, duffles, stashes' },
  { id: 'lvndmark-rat-poison', name: "LVNDMARK's rat poison", hint: 'Medical/valuable spawns, stashes' },
  { id: 'loot-lord', name: 'Loot Lord plushie', hint: 'Duffles, stashes, rare loose loot' },
  { id: 'mazoni-dumbbell', name: 'Mazoni golden dumbbell', hint: 'Safes, valuables, rare loose loot' },
  { id: 'missam-key', name: 'Missam forklift key', hint: 'Jackets, drawers, filing cabinets' },
  { id: 'nuct-balaclava', name: 'Nuct Salk balaclava', apiName: "Nuct's balaclava", hint: 'Scavs, clothing spawns, stashes' },
  { id: 'old-firesteel', name: 'Old firesteel', hint: 'Reserve, safes, technical spawns' },
  { id: 'pestily-mask', name: 'Pestily plague mask', hint: 'Scavs, cultists, stashes' },
  { id: 'press-pass', name: 'Press pass (issued for NoiceGuy)', hint: 'Filing cabinets, jackets, Streets' },
  { id: 'raven-figurine', name: 'Raven figurine', hint: 'Safes, valuables, stashes' },
  { id: 'shroud-mask', name: 'Shroud half-mask', hint: 'Scavs, duffles, stashes' },
  { id: 'silver-badge', name: 'Silver Badge', hint: 'Safes, valuables, jackets' },
  { id: 'smoke-balaclava', name: 'Smoke balaclava', hint: 'Scavs, clothing spawns' },
  { id: 'tamatthi-kunai', name: 'Tamatthi kunai knife replica', hint: 'Safes, valuables, stashes' },
  { id: 'tigz-splint', name: 'Tigzresq splint', hint: 'Medical spawns, medbags, stashes' },
  { id: 'veritas-pick', name: 'Veritas guitar pick', hint: 'Safes, filing cabinets, valuables' },
  { id: 'cyborg-killer', name: 'Video cassette with the Cyborg Killer movie', hint: 'Drawers, shelves, stashes' },
  { id: 'viibiin-sneaker', name: 'Viibiin sneaker', hint: 'Duffles, stashes, loose loot' },
  { id: 'wz-wallet', name: 'WZ Wallet', hint: 'Safes, jackets, stashes' }
];

const collectorItemNames = collectorItemsList.map((item) => item.apiName || item.name);

const getStorageKey = (mode) => `${STORAGE_PREFIX}${mode.toLowerCase()}`;
const getCollectorStorageKey = (mode) => `${COLLECTOR_STORAGE_PREFIX}${mode.toLowerCase()}`;

const normalizeCollectorName = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const readProgress = (mode) => {
  try {
    const saved = localStorage.getItem(getStorageKey(mode));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalProgress = (mode, progress) => {
  localStorage.setItem(getStorageKey(mode), JSON.stringify(progress));
};

const readCollectorProgress = (mode) => {
  try {
    const saved = localStorage.getItem(getCollectorStorageKey(mode));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveCollectorProgress = (mode, progress) => {
  localStorage.setItem(getCollectorStorageKey(mode), JSON.stringify(progress));
};

const collectorItemsQuery = `
  query GetCollectorItems($names: [String]) {
    items(names: $names) {
      id
      name
      shortName
      iconLink
      imageLink
      wikiLink
    }
  }
`;

const saveCloudProgress = async (userId, mode, progress) => {
  const { error } = await supabase
    .from('quest_progress')
    .upsert(
      {
        user_id: userId,
        mode,
        completed_task_ids: progress,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,mode' }
    );

  if (error) throw error;
};

const getInitialTreePan = () => ({
  x: typeof window === 'undefined' ? 900 : window.innerWidth / 2,
  y: 120
});

export default function KappaTree({ onViewChange, session, initialTool = 'tree' }) {
  const { t } = useTranslation();
  const [modoJuego, setModoJuego] = useState(() => {
    try {
      return localStorage.getItem(MODE_STORAGE_KEY) || 'PVP';
    } catch {
      return 'PVP';
    }
  });

  const [todasLasMisiones, setTodasLasMisiones] = useState([]);
  const [currentTrader, setCurrentTrader] = useState('Prapor');
  const [arbolEstructurado, setArbolEstructurado] = useState({
    nodos: [],
    conexiones: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [soloKappa, setSoloKappa] = useState(false);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [activeTool, setActiveTool] = useState(initialTool);
  const [collectorOpen, setCollectorOpen] = useState(false);
  const [collectorItems, setCollectorItems] = useState(() => readCollectorProgress('PVP'));
  const [collectorSearch, setCollectorSearch] = useState('');
  const [collectorItemAssets, setCollectorItemAssets] = useState({});

  const [completadas, setCompletadas] = useState(() => readProgress('PVP'));

  const matrixRef = useRef(null);
  const suppressSaveRef = useRef(false);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState(getInitialTreePan);
  const [isDown, setIsDown] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const traders = [
    'Prapor',
    'Therapist',
    'Skier',
    'Peacekeeper',
    'Mechanic',
    'Ragman',
    'Jaeger',
    'Fence',
    'Lightkeeper'
  ];

  const traderStyles = {
    Prapor: { color: '#8F9F7F', bgGradient: 'rgba(143, 159, 127, 0.06)' },
    Therapist: { color: '#4A90E2', bgGradient: 'rgba(74, 144, 226, 0.06)' },
    Skier: { color: '#D4AF37', bgGradient: 'rgba(212, 175, 55, 0.06)' },
    Peacekeeper: { color: '#50E3C2', bgGradient: 'rgba(80, 227, 194, 0.06)' },
    Mechanic: { color: '#9B9B9B', bgGradient: 'rgba(155, 155, 155, 0.06)' },
    Ragman: { color: '#A5673F', bgGradient: 'rgba(165, 103, 63, 0.06)' },
    Jaeger: { color: '#7ED321', bgGradient: 'rgba(126, 211, 33, 0.06)' },
    Fence: { color: '#9013FE', bgGradient: 'rgba(144, 19, 254, 0.06)' },
    Lightkeeper: { color: '#D16E41', bgGradient: 'rgba(209, 110, 65, 0.06)' },
    DEFAULT: { color: '#8F9F7F', bgGradient: 'rgba(143, 159, 127, 0.06)' }
  };

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, modoJuego);
  }, [modoJuego]);

  useEffect(() => {
    setCollectorItems(readCollectorProgress(modoJuego));
    setCollectorSearch('');
  }, [modoJuego]);

  useEffect(() => {
    saveCollectorProgress(modoJuego, collectorItems);
  }, [collectorItems, modoJuego]);

  useEffect(() => {
    let cancelled = false;

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: collectorItemsQuery,
        variables: { names: collectorItemNames }
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error(t('kappa.errors.collectorImages'));
        return res.json();
      })
      .then((response) => {
        if (cancelled) return;

        const assets = {};
        (response.data?.items || []).forEach((item) => {
          assets[normalizeCollectorName(item.name)] = item;
        });

        setCollectorItemAssets(assets);
      })
      .catch((loadError) => {
        console.error(loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      setSyncError(null);

      if (!session?.user?.id) {
        suppressSaveRef.current = false;
        setSyncLoading(false);
        setCompletadas(readProgress(modoJuego));
        return;
      }

      suppressSaveRef.current = true;
      setSyncLoading(true);

      const { data, error: loadError } = await supabase
        .from('quest_progress')
        .select('completed_task_ids')
        .eq('user_id', session.user.id)
        .eq('mode', modoJuego)
        .maybeSingle();

      if (cancelled) return;

      if (loadError) {
        setSyncError(t('kappa.errors.cloudLoad'));
        setCompletadas(readProgress(modoJuego));
        setSyncLoading(false);
        suppressSaveRef.current = false;
        return;
      }

      const cloudProgress = Array.isArray(data?.completed_task_ids)
        ? data.completed_task_ids
        : null;

      if (cloudProgress) {
        setCompletadas(cloudProgress);
      } else {
        const localProgress = readProgress(modoJuego);
        setCompletadas(localProgress);

        try {
          await saveCloudProgress(session.user.id, modoJuego, localProgress);
        } catch (saveError) {
          if (!cancelled) {
            console.error(saveError);
            setSyncError(t('kappa.errors.cloudCreate'));
          }
        }
      }

      if (!cancelled) {
        setSyncLoading(false);
        window.setTimeout(() => {
          if (!cancelled) suppressSaveRef.current = false;
        }, 0);
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, modoJuego, t]);

  useEffect(() => {
    if (suppressSaveRef.current || syncLoading) return;

    if (!session?.user?.id) {
      saveLocalProgress(modoJuego, completadas);
      return;
    }

    let cancelled = false;

    saveCloudProgress(session.user.id, modoJuego, completadas).catch((saveError) => {
      if (cancelled) return;
      console.error(saveError);
      setSyncError(t('kappa.errors.cloudSync'));
    });

    return () => {
      cancelled = true;
    };
  }, [completadas, modoJuego, session?.user?.id, syncLoading, t]);

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
              name
              trader {
                name
              }
            }
          }
        }
      }
    `;

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ query })
    })
      .then((res) => {
        if (!res.ok) throw new Error(t('kappa.errors.serverCommunication'));
        return res.json();
      })
      .then((response) => {
        if (response.data?.tasks) {
          setTodasLasMisiones(response.data.tasks);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(t('kappa.errors.centralApi'));
        setLoading(false);
      });
  }, [t]);

  const cambiarModoJuego = (nuevoModo) => {
    if (nuevoModo === modoJuego) return;

    if (session?.user?.id) {
      suppressSaveRef.current = true;
      setSyncLoading(true);
    } else {
      saveLocalProgress(modoJuego, completadas);
      setCompletadas(readProgress(nuevoModo));
    }

    localStorage.setItem(MODE_STORAGE_KEY, nuevoModo);

    setModoJuego(nuevoModo);
    setSoloPendientes(false);
    setSearchQuery('');
  };

  const obtenerPrerequisitosRecursivos = (misionId) => {
    const mapa = new Map(todasLasMisiones.map((m) => [m.id, m]));
    const visitadas = new Set();

    const recorrer = (id) => {
      const mision = mapa.get(id);
      if (!mision) return;

      const requisitos = mision.taskRequirements || [];

      requisitos.forEach((req) => {
        const requisitoId = req?.task?.id;
        if (!requisitoId || visitadas.has(requisitoId)) return;

        visitadas.add(requisitoId);
        recorrer(requisitoId);
      });
    };

    recorrer(misionId);
    return Array.from(visitadas);
  };

  const obtenerDependientesRecursivos = (misionId) => {
    const visitadas = new Set();

    const recorrer = (id) => {
      const hijas = todasLasMisiones.filter((mision) =>
        (mision.taskRequirements || []).some((req) => req?.task?.id === id)
      );

      hijas.forEach((hija) => {
        if (visitadas.has(hija.id)) return;

        visitadas.add(hija.id);
        recorrer(hija.id);
      });
    };

    recorrer(misionId);
    return Array.from(visitadas);
  };

  const completarMisionConPrevias = (misionId) => {
    const previas = obtenerPrerequisitosRecursivos(misionId);

    setCompletadas((prev) => {
      const nuevas = new Set(prev);
      previas.forEach((id) => nuevas.add(id));
      nuevas.add(misionId);
      return Array.from(nuevas);
    });
  };

  const desmarcarRamaCompleta = (misionId) => {
    const previas = obtenerPrerequisitosRecursivos(misionId);
    const dependientes = obtenerDependientesRecursivos(misionId);

    const idsAEliminar = new Set([
      misionId,
      ...previas,
      ...dependientes
    ]);

    setCompletadas((prev) => prev.filter((id) => !idsAEliminar.has(id)));
  };

  const toggleMision = (id) => {
    if (completadas.includes(id)) {
      desmarcarRamaCompleta(id);
    } else {
      completarMisionConPrevias(id);
    }
  };

  const resetearProgreso = () => {
    const confirmar = window.confirm(
      t('kappa.confirm.resetProgress', { mode: modoJuego })
    );

    if (!confirmar) return;

    setCompletadas([]);

    if (!session?.user?.id) {
      saveLocalProgress(modoJuego, []);
    }
  };

  const toggleCollectorItem = (itemId) => {
    setCollectorItems((current) => ({
      ...current,
      [itemId]: !current[itemId]
    }));
  };

  const resetCollectorItems = () => {
    const confirmar = window.confirm(
      t('kappa.confirm.resetCollector', { mode: modoJuego })
    );

    if (!confirmar) return;
    setCollectorItems({});
  };

  const handleSearchChange = (e) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);

    if (queryText.trim() === '') return;

    const misionEncontrada = todasLasMisiones.find(
      (m) =>
        m.name &&
        m.name.toLowerCase().includes(queryText.toLowerCase()) &&
        (soloKappa ? m.kappaRequired : true) &&
        (soloPendientes ? !completadas.includes(m.id) : true)
    );

    if (misionEncontrada?.trader?.name) {
      const traderDestino = misionEncontrada.trader.name;

      if (traders.includes(traderDestino) && traderDestino !== currentTrader) {
        setCurrentTrader(traderDestino);
      }
    }
  };

  useEffect(() => {
    if (!todasLasMisiones.length) return;

    let misionesDelTrader = todasLasMisiones.filter(
      (m) => m.trader?.name === currentTrader
    );

    if (soloKappa) {
      misionesDelTrader = misionesDelTrader.filter((m) => m.kappaRequired);
    }

    if (soloPendientes) {
      misionesDelTrader = misionesDelTrader.filter(
        (m) => !completadas.includes(m.id)
      );
    }

    const mapaMisiones = new Map(misionesDelTrader.map((m) => [m.id, m]));
    const niveles = {};

    misionesDelTrader.forEach((m) => {
      niveles[m.id] = 0;
    });

    misionesDelTrader.forEach((m) => {
      const prevIds = m.taskRequirements
        ? m.taskRequirements
            .map((req) => req?.task?.id)
            .filter((id) => mapaMisiones.has(id))
        : [];

      m._prevIds = prevIds;
    });

    let cambio = true;

    for (let i = 0; i < 20 && cambio; i++) {
      cambio = false;

      misionesDelTrader.forEach((m) => {
        m._prevIds.forEach((pId) => {
          if (niveles[m.id] <= niveles[pId]) {
            niveles[m.id] = niveles[pId] + 1;
            cambio = true;
          }
        });
      });
    }

    const misionesPorNivel = {};

    misionesDelTrader.forEach((m) => {
      const lvl = niveles[m.id];

      if (!misionesPorNivel[lvl]) misionesPorNivel[lvl] = [];

      if (!misionesPorNivel[lvl].some((x) => x.id === m.id)) {
        misionesPorNivel[lvl].push(m);
      }
    });

    const nivelesOrdenados = Object.keys(misionesPorNivel).sort(
      (a, b) => Number(a) - Number(b)
    );

    nivelesOrdenados.forEach((lvl, idx) => {
      if (idx === 0) return;

      const nivelAnterior = misionesPorNivel[nivelesOrdenados[idx - 1]];

      misionesPorNivel[lvl].sort((a, b) => {
        const primerPadreA = a._prevIds
          .map((pId) => nivelAnterior.findIndex((n) => n.id === pId))
          .filter((index) => index !== -1)[0];

        const primerPadreB = b._prevIds
          .map((pId) => nivelAnterior.findIndex((n) => n.id === pId))
          .filter((index) => index !== -1)[0];

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

    Object.keys(misionesPorNivel).forEach((lvl) => {
      const lista = misionesPorNivel[lvl];
      const totalNivel = lista.length;
      const anchoTotalNivel =
        totalNivel * CARD_WIDTH + (totalNivel - 1) * GAP_X;
      const inicioX = -anchoTotalNivel / 2;

      lista.forEach((mision, index) => {
        const posX = inicioX + index * (CARD_WIDTH + GAP_X);
        const posY = lvl * (CARD_HEIGHT + GAP_Y);

        nodosCalculados.push({
          ...mision,
          x: posX,
          y: posY,
          prevIds: mision._prevIds
        });
      });
    });

    nodosCalculados.forEach((nodo) => {
      nodo.prevIds.forEach((pId) => {
        const padre = nodosCalculados.find((n) => n.id === pId);

        if (padre) {
          conexionesCalculadas.push({
            id: `${padre.id}-${nodo.id}`,
            from: {
              x: padre.x + CARD_WIDTH / 2,
              y: padre.y + CARD_HEIGHT
            },
            to: {
              x: nodo.x + CARD_WIDTH / 2,
              y: nodo.y
            },
            activo: completadas.includes(padre.id)
          });
        }
      });
    });

    setArbolEstructurado({
      nodos: nodosCalculados,
      conexiones: conexionesCalculadas
    });

    if (searchQuery.trim() !== '') {
      const nodoMatch = nodosCalculados.find(
        (n) =>
          n.name &&
          n.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (nodoMatch) {
        const centroPantallaX = window.innerWidth / 2;
        const centroPantallaY = window.innerHeight / 2;

        setPan({
          x: centroPantallaX - (nodoMatch.x + CARD_WIDTH / 2) * zoom,
          y: centroPantallaY - (nodoMatch.y + CARD_HEIGHT / 2) * zoom
        });
      }
    }
  }, [
    currentTrader,
    todasLasMisiones,
    searchQuery,
    soloKappa,
    soloPendientes,
    completadas,
    zoom
  ]);

  const handleWheel = (e) => {
    e.preventDefault();

    const zoomFactor = 0.05;
    let newZoom = zoom - e.deltaY * zoomFactor * 0.01;
    newZoom = Math.max(0.3, Math.min(1.3, newZoom));

    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (
      e.target.tagName === 'BUTTON' ||
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'A' ||
      e.target.closest?.('[data-fixed-panel="true"]')
    ) {
      return;
    }

    setIsDown(true);

    setStartPan({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseLeaveOrUp = () => setIsDown(false);

  const handleMouseMove = (e) => {
    if (!isDown) return;

    e.preventDefault();

    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const activeStyle = traderStyles[currentTrader] || traderStyles.DEFAULT;

  const totalMisiones = todasLasMisiones.length;

  const totalMisionesCompletadas = todasLasMisiones.filter((mision) =>
    completadas.includes(mision.id)
  ).length;

  const totalMisionesKappa = todasLasMisiones.filter(
    (mision) => mision.kappaRequired
  ).length;

  const totalMisionesKappaCompletadas = todasLasMisiones.filter(
    (mision) => mision.kappaRequired && completadas.includes(mision.id)
  ).length;

  const totalMisionesPendientes = totalMisiones - totalMisionesCompletadas;

  const totalMisionesKappaPendientes =
    totalMisionesKappa - totalMisionesKappaCompletadas;

  const totalCollectorItems = collectorItemsList.length;
  const totalCollectorItemsCompletados = collectorItemsList.filter((item) => collectorItems[item.id]).length;
  const collectorProgressPercent = totalCollectorItems
    ? Math.round((totalCollectorItemsCompletados / totalCollectorItems) * 100)
    : 0;
  const collectorItemsFiltrados = collectorItemsList.filter((item) => {
    const query = collectorSearch.trim().toLowerCase();
    if (!query) return true;
    return `${item.name} ${item.hint}`.toLowerCase().includes(query);
  });

  const statPanelStyle = {
    position: 'absolute',
    right: '2rem',
    bottom: '2rem',
    zIndex: 50,
    width: '290px',
    backgroundColor: 'rgba(10,10,10,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    pointerEvents: 'auto'
  };

  const statRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.35rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)'
  };

  const statLabelStyle = {
    color: 'var(--tk-text-muted)',
    fontSize: '0.76rem',
    fontWeight: '700',
    letterSpacing: '0.5px'
  };

  const statValueStyle = {
    color: 'var(--tk-green)',
    fontSize: '0.85rem',
    fontWeight: '900'
  };

  const filterButtonStyle = (active) => ({
    width: '100%',
    marginTop: '0.6rem',
    backgroundColor: active
      ? 'rgba(26,176,21,0.18)'
      : 'rgba(255,255,255,0.035)',
    border: `1px solid ${
      active ? 'var(--tk-green)' : 'rgba(255,255,255,0.08)'
    }`,
    borderRadius: '8px',
    color: active ? 'var(--tk-green)' : '#d7d7d7',
    fontWeight: '900',
    letterSpacing: '0.7px',
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
    padding: '0.65rem',
    boxShadow: active ? '0 0 16px rgba(26,176,21,0.18)' : 'none'
  });

  const modeButtonStyle = (active) => ({
    flex: 1,
    backgroundColor: active
      ? 'var(--tk-green)'
      : 'rgba(255,255,255,0.035)',
    border: `1px solid ${
      active ? 'var(--tk-green)' : 'rgba(255,255,255,0.08)'
    }`,
    borderRadius: '8px',
    color: active ? '#061006' : '#d7d7d7',
    fontWeight: '900',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
    padding: '0.55rem',
    boxShadow: active ? '0 0 18px rgba(26,176,21,0.28)' : 'none'
  });

  if (activeTool === 'optimizer') {
    return (
      <QuestOptimizerModule
        session={session}
        onViewChange={(nextView) => {
          if (nextView === 'home') {
            setActiveTool('tree');
            return;
          }

          onViewChange(nextView);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontFamily: "'Rajdhani', sans-serif"
        }}
      >
        <p
          style={{
            letterSpacing: '2px',
            color: 'var(--tk-green)',
            fontSize: '1.5rem',
            textTransform: 'uppercase'
          }}
        >
          COMPILANDO MATRIZ JERÁRQUICA, ESPERE...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '4rem',
          color: '#ff6b6b',
          fontFamily: "'Rajdhani', sans-serif"
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className="terminal-panel"
      style={{
        padding: '2rem 1rem 0 1rem',
        width: '100%',
        maxWidth: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          zIndex: 10,
          paddingBottom: '1rem'
        }}
      >
        <button
          onClick={() => onViewChange('home')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--tk-green)',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: '600',
            letterSpacing: '1px'
          }}
        >
          {t('common.backToTerminal')}
        </button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ flex: '1 1 760px' }}>
            <h2
              style={{
                fontSize: '2.2rem',
                letterSpacing: '1px',
                margin: 0,
                fontWeight: '700'
              }}
            >
              {t('kappa.title')}
            </h2>

            <p
              style={{
                color: 'var(--tk-text-muted)',
                margin: '5px 0 0 0',
                fontSize: '0.95rem'
              }}
            >
              {t('kappa.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setActiveTool('optimizer')}
              style={{
                backgroundColor: 'rgba(26,176,21,0.08)',
                border: '1px solid rgba(26,176,21,0.24)',
                borderRadius: '8px',
                color: 'var(--tk-green)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.92rem',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {t('kappa.optimizerButton')}
            </button>

            <input
              type="text"
              placeholder={t('kappa.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                backgroundColor: 'rgba(15,15,15,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '1rem',
                width: '280px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '0.5rem'
          }}
        >
          {traders.map((tName) => {
            const esActivo = currentTrader === tName;
            const tStyle = traderStyles[tName] || traderStyles.DEFAULT;

            return (
              <button
                key={tName}
                onClick={() => {
                  setCurrentTrader(tName);
                  setPan(getInitialTreePan());
                }}
                style={{
                  backgroundColor: esActivo
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                  border: 'none',
                  borderBottom: esActivo
                    ? `2px solid ${tStyle.color}`
                    : '2px solid transparent',
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

      <div
        ref={matrixRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        style={{
          flex: 1,
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          position: 'relative',
          overflow: 'hidden',
          cursor: isDown ? 'grabbing' : 'grab',
          backgroundColor: '#030303'
        }}
      >
        {collectorOpen && (
          <CollectorPanel
            mode={modoJuego}
            items={collectorItemsFiltrados}
            allItems={collectorItemsList}
            completed={collectorItems}
            itemAssets={collectorItemAssets}
            search={collectorSearch}
            progressPercent={collectorProgressPercent}
            completedCount={totalCollectorItemsCompletados}
            totalCount={totalCollectorItems}
            onSearchChange={setCollectorSearch}
            onToggleItem={toggleCollectorItem}
            onReset={resetCollectorItems}
            onClose={() => setCollectorOpen(false)}
          />
        )}

        <aside data-fixed-panel="true" style={statPanelStyle}>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.9rem'
            }}
          >
            <button
              onClick={() => cambiarModoJuego('PVP')}
              style={modeButtonStyle(modoJuego === 'PVP')}
            >
              PvP
            </button>

            <button
              onClick={() => cambiarModoJuego('PVE')}
              style={modeButtonStyle(modoJuego === 'PVE')}
            >
              PvE
            </button>
          </div>

          <div
            style={{
              marginBottom: '1rem',
              padding: '0.55rem 0.7rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--tk-text-muted)',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.7px',
              textAlign: 'center'
            }}
          >
            {t('kappa.panel.activeProfile')}: <span style={{ color: 'var(--tk-green)' }}>{modoJuego}</span>
          </div>

          <div
            style={{
              marginBottom: '1rem',
              padding: '0.55rem 0.7rem',
              borderRadius: '8px',
              backgroundColor: session?.user?.id
                ? 'rgba(26,176,21,0.07)'
                : 'rgba(255,207,102,0.075)',
              border: `1px solid ${
                syncError
                  ? 'rgba(255,107,107,0.35)'
                  : session?.user?.id
                  ? 'rgba(26,176,21,0.18)'
                  : 'rgba(255,207,102,0.22)'
              }`,
              color: syncError
                ? '#ff6b6b'
                : session?.user?.id
                ? 'var(--tk-green)'
                : '#ffcf66',
              fontSize: '0.72rem',
              fontWeight: '900',
              letterSpacing: '0.7px',
              textAlign: 'center'
            }}
          >
            {syncError ||
              (syncLoading
                ? t('kappa.panel.syncing')
                : session?.user?.id
                ? t('kappa.panel.cloudActive')
                : t('kappa.panel.localGuest'))}
          </div>

          <label
            onClick={() => setSoloKappa(!soloKappa)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              marginBottom: '0.7rem',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '800',
              letterSpacing: '0.5px',
              userSelect: 'none'
            }}
          >
            <span
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: `2px solid ${
                  soloKappa ? 'var(--tk-green)' : 'rgba(255,255,255,0.25)'
                }`,
                backgroundColor: soloKappa ? 'var(--tk-green)' : 'transparent',
                boxShadow: soloKappa ? '0 0 12px rgba(26,176,21,0.35)' : 'none'
              }}
            />

            {t('kappa.panel.kappaOnly')}
          </label>

          <button
            onClick={() => setSoloPendientes(!soloPendientes)}
            style={filterButtonStyle(soloPendientes)}
          >
            {soloPendientes
              ? t('kappa.panel.showingIncomplete')
              : t('kappa.panel.showIncomplete')}
          </button>

          <h4
            style={{
              margin: '1rem 0 0.9rem 0',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '900',
              letterSpacing: '1px'
            }}
          >
            {t('kappa.panel.statsTitle')}
          </h4>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.profile')}:</span>
            <strong style={statValueStyle}>{modoJuego}</strong>
          </div>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.total')}:</span>
            <strong style={statValueStyle}>{totalMisiones}</strong>
          </div>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.completed')}:</span>
            <strong style={statValueStyle}>{totalMisionesCompletadas}</strong>
          </div>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.remaining')}:</span>
            <strong style={{ ...statValueStyle, color: '#ffcf66' }}>
              {totalMisionesPendientes}
            </strong>
          </div>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.kappaTotal')}:</span>
            <strong style={statValueStyle}>{totalMisionesKappa}</strong>
          </div>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.kappaCompleted')}:</span>
            <strong style={statValueStyle}>{totalMisionesKappaCompletadas}</strong>
          </div>

          <div style={statRowStyle}>
            <span style={statLabelStyle}>{t('kappa.stats.kappaRemaining')}:</span>
            <strong style={{ ...statValueStyle, color: '#ffcf66' }}>
              {totalMisionesKappaPendientes}
            </strong>
          </div>

          <button
            onClick={resetearProgreso}
            style={{
              width: '100%',
              marginTop: '1rem',
              backgroundColor: 'var(--tk-green)',
              border: 'none',
              borderRadius: '8px',
              color: '#061006',
              fontWeight: '900',
              letterSpacing: '1px',
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              padding: '0.75rem'
            }}
          >
            {t('kappa.panel.resetProgress', { mode: modoJuego })}
          </button>
        </aside>

        <div
          style={{
            position: 'absolute',
            transformOrigin: '0 0',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDown
              ? 'none'
              : 'transform 0.25s cubic-bezier(0.1, 0.8, 0.2, 1)',
            width: '1px',
            height: '1px'
          }}
        >
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '8000px',
              height: '8000px',
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(255,255,255,0.2)" />
              </marker>

              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={activeStyle.color} />
              </marker>
            </defs>

            {arbolEstructurado.conexiones.map((linea) => (
              <path
                key={linea.id}
                d={`M ${linea.from.x} ${linea.from.y} C ${linea.from.x} ${
                  (linea.from.y + linea.to.y) / 2
                }, ${linea.to.x} ${(linea.from.y + linea.to.y) / 2}, ${
                  linea.to.x
                } ${linea.to.y}`}
                fill="none"
                stroke={
                  linea.activo ? activeStyle.color : 'rgba(255,255,255,0.08)'
                }
                strokeWidth={linea.activo ? '3' : '2'}
                markerEnd={linea.activo ? 'url(#arrow-active)' : 'url(#arrow)'}
                style={{
                  transition: 'stroke 0.4s, stroke-width 0.4s'
                }}
              />
            ))}
          </svg>

          {arbolEstructurado.nodos.map((mision) => {
            const esCompletada = completadas.includes(mision.id);
            const esCollector = mision.name?.toLowerCase() === 'collector';

            const esDesbloqueada =
              mision.prevIds.length === 0 ||
              mision.prevIds.every((id) => completadas.includes(id));

            const esMatchBuscador =
              searchQuery.trim() !== '' &&
              mision.name &&
              mision.name.toLowerCase().includes(searchQuery.toLowerCase());

            return (
              <div
                key={mision.id}
                style={{
                  position: 'absolute',
                  left: mision.x,
                  top: mision.y,
                  width: '340px',
                  height: '160px',
                  backgroundColor: esCompletada
                    ? 'rgba(19, 72, 28, 0.75)'
                    : 'rgba(20, 20, 20, 0.85)',
                  backgroundImage: esCompletada
                    ? 'linear-gradient(180deg, rgba(26,176,21,0.18) 0%, rgba(26,176,21,0.04) 100%)'
                    : `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${activeStyle.bgGradient} 100%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: esMatchBuscador
                    ? `2px solid ${activeStyle.color}`
                    : `1px solid ${
                        esCompletada
                          ? 'var(--tk-green)'
                          : esDesbloqueada
                          ? 'rgba(255,255,255,0.14)'
                          : 'rgba(255,255,255,0.06)'
                      }`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: esMatchBuscador
                    ? `0 0 30px ${activeStyle.color}40`
                    : esCompletada
                    ? '0 0 30px rgba(26,176,21,0.22)'
                    : '0 10px 30px rgba(0,0,0,0.6)',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  transform: esMatchBuscador ? 'scale(1.03)' : 'scale(1)',
                  opacity: 1
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--tk-green)',
                        letterSpacing: '0.5px'
                      }}
                    >
                      ID: {mision.id.substring(0, 8).toUpperCase()}...
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: esCompletada
                          ? 'var(--tk-green)'
                          : esDesbloqueada
                          ? '#8F9F7F'
                          : '#666',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}
                    >
                      {esCompletada
                        ? t('kappa.node.completedStatus', { mode: modoJuego })
                        : esDesbloqueada
                        ? t('kappa.node.availableStatus')
                        : t('kappa.node.lockedStatus')}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: '1.2rem',
                      letterSpacing: '0.5px',
                      margin: 0,
                      color: '#ffffff',
                      fontWeight: '600',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {mision.name}
                  </h4>

                  {esCollector && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCollectorOpen(true);
                      }}
                      style={{
                        marginTop: '0.65rem',
                        width: '100%',
                        backgroundColor: 'rgba(255,207,102,0.08)',
                        border: '1px solid rgba(255,207,102,0.28)',
                        borderRadius: '6px',
                        color: '#ffcf66',
                        padding: '0.45rem 0.55rem',
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: '0.78rem',
                        fontWeight: '900',
                        letterSpacing: '0.7px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {t('kappa.collector.cardButton', {
                        completed: totalCollectorItemsCompletados,
                        total: totalCollectorItems,
                        percent: collectorProgressPercent
                      })}
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    width: '100%'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMision(mision.id);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: esCompletada
                        ? 'var(--tk-green)'
                        : esDesbloqueada
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(26,176,21,0.06)',
                      color: esCompletada
                        ? '#061006'
                        : esDesbloqueada
                        ? '#fff'
                        : activeStyle.color,
                      border: `1px solid ${
                        esCompletada
                          ? 'var(--tk-green)'
                          : esDesbloqueada
                          ? 'rgba(255,255,255,0.12)'
                          : `${activeStyle.color}55`
                      }`,
                      boxShadow: esCompletada
                        ? '0 0 18px rgba(26,176,21,0.35)'
                        : 'none',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '900',
                      letterSpacing: '1px',
                      transition: 'all 0.3s'
                    }}
                    title={
                      esCompletada
                        ? t('kappa.node.uncompleteTitle', { mode: modoJuego })
                        : t('kappa.node.completeTitle', { mode: modoJuego })
                    }
                  >
                    {esCompletada
                      ? t('kappa.node.completedButton', { mode: modoJuego })
                      : t('kappa.node.completeButton')}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = activeStyle.color;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = '#aaa';
                      }}
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

function CollectorPanel({
  mode,
  items,
  allItems,
  completed,
  itemAssets,
  search,
  progressPercent,
  completedCount,
  totalCount,
  onSearchChange,
  onToggleItem,
  onReset,
  onClose
}) {
  const { t } = useTranslation();

  return (
    <div
      data-fixed-panel="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'grid',
        placeItems: 'center',
        padding: '1.25rem',
        background: 'rgba(0,0,0,0.58)',
        pointerEvents: 'auto',
        cursor: 'default'
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onMouseMove={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <section
        style={{
          width: 'min(1040px, 100%)',
          height: 'min(760px, calc(100vh - 2.5rem))',
          backgroundColor: 'rgba(10,10,10,0.97)',
          border: '1px solid rgba(255,207,102,0.24)',
          borderRadius: '12px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.72)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: 'auto 1fr'
        }}
      >
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, color: '#ffcf66', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Fence - Collector
            </p>
            <h3 style={{ margin: '0.2rem 0 0', color: '#fff', fontSize: '1.8rem', textTransform: 'uppercase' }}>
              {t('kappa.collector.title')}
            </h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--tk-text-muted)', lineHeight: 1.45 }}>
              {t('kappa.collector.subtitle', { mode })}
            </p>
          </div>

          <button type="button" onClick={onClose} style={collectorIconButtonStyle} title={t('common.close')}>
            X
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tk-text-muted)', fontWeight: '900', marginBottom: '0.45rem' }}>
            <span>{t('kappa.collector.progress', { completed: completedCount, total: totalCount })}</span>
            <span style={{ color: '#ffcf66' }}>{progressPercent}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#ffcf66' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginTop: '1rem' }}>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('kappa.collector.searchPlaceholder')}
            style={{
              backgroundColor: 'rgba(15,15,15,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              padding: '0.75rem 0.9rem',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: '800',
              minWidth: 0
            }}
          />

          <button type="button" onClick={onReset} style={collectorSecondaryButtonStyle}>
            {t('kappa.collector.reset')}
          </button>
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem 1.25rem', overflowY: 'auto', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 285px), 1fr))', gap: '0.65rem' }}>
          {items.map((item) => {
            const isDone = Boolean(completed[item.id]);
            const asset = itemAssets[normalizeCollectorName(item.apiName || item.name)] || itemAssets[normalizeCollectorName(item.name)];
            const imageSrc = asset?.iconLink || asset?.imageLink;

            return (
              <label
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '54px 18px 1fr',
                  gap: '0.65rem',
                  alignItems: 'center',
                  backgroundColor: isDone ? 'rgba(26,176,21,0.08)' : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${isDone ? 'rgba(26,176,21,0.24)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    width: '54px',
                    height: '54px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(0,0,0,0.34)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px',
                    padding: '5px'
                  }}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: '#ffcf66', fontSize: '0.68rem', fontWeight: '900' }}>ITEM</span>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleItem(item.id)}
                />
                <span>
                  <strong style={{ display: 'block', color: isDone ? 'var(--tk-green)' : '#fff', lineHeight: 1.25 }}>
                    {item.name}
                  </strong>
                  <span style={{ display: 'block', color: 'var(--tk-text-muted)', fontSize: '0.8rem', lineHeight: 1.35, marginTop: '0.25rem' }}>
                    {item.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {items.length === 0 && (
          <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>
            {t('kappa.collector.empty')}
          </p>
        )}

        <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.45, margin: '1rem 0 0', fontSize: '0.85rem' }}>
          {t('kappa.collector.footer', { total: allItems.length })}
        </p>
      </div>
      </section>
    </div>
  );
}

const collectorIconButtonStyle = {
  width: '34px',
  height: '34px',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900'
};

const collectorSecondaryButtonStyle = {
  backgroundColor: 'rgba(255,207,102,0.08)',
  border: '1px solid rgba(255,207,102,0.28)',
  borderRadius: '8px',
  color: '#ffcf66',
  padding: '0.75rem 0.95rem',
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900',
  letterSpacing: '1px'
};
