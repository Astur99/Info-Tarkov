import { useEffect, useMemo, useRef, useState } from 'react';
import { loadModuleState, saveModuleState } from '../../lib/moduleStateSync';

const MARKET_MODES = {
  PVP: 'regular',
  PVE: 'pve'
};

const STORAGE_PREFIX = 'info_tarkov_hideout_items';
const LEVEL_STORAGE_PREFIX = 'info_tarkov_hideout_levels';
const HIDEOUT_MODULE_KEY = 'hideout_progress';

const NATURAL_STATION_ORDER = [
  'Stash',
  'Security',
  'Vents',
  'Generator',
  'Illumination',
  'Heating',
  'Lavatory',
  'Workbench',
  'Medstation',
  'Nutrition Unit',
  'Rest Space',
  'Water Collector',
  'Shooting Range',
  'Gym',
  'Defective Wall',
  'Booze Generator',
  'Intelligence Center',
  'Library',
  'Bitcoin Farm',
  'Scav Case',
  'Air Filtering Unit',
  'Solar Power',
  'Gear Rack',
  'Cultist Circle',
  'Weapon Rack',
  'Hall of Fame'
];

const getStationOrderScore = (station) => {
  const manualIndex = NATURAL_STATION_ORDER.findIndex(
    (name) => name.toLowerCase() === station?.name?.toLowerCase()
  );

  if (manualIndex >= 0) return manualIndex;

  const firstLevel = station?.levels?.[0];
  const dependencyWeight = firstLevel?.stationLevelRequirements?.length || 0;
  const traderWeight = firstLevel?.traderRequirements?.length || 0;
  const skillWeight = firstLevel?.skillRequirements?.length || 0;

  return 100 + dependencyWeight * 8 + traderWeight * 4 + skillWeight * 4;
};

const poolHideoutLocal = [
  {
    id: 'h1',
    name: 'Workbench',
    imageLink: 'https://assets.tarkov.dev/5d484fc0654e76006657e335-image.png',
    levels: [
      {
        id: 'h1-l1',
        level: 1,
        constructionTime: 14400,
        traderRequirements: [{ trader: { name: 'Mechanic' }, value: 1 }],
        stationLevelRequirements: [],
        skillRequirements: [],
        itemRequirements: [
          {
            id: 'h1-l1-i1',
            item: {
              id: 'i1',
              name: 'Multitool',
              shortName: 'Tool',
              lastLowPrice: 25000,
              iconLink: 'https://assets.tarkov.dev/544fb5454bdc2df8738b456f-icon.png'
            },
            count: 1,
            quantity: 1,
            attributes: []
          }
        ]
      }
    ]
  }
];

const getRequirementKey = (mode, stationId, level, req) =>
  `${mode}:${stationId}:${level}:${req?.id || req?.item?.id || req?.item?.name}`;

const isFirRequirement = (req) => {
  return (req?.attributes || []).some((attribute) => {
    const type = String(attribute?.type || '').toLowerCase();
    const name = String(attribute?.name || '').toLowerCase();
    const value = String(attribute?.value || '').toLowerCase();
    const key = `${type} ${name}`;
    const positiveValue = ['true', '1', 'yes', 'required', 'only'].includes(value);

    return (
      positiveValue &&
      (
        key.includes('foundinraid') ||
        key.includes('found in raid') ||
        key.includes('findinraid') ||
        key.includes('find in raid') ||
        key.includes('fir')
      )
    );
  });
};

const getRequirementCount = (req) => req?.count || req?.quantity || 0;

const getRequirementPrice = (req) => {
  const price = req?.item?.lastLowPrice || req?.item?.avg24hPrice || req?.item?.basePrice || 0;
  return price > 0 ? price : 0;
};

export default function HideoutModule({ onViewChange, session }) {
  const [estaciones, setEstaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [nivelObjetivo, setNivelObjetivo] = useState(1);
  const [modoMercado, setModoMercado] = useState('PVP');
  const [itemsMarcados, setItemsMarcados] = useState({});
  const [nivelesConstruidos, setNivelesConstruidos] = useState({});
  const [errorFuente, setErrorFuente] = useState('');
  const [syncStatus, setSyncStatus] = useState('local');
  const suppressSaveRef = useRef(false);

  const gameMode = MARKET_MODES[modoMercado];
  const storageKey = `${STORAGE_PREFIX}_${modoMercado.toLowerCase()}`;
  const levelStorageKey = `${LEVEL_STORAGE_PREFIX}_${modoMercado.toLowerCase()}`;

  const cargarLocal = () => {
    setEstaciones(poolHideoutLocal);
    setEstacionSeleccionada(poolHideoutLocal[0]);
    setNivelObjetivo(1);
    setErrorFuente('Datos externos no disponibles. Mostrando fallback local reducido.');
    setCargando(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      const localItems = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const localLevels = JSON.parse(localStorage.getItem(levelStorageKey) || '{}');

      if (!session?.user?.id) {
        setItemsMarcados(localItems);
        setNivelesConstruidos(localLevels);
        setSyncStatus('local');
        return;
      }

      suppressSaveRef.current = true;
      setSyncStatus('syncing');

      const { data, error } = await loadModuleState({
        userId: session.user.id,
        moduleKey: HIDEOUT_MODULE_KEY,
        mode: modoMercado
      });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setItemsMarcados(localItems);
        setNivelesConstruidos(localLevels);
        setSyncStatus('local-error');
      } else if (data) {
        setItemsMarcados(data.items || {});
        setNivelesConstruidos(data.levels || {});
        setSyncStatus('cloud');
      } else {
        setItemsMarcados(localItems);
        setNivelesConstruidos(localLevels);
        const { error: saveError } = await saveModuleState({
          userId: session.user.id,
          moduleKey: HIDEOUT_MODULE_KEY,
          mode: modoMercado,
          state: { items: localItems, levels: localLevels }
        });
        setSyncStatus(saveError ? 'local-error' : 'cloud');
      }

      window.setTimeout(() => {
        if (!cancelled) suppressSaveRef.current = false;
      }, 0);
    };

    try {
      loadProgress();
    } catch {
      setItemsMarcados({});
      setNivelesConstruidos({});
      setSyncStatus(session?.user?.id ? 'local-error' : 'local');
    }

    return () => {
      cancelled = true;
    };
  }, [levelStorageKey, modoMercado, session?.user?.id, storageKey]);

  useEffect(() => {
    if (suppressSaveRef.current) return;

    localStorage.setItem(storageKey, JSON.stringify(itemsMarcados));
    localStorage.setItem(levelStorageKey, JSON.stringify(nivelesConstruidos));

    if (!session?.user?.id) {
      setSyncStatus('local');
      return;
    }

    let cancelled = false;
    setSyncStatus('syncing');

    saveModuleState({
      userId: session.user.id,
      moduleKey: HIDEOUT_MODULE_KEY,
      mode: modoMercado,
      state: { items: itemsMarcados, levels: nivelesConstruidos }
    }).then(({ error }) => {
      if (cancelled) return;
      if (error) {
        console.error(error);
        setSyncStatus('local-error');
      } else {
        setSyncStatus('cloud');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [itemsMarcados, levelStorageKey, nivelesConstruidos, modoMercado, session?.user?.id, storageKey]);

  useEffect(() => {
    const queryHideout = JSON.stringify({
      query: `
        query GetHideoutData {
          hideoutStations(gameMode: ${gameMode}) {
            id
            name
            normalizedName
            imageLink
            levels {
              id
              level
              constructionTime
              description
              stationLevelRequirements {
                id
                level
                station {
                  id
                  name
                  imageLink
                }
              }
              skillRequirements {
                id
                name
                level
                skill {
                  id
                  name
                  imageLink
                }
              }
              traderRequirements {
                id
                value
                level
                trader {
                  id
                  name
                }
              }
              itemRequirements {
                id
                count
                quantity
                attributes {
                  type
                  name
                  value
                }
                item {
                  id
                  name
                  shortName
                  basePrice
                  avg24hPrice
                  lastLowPrice
                  iconLink
                  wikiLink
                }
              }
            }
          }
        }
      `
    });

    setCargando(true);
    setErrorFuente('');

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: queryHideout
    })
      .then((res) => res.json())
      .then((result) => {
        if (!result?.data?.hideoutStations || !Array.isArray(result.data.hideoutStations)) {
          cargarLocal();
          return;
        }

        const datosFiltrados = result.data.hideoutStations
          .filter((st) => st && st.name)
          .map((station) => ({
            ...station,
            levels: [...(station.levels || [])].sort((a, b) => a.level - b.level)
          }))
          .sort((a, b) => {
            const orderDiff = getStationOrderScore(a) - getStationOrderScore(b);
            return orderDiff || a.name.localeCompare(b.name);
          });

        if (datosFiltrados.length === 0) {
          cargarLocal();
          return;
        }

        const estacionAnteriorId = estacionSeleccionada?.id;
        const siguienteEstacion = datosFiltrados.find((st) => st.id === estacionAnteriorId) || datosFiltrados[0];
        const siguienteNivel =
          siguienteEstacion.levels?.find((level) => level.level === nivelObjetivo)?.level ||
          siguienteEstacion.levels?.[0]?.level ||
          1;

        setEstaciones(datosFiltrados);
        setEstacionSeleccionada(siguienteEstacion);
        setNivelObjetivo(siguienteNivel);
        setCargando(false);
      })
      .catch(() => {
        cargarLocal();
      });
  }, [gameMode]);

  const datosNivel =
    estacionSeleccionada?.levels?.find((level) => level.level === nivelObjetivo) || null;

  const itemRequirements = datosNivel?.itemRequirements || [];
  const stationRequirements = datosNivel?.stationLevelRequirements || [];
  const skillRequirements = datosNivel?.skillRequirements || [];
  const traderRequirements = datosNivel?.traderRequirements || [];

  const itemStats = useMemo(() => {
    return itemRequirements.reduce(
      (acc, req) => {
        const key = getRequirementKey(modoMercado, estacionSeleccionada?.id, nivelObjetivo, req);
        const price = getRequirementPrice(req) * getRequirementCount(req);

        acc.total += price;
        if (itemsMarcados[key]) {
          acc.completed += 1;
        } else {
          acc.pending += price;
        }

        if (isFirRequirement(req)) acc.fir += 1;
        return acc;
      },
      { total: 0, pending: 0, completed: 0, fir: 0 }
    );
  }, [estacionSeleccionada?.id, itemRequirements, itemsMarcados, modoMercado, nivelObjetivo]);

  const hideoutProgress = useMemo(() => {
    const totalLevels = estaciones.reduce((sum, station) => sum + (station.levels?.length || 0), 0);
    const builtLevels = estaciones.reduce((sum, station) => sum + Math.min(nivelesConstruidos[station.id] || 0, station.levels?.length || 0), 0);
    const available = estaciones.flatMap((station) =>
      (station.levels || []).filter((level) => {
        const current = nivelesConstruidos[station.id] || 0;
        if (level.level !== current + 1) return false;
        return (level.stationLevelRequirements || []).every((req) => (nivelesConstruidos[req.station?.id] || 0) >= req.level);
      })
    ).length;

    return { totalLevels, builtLevels, available };
  }, [estaciones, nivelesConstruidos]);

  const stationAvailability = (station) => {
    const builtLevel = nivelesConstruidos[station.id] || 0;
    const nextLevel = (station.levels || []).find((level) => level.level === builtLevel + 1);
    const blockedBy = (nextLevel?.stationLevelRequirements || []).filter(
      (req) => (nivelesConstruidos[req.station?.id] || 0) < req.level
    );

    if (!nextLevel) return { status: 'complete', text: 'MAX', blockedBy: [] };
    if (blockedBy.length > 0) return { status: 'blocked', text: 'BLOQ', blockedBy };
    return { status: 'available', text: `L${nextLevel.level}` , blockedBy: [] };
  };

  const formatRublos = (val) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(val || 0);

  const formatConstructionTime = (seconds) => {
    if (!seconds) return 'INMEDIATO';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    if (hours <= 0) return `${minutes} MIN`;
    if (minutes <= 0) return `${hours} HORAS`;
    return `${hours}H ${minutes}M`;
  };

  const toggleItem = (req) => {
    const key = getRequirementKey(modoMercado, estacionSeleccionada?.id, nivelObjetivo, req);
    const nextState = { ...itemsMarcados, [key]: !itemsMarcados[key] };

    if (!nextState[key]) delete nextState[key];
    setItemsMarcados(nextState);
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  };

  const setStationBuiltLevel = (stationId, level) => {
    const station = estaciones.find((currentStation) => currentStation.id === stationId);

    setNivelesConstruidos((current) => {
      const next = { ...current, [stationId]: level };
      if (level <= 0) delete next[stationId];
      return next;
    });

    setItemsMarcados((current) => {
      const next = { ...current };

      (station?.levels || []).forEach((stationLevel) => {
        (stationLevel.itemRequirements || []).forEach((req) => {
          const key = getRequirementKey(modoMercado, stationId, stationLevel.level, req);

          if (stationLevel.level <= level) {
            next[key] = true;
          } else {
            delete next[key];
          }
        });
      });

      return next;
    });
  };

  if (cargando) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '10rem',
          color: 'var(--tk-green)',
          fontSize: '1.2rem',
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: '2px'
        }}
      >
        CONECTANDO CON MÓDULO DEL REFUGIO, ESPERE...
      </div>
    );
  }

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        padding: '6rem 2rem 8rem 2rem',
        maxWidth: '1500px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <header
        style={{
          marginBottom: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '2.2rem',
              letterSpacing: '1.5px',
              fontWeight: '700',
              color: '#fff'
            }}
          >
            HIDEOUT LOGISTICS
          </h2>

          <p
            style={{
              color: 'var(--tk-text-muted)',
              fontSize: '1rem',
              marginTop: '0.3rem',
              maxWidth: '820px',
              lineHeight: 1.5
            }}
          >
            Costes separados para PVP/PVE, checklist local de materiales, avisos FIR y requisitos de estaciones,
            traders y skills.
          </p>
          {errorFuente && (
            <p style={{ color: '#ffcf66', marginTop: '0.5rem', fontWeight: '800', letterSpacing: '0.8px' }}>
              {errorFuente}
            </p>
          )}
          <p style={{ color: syncStatus === 'cloud' ? 'var(--tk-green)' : '#ffcf66', marginTop: '0.45rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {syncStatus === 'cloud' && 'PROGRESO CLOUD ACTIVO'}
            {syncStatus === 'syncing' && 'SINCRONIZANDO PROGRESO...'}
            {syncStatus === 'local' && 'MODO LOCAL: INICIA SESIÓN PARA SINCRONIZAR'}
            {syncStatus === 'local-error' && 'MODO LOCAL: TABLA CLOUD NO DISPONIBLE O ERROR DE SINCRONIZACIÓN'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(0,0,0,0.32)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)'
            }}
          >
            {Object.keys(MARKET_MODES).map((mode) => {
              const active = modoMercado === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setModoMercado(mode)}
                  style={{
                    minWidth: '86px',
                    border: active ? '1px solid rgba(187, 211, 169, 0.55)' : '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: active ? 'rgba(187, 211, 169, 0.85)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#11180f' : '#d7d7d7',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '900',
                    letterSpacing: '1px',
                    fontFamily: "'Rajdhani', sans-serif",
                    boxShadow: active ? '0 0 18px rgba(187, 211, 169, 0.18)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onViewChange('home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '12px 22px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '700',
              letterSpacing: '1px'
            }}
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '2rem'
        }}
      >
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--tk-text-muted)',
              fontWeight: '800',
              letterSpacing: '2px',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}
          >
            SECCIONES
          </h3>

          <div
            style={{
              background: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '0.9rem',
              display: 'grid',
              gap: '0.45rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: '900' }}>
              <span>Progreso</span>
              <span style={{ color: 'var(--tk-green)' }}>{hideoutProgress.builtLevels}/{hideoutProgress.totalLevels}</span>
            </div>
            <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${hideoutProgress.totalLevels ? Math.round((hideoutProgress.builtLevels / hideoutProgress.totalLevels) * 100) : 0}%`,
                  height: '100%',
                  background: 'var(--tk-green)'
                }}
              />
            </div>
            <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800', fontSize: '0.78rem' }}>
              {hideoutProgress.available} mejora(s) desbloqueada(s)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.65rem',
              maxHeight: '700px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {estaciones.map((est) => {
              const activo = estacionSeleccionada?.id === est.id;
              const availability = stationAvailability(est);
              const builtLevel = nivelesConstruidos[est.id] || 0;

              return (
                <button
                  key={est.id}
                  onClick={() => {
                    setEstacionSeleccionada(est);
                    setNivelObjetivo(est.levels?.[0]?.level || 1);
                  }}
                  title={est.name}
                  style={{
                    minHeight: '110px',
                    backgroundColor: activo ? 'rgba(26,176,21,0.10)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${activo ? 'var(--tk-green)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px',
                    padding: '0.75rem 0.5rem',
                    color: '#fff',
                    fontFamily: "'Rajdhani', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.18s ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    boxShadow: activo ? '0 0 18px rgba(26,176,21,0.18)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {est.imageLink ? (
                      <img
                        src={est.imageLink}
                        alt={est.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          filter: activo ? 'brightness(1.15)' : 'brightness(0.85)'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.4rem' }}>H</span>
                    )}
                  </div>

                  <span
                    style={{
                      maxWidth: '100%',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      lineHeight: '1.05',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      color: activo ? '#fff' : 'rgba(255,255,255,0.78)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {est.name}
                  </span>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: availability.status === 'blocked' ? '#ffcf66' : activo ? 'var(--tk-green)' : 'var(--tk-text-muted)',
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      fontWeight: '800'
                    }}
                  >
                    {builtLevel}/{est.levels?.length || 0} - {availability.text}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {estacionSeleccionada && (
          <section
            style={{
              backgroundColor: 'var(--tk-glass)',
              backdropFilter: 'blur(25px)',
              border: '1px solid var(--tk-glass-border)',
              borderRadius: '12px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '1.25rem',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: 'var(--tk-green)',
                    letterSpacing: '1.5px'
                  }}
                >
                  {modoMercado} / NIVEL OBJETIVO
                </span>

                <h3
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#fff',
                    margin: '0.2rem 0 0 0'
                  }}
                >
                  {estacionSeleccionada.name.toUpperCase()}
                </h3>
                {stationAvailability(estacionSeleccionada).blockedBy.length > 0 && (
                  <p style={{ color: '#ffcf66', margin: '0.45rem 0 0', fontWeight: '800' }}>
                    Bloqueada por:{' '}
                    {stationAvailability(estacionSeleccionada).blockedBy
                      .map((req) => `${req.station?.name} nivel ${req.level}`)
                      .join(', ')}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gap: '0.65rem', justifyItems: 'end' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {estacionSeleccionada.levels?.map((level) => (
                    <button
                      key={level.level}
                      onClick={() => setNivelObjetivo(level.level)}
                      style={{
                        backgroundColor: nivelObjetivo === level.level ? 'var(--tk-green)' : 'rgba(0,0,0,0.4)',
                        border: `1px solid ${
                          nivelObjetivo === level.level ? 'var(--tk-green)' : 'var(--tk-glass-border)'
                        }`,
                        color: nivelObjetivo === level.level ? '#000' : '#fff',
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      L{level.level}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ color: 'var(--tk-text-muted)', fontWeight: '900', letterSpacing: '0.8px' }}>Construido:</span>
                  <select
                    value={nivelesConstruidos[estacionSeleccionada.id] || 0}
                    onChange={(event) => setStationBuiltLevel(estacionSeleccionada.id, Number(event.target.value))}
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '6px',
                      padding: '0.45rem 0.65rem',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: '900'
                    }}
                  >
                    <option value={0}>Sin construir</option>
                    {estacionSeleccionada.levels?.map((level) => (
                      <option key={level.level} value={level.level}>Nivel {level.level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.02)'
              }}
            >
              <StatBlock
                label={`PRESUPUESTO ${modoMercado}`}
                value={itemStats.total > 0 ? formatRublos(itemStats.total) : 'SIN COSTE'}
                highlight={itemStats.total > 0}
              />
              <StatBlock
                label="PENDIENTE SEGÚN CHECKLIST"
                value={itemStats.pending > 0 ? formatRublos(itemStats.pending) : 'COMPLETO / SIN COSTE'}
                highlight={itemStats.pending > 0}
              />
              <StatBlock label="TIEMPO DE CONSTRUCCIÓN" value={formatConstructionTime(datosNivel?.constructionTime)} />
              <StatBlock
                label="MATERIALES"
                value={`${itemStats.completed}/${itemRequirements.length} MARCADOS`}
                detail={itemStats.fir > 0 ? `${itemStats.fir} requisito(s) FIR` : 'Sin requisitos FIR detectados'}
              />
            </div>

            <RequirementSection title="INSTANCIAS REQUERIDAS" empty="No requiere otras instancias del refugio.">
              {stationRequirements.map((req) => (
                <RequirementPill key={req.id} tone="green">
                  {req.station?.name} <strong>NIVEL {req.level}</strong>
                </RequirementPill>
              ))}
            </RequirementSection>

            <RequirementSection title="TRADERS Y SKILLS" empty="No registra requisitos de traders o skills.">
              {traderRequirements.map((req) => (
                <RequirementPill key={req.id || `${req.trader?.name}-${req.value}`} tone="amber">
                  {req.trader?.name} <strong>NIVEL {req.value || req.level}</strong>
                </RequirementPill>
              ))}
              {skillRequirements.map((req) => (
                <RequirementPill key={req.id || `${req.skill?.name}-${req.level}`} tone="green">
                  {req.skill?.name || req.name} <strong>NIVEL {req.level}</strong>
                </RequirementPill>
              ))}
            </RequirementSection>

            <div>
              <h4
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--tk-text-muted)',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  marginBottom: '1rem',
                  textTransform: 'uppercase'
                }}
              >
                OBJETOS REQUERIDOS
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {itemRequirements.map((req) => {
                  const precioUnidad = getRequirementPrice(req);
                  const count = getRequirementCount(req);
                  const key = getRequirementKey(modoMercado, estacionSeleccionada.id, nivelObjetivo, req);
                  const checked = Boolean(itemsMarcados[key]);
                  const requiresFir = isFirRequirement(req);

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => toggleItem(req)}
                      style={{
                        backgroundColor: checked ? 'rgba(26,176,21,0.08)' : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${checked ? 'rgba(26,176,21,0.34)' : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Rajdhani', sans-serif",
                        opacity: checked ? 0.72 : 1,
                        transition: 'all 0.18s ease-out'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `1px solid ${checked ? 'var(--tk-green)' : 'rgba(255,255,255,0.26)'}`,
                            background: checked ? 'var(--tk-green)' : 'rgba(255,255,255,0.04)',
                            color: '#061006',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            flexShrink: 0
                          }}
                        >
                          {checked ? '✓' : ''}
                        </span>

                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px',
                            flexShrink: 0
                          }}
                        >
                          {req.item?.iconLink ? (
                            <img
                              src={req.item.iconLink}
                              alt={req.item?.shortName || req.item?.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ color: 'var(--tk-text-muted)', fontWeight: '900' }}>?</span>
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              color: '#fff',
                              fontWeight: '800',
                              fontSize: '1.05rem',
                              textDecoration: checked ? 'line-through' : 'none'
                            }}
                          >
                            {req.item?.name}
                          </span>

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.4rem',
                              marginTop: '0.35rem',
                              fontSize: '0.78rem',
                              color: 'var(--tk-text-muted)',
                              fontWeight: '800'
                            }}
                          >
                            <span>Flea {modoMercado} c/u: {precioUnidad > 0 ? formatRublos(precioUnidad) : '-'}</span>
                            <span
                              style={{
                                color: requiresFir ? '#ffcf66' : 'var(--tk-green)',
                                border: `1px solid ${requiresFir ? 'rgba(255,207,102,0.28)' : 'rgba(26,176,21,0.22)'}`,
                                background: requiresFir ? 'rgba(255,207,102,0.08)' : 'rgba(26,176,21,0.07)',
                                borderRadius: '999px',
                                padding: '0 0.45rem'
                              }}
                            >
                              {requiresFir ? 'FIR OBLIGATORIO' : 'FLEA OK'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                        <span style={{ color: 'var(--tk-green)' }}>x{count}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '600', marginTop: '2px' }}>
                          {precioUnidad > 0 ? formatRublos(precioUnidad * count) : '-'}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {itemRequirements.length === 0 && (
                  <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem' }}>
                    No se registran materiales específicos.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatBlock({ label, value, detail, highlight = false }) {
  return (
    <div>
      <span
        style={{
          fontSize: '0.78rem',
          color: 'var(--tk-text-muted)',
          fontWeight: '800',
          display: 'block',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </span>
      <div
        style={{
          fontSize: '1.55rem',
          fontWeight: '900',
          color: highlight ? 'var(--tk-green)' : '#fff',
          marginTop: '0.3rem'
        }}
      >
        {value}
      </div>
      {detail && <p style={{ color: 'var(--tk-text-muted)', margin: '0.15rem 0 0', fontWeight: '700' }}>{detail}</p>}
    </div>
  );
}

function RequirementSection({ title, empty, children }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div>
      <h4
        style={{
          fontSize: '0.85rem',
          color: 'var(--tk-text-muted)',
          fontWeight: '800',
          letterSpacing: '1px',
          marginBottom: '0.8rem',
          textTransform: 'uppercase'
        }}
      >
        {title}
      </h4>
      {hasChildren ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>{children}</div>
      ) : (
        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{empty}</p>
      )}
    </div>
  );
}

function RequirementPill({ children, tone = 'green' }) {
  const isAmber = tone === 'amber';

  return (
    <div
      style={{
        backgroundColor: isAmber ? 'rgba(255,207,102,0.08)' : 'rgba(26,176,21,0.07)',
        border: `1px solid ${isAmber ? 'rgba(255,207,102,0.2)' : 'rgba(26,176,21,0.18)'}`,
        padding: '0.6rem 1rem',
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: '#fff',
        fontWeight: '800'
      }}
    >
      {children}
    </div>
  );
}
