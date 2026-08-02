import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';
import { loadJsonEconomy } from '../../services/tarkovDataApi';
import { fetchHideoutStations } from './hideoutApi';
import HideoutHeader from './HideoutHeader';
import HideoutGlobalNeeds from './HideoutGlobalNeeds';
import HideoutStationDetail from './HideoutStationDetail';
import HideoutStationList from './HideoutStationList';
import { loadHideoutProgress, saveHideoutProgress, writeLocalHideoutProgress } from './hideoutStorage';
import {
  MARKET_MODES,
  getGlobalHideoutNeeds,
  getHideoutProgress,
  getHideoutStorageKeys,
  getRequirementCount,
  getRequirementKey,
  getRequirementPrice,
  getStationAvailability,
  isFirRequirement,
  poolHideoutLocal
} from './hideoutUtils';

export default function HideoutModule({ onViewChange, session }) {
  const { t, i18n } = useTranslation();
  const [estaciones, setEstaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [nivelObjetivo, setNivelObjetivo] = useState(1);
  const [modoMercado, setModoMercado] = useState(() => readDefaultPlayableMode());
  const [itemsMarcados, setItemsMarcados] = useState({});
  const [nivelesConstruidos, setNivelesConstruidos] = useState({});
  const [errorFuente, setErrorFuente] = useState('');
  const [economy, setEconomy] = useState(null);
  const [syncStatus, setSyncStatus] = useState('local');
  const [activeView, setActiveView] = useState('stations');
  const suppressSaveRef = useRef(false);
  const hydratedProgressKeyRef = useRef(null);
  const selectedStationIdRef = useRef(null);
  const selectedLevelRef = useRef(1);

  const gameMode = MARKET_MODES[modoMercado];
  const { storageKey, levelStorageKey } = getHideoutStorageKeys(modoMercado);

  const cargarLocal = useCallback(() => {
    setEstaciones(poolHideoutLocal);
    selectedStationIdRef.current = poolHideoutLocal[0]?.id || null;
    selectedLevelRef.current = 1;
    setEstacionSeleccionada(poolHideoutLocal[0]);
    setNivelObjetivo(1);
    setErrorFuente(t('hideoutModule.errors.externalFallback'));
    setCargando(false);
  }, [t]);

  const handleModeChange = (mode) => {
    setCargando(true);
    setErrorFuente('');
    setModoMercado(mode);
  };

  const handleStationSelect = (station) => {
    const nextLevel = station?.levels?.[0]?.level || 1;
    selectedStationIdRef.current = station?.id || null;
    selectedLevelRef.current = nextLevel;
    setEstacionSeleccionada(station);
    setNivelObjetivo(nextLevel);
  };

  const handleTargetLevelChange = (level) => {
    selectedLevelRef.current = level;
    setNivelObjetivo(level);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      hydratedProgressKeyRef.current = null;
      setSyncStatus(session?.user?.id ? 'syncing' : 'local');
      suppressSaveRef.current = Boolean(session?.user?.id);

      const progress = await loadHideoutProgress({
        session,
        mode: modoMercado,
        storageKey,
        levelStorageKey
      });
      if (cancelled) return;

      setItemsMarcados(progress.items);
      setNivelesConstruidos(progress.levels);
      setSyncStatus(progress.syncStatus);
      hydratedProgressKeyRef.current = `${session?.user?.id || 'guest'}:${modoMercado}`;

      window.setTimeout(() => {
        if (!cancelled) suppressSaveRef.current = false;
      }, 0);
    };

    loadProgress().catch(() => {
      if (cancelled) return;
      setItemsMarcados({});
      setNivelesConstruidos({});
      setSyncStatus(session?.user?.id ? 'local-error' : 'local');
      hydratedProgressKeyRef.current = `${session?.user?.id || 'guest'}:${modoMercado}`;
    });

    return () => {
      cancelled = true;
    };
  }, [levelStorageKey, modoMercado, session, storageKey]);

  useEffect(() => {
    const progressKey = `${session?.user?.id || 'guest'}:${modoMercado}`;
    if (hydratedProgressKeyRef.current !== progressKey || suppressSaveRef.current) return;

    let cancelled = false;
    setSyncStatus(session?.user?.id ? 'syncing' : 'local');

    saveHideoutProgress({
      session,
      mode: modoMercado,
      storageKey,
      levelStorageKey,
      items: itemsMarcados,
      levels: nivelesConstruidos
    }).then((nextSyncStatus) => {
      if (cancelled) return;
      setSyncStatus(nextSyncStatus);
    });

    return () => {
      cancelled = true;
    };
  }, [itemsMarcados, levelStorageKey, nivelesConstruidos, modoMercado, session, storageKey]);

  useEffect(() => {
    let cancelled = false;

    fetchHideoutStations(gameMode, i18n.resolvedLanguage)
      .then(({ stations: datosFiltrados }) => {
        if (cancelled) return;

        const estacionAnteriorId = selectedStationIdRef.current;
        const siguienteEstacion = datosFiltrados.find((st) => st.id === estacionAnteriorId) || datosFiltrados[0];
        const siguienteNivel =
          siguienteEstacion.levels?.find((level) => level.level === selectedLevelRef.current)?.level ||
          siguienteEstacion.levels?.[0]?.level ||
          1;

        selectedStationIdRef.current = siguienteEstacion.id;
        selectedLevelRef.current = siguienteNivel;
        setEstaciones(datosFiltrados);
        setEstacionSeleccionada(siguienteEstacion);
        setNivelObjetivo(siguienteNivel);
        setCargando(false);
      })
      .catch(() => {
        if (cancelled) return;
        cargarLocal();
      });

    return () => {
      cancelled = true;
    };
  }, [cargarLocal, gameMode, i18n.resolvedLanguage]);

  useEffect(() => {
    let cancelled = false;

    loadJsonEconomy({ gameMode, locale: i18n.resolvedLanguage })
      .then((data) => {
        if (!cancelled) setEconomy(data);
      })
      .catch((error) => {
        console.warn('Official economy JSON unavailable.', error);
        if (!cancelled) setEconomy(null);
      });

    return () => {
      cancelled = true;
    };
  }, [gameMode, i18n.resolvedLanguage]);

  const datosNivel = useMemo(
    () => estacionSeleccionada?.levels?.find((level) => level.level === nivelObjetivo) || null,
    [estacionSeleccionada?.levels, nivelObjetivo]
  );

  const itemRequirements = useMemo(() => datosNivel?.itemRequirements || [], [datosNivel]);
  const stationRequirements = useMemo(() => datosNivel?.stationLevelRequirements || [], [datosNivel]);
  const skillRequirements = useMemo(() => datosNivel?.skillRequirements || [], [datosNivel]);
  const traderRequirements = useMemo(() => datosNivel?.traderRequirements || [], [datosNivel]);

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
    return getHideoutProgress(estaciones, nivelesConstruidos);
  }, [estaciones, nivelesConstruidos]);

  const globalNeeds = useMemo(() => getGlobalHideoutNeeds({
    stations: estaciones,
    builtLevels: nivelesConstruidos,
    markedItems: itemsMarcados,
    mode: modoMercado
  }), [estaciones, itemsMarcados, modoMercado, nivelesConstruidos]);

  const stationCraftCount = useMemo(
    () => economy?.crafts?.filter((craft) => craft.station === estacionSeleccionada?.id).length || 0,
    [economy?.crafts, estacionSeleccionada?.id]
  );

  const stationAvailability = (station) => {
    return getStationAvailability(station, nivelesConstruidos);
  };

  const toggleItem = (req) => {
    const key = getRequirementKey(modoMercado, estacionSeleccionada?.id, nivelObjetivo, req);
    const nextState = { ...itemsMarcados, [key]: !itemsMarcados[key] };

    if (!nextState[key]) delete nextState[key];
    setItemsMarcados(nextState);
    writeLocalHideoutProgress({
      storageKey,
      levelStorageKey,
      items: nextState,
      levels: nivelesConstruidos
    });
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

  const openGlobalRequirement = ({ stationId, level }) => {
    const station = estaciones.find((currentStation) => currentStation.id === stationId);
    if (!station) return;

    selectedStationIdRef.current = station.id;
    selectedLevelRef.current = level;
    setEstacionSeleccionada(station);
    setNivelObjetivo(level);
    setActiveView('stations');
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
        {t('hideoutModule.loading')}
      </div>
    );
  }

  return (
    <div
      className="fade-in-slide terminal-panel hideout-mobile-root"
      style={{
        padding: '6rem 2rem 8rem 2rem',
        maxWidth: '1500px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <HideoutHeader
        errorFuente={errorFuente}
        syncStatus={syncStatus}
        modoMercado={modoMercado}
        setModoMercado={handleModeChange}
        onViewChange={onViewChange}
      />

      <nav className="hideout-view-switch" aria-label={t('hideoutModule.global.navigationLabel')}>
        <button
          type="button"
          className={activeView === 'stations' ? 'is-active' : ''}
          onClick={() => setActiveView('stations')}
        >
          {t('hideoutModule.global.stationView')}
        </button>
        <button
          type="button"
          className={activeView === 'global' ? 'is-active' : ''}
          onClick={() => setActiveView('global')}
        >
          {t('hideoutModule.global.globalView')}
          <span>{globalNeeds.uniqueItems}</span>
        </button>
      </nav>

      {activeView === 'global' ? (
        <HideoutGlobalNeeds
          stations={estaciones}
          builtLevels={nivelesConstruidos}
          markedItems={itemsMarcados}
          mode={modoMercado}
          onOpenRequirement={openGlobalRequirement}
        />
      ) : (
        <div
          className="hideout-mobile-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            gap: '2rem'
          }}
        >
          <HideoutStationList
            hideoutProgress={hideoutProgress}
            estaciones={estaciones}
            estacionSeleccionada={estacionSeleccionada}
            stationAvailability={stationAvailability}
            nivelesConstruidos={nivelesConstruidos}
            setEstacionSeleccionada={handleStationSelect}
            setNivelObjetivo={handleTargetLevelChange}
          />

          <HideoutStationDetail
            estacionSeleccionada={estacionSeleccionada}
            modoMercado={modoMercado}
            nivelObjetivo={nivelObjetivo}
            setNivelObjetivo={handleTargetLevelChange}
            nivelesConstruidos={nivelesConstruidos}
            setStationBuiltLevel={setStationBuiltLevel}
            stationAvailability={stationAvailability}
            itemStats={itemStats}
            datosNivel={datosNivel}
            itemRequirements={itemRequirements}
            stationRequirements={stationRequirements}
            skillRequirements={skillRequirements}
            traderRequirements={traderRequirements}
            itemsMarcados={itemsMarcados}
            toggleItem={toggleItem}
            stationCraftCount={stationCraftCount}
          />
        </div>
      )}
    </div>
  );
}
