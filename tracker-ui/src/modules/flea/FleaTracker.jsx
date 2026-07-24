import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';
import { getIntlLocale } from '../../i18n/languages';
import { fetchFleaHotDeals, fetchFleaPriceHistory, searchFleaItems } from './fleaApi';
import FleaPriceChart from './FleaPriceChart';

const MARKET_MODES = {
  PVP: 'regular',
  PVE: 'pve'
};

const ITEMS_INTERES = [
  "Graphics card", "LedX", "Defibrillator", "Water filter", "Expeditionary fuel tank",
  "Physical bitcoin", "Moonshine", "Sugar", "Tetriz", "Ophthalmoscope", "GPU",
  "Military corrugated tube", "Prokill", "Alenka", "Sledgehammer", "M.U.L.E. stimulant",
  "Obdolbos", "SJ6 TGLabs", "Intelligence folder", "Keycard Blue", "Keycard Green"
];

export default function FleaTracker({ onViewChange }) {
  const { t, i18n } = useTranslation();
  const [busqueda, setBusqueda] = useState('');
  const [itemsResultados, setItemsResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoHotDeals, setCargandoHotDeals] = useState(true);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [hotDeals, setHotDeals] = useState([]);
  const [modoMercado, setModoMercado] = useState(() => readDefaultPlayableMode());
  const [rangoHistorico, setRangoHistorico] = useState(7);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [errorHotDeals, setErrorHotDeals] = useState('');
  const [cargandoHistorico, setCargandoHistorico] = useState(false);
  const [errorHistorico, setErrorHistorico] = useState('');
  const gameMode = MARKET_MODES[modoMercado];

  // 1. RADAR AUTOMÁTICO DE ANOMALÍAS (HOT DEALS VIVO)
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadHotDeals = async () => {
      setErrorHotDeals('');

      try {
        const { items } = await fetchFleaHotDeals({
          names: ITEMS_INTERES,
          gameMode,
          locale: i18n.resolvedLanguage,
          signal: controller.signal
        });
        if (cancelled) return;

        const anomalies = items
          .map((item) => {
            const currentPrice = item.lastLowPrice || 0;
            const averagePrice = item.avg24hPrice || 1;
            const deviation = (currentPrice - averagePrice) / averagePrice;
            const slots = (item.width || 1) * (item.height || 1);
            const pricePerSlot = Math.round(currentPrice / slots);

            return { ...item, desviacion: deviation, pricePerSlot, slots };
          })
          .filter((item) => Math.abs(item.desviacion) >= 0.12 && item.lastLowPrice > 0)
          .sort((a, b) => Math.abs(b.desviacion) - Math.abs(a.desviacion))
          .slice(0, 12);

        setHotDeals(anomalies);
      } catch (error) {
        if (cancelled || error.name === 'AbortError') return;
        console.error(error);
        setErrorHotDeals(t('fleaModule.hotDeals.connectionError'));
        setHotDeals([]);
      } finally {
        if (!cancelled) setCargandoHotDeals(false);
      }
    };

    loadHotDeals();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [gameMode, i18n.resolvedLanguage, t]);

  const cambiarModoMercado = (mode) => {
    setModoMercado(mode);
    setItemSeleccionado(null);
    setCargandoHistorico(false);
    setErrorHistorico('');
    setItemsResultados([]);
    setErrorBusqueda('');
    setCargandoHotDeals(true);
  };

  const seleccionarItem = (item) => {
    setItemSeleccionado(item);
    setCargandoHistorico(true);
    setErrorHistorico('');
  };

  // 2. BUSCADOR INTELIGENTE MULTI-IDIOMA CON TOLERANCIA DE TILDES
  useEffect(() => {
    if (busqueda.length < 3) {
      const resetResults = window.setTimeout(() => {
        setItemsResultados([]);
        setCargando(false);
        setErrorBusqueda('');
      }, 0);
      return () => window.clearTimeout(resetResults);
    }

    const controller = new AbortController();
    let cancelled = false;

    const delayDebounce = setTimeout(() => {
      setCargando(true);
      setErrorBusqueda('');

      searchFleaItems({
        query: busqueda,
        gameMode,
        locale: i18n.resolvedLanguage,
        signal: controller.signal
      })
        .then(({ items }) => {
          if (cancelled) return;
          setItemsResultados(items.slice(0, 6));
        })
        .catch((error) => {
          if (cancelled || error.name === 'AbortError') return;
          console.error(error);
          setItemsResultados([]);
          setErrorBusqueda(t('fleaModule.search.connectionError'));
        })
        .finally(() => {
          if (!cancelled) setCargando(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [busqueda, gameMode, i18n.resolvedLanguage, t]);

  useEffect(() => {
    if (!itemSeleccionado?.id) {
      return undefined;
    }

    const controller = new AbortController();
    const selectedId = itemSeleccionado.id;
    let cancelled = false;

    fetchFleaPriceHistory({
      itemId: selectedId,
      gameMode,
      signal: controller.signal
    })
      .then((marketData) => {
        if (cancelled) return;
        setItemSeleccionado((current) =>
          current?.id === selectedId ? { ...current, ...marketData } : current
        );
      })
      .catch((error) => {
        if (cancelled || error.name === 'AbortError') return;
        console.error(error);
        setErrorHistorico(t('fleaModule.search.connectionError'));
      })
      .finally(() => {
        if (!cancelled) setCargandoHistorico(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [gameMode, itemSeleccionado?.id, t]);

  const formatRublos = (val) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  const formatMarketDate = (timestamp) => {
    if (!timestamp) return t('fleaModule.noDate');

    const numericTimestamp = Number(timestamp);
    const date = Number.isFinite(numericTimestamp)
      ? new Date(numericTimestamp < 10000000000 ? numericTimestamp * 1000 : numericTimestamp)
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) return t('fleaModule.noDate');

    return date.toLocaleString(getIntlLocale(i18n.resolvedLanguage || i18n.language), {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fade-in-slide terminal-panel flea-mobile-root" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* CABECERA */}
      <header className="flea-mobile-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>{t('fleaModule.title')}</h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            {t('fleaModule.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.32)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)'
          }}>
            {Object.keys(MARKET_MODES).map((mode) => {
              const active = modoMercado === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => cambiarModoMercado(mode)}
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
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.3s' }}
          >
            {t('common.backToMenu')}
          </button>
        </div>
      </header>

      {/* INPUT DEL BUSCADOR GENERAL */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--tk-text-muted)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
          {t('fleaModule.search.title', { mode: modoMercado })}
        </h3>
        <input 
          type="text" 
          placeholder={t('fleaModule.search.placeholder')}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--tk-glass-border)',
            borderRadius: '8px',
            padding: '16px',
            color: '#fff',
            fontSize: '1.1rem',
            fontFamily: "'Rajdhani', sans-serif",
            width: '100%',
            outline: 'none',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}
        />
        {cargando && <p style={{ color: 'var(--tk-green)', marginTop: '0.5rem', fontSize: '0.9rem', letterSpacing: '1px' }}>{t('fleaModule.search.loading')}</p>}
        {errorBusqueda && (
          <p style={{ color: '#ffcf66', marginTop: '1rem', fontSize: '1rem', fontWeight: '700' }}>
            {errorBusqueda}
          </p>
        )}
        
        {!cargando && !errorBusqueda && busqueda.length >= 3 && itemsResultados.length === 0 && (
          <p style={{ 
            color: '#ff4444', 
            marginTop: '1rem', 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            letterSpacing: '1px',
            fontFamily: "'Rajdhani', sans-serif",
            textTransform: 'uppercase'
          }}>
            {t('fleaModule.search.empty', { mode: modoMercado })}
          </p>
        )}
      </section>

      {/* CAMBIO DE ORDEN: REJILLA DEL ÍTEM BUSCADO (PRIMERA PRIORIDAD BAJO INPUT) */}
      <div className="flea-mobile-results" style={{ display: 'grid', gridTemplateColumns: itemSeleccionado ? 'minmax(300px, 0.7fr) minmax(0, 1.3fr)' : '1fr', gap: '2rem', transition: 'all 0.3s', marginBottom: '4rem' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {itemsResultados.map((item) => {
            const slots = item.width * item.height;
            const fleaPrice = item.avg24hPrice || item.lastLowPrice || 0;
            const pricePerSlot = Math.round(fleaPrice / slots);

            return (
              <div
                key={item.id}
                onClick={() => seleccionarItem(item)}
                style={{
                  backgroundColor: 'var(--tk-glass)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${itemSeleccionado?.id === item.id ? 'var(--tk-green)' : 'var(--tk-glass-border)'}`,
                  borderRadius: '8px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                    <img src={item.iconLink} alt={item.shortName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{item.name}</h4>
                    <span style={{ color: 'var(--tk-text-muted)', fontSize: '0.85rem' }}>{t('fleaModule.item.space', { width: item.width, height: item.height, slots })}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--tk-text-muted)', fontSize: '0.72rem', fontWeight: '700' }}>
                    {t('fleaModule.detail.avg24h')}
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>{formatRublos(fleaPrice)}</div>
                  <span style={{ 
                    backgroundColor: 'rgba(26,176,21,0.1)',
                    color: 'var(--tk-green)',
                    fontSize: '0.75rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' 
                  }}>
                    {pricePerSlot ? t('fleaModule.item.pricePerSlot', { price: formatRublos(pricePerSlot) }) : t('fleaModule.item.noRecord')}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* DETALLE LATERAL EN CASO DE INTERACCIÓN */}
        {itemSeleccionado && (
          <section style={{ backgroundColor: 'var(--tk-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--tk-glass-border)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--tk-green)', letterSpacing: '1px' }}>{t('fleaModule.detail.specificData', { mode: modoMercado })}</span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0.2rem 0 0 0' }}>{itemSeleccionado.name}</h3>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                  {t('fleaModule.detail.historicalTrend', { mode: modoMercado })}
                </span>
                <select
                  value={rangoHistorico}
                  onChange={(event) => setRangoHistorico(Number(event.target.value))}
                  aria-label={t('fleaModule.chart.range')}
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(185,170,120,0.55)',
                    borderRadius: '5px',
                    color: '#d8d2bc',
                    padding: '0.45rem 0.7rem',
                    fontFamily: 'inherit',
                    fontWeight: '700'
                  }}
                >
                  <option value={1}>24 h</option>
                  <option value={7}>7 d</option>
                  <option value={30}>30 d</option>
                  <option value={90}>90 d</option>
                </select>
              </div>
              {cargandoHistorico ? (
                <div style={{ color: 'var(--tk-green)', padding: '2rem 0' }}>
                  {t('fleaModule.search.loading')}
                </div>
              ) : errorHistorico || (itemSeleccionado.historicalPrices || []).length < 2 ? (
                <div style={{ color: '#ffcf66', padding: '2rem 0' }}>
                  {errorHistorico || t('fleaModule.search.connectionError')}
                </div>
              ) : (
                <FleaPriceChart
                  item={itemSeleccionado}
                  gameMode={modoMercado}
                  rangeDays={rangoHistorico}
                />
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', marginTop: '0.8rem', paddingLeft: '4px' }}>
                <div><span style={{ color: 'var(--tk-text-muted)' }}>{t('fleaModule.detail.avg24h')}</span> <span style={{ color: '#fff', fontWeight: '700', marginLeft: '4px' }}>{formatRublos(itemSeleccionado.avg24hPrice)}</span></div>
                <div><span style={{ color: 'var(--tk-text-muted)' }}>{t('fleaModule.detail.currentLow')}</span> <span style={{ color: '#fff', fontWeight: '700', marginLeft: '4px' }}>{formatRublos(itemSeleccionado.lastLowPrice)}</span></div>
                {itemSeleccionado.low24hPrice > 0 && (
                  <div><span style={{ color: 'var(--tk-text-muted)' }}>{t('fleaModule.detail.low24h')}</span> <span style={{ color: '#fff', fontWeight: '700', marginLeft: '4px' }}>{formatRublos(itemSeleccionado.low24hPrice)}</span></div>
                )}
              </div>
              {itemSeleccionado.updated && (
                <div style={{ color: 'var(--tk-text-muted)', fontSize: '0.78rem', marginTop: '0.5rem', paddingLeft: '4px' }}>
                  {t('fleaModule.detail.lastScan', { date: formatMarketDate(itemSeleccionado.updated) })}
                  {itemSeleccionado.lastOfferCount > 0
                    ? ` · ${t('fleaModule.detail.offerCount', { count: itemSeleccionado.lastOfferCount })}`
                    : ''}
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>{t('fleaModule.detail.traderValue')}</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {itemSeleccionado.sellFor && itemSeleccionado.sellFor.slice(0, 4).map((trader, i) => (
                  <div key={i} style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', color: '#bbb' }}>{trader.source}</span>
                    <span style={{ color: 'var(--tk-green)', fontWeight: '700' }}>{formatRublos(trader.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* CAMBIO DE ORDEN: RADAR DE ANOMALÍAS EN LA MITAD INFERIOR */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--tk-text-muted)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
          {t('fleaModule.hotDeals.title', { mode: modoMercado })}
        </h3>
        
        {cargandoHotDeals ? (
          <div style={{ color: 'var(--tk-text-muted)', fontSize: '0.95rem', letterSpacing: '1px' }}>{t('fleaModule.hotDeals.loading')}</div>
        ) : errorHotDeals ? (
          <div style={{ color: '#ffcf66', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{errorHotDeals}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {hotDeals.map((deal) => {
              const esSubida = deal.desviacion > 0;
              const pctText = `${Math.abs(Math.round(deal.desviacion * 100))}%`;
              
              return (
                <div
                  key={deal.id}
                  onClick={() => seleccionarItem(deal)}
                  style={{
                    backgroundColor: 'var(--tk-glass)',
                    backdropFilter: 'blur(25px)',
                    border: `1px solid ${esSubida ? 'rgba(255, 68, 68, 0.2)' : 'rgba(26, 176, 21, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = esSubida ? '#ff4444' : 'var(--tk-green)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = esSubida ? 'rgba(255, 68, 68, 0.2)' : 'rgba(26, 176, 21, 0.2)'}
                >
                  <span style={{
                    backgroundColor: esSubida ? 'rgba(255,68,68,0.12)' : 'rgba(26,176,21,0.12)',
                    color: esSubida ? '#ff4444' : 'var(--tk-green)',
                    fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', position: 'absolute', top: '12px', right: '12px', letterSpacing: '0.5px'
                  }}>
                    {esSubida ? t('fleaModule.hotDeals.up', { pct: pctText }) : t('fleaModule.hotDeals.down', { pct: pctText })}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                    <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0 }}>
                      <img src={deal.iconLink} alt={deal.shortName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', margin: 0, paddingRight: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.name}</h4>
                      <p style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', margin: '2px 0 0 0', fontWeight: '700' }}>{formatRublos(deal.lastLowPrice)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
