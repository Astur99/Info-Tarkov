import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';

const TARKOV_GRAPHQL_URL = 'https://api.tarkov.dev/graphql';
const MARKET_MODES = {
  PVP: 'regular',
  PVE: 'pve'
};

const maps = ['Todos', 'Customs', 'Shoreline', 'Reserve', 'Streets', 'Interchange', 'Woods', 'Lighthouse', 'Factory', 'Labs', 'Ground Zero'];
const categories = ['Todas', 'Importantes', 'Quest', 'Loot', 'High value', 'Utility', 'Sin clasificar'];

const priorityStyles = {
  Alta: { color: '#ffcf66', border: 'rgba(255,207,102,0.35)', bg: 'rgba(255,207,102,0.08)' },
  Media: { color: 'var(--tk-green)', border: 'rgba(26,176,21,0.28)', bg: 'rgba(26,176,21,0.08)' },
  Baja: { color: 'var(--tk-text-muted)', border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.04)' }
};

const getKeyQuery = (gameMode) => `
  query GetKeyItems {
    items(gameMode: ${gameMode}) {
      id
      name
      shortName
      iconLink
      wikiLink
      avg24hPrice
      lastLowPrice
      basePrice
      width
      height
    }
  }
`;

const importantKeyIntel = [
  {
    copyKey: 'dorm206',
    aliases: ['Dorm room 206 key'],
    map: 'Customs',
    area: 'Dorms, two-story dormitory',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Operation Aquarius - Part 1'],
    use: 'Abre la habitacion 206 para localizar el agua escondida.',
    recommendation: 'Guardar hasta completar la quest. Es una llave temprana muy importante para progresion.',
    tags: ['early wipe', 'therapist', 'quest blocker']
  },
  {
    copyKey: 'machinery',
    aliases: ['Machinery key'],
    map: 'Customs',
    area: 'Camion cisterna de construccion',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Checking'],
    use: 'Permite abrir el camion donde se recoge el reloj de bronce.',
    recommendation: 'Prioridad absoluta al inicio del wipe. Si no la tienes, busca la chaqueta fija de tres plantas.',
    tags: ['early wipe', 'prapor', 'customs']
  },
  {
    copyKey: 'dorm114',
    aliases: ['Dorm room 114 key'],
    map: 'Customs',
    area: 'Dorms, two-story dormitory',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Pharmacist'],
    use: 'Abre la habitacion 114 para recuperar el maletin de Carbon.',
    recommendation: 'Guardar para quest. Despues puede conservarse por caja fuerte y botiquines.',
    tags: ['therapist', 'safe', 'meds']
  },
  {
    copyKey: 'factoryExit',
    aliases: ['Factory emergency exit key'],
    map: 'Factory',
    area: 'Salidas ZB y puertas de Factory',
    category: 'Utility',
    priority: 'Alta',
    quests: [],
    use: 'Desbloquea extracciones y atajos clave en Factory y Customs.',
    recommendation: 'Comprar o guardar siempre. Es una llave utilitaria de alto impacto para supervivencia.',
    tags: ['extract', 'utility', 'factory', 'customs']
  },
  {
    copyKey: 'resortWest216',
    aliases: ['Health Resort west wing room 216 key'],
    map: 'Shoreline',
    area: 'Health Resort, ala oeste',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Health Care Privacy - Part 2'],
    use: 'Acceso a habitacion necesaria para progresion de Therapist.',
    recommendation: 'Guardar hasta completar la cadena. Shoreline tiene mucho bloqueo por llaves.',
    tags: ['shoreline', 'therapist', 'resort']
  },
  {
    copyKey: 'resortWest220',
    aliases: ['Health Resort west wing room 220 key'],
    map: 'Shoreline',
    area: 'Health Resort, ala oeste',
    category: 'Quest',
    priority: 'Media',
    quests: ['Spa Tour - Part 4'],
    use: 'Una de las llaves usadas para acceder al generador del resort.',
    recommendation: 'Guardar si estas avanzando Peacekeeper. Puede ser sustituible segun ruta/llave disponible.',
    tags: ['shoreline', 'peacekeeper', 'resort']
  },
  {
    copyKey: 'cottageBackDoor',
    aliases: ['Cottage back door key'],
    map: 'Shoreline',
    area: 'Zona de cottages',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Colleagues - Part 2'],
    use: 'Permite entrar al cottage cerrado para objetivos de quest.',
    recommendation: 'Muy recomendable guardarla. Suele bloquear progresion si no aparece en flea a buen precio.',
    tags: ['shoreline', 'therapist', 'quest blocker']
  },
  {
    copyKey: 'rbSt',
    aliases: ['RB-ST key'],
    map: 'Reserve',
    area: 'Garajes y zona tecnica',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Revision - Reserve'],
    use: 'Abre una sala importante para objetivos de Reserve y loot tecnico/militar.',
    recommendation: 'Guardar si la encuentras. Suele tener valor alto por combinacion de quest y loot.',
    tags: ['reserve', 'military', 'expensive']
  },
  {
    copyKey: 'rbKprl',
    aliases: ['RB-KPRL key'],
    map: 'Reserve',
    area: 'Dome / guard building',
    category: 'Loot',
    priority: 'Media',
    quests: [],
    use: 'Acceso a habitacion con potencial de intel, cajas y valor consistente.',
    recommendation: 'Buena para rutas de loot en Reserve, no prioritaria si vas solo a questear.',
    tags: ['reserve', 'intel', 'loot']
  },
  {
    copyKey: 'emercomMedical',
    aliases: ['EMERCOM medical unit key'],
    map: 'Interchange',
    area: 'Unidad medica EMERCOM',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Vitamins - Part 1'],
    use: 'Abre la unidad medica necesaria para quest y loot medico.',
    recommendation: 'Guardar para Therapist/Skier y llevar cuando vayas a Interchange con objetivo medico.',
    tags: ['interchange', 'medical', 'quest']
  },
  {
    copyKey: 'oliLogistics',
    aliases: ['OLI logistics department office key'],
    map: 'Interchange',
    area: 'Oficinas de OLI',
    category: 'Quest',
    priority: 'Alta',
    quests: ['Database - Part 1'],
    use: 'Permite acceder a documentos de quest en OLI.',
    recommendation: 'Llave de progresion. Mantener hasta completar las rutas de Ragman en Interchange.',
    tags: ['interchange', 'ragman', 'documents']
  },
  {
    copyKey: 'zb014',
    aliases: ['ZB-014 key'],
    map: 'Woods',
    area: 'Bunker ZB-014',
    category: 'Utility',
    priority: 'Media',
    quests: ['The Survivalist Path - Unprotected but Dangerous'],
    use: 'Abre bunker y extract condicional con loot util.',
    recommendation: 'Guardar. No suele ser carisima y ayuda tanto a quest como a supervivencia.',
    tags: ['woods', 'extract', 'jaeger']
  },
  {
    copyKey: 'operatingRoom',
    aliases: ['Operating room key'],
    map: 'Lighthouse',
    area: 'Water Treatment / edificios medicos',
    category: 'Loot',
    priority: 'Media',
    quests: [],
    use: 'Acceso a sala con loot medico y tecnico.',
    recommendation: 'Interesante si juegas Lighthouse de forma regular. No prioritaria para novatos.',
    tags: ['lighthouse', 'medical', 'loot']
  },
  {
    copyKey: 'conferenceRoom',
    aliases: ['Conference room key'],
    map: 'Streets',
    area: 'Streets of Tarkov',
    category: 'Quest',
    priority: 'Media',
    quests: ['Broadcast - Part 4'],
    use: 'Acceso a ubicacion interior usada en progresion de Streets.',
    recommendation: 'Comprar solo cuando tengas la quest o ruta clara en Streets.',
    tags: ['streets', 'quest', 'mid wipe']
  },
  {
    copyKey: 'dorm314Marked',
    aliases: ['Dorm room 314 marked key'],
    map: 'Customs',
    area: 'Dorms, three-story dormitory',
    category: 'High value',
    priority: 'Media',
    quests: [],
    use: 'Abre la habitacion marcada de Customs con loot de alto valor variable.',
    recommendation: 'No es llave de principiante. Valora precio, usos restantes y riesgo de Dorms.',
    tags: ['marked', 'high risk', 'loot']
  },
  {
    copyKey: 'labsKeycard',
    aliases: ['TerraGroup Labs keycard (Black)', 'TerraGroup Labs access keycard'],
    map: 'Labs',
    area: 'Laboratorio',
    category: 'High value',
    priority: 'Baja',
    quests: [],
    use: 'Acceso a Labs o zonas especiales del laboratorio, segun tarjeta.',
    recommendation: 'Potente, pero no prioritaria para progresion general. Requiere economia y experiencia en Labs.',
    tags: ['labs', 'keycard', 'endgame']
  }
];

const fallbackKeys = importantKeyIntel.map((intel) => ({
  id: intel.aliases[0].toLowerCase().replaceAll(' ', '-'),
  name: intel.aliases[0],
  shortName: intel.aliases[0],
  iconLink: '',
  wikiLink: '',
  avg24hPrice: 0,
  lastLowPrice: 0,
  basePrice: 0,
  width: 1,
  height: 1
}));

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const isKeyItem = (item) => {
  const name = normalize(`${item.name} ${item.shortName}`);
  return name.includes(' key') || name.endsWith('key') || name.includes('keycard') || name.includes('access card');
};

const getMapFromName = (itemName) => {
  const name = normalize(itemName);

  if (name.includes('dorm') || name.includes('machinery') || name.includes('gas station') || name.includes('tarcone')) return 'Customs';
  if (name.includes('resort') || name.includes('cottage') || name.includes('weather station') || name.includes('sanatorium')) return 'Shoreline';
  if (name.includes('rb-') || name.includes('orb') || name.includes('reserve')) return 'Reserve';
  if (name.includes('oli') || name.includes('idea') || name.includes('goshan') || name.includes('kiba') || name.includes('emercom')) return 'Interchange';
  if (name.includes('zb-014') || name.includes('woods')) return 'Woods';
  if (name.includes('lighthouse') || name.includes('water treatment') || name.includes('merin') || name.includes('conference room')) return 'Lighthouse';
  if (name.includes('streets') || name.includes('concordia') || name.includes('beluga') || name.includes('skybridge') || name.includes('abandoned factory')) return 'Streets';
  if (name.includes('factory')) return 'Factory';
  if (name.includes('labs') || name.includes('terragroup') || name.includes('keycard')) return 'Labs';
  if (name.includes('ground zero') || name.includes('terra group science')) return 'Ground Zero';

  return 'Sin clasificar';
};

const inferCategory = (itemName, intel) => {
  if (intel?.category) return intel.category;
  const name = normalize(itemName);

  if (name.includes('marked') || name.includes('keycard') || name.includes('kiba')) return 'High value';
  if (name.includes('exit') || name.includes('extract') || name.includes('zb-')) return 'Utility';
  return 'Sin clasificar';
};

const formatRoubles = (value, locale, emptyLabel) => {
  const price = Number(value) || 0;
  if (!price) return emptyLabel;
  return `${new Intl.NumberFormat(locale).format(price)} RUB`;
};

const getIntelForItem = (item) => {
  const itemName = normalize(item.name);
  return importantKeyIntel.find((intel) => intel.aliases.some((alias) => normalize(alias) === itemName));
};

const enrichKey = (item, t) => {
  const intel = getIntelForItem(item);
  const map = intel?.map || getMapFromName(item.name);
  const category = inferCategory(item.name, intel);
  const isImportant = Boolean(intel);

  return {
    ...item,
    map,
    area: intel?.copyKey ? t(`keysModule.intel.${intel.copyKey}.area`, { defaultValue: intel.area }) : map,
    category,
    priority: intel?.priority || 'Baja',
    quests: intel?.quests || [],
    use: intel?.copyKey ? t(`keysModule.intel.${intel.copyKey}.use`, { defaultValue: intel.use }) : t('keysModule.defaults.use'),
    recommendation: intel?.copyKey ? t(`keysModule.intel.${intel.copyKey}.recommendation`, { defaultValue: intel.recommendation }) : t('keysModule.defaults.recommendation'),
    tags: intel?.tags || [map.toLowerCase(), category.toLowerCase(), 'tarkov.dev'],
    isImportant,
    price: item.lastLowPrice || item.avg24hPrice || item.basePrice || 0
  };
};

const getPriorityStyle = (priority) => priorityStyles[priority] || priorityStyles.Baja;

export default function KeysModule({ onViewChange }) {
  const { i18n, t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showImportantFirst, setShowImportantFirst] = useState(true);
  const [rawKeys, setRawKeys] = useState(fallbackKeys);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [modoMercado, setModoMercado] = useState(() => readDefaultPlayableMode());
  const gameMode = MARKET_MODES[modoMercado];
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'es-ES';

  useEffect(() => {
    let cancelled = false;

    const loadKeys = async () => {
      setLoading(true);
      setStatus('');

      try {
        const response = await fetch(TARKOV_GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ query: getKeyQuery(gameMode) })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload = await response.json();
        const items = payload.data?.items;

        if (!Array.isArray(items)) throw new Error('Respuesta sin items');

        const keys = items.filter(isKeyItem);

        if (!cancelled) {
          setRawKeys(keys.length ? keys : fallbackKeys);
          setStatus(keys.length ? '' : t('keysModule.status.noKeys'));
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setRawKeys(fallbackKeys);
          setStatus(t('keysModule.status.connectionError'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadKeys();

    return () => {
      cancelled = true;
    };
  }, [gameMode, t]);

  const allKeys = useMemo(() => rawKeys.map((key) => enrichKey(key, t)), [rawKeys, t]);

  const filteredKeys = useMemo(() => {
    const normalizedSearch = normalize(search.trim());

    return allKeys
      .filter((key) => {
        const matchesMap = selectedMap === 'Todos' || key.map === selectedMap;
        const matchesCategory =
          selectedCategory === 'Todas' ||
          (selectedCategory === 'Importantes' ? key.isImportant : key.category === selectedCategory);
        const matchesSearch =
          !normalizedSearch ||
          [key.name, key.shortName, key.map, key.area, key.use, key.recommendation, ...key.quests, ...key.tags]
            .map(normalize)
            .join(' ')
            .includes(normalizedSearch);

        return matchesMap && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (showImportantFirst && Number(b.isImportant) !== Number(a.isImportant)) {
          return Number(b.isImportant) - Number(a.isImportant);
        }

        if (a.map !== b.map) return a.map.localeCompare(b.map);
        return a.name.localeCompare(b.name);
      });
  }, [allKeys, search, selectedCategory, selectedMap, showImportantFirst]);

  const importantCount = allKeys.filter((key) => key.isImportant).length;
  const visibleImportantCount = filteredKeys.filter((key) => key.isImportant).length;

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
              {t('keysModule.eyebrow')}
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.7rem', textTransform: 'uppercase' }}>
              {t('keysModule.title')}
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '860px', lineHeight: 1.6 }}>
              {t('keysModule.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '6px', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.32)' }}>
              {Object.keys(MARKET_MODES).map((mode) => {
                const active = modoMercado === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setModoMercado(mode)}
                    style={{
                      minWidth: '76px',
                      border: active ? '1px solid rgba(187, 211, 169, 0.55)' : '1px solid rgba(255,255,255,0.06)',
                      backgroundColor: active ? 'rgba(187, 211, 169, 0.85)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#11180f' : '#d7d7d7',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '900',
                      fontFamily: "'Rajdhani', sans-serif"
                    }}
                  >
                    {mode}
                  </button>
                );
              })}
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
              {t('common.backToMenu')}
            </button>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) repeat(2, minmax(180px, 220px))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('keysModule.searchPlaceholder')}
            style={inputStyle}
          />

          <select value={selectedMap} onChange={(event) => setSelectedMap(event.target.value)} style={selectStyle}>
            {maps.map((map) => (
              <option key={map} value={map}>{t(`keysModule.filters.maps.${map}`, { defaultValue: map })}</option>
            ))}
          </select>

          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} style={selectStyle}>
            {categories.map((category) => (
              <option key={category} value={category}>{t(`keysModule.filters.categories.${category}`, { defaultValue: category })}</option>
            ))}
          </select>
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('Importantes')}
            style={{ ...buttonStyle, borderColor: 'rgba(255,207,102,0.35)', color: '#ffcf66' }}
          >
            {t('keysModule.actions.showImportant')}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Todas');
              setSelectedMap('Todos');
              setSearch('');
            }}
            style={buttonStyle}
          >
            {t('keysModule.actions.clearFilters')}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tk-text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>
            <input
              type="checkbox"
              checked={showImportantFirst}
              onChange={(event) => setShowImportantFirst(event.target.checked)}
            />
            {t('keysModule.actions.importantFirst')}
          </label>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard label={t('keysModule.stats.visible', { mode: modoMercado })} value={filteredKeys.length} />
          <StatCard label={t('keysModule.stats.catalog')} value={allKeys.length} />
          <StatCard label={t('keysModule.stats.important')} value={`${visibleImportantCount}/${importantCount}`} />
          <StatCard label={t('keysModule.stats.maps')} value={new Set(filteredKeys.map((key) => key.map)).size} />
        </section>

        {loading && <p style={{ color: 'var(--tk-green)', marginBottom: '1rem' }}>{t('keysModule.status.loading', { mode: modoMercado })}</p>}
        {status && <p style={{ color: '#ffcf66', marginBottom: '1rem' }}>{status}</p>}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem' }}>
          {filteredKeys.map((key) => (
          <KeyCard key={key.id} keyItem={key} mode={modoMercado} locale={locale} />
          ))}
        </section>

        {!loading && filteredKeys.length === 0 && (
          <p style={{ color: 'var(--tk-text-muted)', marginTop: '2rem' }}>
            {t('keysModule.empty')}
          </p>
        )}
      </main>
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.85rem 1rem',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '800'
};

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
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.7rem 0.95rem',
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900',
  letterSpacing: '0.6px',
  textTransform: 'uppercase'
};

function KeyCard({ keyItem, mode, locale }) {
  const { t } = useTranslation();
  const priorityStyle = getPriorityStyle(keyItem.priority);
  const translatedPriority = t(`keysModule.priorities.${keyItem.priority}`, { defaultValue: keyItem.priority });
  const translatedCategory = t(`keysModule.filters.categories.${keyItem.category}`, { defaultValue: keyItem.category });

  return (
    <article
      style={{
        background: keyItem.isImportant ? 'rgba(255,207,102,0.045)' : 'rgba(255,255,255,0.035)',
        border: `1px solid ${keyItem.isImportant ? 'rgba(255,207,102,0.18)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '8px',
        padding: '1.25rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', minWidth: 0 }}>
          <div style={{ width: '54px', height: '54px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', display: 'grid', placeItems: 'center', padding: '5px', flex: '0 0 auto' }}>
            {keyItem.iconLink ? (
              <img src={keyItem.iconLink} alt={keyItem.shortName || keyItem.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ color: 'var(--tk-green)', fontWeight: '900' }}>{t('keysModule.fallbackIcon')}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.18rem', overflowWrap: 'anywhere' }}>{keyItem.name}</h2>
            <p style={{ color: 'var(--tk-text-muted)', margin: '0.25rem 0 0' }}>{keyItem.map} - {keyItem.area}</p>
          </div>
        </div>

        {keyItem.isImportant && (
          <span
            style={{
              color: priorityStyle.color,
              background: priorityStyle.bg,
              border: `1px solid ${priorityStyle.border}`,
              borderRadius: '999px',
              padding: '0.25rem 0.55rem',
              fontWeight: '900',
              whiteSpace: 'nowrap'
            }}
          >
            {translatedPriority}
          </span>
        )}
      </div>

      <p style={{ color: '#eee', lineHeight: 1.55, margin: '0 0 0.8rem' }}>{keyItem.use}</p>
      <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>{keyItem.recommendation}</p>

      <div style={{ display: 'grid', gap: '0.65rem' }}>
        <InfoRow label={t('keysModule.card.type')} value={keyItem.isImportant ? t('keysModule.card.importantType', { category: translatedCategory }) : translatedCategory} />
        <InfoRow label={t('keysModule.card.price', { mode })} value={formatRoubles(keyItem.price, locale, t('keysModule.card.noPrice'))} />
        <InfoRow label={t('keysModule.card.size')} value={`${keyItem.width || 1}x${keyItem.height || 1}`} />
        <InfoRow label={t('keysModule.card.quests')} value={keyItem.quests.length ? keyItem.quests.join(', ') : t('keysModule.card.noQuest')} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
        {keyItem.tags.map((tag) => (
          <span key={tag} style={tagStyle}>
            {tag}
          </span>
        ))}
      </div>

      {keyItem.wikiLink && (
        <a
          href={keyItem.wikiLink}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--tk-green)', display: 'inline-block', marginTop: '1rem', fontWeight: '900', textDecoration: 'none' }}
        >
          {t('keysModule.actions.openWiki')}
        </a>
      )}
    </article>
  );
}

function StatCard({ label, value }) {
  return (
    <article
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '1rem'
      }}
    >
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '800' }}>{label}</span>
      <strong style={{ color: 'var(--tk-green)', display: 'block', fontSize: '1.8rem', marginTop: '0.25rem' }}>{value}</strong>
    </article>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
      <strong style={{ color: '#fff' }}>{label}</strong>
      <span style={{ color: 'var(--tk-text-muted)' }}>{value}</span>
    </div>
  );
}

const tagStyle = {
  color: 'var(--tk-green)',
  background: 'rgba(26,176,21,0.07)',
  border: '1px solid rgba(26,176,21,0.16)',
  borderRadius: '999px',
  padding: '0.2rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: '800'
};
