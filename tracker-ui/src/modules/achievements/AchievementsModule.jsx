import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadAchievementCatalog } from './achievementsApi';
import './achievements.css';

const STORAGE_KEY = 'info_tarkov_achievement_checklist';

const COPY = {
  es: {
    eyebrow: 'REGISTRO DE PROGRESO GLOBAL',
    title: 'ARCHIVO DE LOGROS',
    subtitle: 'Consulta y organiza todos los logros de Escape from Tarkov, sus eventos y Tarkov: Arena.',
    back: 'VOLVER AL MENÚ',
    connected: 'DATOS DE TARKOV CONECTADOS',
    cached: 'USANDO ÚLTIMA COPIA VÁLIDA',
    syncing: 'SINCRONIZANDO LOGROS...',
    tabs: { normal: 'TARKOV', event: 'EVENTOS', arena: 'ARENA', retired: 'RETIRADOS' },
    search: 'Buscar logro, requisito o evento...',
    allRarities: 'TODAS LAS RAREZAS',
    common: 'COMÚN',
    rare: 'RARO',
    legendary: 'LEGENDARIO',
    allVisibility: 'TODOS',
    visible: 'VISIBLES',
    hidden: 'OCULTOS',
    total: 'LOGROS DISPONIBLES',
    completed: 'MARCADOS',
    progress: 'PROGRESO',
    empty: 'No hay logros que coincidan con estos filtros.',
    loading: 'CARGANDO ARCHIVO...',
    error: 'No se pudo cargar el catálogo de logros.',
    retry: 'REINTENTAR',
    event: 'EVENTO',
    arenaEvent: 'EVENTO DE ARENA',
    hiddenBadge: 'OCULTO',
    reward: 'RECOMPENSA',
    mark: 'MARCAR',
    done: 'COMPLETADO',
    wikiAttribution: 'Datos de Arena: Escape from Tarkov Wiki · CC BY-NC-SA'
  },
  en: {
    eyebrow: 'GLOBAL PROGRESSION RECORD',
    title: 'ACHIEVEMENT ARCHIVE',
    subtitle: 'Browse and organize every Escape from Tarkov, event and Tarkov: Arena achievement.',
    back: 'BACK TO MENU',
    connected: 'TARKOV DATA CONNECTED',
    cached: 'USING LAST VALID SNAPSHOT',
    syncing: 'SYNCING ACHIEVEMENTS...',
    tabs: { normal: 'TARKOV', event: 'EVENTS', arena: 'ARENA', retired: 'RETIRED' },
    search: 'Search achievement, requirement or event...',
    allRarities: 'ALL RARITIES',
    common: 'COMMON',
    rare: 'RARE',
    legendary: 'LEGENDARY',
    allVisibility: 'ALL',
    visible: 'VISIBLE',
    hidden: 'HIDDEN',
    total: 'AVAILABLE ACHIEVEMENTS',
    completed: 'MARKED',
    progress: 'PROGRESS',
    empty: 'No achievements match these filters.',
    loading: 'LOADING ARCHIVE...',
    error: 'The achievement catalog could not be loaded.',
    retry: 'RETRY',
    event: 'EVENT',
    arenaEvent: 'ARENA EVENT',
    hiddenBadge: 'HIDDEN',
    reward: 'REWARD',
    mark: 'MARK',
    done: 'COMPLETED',
    wikiAttribution: 'Arena data: Escape from Tarkov Wiki · CC BY-NC-SA'
  }
};

const readCompleted = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const formatPercent = (value, locale) => value == null
  ? null
  : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value));

export default function AchievementsModule({ onViewChange }) {
  const { i18n } = useTranslation();
  const language = String(i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const copy = COPY[language] || COPY.en;
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('normal');
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('all');
  const [visibility, setVisibility] = useState('all');
  const [completed, setCompleted] = useState(readCompleted);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    loadAchievementCatalog(language)
      .then((data) => {
        if (!active) return;
        setCatalog(data);
        setError('');
      })
      .catch((loadError) => active && setError(loadError?.message || 'Achievements unavailable'));
    return () => { active = false; };
  }, [language, refreshKey]);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const categoryItems = useMemo(
    () => catalog?.[activeCategory] || [],
    [activeCategory, catalog]
  );
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(language);
    return categoryItems.filter((achievement) => {
      const matchesQuery = !needle || [achievement.name, achievement.description, achievement.event]
        .some((value) => String(value || '').toLocaleLowerCase(language).includes(needle));
      const matchesRarity = rarity === 'all' || achievement.normalizedRarity === rarity;
      const matchesVisibility = visibility === 'all'
        || (visibility === 'hidden' ? achievement.hidden : !achievement.hidden);
      return matchesQuery && matchesRarity && matchesVisibility;
    });
  }, [categoryItems, language, query, rarity, visibility]);

  const categoryCompleted = categoryItems.filter((achievement) => completedSet.has(achievement.id)).length;
  const completionPercent = categoryItems.length ? Math.round((categoryCompleted / categoryItems.length) * 100) : 0;

  const toggleCompleted = (id) => {
    const next = completedSet.has(id)
      ? completed.filter((achievementId) => achievementId !== id)
      : [...completed, id];
    setCompleted(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <main className="achievements-page">
      <div className="achievements-page__grid" aria-hidden="true" />
      <header className="achievements-header">
        <div>
          <span>{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <div className="achievements-header__actions">
          <span className={`achievements-source${catalog?.source === 'stale-cache' ? ' is-cached' : ''}`}>
            <i />
            {catalog ? (catalog.source === 'stale-cache' ? copy.cached : copy.connected) : copy.syncing}
          </span>
          <button type="button" onClick={() => onViewChange('home')}>{copy.back}</button>
        </div>
      </header>

      <nav className="achievements-tabs" aria-label={copy.title}>
        {Object.entries(copy.tabs).map(([category, label]) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'is-active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {label}
            <span>{catalog?.[category]?.length ?? '—'}</span>
          </button>
        ))}
      </nav>

      <section className="achievements-content">
        <div className="achievements-stats">
          <Stat label={copy.total} value={categoryItems.length} />
          <Stat label={copy.completed} value={categoryCompleted} />
          <Stat label={copy.progress} value={`${completionPercent}%`} />
          <div className="achievements-progress" aria-label={`${copy.progress}: ${completionPercent}%`}>
            <i style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <div className="achievements-filters">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
          <select value={rarity} onChange={(event) => setRarity(event.target.value)} aria-label={copy.allRarities}>
            <option value="all">{copy.allRarities}</option>
            <option value="common">{copy.common}</option>
            <option value="rare">{copy.rare}</option>
            <option value="legendary">{copy.legendary}</option>
          </select>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value)} aria-label={copy.allVisibility}>
            <option value="all">{copy.allVisibility}</option>
            <option value="visible">{copy.visible}</option>
            <option value="hidden">{copy.hidden}</option>
          </select>
        </div>

        {!catalog && !error && <div className="achievements-empty">{copy.loading}</div>}
        {error && !catalog && (
          <div className="achievements-empty">
            <p>{copy.error}</p>
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>{copy.retry}</button>
          </div>
        )}
        {catalog && filteredItems.length === 0 && <div className="achievements-empty">{copy.empty}</div>}

        <div className="achievements-grid">
          {filteredItems.map((achievement) => {
            const isCompleted = completedSet.has(achievement.id);
            const percentage = formatPercent(achievement.playersCompletedPercent, language);
            return (
              <article key={achievement.id} className={`achievement-card rarity-${achievement.normalizedRarity}${isCompleted ? ' is-completed' : ''}`}>
                <div className="achievement-card__icon">
                  <img src={achievement.imageLink} alt="" loading="lazy" />
                </div>
                <div className="achievement-card__content">
                  <div className="achievement-card__badges">
                    <span>{achievement.normalizedRarity?.toUpperCase()}</span>
                    {achievement.hidden && <span>{copy.hiddenBadge}</span>}
                    {achievement.category === 'event' && <span>{copy.event}</span>}
                    {achievement.category === 'arena-event' && <span>{copy.arenaEvent}</span>}
                  </div>
                  <h2>{achievement.name}</h2>
                  <p>{achievement.description}</p>
                  {achievement.event && <small>{achievement.event}</small>}
                  {achievement.reward && <small><b>{copy.reward}:</b> {achievement.reward}</small>}
                  <footer>
                    <span>{percentage == null ? 'ARENA' : `${percentage}%`}</span>
                    <button type="button" className={isCompleted ? 'is-completed' : ''} onClick={() => toggleCompleted(achievement.id)}>
                      {isCompleted ? copy.done : copy.mark}
                    </button>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>

        {(activeCategory === 'arena' || activeCategory === 'retired') && (
          <a className="achievements-attribution" href="https://escapefromtarkov.fandom.com/wiki/Achievements" target="_blank" rel="noreferrer">
            {copy.wikiAttribution} ↗
          </a>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return <article><span>{label}</span><strong>{value}</strong></article>;
}
