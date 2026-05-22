import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';

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
  const [hoverSparkline, setHoverSparkline] = useState(null);
  const gameMode = MARKET_MODES[modoMercado];

  // 1. RADAR AUTOMÁTICO DE ANOMALÍAS (HOT DEALS VIVO)
  useEffect(() => {
    const controller = new AbortController();

    const queryHotDeals = JSON.stringify({
      query: `
        query GetHotDeals {
          items(names: ${JSON.stringify(ITEMS_INTERES)}, gameMode: ${gameMode}) {
            id
            name
            shortName
            iconLink
            width
            height
            avg24hPrice
            lastLowPrice
            historicalPrices {
              price
              timestamp
            }
            sellFor { price source }
          }
        }
      `
    });

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: queryHotDeals,
      signal: controller.signal
    })
      .then(res => res.json())
      .then(result => {
        if (result?.data?.items) {
          const anomalías = result.data.items
            .map(item => {
              const precioActual = item.lastLowPrice || 0;
              const media = item.avg24hPrice || 1;
              const desviacion = (precioActual - media) / media;
              const slots = item.width * item.height;
              const pricePerSlot = Math.round(precioActual / slots);

              return { ...item, desviacion, pricePerSlot, slots };
            })
            .filter(item => Math.abs(item.desviacion) >= 0.12 && item.lastLowPrice > 0)
            .sort((a, b) => Math.abs(b.desviacion) - Math.abs(a.desviacion))
            .slice(0, 12);

          setHotDeals(anomalías);
        }
        setCargandoHotDeals(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCargandoHotDeals(false);
      });

    return () => controller.abort();
  }, [gameMode]);

  const cambiarModoMercado = (mode) => {
    setModoMercado(mode);
    setItemSeleccionado(null);
    setItemsResultados([]);
  };

  // 2. BUSCADOR INTELIGENTE MULTI-IDIOMA CON TOLERANCIA DE TILDES
  useEffect(() => {
    if (busqueda.length < 3) {
      const resetResults = window.setTimeout(() => {
        setItemsResultados([]);
        setCargando(false);
      }, 0);
      return () => window.clearTimeout(resetResults);
    }

    const delayDebounce = setTimeout(() => {
      setCargando(true);

      const queryBuscador = JSON.stringify({
        query: `
          query SearchItems {
            items(gameMode: ${gameMode}) {
              id
              name
              shortName
              iconLink
              width
              height
              avg24hPrice
              lastLowPrice
              historicalPrices {
                price
                timestamp
              }
              sellFor { price source }
            }
          }
        `
      });

      fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: queryBuscador
      })
        .then(res => res.json())
        .then(result => {
          if (result?.data?.items) {
            const normalizar = (str) => 
              str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

            const inputLimpio = normalizar(busqueda);

            const filtrados = result.data.items.filter(item => {
              const itemIngles = normalizar(item.name);
              const itemCorto = normalizar(item.shortName);
              
              let equivalenciaEspanol = "";
              if (itemIngles.includes("sugar")) equivalenciaEspanol = "azucar";
              if (itemIngles.includes("graphics card")) equivalenciaEspanol = "tarjeta grafica tarjeta de graficos";
              if (itemIngles.includes("water filter")) equivalenciaEspanol = "filtro de agua";
              if (itemIngles.includes("ledx")) equivalenciaEspanol = "ledx";
              if (itemIngles.includes("bitcoin")) equivalenciaEspanol = "bitcoin fisico btc";

              return (
                itemIngles.includes(inputLimpio) || 
                itemCorto.includes(inputLimpio) || 
                equivalenciaEspanol.includes(inputLimpio)
              );
            });

            setItemsResultados(filtrados.slice(0, 6));
          }
          setCargando(false);
        })
        .catch(() => setCargando(false));
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [busqueda, gameMode]);

  const formatRublos = (val) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  const formatMarketDate = (timestamp) => {
    if (!timestamp) return t('fleaModule.noDate');

    const numericTimestamp = Number(timestamp);
    const date = Number.isFinite(numericTimestamp)
      ? new Date(numericTimestamp < 10000000000 ? numericTimestamp * 1000 : numericTimestamp)
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) return t('fleaModule.noDate');

    return date.toLocaleString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // RENDERIZADOR DE GRÁFICAS REALES
  const renderRealSparkline = (item) => {
    const historicoLimpio = (item?.historicalPrices || [])
      .filter(d => d && d.price && d.price > 0 && d.timestamp)
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    const datosFinales = historicoLimpio.length >= 2 
      ? historicoLimpio.slice(-7)
      : [{ price: item.lastLowPrice || item.avg24hPrice, timestamp: "1" }, { price: item.lastLowPrice || item.avg24hPrice, timestamp: "2" }];
    
    const precios = datosFinales.map(d => d.price);
    const maxPrecio = Math.max(...precios);
    const minPrecio = Math.min(...precios);
    const rango = (maxPrecio - minPrecio) === 0 ? 1 : (maxPrecio - minPrecio);

    const svgWidth = 500;
    const svgHeight = 100;
    const paddingY = 20; 

    const puntos = datosFinales.map((d, index) => {
      const x = (index / (datosFinales.length - 1)) * svgWidth;
      const y = svgHeight - paddingY - ((d.price - minPrecio) / rango) * (svgHeight - 2 * paddingY);
      const previousPrice = datosFinales[index - 1]?.price || null;
      const delta = previousPrice ? d.price - previousPrice : 0;
      return { x, y, price: d.price, timestamp: d.timestamp, delta };
    });

    const pathD = puntos.reduce((acc, p, i) => i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');
    const areaD = `${pathD} L ${puntos[puntos.length - 1].x},${svgHeight} L ${puntos[0].x},${svgHeight} Z`;

    const esInflado = (item.lastLowPrice || 0) > (item.avg24hPrice || 0);
    const colorGrafica = esInflado ? '#ff4444' : '#1ab015';

    return (
      <div style={{ position: 'relative', width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '12px', overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '110px', display: 'block' }}>
          <defs>
            <linearGradient id={`gradienteFlea-${modoMercado}-${item.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorGrafica} stopOpacity="0.2" />
              <stop offset="100%" stopColor={colorGrafica} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#gradienteFlea-${modoMercado}-${item.id})`} />
          <path d={pathD} fill="none" stroke={colorGrafica} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {puntos.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoverSparkline({ ...p, index: i, total: puntos.length })}
              onMouseLeave={() => setHoverSparkline(null)}
              style={{ cursor: 'crosshair' }}
            >
              <circle cx={p.x} cy={p.y} r="11" fill="transparent" />
              <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={colorGrafica} strokeWidth="2" />
            </g>
          ))}
        </svg>

        {hoverSparkline && (
          <div
            style={{
              position: 'absolute',
              left: `clamp(8px, calc(${(hoverSparkline.x / svgWidth) * 100}% - 78px), calc(100% - 164px))`,
              top: '-76px',
              width: '156px',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(8,8,10,0.96)',
              border: `1px solid ${colorGrafica}`,
              boxShadow: `0 0 22px ${colorGrafica}22`,
              pointerEvents: 'none',
              zIndex: 4,
              textAlign: 'left'
            }}
          >
            <div style={{ color: '#fff', fontWeight: '900', fontSize: '1rem' }}>{formatRublos(hoverSparkline.price)}</div>
            <div style={{ color: 'var(--tk-text-muted)', fontWeight: '800', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              {formatMarketDate(hoverSparkline.timestamp)}
            </div>
            <div
              style={{
                color: hoverSparkline.delta >= 0 ? '#ffcf66' : 'var(--tk-green)',
                fontWeight: '900',
                fontSize: '0.78rem',
                marginTop: '0.3rem'
              }}
            >
              {hoverSparkline.index === 0
                ? t('fleaModule.chart.firstRecord')
                : t('fleaModule.chart.deltaVsPrevious', {
                  delta: `${hoverSparkline.delta >= 0 ? '+' : ''}${formatRublos(hoverSparkline.delta)}`
                })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--tk-text-muted)', fontFamily: "'Rajdhani', sans-serif", fontWeight: '700', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
          <span>{t('fleaModule.chart.sevenDaysAgo')}</span>
          <div><span style={{ color: '#fff' }}>{t('fleaModule.chart.min')}</span> {formatRublos(minPrecio)}</div>
          <div><span style={{ color: '#fff' }}>{t('fleaModule.chart.max')}</span> {formatRublos(maxPrecio)}</div>
          <span>{t('fleaModule.chart.now')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in-slide terminal-panel" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* CABECERA */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
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
        
        {!cargando && busqueda.length >= 3 && itemsResultados.length === 0 && (
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
      <div style={{ display: 'grid', gridTemplateColumns: itemSeleccionado ? '1.1fr 0.9fr' : '1fr', gap: '2rem', transition: 'all 0.3s', marginBottom: '4rem' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {itemsResultados.map((item) => {
            const slots = item.width * item.height;
            const fleaPrice = item.lastLowPrice || 0;
            const pricePerSlot = Math.round(fleaPrice / slots);
            const inflado = fleaPrice > item.avg24hPrice * 1.15;

            return (
              <div
                key={item.id}
                onClick={() => setItemSeleccionado(item)}
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
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>{formatRublos(fleaPrice)}</div>
                  <span style={{ 
                    backgroundColor: inflado ? 'rgba(255,68,68,0.1)' : 'rgba(26,176,21,0.1)', 
                    color: inflado ? '#ff4444' : 'var(--tk-green)', 
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
              <span style={{ fontSize: '0.8rem', color: 'var(--tk-text-muted)', fontWeight: '700', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.5px' }}>
                {t('fleaModule.detail.historicalTrend', { mode: modoMercado })}
              </span>
              {renderRealSparkline(itemSeleccionado)}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', marginTop: '0.8rem', paddingLeft: '4px' }}>
                <div><span style={{ color: 'var(--tk-text-muted)' }}>{t('fleaModule.detail.avg24h')}</span> <span style={{ color: '#fff', fontWeight: '700', marginLeft: '4px' }}>{formatRublos(itemSeleccionado.avg24hPrice)}</span></div>
                <div><span style={{ color: 'var(--tk-text-muted)' }}>{t('fleaModule.detail.currentLow')}</span> <span style={{ color: '#fff', fontWeight: '700', marginLeft: '4px' }}>{formatRublos(itemSeleccionado.lastLowPrice)}</span></div>
              </div>
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
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {hotDeals.map((deal) => {
              const esSubida = deal.desviacion > 0;
              const pctText = `${Math.abs(Math.round(deal.desviacion * 100))}%`;
              
              return (
                <div
                  key={deal.id}
                  onClick={() => setItemSeleccionado(deal)}
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
