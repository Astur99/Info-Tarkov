import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HOW_TO_USE_CONTENT } from './howToUseContent';

const panelStyle = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
};

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const sectionMatches = (section, category, query) => {
  if (!query) return true;

  const haystack = [
    category.module,
    section.title,
    section.summary,
    section.connection,
    ...(section.keywords || []),
    ...(section.steps || []),
    ...(section.tips || [])
  ].join(' ');

  return normalize(haystack).includes(query);
};

const isPublicSection = (section) => normalize(section.title) !== 'panel admin' && normalize(section.title) !== 'admin panel';

export default function HowToUseView({ onViewChange }) {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('en') ? 'en' : 'es';
  const content = HOW_TO_USE_CONTENT[language] || HOW_TO_USE_CONTENT.es;
  const [query, setQuery] = useState('');
  const [activeModule, setActiveModule] = useState('all');
  const [openSections, setOpenSections] = useState(() => new Set(['getting-started-0']));

  const normalizedQuery = normalize(query.trim());

  const chapters = useMemo(() => content.categories.map((category) => ({
    id: category.id,
    name: category.module
  })), [content.categories]);

  const visibleCategories = useMemo(() => (
    content.categories
      .filter((category) => activeModule === 'all' || category.id === activeModule)
      .map((category) => ({
        ...category,
        sections: category.sections.filter(
          (section) => isPublicSection(section) && sectionMatches(section, category, normalizedQuery)
        )
      }))
      .filter((category) => category.sections.length > 0)
  ), [activeModule, content.categories, normalizedQuery]);

  const visibleCount = visibleCategories.reduce((count, category) => count + category.sections.length, 0);

  const toggleSection = (id) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
      <main style={{ width: 'min(1180px, 100%)', margin: '0 auto' }}>
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
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.45rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {content.eyebrow}
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.8rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {content.title}
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '760px', lineHeight: 1.6, fontSize: '1rem' }}>
              {content.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => onViewChange('about')} style={headerButtonStyle}>
              ABOUT
            </button>
            <button type="button" onClick={() => onViewChange('home')} style={headerButtonStyle}>
              {language === 'en' ? 'BACK TO MENU' : 'VOLVER AL MENU'}
            </button>
          </div>
        </header>

        <section style={{ ...panelStyle, padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) auto', gap: '1rem', alignItems: 'center' }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.searchPlaceholder}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.32)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.95rem 1rem',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <strong style={{ color: 'var(--tk-green)', whiteSpace: 'nowrap', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {content.results.replace('{{count}}', visibleCount)}
            </strong>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: 'var(--tk-text-muted)', margin: '0 0 0.55rem', fontSize: '0.82rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {content.chaptersLabel}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <FilterButton active={activeModule === 'all'} onClick={() => setActiveModule('all')}>
              {content.allModules}
            </FilterButton>
            {chapters.map((module) => (
              <FilterButton key={module.id} active={activeModule === module.id} onClick={() => setActiveModule(module.id)}>
                {module.name}
              </FilterButton>
            ))}
            </div>
          </div>
        </section>

        {visibleCategories.length === 0 ? (
          <section style={{ ...panelStyle, padding: '1.5rem' }}>
            <p style={{ color: 'var(--tk-text-muted)', margin: 0, lineHeight: 1.6 }}>{content.empty}</p>
          </section>
        ) : (
          <section style={{ display: 'grid', gap: '1rem' }}>
            {visibleCategories.map((category) => (
              <article key={category.id} style={{ ...panelStyle, padding: '1.35rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '0.85rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: '0.85rem'
                  }}
                >
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.35rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {category.module}
                  </h2>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {category.sections.map((section, index) => {
                    const sectionId = `${category.id}-${index}`;
                    const isOpen = openSections.has(sectionId);

                    return (
                      <div key={sectionId} style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          type="button"
                          onClick={() => toggleSection(sectionId)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            alignItems: 'center',
                            background: isOpen ? 'linear-gradient(90deg, rgba(26,176,21,0.075), rgba(255,255,255,0.025))' : 'transparent',
                            border: 'none',
                            color: '#fff',
                            padding: '1rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: "'Rajdhani', sans-serif"
                          }}
                        >
                          <span>
                            <strong style={{ display: 'block', fontSize: '1.18rem', letterSpacing: '0.4px' }}>{section.title}</strong>
                            <span style={{ color: 'var(--tk-text-muted)', display: 'block', marginTop: '0.2rem', lineHeight: 1.35 }}>{section.summary}</span>
                          </span>
                          <span style={{ color: 'var(--tk-green)', fontWeight: 900, fontSize: '1.2rem' }}>{isOpen ? '-' : '+'}</span>
                        </button>

                        {isOpen && (
                          <div style={{ padding: '0 1rem 1.15rem', display: 'grid', gap: '1rem' }}>
                            <HelpBlock title={content.stepsLabel} items={section.steps} ordered />
                            <HelpBlock title={content.tipsLabel} items={section.tips} />
                            {category.view && category.view !== 'home' && (
                              <div>
                                <button type="button" onClick={() => onViewChange(category.view)} style={smallButtonStyle}>
                                  {content.openModule}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? 'rgba(182,205,169,0.9)' : 'rgba(255,255,255,0.04)',
        color: active ? '#0b0c0b' : '#fff',
        border: active ? '1px solid rgba(182,205,169,0.55)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '0.55rem 0.75rem',
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 900,
        letterSpacing: '0.8px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}

function HelpBlock({ title, items, ordered = false }) {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <div>
      <h3 style={blockTitleStyle}>{title}</h3>
      <ListTag style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--tk-text-muted)', lineHeight: 1.65 }}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}

const headerButtonStyle = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.8rem 1.2rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 900,
  letterSpacing: '1px',
  whiteSpace: 'nowrap',
  fontFamily: "'Rajdhani', sans-serif"
};

const smallButtonStyle = {
  ...headerButtonStyle,
  padding: '0.6rem 0.85rem',
  color: 'var(--tk-green)',
  backgroundColor: 'rgba(26,176,21,0.08)',
  border: '1px solid rgba(26,176,21,0.22)'
};

const blockTitleStyle = {
  color: '#fff',
  margin: '0 0 0.45rem',
  fontSize: '0.95rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};
