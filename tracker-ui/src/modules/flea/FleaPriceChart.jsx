import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '../../i18n/languages';

const DAY_MS = 24 * 60 * 60 * 1000;
const SVG_WIDTH = 920;
const SVG_HEIGHT = 310;
const PLOT = { left: 76, right: 20, top: 18, bottom: 48 };

const niceScale = (maximum) => {
  const roughStep = Math.max(1, maximum / 5);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const residual = roughStep / magnitude;
  const step = (residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1) * magnitude;
  return { step, maximum: Math.max(step, Math.ceil(maximum / step) * step) };
};

export default function FleaPriceChart({ item, gameMode, rangeDays }) {
  const { i18n, t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const locale = getIntlLocale(i18n.resolvedLanguage || i18n.language);

  const chart = useMemo(() => {
    const history = (item?.historicalPrices || [])
      .filter((sample) => Number(sample?.price) > 0 && Number(sample?.timestamp) > 0)
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    const latestTimestamp = Number(history.at(-1)?.timestamp || 0);
    const filtered = history.filter(
      (sample) => Number(sample.timestamp) >= latestTimestamp - rangeDays * DAY_MS
    );
    const samples = filtered.length >= 2 ? filtered : history.slice(-2);
    const allPrices = samples.flatMap((sample) => [
      Number(sample.price),
      Number(sample.priceMin || sample.price)
    ]);
    const rawMaximum = Math.max(...allPrices);
    const rawMinimum = Math.min(...allPrices);
    const scale = niceScale(rawMaximum);
    const plotWidth = SVG_WIDTH - PLOT.left - PLOT.right;
    const plotHeight = SVG_HEIGHT - PLOT.top - PLOT.bottom;
    const xFor = (index) =>
      PLOT.left + (index / Math.max(1, samples.length - 1)) * plotWidth;
    const yFor = (price) =>
      PLOT.top + plotHeight - (Number(price || 0) / scale.maximum) * plotHeight;
    const points = samples.map((sample, index) => ({
      x: xFor(index),
      y: yFor(sample.price),
      yMin: yFor(sample.priceMin || sample.price),
      price: Number(sample.price),
      priceMin: Number(sample.priceMin || 0),
      offerCount: Number(sample.offerCount || 0),
      timestamp: Number(sample.timestamp)
    }));

    return {
      points,
      rawMaximum,
      rawMinimum,
      plotWidth,
      plotHeight,
      chartMaximum: scale.maximum,
      averagePath: points
        .map((point, index) => `${index ? 'L' : 'M'} ${point.x},${point.y}`)
        .join(' '),
      minimumPath: points
        .map((point, index) => `${index ? 'L' : 'M'} ${point.x},${point.yMin}`)
        .join(' ')
    };
  }, [item, rangeDays]);

  const formatRoubles = (value) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  const formatCompact = (value) =>
    new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  const formatTickDate = (timestamp) =>
    new Date(timestamp).toLocaleString(
      locale,
      rangeDays <= 1
        ? { hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: 'short' }
    );

  const horizontalTicks = Array.from({ length: 6 }, (_, index) => ({
    value: chart.chartMaximum - (index * chart.chartMaximum) / 5,
    y: PLOT.top + (index * chart.plotHeight) / 5
  }));
  const verticalTicks = Array.from({ length: 8 }, (_, index) => {
    const dataIndex = Math.round((index / 7) * (chart.points.length - 1));
    return {
      x: PLOT.left + (index / 7) * chart.plotWidth,
      timestamp: chart.points[dataIndex].timestamp
    };
  });
  const areaPath = `${chart.averagePath} L ${chart.points.at(-1).x},${PLOT.top + chart.plotHeight} L ${chart.points[0].x},${PLOT.top + chart.plotHeight} Z`;
  const tooltipX = hoveredPoint?.x > SVG_WIDTH - 210
    ? hoveredPoint.x - 194
    : (hoveredPoint?.x || 0) + 12;
  const tooltipY = Math.min(
    PLOT.top + chart.plotHeight - 94,
    Math.max(PLOT.top + 6, (hoveredPoint?.y || 0) - 42)
  );

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.42)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '12px'
    }}>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ width: '100%', minWidth: '680px', height: 'auto', display: 'block' }}
          onPointerLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={`flea-area-${gameMode}-${item.id}-${rangeDays}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#20d51a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#20d51a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {horizontalTicks.map((tick) => (
            <g key={`y-${tick.y}`}>
              <line
                x1={PLOT.left}
                y1={tick.y}
                x2={PLOT.left + chart.plotWidth}
                y2={tick.y}
                stroke="rgba(255,255,255,0.22)"
                strokeDasharray="7 6"
              />
              <text x={PLOT.left - 10} y={tick.y + 4} textAnchor="end" fill="#71808a" fontSize="11">
                {formatCompact(tick.value)}
              </text>
            </g>
          ))}

          {verticalTicks.map((tick, index) => (
            <g key={`x-${tick.x}`}>
              <line
                x1={tick.x}
                y1={PLOT.top}
                x2={tick.x}
                y2={PLOT.top + chart.plotHeight}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="7 6"
              />
              <text
                x={tick.x}
                y={SVG_HEIGHT - 17}
                textAnchor={index === 0 ? 'start' : index === 7 ? 'end' : 'middle'}
                fill="#71808a"
                fontSize="11"
              >
                {formatTickDate(tick.timestamp)}
              </text>
            </g>
          ))}

          <path
            d={areaPath}
            fill={`url(#flea-area-${gameMode}-${item.id}-${rangeDays})`}
          />
          <path
            d={chart.averagePath}
            fill="none"
            stroke="#20d51a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d={chart.minimumPath}
            fill="none"
            stroke="#b8f2aa"
            strokeWidth="1.7"
            strokeDasharray="6 5"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={PLOT.top}
              x2={hoveredPoint.x}
              y2={PLOT.top + chart.plotHeight}
              stroke="rgba(255,255,255,0.58)"
              strokeDasharray="3 4"
            />
          )}

          {chart.points.map((point, index) => (
            <circle
              key={`${point.timestamp}-${index}`}
              cx={point.x}
              cy={point.y}
              r="7"
              fill="transparent"
              onPointerEnter={() => setHoveredPoint(point)}
              onPointerDown={() => setHoveredPoint(point)}
              style={{ cursor: 'crosshair' }}
            />
          ))}
          <circle
            cx={chart.points.at(-1).x}
            cy={chart.points.at(-1).y}
            r="3.5"
            fill="#fff"
            stroke="#20d51a"
            strokeWidth="2"
          />

          {hoveredPoint && (
            <g pointerEvents="none">
              <rect
                x={tooltipX}
                y={tooltipY}
                width="182"
                height={hoveredPoint.offerCount > 0 ? 88 : 72}
                rx="6"
                fill="rgba(8,8,10,0.97)"
                stroke="rgba(32,213,26,0.8)"
              />
              <text x={tooltipX + 10} y={tooltipY + 17} fill="#9aa1a8" fontSize="11">
                {formatTimestamp(hoveredPoint.timestamp)}
              </text>
              <text x={tooltipX + 10} y={tooltipY + 37} fill="#20d51a" fontSize="12" fontWeight="800">
                {t('fleaModule.chart.averageSeries')}: {formatRoubles(hoveredPoint.price)}
              </text>
              <text x={tooltipX + 10} y={tooltipY + 56} fill="#b8f2aa" fontSize="11" fontWeight="700">
                {t('fleaModule.chart.minimumSeries')}: {formatRoubles(hoveredPoint.priceMin)}
              </text>
              {hoveredPoint.offerCount > 0 && (
                <text x={tooltipX + 10} y={tooltipY + 75} fill="#9aa1a8" fontSize="10">
                  {t('fleaModule.detail.offerCount', { count: hoveredPoint.offerCount })}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '0.75rem',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        color: 'var(--tk-text-muted)',
        fontSize: '0.75rem',
        fontWeight: '700'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#20d51a' }}>━ {t('fleaModule.chart.averageSeries')}</span>
          <span style={{ color: '#b8f2aa' }}>┄ {t('fleaModule.chart.minimumSeries')}</span>
        </div>
        <span>{t('fleaModule.chart.min')} {formatRoubles(chart.rawMinimum)}</span>
        <span>{t('fleaModule.chart.max')} {formatRoubles(chart.rawMaximum)}</span>
      </div>
    </div>
  );
}
