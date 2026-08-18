import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSeasonalIntel } from './seasonalApi';
import {
  BATTLE_PASS_DOCUMENTS,
  BATTLE_PASS_PAGES,
  BATTLE_PASS_REWARDS,
  BATTLE_PASS_SEARCH_TAGS,
  calculateModifierBalance,
  getBattlePassProgressRequirements,
  getBattlePassRewardTags,
  GLOBAL_MODIFIERS,
  PERSONAL_MODIFIERS,
  searchBattlePassRewards,
  SEASON
} from './seasonalData';
import './kord-breach.css';

const BUILD_STORAGE_KEY = 'info_tarkov_kord_breach_modifier_build';
const DOCUMENT_STORAGE_KEY = 'info_tarkov_kord_breach_documents';
const REWARD_STORAGE_KEY = 'info_tarkov_kord_breach_claimed_rewards';
const WISHLIST_STORAGE_KEY = 'info_tarkov_kord_breach_reward_wishlist';

const SPANISH_EFFECTS = {
  'no-insurance': 'El seguro está desactivado para todos los PMC estacionales.',
  handyman: 'Los crafteos tardan un 50% menos y Crafting comienza en nivel 51.',
  'seasoned-pmcs': 'Los personajes estacionales obtienen un 25% más de experiencia en raid.',
  'armor-shortage': 'Los comerciantes ofrecen una selección reducida de armaduras.',
  'black-division': 'Los operativos de Black Division pueden aparecer en localizaciones específicas.',
  'no-fir-hideout': 'Las mejoras del refugio no necesitan estado Encontrado en Raid.',
  'street-tax': 'Una vez por semana, algunos Scavs te pagan dinero de protección.',
  diet: 'La comida y las bebidas consumen un 50% menos de recurso.',
  'juice-time': 'Beber zumo otorga el efecto Analgésico durante 60 segundos.',
  hypodipsia: 'La hidratación se consume un 20% más despacio.',
  'sailors-nostalgia': 'El pescado enlatado otorga Regeneración de salud (+2) durante 30 segundos.',
  sprinter: 'La velocidad de carrera aumenta un 5%.',
  polyphagia: 'La energía se consume un 20% más despacio.',
  thrombophilia: 'La probabilidad de sangrado disminuye un 25%.',
  'marathon-runner': 'La resistencia de brazos y piernas se consume un 20% más despacio.',
  hercules: 'Fuerza y Resistencia comienzan en nivel 15.',
  'tarkov-shooter': 'Fusiles de cerrojo comienza en nivel 25 y progresa un 100% más rápido.',
  youth: 'La energía se consume un 20% más despacio y la resistencia de extremidades aumenta en 10.',
  'sturdy-bones': 'La probabilidad de fractura disminuye un 25% y el daño por caída un 20%.',
  'bush-borne': 'La vegetación provoca un 75% menos de ruido y ralentización.',
  safecracker: 'Las llaves mecánicas tienen un 25% de probabilidad de no perder durabilidad.',
  average: 'Las habilidades comienzan en nivel 25, pero no pueden seguir progresando salvo Crafting.',
  'kappa-protocol': 'Recibes inmediatamente el contenedor seguro Kappa.',
  prodigy: 'La experiencia obtenida por las habilidades aumenta un 30%.',
  lucky: '¡La fortuna favorece a los audaces!',
  'chronic-fatigue': 'La energía se consume un 20% más rápido.',
  'third-leg': 'La velocidad de movimiento baja un 1%, pero Therapist vende un 5% más barato.',
  polydipsia: 'La hidratación se consume un 15% más rápido.',
  'dr-jekyll': 'El estado Herida reciente no puede eliminarse antes de terminar la raid.',
  hemophilia: 'La probabilidad de sangrado aumenta un 25%.',
  'well-that-hurt': 'Los botiquines consumen un 25% más de recurso.',
  'personality-vacuum': 'Carisma no puede aumentar y los objetos de comerciantes cuestan un 20% más.',
  allergic: 'Te vuelves alérgico a tres objetos aleatorios de Provisiones o Medicación.',
  osteoporosis: 'La probabilidad de fractura aumenta un 25% y el daño por caída un 20%.',
  incompetent: 'La mayoría de habilidades progresan un 25% más lento y quedan limitadas al nivel 30.',
  'broken-secure-container': 'El contenedor seguro queda restringido a determinadas categorías de objetos.',
  unlucky: 'Tu mala suerte puede tener consecuencias graves.',
  exhaustion: 'La resistencia de extremidades se recupera un 20% más despacio y se reduce en 10.',
  'no-flea-market': 'El acceso al Flea Market queda desactivado.',
};

const SPANISH_DOCUMENT_NAMES = {
  '6a317b9692cfdcddcb02a58e': 'Expedientes de personal PMC',
  '6a31807f17005505b70d5827': 'Documentos financieros',
  '6a3181f178450ec91c0ea1aa': 'Documentación de proyecto',
  '6a31824878450ec91c0ea1ae': 'Planos y documentación técnica',
  '6a31828557705071410ca00e': 'Documentación de pruebas',
  '6a3182b72fd891345e047eef': 'Documentación de usuario',
  '6a3182dc6cd8de21cf0a3a7d': 'Documentos médicos',
  '6a31830dde69ceafd805afa0': 'Documentación técnica',
  '6a3183258f113efdb7093622': 'Documentos clasificados'
};

const COPY = {
  es: {
    back: 'VOLVER AL MENÚ',
    eyebrow: 'CENTRO DE OPERACIONES ESTACIONAL',
    subtitle: 'Planifica tu PMC estacional, equilibra modificadores y controla el progreso documental de KORD BREACH.',
    live: 'DATOS ESTACIONALES CONECTADOS',
    cached: 'USANDO ÚLTIMA COPIA VÁLIDA',
    loading: 'SINCRONIZANDO INTEL...',
    tabs: ['MODIFICADORES', 'BATTLE PASS', 'MAPAS', 'LOGROS'],
    mandatory: 'OBLIGATORIO',
    mandatoryPerks: 'PERKS OBLIGATORIOS',
    mandatoryPerksBody: 'Se aplican automáticamente a todos los PMC estacionales y no pueden desactivarse.',
    selectablePerks: 'PERKS SELECCIONABLES',
    selectablePerksBody: 'Construye tu PMC combinando ventajas que consumen puntos con desventajas que los aportan.',
    builderTitle: 'Constructor de PMC estacional',
    builderBody: 'Los modificadores negativos aportan puntos y los positivos los consumen. El balance final debe ser cero o superior.',
    balance: 'BALANCE',
    valid: 'CONFIGURACIÓN VÁLIDA',
    invalid: 'FALTAN PUNTOS NEGATIVOS',
    reset: 'REINICIAR BUILD',
    positive: 'VENTAJAS · RESTAN PUNTOS',
    negative: 'DESVENTAJAS · SUMAN PUNTOS',
    documentsTitle: 'Documentación de TerraGroup',
    documentsBody: 'Marca lo que ya hayas entregado o guardado. Classified Documents puede sustituir cualquier tipo requerido.',
    battlePassTitle: 'Pase de batalla KORD BREACH',
    battlePassBody: 'Consulta las 12 páginas, sus recompensas y el coste documental de cada una sin abrirlas una por una dentro del juego.',
    rewards: 'RECOMPENSAS',
    verifiedCosts: 'COSTES VERIFICADOS',
    claimedRewards: 'RECLAMADAS',
    page: 'PÁGINA',
    pageRequirements: 'DOCUMENTOS PARA ESTA PÁGINA',
    costPending: 'COSTE PENDIENTE DE CONFIRMAR',
    namePending: 'NOMBRE PENDIENTE DE CONFIRMAR',
    markClaimed: 'MARCAR RECLAMADA',
    claimed: 'RECLAMADA',
    searchPlaceholder: 'Buscar recompensa por nombre o etiqueta...',
    searchResults: 'RESULTADOS DE BÚSQUEDA',
    noSearchResults: 'No hay recompensas que coincidan con la búsqueda.',
    allTags: 'TODAS',
    tagLabels: { tarcoins: 'TARCOINS', clothing: 'ROPA', gear: 'GEAR', hideout: 'HIDEOUT', crates: 'CAJAS', dogtags: 'DOGTAGS', weapons: 'ARMAS' },
    foundOnPage: 'SE ENCUENTRA EN LA PÁGINA',
    openReward: 'VER RECOMPENSA',
    wishlist: 'WISHLIST',
    addWishlist: 'AÑADIR A WISHLIST',
    removeWishlist: 'QUITAR DE WISHLIST',
    emptyWishlist: 'Añade recompensas para calcular una ruta documental conjunta.',
    wishlistRoute: 'RUTA CONJUNTA HASTA LA RECOMPENSA MÁS LEJANA',
    cumulativeTitle: 'DOCUMENTOS ACUMULADOS HASTA ESTA RECOMPENSA',
    knownMinimum: 'MÍNIMO VERIFICADO',
    sharedProgress: 'El progreso compartido se calcula una sola vez, sin duplicar páginas anteriores.',
    unverifiedWarning: 'Hay costes anteriores pendientes de confirmar. El total mostrado es el mínimo conocido.',
    pendingPrevious: 'COSTES PREVIOS SIN VERIFICAR',
    selectRewardHint: 'Selecciona una recompensa para ver el coste documental acumulado.',
    inventoryTitle: 'Inventario documental',
    inventoryBody: 'Marca los tipos de documentos que ya tienes localizados. Los documentos clasificados funcionan como comodín.',
    collected: 'DOCUMENTOS CONTROLADOS',
    wildcard: 'COMODÍN',
    mapsTitle: 'Mapas de documentos',
    mapsBody: 'Consulta las ubicaciones comunitarias de los documentos requeridos para KORD BREACH sin salir de InfoTarkov.',
    mapsNotice: 'Mapa comunitario externo integrado desde Kord Map. Las ubicaciones pueden actualizarse a medida que se verifican nuevos hallazgos.',
    openMaps: 'ABRIR MAPA EN PANTALLA COMPLETA',
    mapsFrameTitle: 'Mapa interactivo de documentos de KORD BREACH',
    achievementsTitle: 'Logros estacionales',
    achievementsBody: 'Leídos directamente del dataset pvp-season de Tarkov.dev.',
    sourceTitle: 'Cobertura actual de datos',
    sourceBody: 'Objetos y logros se actualizan desde Tarkov.dev. Los modificadores se mantienen en una capa verificada hasta que la API los estructure.',
    noAchievements: 'No se pudieron cargar los logros estacionales.',
    retry: 'REINTENTAR',
    selected: 'SELECCIONADO',
    wikiAttribution: 'Iconos y datos de perks: Escape from Tarkov Wiki · CC BY-NC-SA'
  },
  en: {
    back: 'BACK TO MENU',
    eyebrow: 'SEASONAL OPERATIONS CENTER',
    subtitle: 'Plan your Seasonal PMC, balance modifiers and track KORD BREACH documentation progress.',
    live: 'SEASONAL DATA CONNECTED',
    cached: 'USING LAST VALID SNAPSHOT',
    loading: 'SYNCING INTEL...',
    tabs: ['MODIFIERS', 'BATTLE PASS', 'MAPS', 'ACHIEVEMENTS'],
    mandatory: 'MANDATORY',
    mandatoryPerks: 'MANDATORY PERKS',
    mandatoryPerksBody: 'Automatically applied to every Seasonal PMC and cannot be disabled.',
    selectablePerks: 'SELECTABLE PERKS',
    selectablePerksBody: 'Build your PMC by combining advantages that spend points with disadvantages that grant them.',
    builderTitle: 'Seasonal PMC builder',
    builderBody: 'Negative modifiers grant points and positive modifiers spend them. Final balance must be zero or higher.',
    balance: 'BALANCE',
    valid: 'VALID CONFIGURATION',
    invalid: 'MORE NEGATIVE POINTS REQUIRED',
    reset: 'RESET BUILD',
    positive: 'ADVANTAGES · SPEND POINTS',
    negative: 'DISADVANTAGES · GRANT POINTS',
    documentsTitle: 'TerraGroup documentation',
    documentsBody: 'Mark documents you have stored or submitted. Classified Documents can replace any required type.',
    battlePassTitle: 'KORD BREACH Battle Pass',
    battlePassBody: 'Browse all 12 pages, their rewards and each document cost without opening every item inside the game.',
    rewards: 'REWARDS',
    verifiedCosts: 'VERIFIED COSTS',
    claimedRewards: 'CLAIMED',
    page: 'PAGE',
    pageRequirements: 'DOCUMENTS FOR THIS PAGE',
    costPending: 'DOCUMENT COST TO BE CONFIRMED',
    namePending: 'NAME TO BE CONFIRMED',
    markClaimed: 'MARK CLAIMED',
    claimed: 'CLAIMED',
    searchPlaceholder: 'Search rewards by name or tag...',
    searchResults: 'SEARCH RESULTS',
    noSearchResults: 'No rewards match this search.',
    allTags: 'ALL',
    tagLabels: { tarcoins: 'TARCOINS', clothing: 'CLOTHING', gear: 'GEAR', hideout: 'HIDEOUT', crates: 'CRATES', dogtags: 'DOGTAGS', weapons: 'WEAPONS' },
    foundOnPage: 'FOUND ON PAGE',
    openReward: 'VIEW REWARD',
    wishlist: 'WISHLIST',
    addWishlist: 'ADD TO WISHLIST',
    removeWishlist: 'REMOVE FROM WISHLIST',
    emptyWishlist: 'Add rewards to calculate one combined document route.',
    wishlistRoute: 'COMBINED ROUTE TO THE FURTHEST REWARD',
    cumulativeTitle: 'CUMULATIVE DOCUMENTS TO THIS REWARD',
    knownMinimum: 'VERIFIED MINIMUM',
    sharedProgress: 'Shared progression is calculated once, without duplicating earlier pages.',
    unverifiedWarning: 'Some earlier costs are still unverified. The displayed total is the known minimum.',
    pendingPrevious: 'UNVERIFIED EARLIER COSTS',
    selectRewardHint: 'Select a reward to see its cumulative document cost.',
    inventoryTitle: 'Document inventory',
    inventoryBody: 'Mark the document types you have located. Classified Documents work as a wildcard.',
    collected: 'DOCUMENTS TRACKED',
    wildcard: 'WILDCARD',
    mapsTitle: 'Document maps',
    mapsBody: 'Browse community document locations required for KORD BREACH without leaving InfoTarkov.',
    mapsNotice: 'External community map embedded from Kord Map. Locations may change as new finds are verified.',
    openMaps: 'OPEN FULL-SCREEN MAP',
    mapsFrameTitle: 'Interactive KORD BREACH document map',
    achievementsTitle: 'Seasonal achievements',
    achievementsBody: 'Read directly from Tarkov.dev pvp-season data.',
    sourceTitle: 'Current data coverage',
    sourceBody: 'Items and achievements update through Tarkov.dev. Modifiers use a verified layer until the API structures them.',
    noAchievements: 'Seasonal achievements could not be loaded.',
    retry: 'RETRY',
    selected: 'SELECTED',
    wikiAttribution: 'Perk icons and data: Escape from Tarkov Wiki · CC BY-NC-SA'
  }
};

const readStoredList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const formatPercent = (value, locale) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value || 0));

export default function KordBreachModule({ onViewChange }) {
  const { i18n } = useTranslation();
  const language = String(i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const copy = COPY[language] || COPY.en;
  const [activeTab, setActiveTab] = useState('modifiers');
  const [intel, setIntel] = useState(null);
  const [intelError, setIntelError] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState(() => readStoredList(BUILD_STORAGE_KEY));
  const [trackedDocuments, setTrackedDocuments] = useState(() => readStoredList(DOCUMENT_STORAGE_KEY));
  const [claimedRewards, setClaimedRewards] = useState(() => readStoredList(REWARD_STORAGE_KEY));
  const [wishlistRewards, setWishlistRewards] = useState(() => readStoredList(WISHLIST_STORAGE_KEY));
  const [battlePassQuery, setBattlePassQuery] = useState('');
  const [battlePassTag, setBattlePassTag] = useState('all');
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [selectedPage, setSelectedPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    loadSeasonalIntel(language)
      .then((data) => {
        if (!active) return;
        setIntel(data);
        setIntelError('');
      })
      .catch((error) => {
        if (!active) return;
        setIntelError(error?.message || 'Seasonal API unavailable');
      });

    return () => {
      active = false;
    };
  }, [language, refreshKey]);

  const selectedSet = useMemo(() => new Set(selectedModifiers), [selectedModifiers]);
  const trackedSet = useMemo(() => new Set(trackedDocuments), [trackedDocuments]);
  const claimedSet = useMemo(() => new Set(claimedRewards), [claimedRewards]);
  const wishlistSet = useMemo(() => new Set(wishlistRewards), [wishlistRewards]);
  const balance = useMemo(
    () => calculateModifierBalance(selectedModifiers),
    [selectedModifiers]
  );

  const documents = intel?.documents || BATTLE_PASS_DOCUMENTS;
  const documentById = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents]
  );
  const selectedBattlePassPage = BATTLE_PASS_PAGES.find((entry) => entry.page === selectedPage)
    || BATTLE_PASS_PAGES[0];
  const rewardCount = BATTLE_PASS_PAGES.reduce((total, entry) => total + entry.rewards.length, 0);
  const verifiedRewardCount = BATTLE_PASS_PAGES.reduce(
    (total, entry) => total + entry.rewards.filter((reward) => reward.verifiedRequirements).length,
    0
  );
  const selectedPageTotals = useMemo(() => {
    const totals = new Map();
    selectedBattlePassPage.rewards.forEach((reward) => {
      reward.requirements?.forEach(({ documentId, count }) => {
        totals.set(documentId, (totals.get(documentId) || 0) + count);
      });
    });
    return [...totals.entries()].map(([documentId, count]) => ({ documentId, count }));
  }, [selectedBattlePassPage]);
  const searchResults = useMemo(
    () => searchBattlePassRewards({ query: battlePassQuery, tag: battlePassTag }),
    [battlePassQuery, battlePassTag]
  );
  const searchActive = Boolean(battlePassQuery.trim()) || battlePassTag !== 'all';
  const selectedReward = useMemo(
    () => BATTLE_PASS_REWARDS.find((reward) => reward.id === selectedRewardId) || null,
    [selectedRewardId]
  );
  const selectedRewardProgress = useMemo(
    () => getBattlePassProgressRequirements(selectedReward ? [selectedReward.id] : []),
    [selectedReward]
  );
  const wishlistProgress = useMemo(
    () => getBattlePassProgressRequirements(wishlistRewards),
    [wishlistRewards]
  );
  const wishlistItems = useMemo(
    () => BATTLE_PASS_REWARDS.filter((reward) => wishlistSet.has(reward.id)),
    [wishlistSet]
  );
  const tabs = ['modifiers', 'battle-pass', 'maps', 'achievements'];

  const toggleStoredItem = (id, values, setter, storageKey) => {
    const next = values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
    setter(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const getEffect = (modifier) => language === 'es'
    ? SPANISH_EFFECTS[modifier.id] || modifier.effect
    : modifier.effect;

  const getRewardName = (reward) => language === 'es' ? reward.nameEs : reward.name;

  const selectBattlePassReward = (reward) => {
    setSelectedRewardId(reward.id);
    setSelectedPage(reward.page);
  };

  const renderDocumentTotals = (progress) => (
    <div className="kord-pass-plan__documents">
      {progress.totals.map(({ documentId, count }) => {
        const document = documentById.get(documentId);
        const documentName = language === 'es'
          ? SPANISH_DOCUMENT_NAMES[documentId] || document?.name
          : document?.name;
        return (
          <span key={documentId} title={documentName}>
            {document?.imageLink && <img src={document.imageLink} alt="" />}
            <b>×{count}</b>
          </span>
        );
      })}
    </div>
  );

  const renderModifiers = (type) => PERSONAL_MODIFIERS
    .filter((modifier) => modifier.type === type)
    .map((modifier) => {
      const selected = selectedSet.has(modifier.id);
      const disabled = !Number.isFinite(modifier.points);
      return (
        <button
          key={modifier.id}
          type="button"
          className={`kord-modifier kord-modifier--${type}${selected ? ' is-selected' : ''}`}
          onClick={() => !disabled && toggleStoredItem(
            modifier.id,
            selectedModifiers,
            setSelectedModifiers,
            BUILD_STORAGE_KEY
          )}
          disabled={disabled}
        >
          <span className="kord-modifier__icon" aria-hidden="true">
            <img src={modifier.icon} alt="" />
          </span>
          <span className="kord-modifier__body">
            <span className="kord-modifier__topline">
              <strong>{modifier.name}</strong>
              <span>{modifier.points > 0 ? '+' : ''}{modifier.points}</span>
            </span>
            <span className="kord-modifier__effect">{getEffect(modifier)}</span>
          </span>
          {selected && <span className="kord-modifier__selected">{copy.selected}</span>}
        </button>
      );
    });

  return (
    <main className="kord-page">
      <div className="kord-page__grid" aria-hidden="true" />
      <header className="kord-header">
        <div>
          <span className="kord-eyebrow">{copy.eyebrow} · SEASON {SEASON.number}</span>
          <h1>{SEASON.name}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <div className="kord-header__actions">
          <span className={`kord-source${intel?.source === 'stale-cache' ? ' is-cached' : ''}`}>
            <i />
            {intel ? (intel.source === 'stale-cache' ? copy.cached : copy.live) : copy.loading}
          </span>
          <button type="button" onClick={() => onViewChange('home')}>{copy.back}</button>
        </div>
      </header>

      <nav className="kord-tabs" aria-label="KORD BREACH">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {copy.tabs[index]}
          </button>
        ))}
      </nav>

      {activeTab === 'modifiers' && (
        <section className="kord-section">
          <SectionHeading eyebrow="SEASON RULESET" title={copy.mandatoryPerks} body={copy.mandatoryPerksBody} />

          <div className="kord-global-grid">
            {GLOBAL_MODIFIERS.map((modifier) => (
              <article key={modifier.id} className="kord-global-card">
                <span className="kord-global-card__icon" aria-hidden="true">
                  <img src={modifier.icon} alt="" />
                </span>
                <div>
                  <small>{copy.mandatory}</small>
                  <h3>{modifier.name}</h3>
                  <p>{getEffect(modifier)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="kord-selectable-heading">
            <SectionHeading eyebrow="PMC CONFIGURATION" title={copy.selectablePerks} body={copy.selectablePerksBody} />
          </div>

          <div className={`kord-balance${balance >= 0 ? ' is-valid' : ' is-invalid'}`}>
            <div>
              <span>{copy.balance}</span>
              <strong>{balance > 0 ? `+${balance}` : balance}</strong>
            </div>
            <p>{balance >= 0 ? copy.valid : copy.invalid}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedModifiers([]);
                localStorage.removeItem(BUILD_STORAGE_KEY);
              }}
            >
              {copy.reset}
            </button>
          </div>

          <ModifierGroup title={copy.positive} count={PERSONAL_MODIFIERS.filter((item) => item.type === 'positive').length}>
            {renderModifiers('positive')}
          </ModifierGroup>
          <ModifierGroup title={copy.negative} count={PERSONAL_MODIFIERS.filter((item) => item.type === 'negative').length}>
            {renderModifiers('negative')}
          </ModifierGroup>

          <a
            className="kord-wiki-attribution"
            href="https://escapefromtarkov.fandom.com/wiki/Seasons"
            target="_blank"
            rel="noreferrer"
          >
            {copy.wikiAttribution} ↗
          </a>
        </section>
      )}

      {activeTab === 'battle-pass' && (
        <section className="kord-section">
          <SectionHeading eyebrow="SEASON ONE · 12 PAGES" title={copy.battlePassTitle} body={copy.battlePassBody} />

          <div className="kord-pass-stats">
            <article><span>{copy.rewards}</span><strong>{rewardCount}</strong></article>
            <article><span>{copy.verifiedCosts}</span><strong>{verifiedRewardCount}/{rewardCount}</strong></article>
            <article><span>{copy.claimedRewards}</span><strong>{claimedSet.size}/{rewardCount}</strong></article>
          </div>

          <section className="kord-pass-search" aria-label={copy.searchResults}>
            <input
              type="search"
              value={battlePassQuery}
              onChange={(event) => setBattlePassQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
            />
            <div className="kord-pass-search__tags">
              <button
                type="button"
                className={battlePassTag === 'all' ? 'is-active' : ''}
                onClick={() => setBattlePassTag('all')}
              >
                {copy.allTags}
              </button>
              {BATTLE_PASS_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={battlePassTag === tag.id ? 'is-active' : ''}
                  onClick={() => setBattlePassTag(tag.id)}
                >
                  {copy.tagLabels[tag.id]}
                </button>
              ))}
            </div>

            {searchActive && (
              <div className="kord-pass-search__results">
                <header>
                  <span>{copy.searchResults}</span>
                  <strong>{searchResults.length}</strong>
                </header>
                {searchResults.length ? (
                  <div>
                    {searchResults.map((reward) => (
                      <article key={reward.id}>
                        <button type="button" className="kord-pass-search__result" onClick={() => selectBattlePassReward(reward)}>
                          <span className="kord-pass-search__thumb">
                            {reward.imageLink && <img src={reward.imageLink} alt="" loading="lazy" />}
                          </span>
                          <span className="kord-pass-search__result-copy">
                            <strong>{getRewardName(reward)}</strong>
                            <small>{copy.foundOnPage} {String(reward.page).padStart(2, '0')} · {reward.id.replace('overview-', '').toUpperCase()}</small>
                            <span>{getBattlePassRewardTags(reward).map((tag) => copy.tagLabels[tag]).join(' · ')}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`kord-pass-wishlist-toggle${wishlistSet.has(reward.id) ? ' is-active' : ''}`}
                          onClick={() => toggleStoredItem(reward.id, wishlistRewards, setWishlistRewards, WISHLIST_STORAGE_KEY)}
                          aria-label={wishlistSet.has(reward.id) ? copy.removeWishlist : copy.addWishlist}
                        >
                          {wishlistSet.has(reward.id) ? '★' : '☆'}
                        </button>
                      </article>
                    ))}
                  </div>
                ) : <p>{copy.noSearchResults}</p>}
              </div>
            )}
          </section>

          <section className="kord-pass-wishlist" aria-label={copy.wishlist}>
            <header>
              <div>
                <span>{copy.wishlist}</span>
                <strong>{wishlistItems.length}</strong>
              </div>
              {wishlistProgress.furthestReward && (
                <p>{copy.wishlistRoute}: {copy.page} {wishlistProgress.furthestReward.page}</p>
              )}
            </header>
            {wishlistItems.length ? (
              <>
                <div className="kord-pass-wishlist__items">
                  {wishlistItems.map((reward) => (
                    <article key={reward.id}>
                      <button type="button" onClick={() => selectBattlePassReward(reward)}>
                        {reward.imageLink && <img src={reward.imageLink} alt="" />}
                        <span>{getRewardName(reward)}<small>{copy.page} {reward.page}</small></span>
                      </button>
                      <button
                        type="button"
                        aria-label={copy.removeWishlist}
                        onClick={() => toggleStoredItem(reward.id, wishlistRewards, setWishlistRewards, WISHLIST_STORAGE_KEY)}
                      >×</button>
                    </article>
                  ))}
                </div>
                <div className="kord-pass-plan__summary">
                  <div><span>{copy.knownMinimum}</span><strong>{wishlistProgress.knownTotal}</strong></div>
                  {renderDocumentTotals(wishlistProgress)}
                  <p>{copy.sharedProgress}</p>
                  {wishlistProgress.unverifiedRewards.length > 0 && (
                    <p className="is-warning">{copy.unverifiedWarning} {copy.pendingPrevious}: {wishlistProgress.unverifiedRewards.length}.</p>
                  )}
                </div>
              </>
            ) : <p className="kord-pass-wishlist__empty">{copy.emptyWishlist}</p>}
          </section>

          <nav className="kord-pass-pages" aria-label={copy.battlePassTitle}>
            {BATTLE_PASS_PAGES.map((entry) => (
              <button
                key={entry.page}
                type="button"
                className={selectedPage === entry.page ? 'is-active' : ''}
                onClick={() => setSelectedPage(entry.page)}
              >
                <span>{copy.page}</span>
                <strong>{String(entry.page).padStart(2, '0')}</strong>
              </button>
            ))}
          </nav>

          <div className="kord-pass-page-heading">
            <div>
              <span>{copy.page} {selectedPage}/12</span>
              <h3>{selectedBattlePassPage.rewards.length} {copy.rewards.toLowerCase()}</h3>
            </div>
            <div className="kord-pass-page-totals">
              <span>{copy.pageRequirements}</span>
              <div>
                {selectedPageTotals.map(({ documentId, count }) => {
                  const document = documentById.get(documentId);
                  return (
                    <span key={documentId} title={document?.name}>
                      {document?.imageLink && <img src={document.imageLink} alt="" />}
                      <b>{count}</b>
                    </span>
                  );
                })}
                {!selectedPageTotals.length && <em>{copy.costPending}</em>}
              </div>
            </div>
          </div>

          <section className={`kord-pass-plan${selectedReward ? ' has-selection' : ''}`}>
            {selectedReward ? (
              <>
                <div className="kord-pass-plan__reward">
                  <span className="kord-pass-plan__image">
                    {selectedReward.imageLink && <img src={selectedReward.imageLink} alt="" />}
                  </span>
                  <div>
                    <span>{copy.cumulativeTitle}</span>
                    <h3>{getRewardName(selectedReward)}</h3>
                    <small>{copy.page} {selectedReward.page} · {selectedReward.id.replace('overview-', '').toUpperCase()}</small>
                  </div>
                  <button
                    type="button"
                    className={wishlistSet.has(selectedReward.id) ? 'is-active' : ''}
                    onClick={() => toggleStoredItem(selectedReward.id, wishlistRewards, setWishlistRewards, WISHLIST_STORAGE_KEY)}
                  >
                    {wishlistSet.has(selectedReward.id) ? `★ ${copy.removeWishlist}` : `☆ ${copy.addWishlist}`}
                  </button>
                </div>
                <div className="kord-pass-plan__summary">
                  <div><span>{copy.knownMinimum}</span><strong>{selectedRewardProgress.knownTotal}</strong></div>
                  {renderDocumentTotals(selectedRewardProgress)}
                  {selectedRewardProgress.unverifiedRewards.length > 0 && (
                    <p className="is-warning">{copy.unverifiedWarning} {copy.pendingPrevious}: {selectedRewardProgress.unverifiedRewards.length}.</p>
                  )}
                </div>
              </>
            ) : <p>{copy.selectRewardHint}</p>}
          </section>

          <div className="kord-pass-reward-grid">
            {selectedBattlePassPage.rewards.map((reward) => {
              const claimed = claimedSet.has(reward.id);
              return (
                <article
                  key={reward.id}
                  className={`kord-pass-reward${claimed ? ' is-claimed' : ''}${selectedRewardId === reward.id ? ' is-selected' : ''}`}
                  onClick={() => selectBattlePassReward(reward)}
                >
                  <div className="kord-pass-reward__visual">
                    {reward.imageLink
                      ? <img src={reward.imageLink} alt="" loading="lazy" />
                      : <span>{reward.type.slice(0, 3).toUpperCase()}</span>}
                    <small>{reward.id.replace('overview-bp-', 'BP-')}</small>
                  </div>
                  <div className="kord-pass-reward__body">
                    <span className="kord-pass-reward__type">{reward.type}</span>
                    <h4>{getRewardName(reward)}</h4>
                    {!reward.nameVerified && (
                      <span className="kord-pass-reward__unverified-name">{copy.namePending}</span>
                    )}
                    {reward.requirements ? (
                      <div className="kord-pass-reward__requirements">
                        {reward.requirements.map(({ documentId, count }) => {
                          const document = documentById.get(documentId);
                          const documentName = language === 'es'
                            ? SPANISH_DOCUMENT_NAMES[documentId] || document?.name
                            : document?.name;
                          return (
                            <span key={documentId} title={documentName}>
                              {document?.imageLink && <img src={document.imageLink} alt="" />}
                              <b>×{count}</b>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="kord-pass-reward__pending">{copy.costPending}</p>
                    )}
                    <div className="kord-pass-reward__actions">
                      <button
                        type="button"
                        className={wishlistSet.has(reward.id) ? 'is-active' : ''}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleStoredItem(reward.id, wishlistRewards, setWishlistRewards, WISHLIST_STORAGE_KEY);
                        }}
                      >
                        {wishlistSet.has(reward.id) ? '★' : '☆'} {copy.wishlist}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleStoredItem(reward.id, claimedRewards, setClaimedRewards, REWARD_STORAGE_KEY);
                        }}
                      >
                        {claimed ? `✓ ${copy.claimed}` : copy.markClaimed}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="kord-pass-inventory-heading">
            <SectionHeading eyebrow="TERRAGROUP ARCHIVE" title={copy.inventoryTitle} body={copy.inventoryBody} />
          </div>
          <div className="kord-document-progress">
            <span>{copy.collected}</span>
            <strong>{trackedSet.size}/{documents.length}</strong>
            <div><i style={{ width: `${(trackedSet.size / documents.length) * 100}%` }} /></div>
          </div>

          <div className="kord-document-grid">
            {documents.map((document) => {
              const tracked = trackedSet.has(document.id);
              const hasRealImage = document.imageLink && !document.imageLink.includes('unknown-item');
              return (
                <button
                  key={document.id}
                  type="button"
                  className={`kord-document${tracked ? ' is-tracked' : ''}`}
                  onClick={() => toggleStoredItem(
                    document.id,
                    trackedDocuments,
                    setTrackedDocuments,
                    DOCUMENT_STORAGE_KEY
                  )}
                >
                  <span className="kord-document__visual">
                    {hasRealImage ? <img src={document.imageLink} alt="" /> : <b>DOC</b>}
                  </span>
                  <span className="kord-document__content">
                    <span className="kord-document__meta">
                      {document.wildcard ? copy.wildcard : 'BATTLE PASS'}
                    </span>
                    <strong>{language === 'es' ? SPANISH_DOCUMENT_NAMES[document.id] : document.name}</strong>
                    <span className="kord-document__maps">{document.maps.join(' · ')}</span>
                    {document.description && language !== 'es' && (
                      <span className="kord-document__description">{document.description}</span>
                    )}
                  </span>
                  <span className="kord-document__check">{tracked ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'achievements' && (
        <section className="kord-section">
          <SectionHeading eyebrow="SEASONAL RECORDS" title={copy.achievementsTitle} body={copy.achievementsBody} />
          {intelError && !intel?.achievements?.length ? (
            <div className="kord-empty">
              <p>{copy.noAchievements}</p>
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>{copy.retry}</button>
            </div>
          ) : (
            <div className="kord-achievement-grid">
              {(intel?.achievements || []).map((achievement) => (
                <article key={achievement.id} className="kord-achievement">
                  <header className="kord-achievement__header">
                    <span className="kord-achievement__icon">
                      {achievement.imageLink && <img src={achievement.imageLink} alt="" loading="lazy" />}
                    </span>
                    <span className="kord-achievement__rarity">SEASONAL</span>
                  </header>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <footer>
                    <span>{achievement.side?.toUpperCase()}</span>
                    <strong>{formatPercent(achievement.playersCompletedPercent, language)}% COMPLETED</strong>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'maps' && (
        <section className="kord-section kord-maps">
          <SectionHeading eyebrow="FIELD INTELLIGENCE" title={copy.mapsTitle} body={copy.mapsBody} />
          <div className="kord-maps__toolbar">
            <p>{copy.mapsNotice}</p>
            <a href="https://kordmap.wiki/" target="_blank" rel="noreferrer">
              {copy.openMaps}
            </a>
          </div>
          <div className="kord-maps__frame">
            <iframe
              src="https://kordmap.wiki/"
              title={copy.mapsFrameTitle}
              loading="lazy"
              allowFullScreen
            />
          </div>
          <p className="kord-maps__credit">
            Kord Map · Community locations · CC BY-NC-SA 4.0
          </p>
        </section>
      )}

    </main>
  );
}

function SectionHeading({ eyebrow, title, body }) {
  return (
    <header className="kord-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </header>
  );
}

function ModifierGroup({ title, count, children }) {
  return (
    <section className="kord-modifier-group">
      <header><h3>{title}</h3><span>{count}</span></header>
      <div className="kord-modifier-grid">{children}</div>
    </section>
  );
}
