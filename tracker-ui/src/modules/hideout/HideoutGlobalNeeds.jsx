import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_MODE_LABELS } from '../../lib/gameModePreferences';
import { formatRublos, getGlobalHideoutNeeds } from './hideoutUtils';

export default function HideoutGlobalNeeds({
  stations,
  builtLevels,
  markedItems,
  mode,
  onOpenRequirement
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [nextLevelOnly, setNextLevelOnly] = useState(true);
  const [firOnly, setFirOnly] = useState(false);
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const modeLabel = GAME_MODE_LABELS[mode] || mode;
  const formatCount = (value) => new Intl.NumberFormat(locale).format(Number(value) || 0);

  const needs = useMemo(() => getGlobalHideoutNeeds({
    stations,
    builtLevels,
    markedItems,
    mode,
    nextLevelOnly
  }), [builtLevels, markedItems, mode, nextLevelOnly, stations]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return needs.items.filter((entry) => {
      if (firOnly && entry.firCount <= 0) return false;
      if (!normalizedQuery) return true;
      return [entry.item?.name, entry.item?.shortName, ...entry.uses.map((usage) => usage.stationName)]
        .some((value) => String(value || '').toLocaleLowerCase().includes(normalizedQuery));
    });
  }, [firOnly, needs.items, query]);

  return (
    <section className="hideout-global-needs">
      <header className="hideout-global-needs__header">
        <div>
          <h3>{t('hideoutModule.global.title')}</h3>
          <p>{t('hideoutModule.global.subtitle')}</p>
        </div>

        <div className="hideout-global-needs__scope" role="group" aria-label={t('hideoutModule.global.scopeLabel')}>
          <button
            type="button"
            className={nextLevelOnly ? 'is-active' : ''}
            onClick={() => setNextLevelOnly(true)}
          >
            {t('hideoutModule.global.nextUpgrades')}
          </button>
          <button
            type="button"
            className={!nextLevelOnly ? 'is-active' : ''}
            onClick={() => setNextLevelOnly(false)}
          >
            {t('hideoutModule.global.allFuture')}
          </button>
        </div>
      </header>

      <div className="hideout-global-needs__stats">
        <GlobalStat label={t('hideoutModule.global.uniqueItems')} value={formatCount(needs.uniqueItems)} />
        <GlobalStat label={t('hideoutModule.global.totalUnits')} value={formatCount(needs.totalUnits)} />
        <GlobalStat label={t('hideoutModule.global.estimatedBudget', { mode: modeLabel })} value={formatRublos(needs.estimatedCost)} />
        <GlobalStat label={t('hideoutModule.global.firUnits')} value={formatCount(needs.firUnits)} tone="amber" />
      </div>

      <div className="hideout-global-needs__filters">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('hideoutModule.global.searchPlaceholder')}
        />
        <label>
          <input type="checkbox" checked={firOnly} onChange={(event) => setFirOnly(event.target.checked)} />
          <span>{t('hideoutModule.global.firOnly')}</span>
        </label>
      </div>

      <div className="hideout-global-needs__results-line">
        <span>{t('hideoutModule.global.results', { count: visibleItems.length })}</span>
        <span>{t('hideoutModule.global.pendingHint')}</span>
      </div>

      {visibleItems.length > 0 ? (
        <div className="hideout-global-needs__grid">
          {visibleItems.map((entry) => {
            const nextUse = entry.uses[0];
            return (
              <article className="hideout-global-item" key={entry.id}>
                <div className="hideout-global-item__main">
                  <div className="hideout-global-item__image">
                    {entry.item?.iconLink ? (
                      <img src={entry.item.iconLink} alt="" loading="lazy" />
                    ) : (
                      <span aria-hidden="true">?</span>
                    )}
                  </div>
                  <div className="hideout-global-item__identity">
                    <h4>{entry.item?.name || entry.item?.shortName}</h4>
                    <p>
                      {entry.estimatedCost > 0
                        ? t('hideoutModule.global.estimatedCost', { price: formatRublos(entry.estimatedCost) })
                        : t('hideoutModule.global.priceUnavailable')}
                    </p>
                  </div>
                  <strong className="hideout-global-item__count">×{formatCount(entry.count)}</strong>
                </div>

                <div className="hideout-global-item__meta">
                  {entry.firCount > 0 && (
                    <span className="is-fir">{t('hideoutModule.global.firNeeded', { count: formatCount(entry.firCount) })}</span>
                  )}
                  <span>{t('hideoutModule.global.usedIn', { count: entry.uses.length })}</span>
                </div>

                <div className="hideout-global-item__uses">
                  {entry.uses.slice(0, 3).map((usage) => (
                    <button type="button" key={usage.key} onClick={() => onOpenRequirement(usage)}>
                      {t('hideoutModule.global.stationLevel', {
                        station: usage.stationName,
                        level: usage.level,
                        count: formatCount(usage.count)
                      })}
                    </button>
                  ))}
                  {entry.uses.length > 3 && (
                    <span>{t('hideoutModule.global.moreUses', { count: entry.uses.length - 3 })}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="hideout-global-item__open"
                  onClick={() => onOpenRequirement(nextUse)}
                >
                  {t('hideoutModule.global.openNext')}
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="hideout-global-needs__empty">
          <strong>{t('hideoutModule.global.emptyTitle')}</strong>
          <p>{t('hideoutModule.global.emptyBody')}</p>
        </div>
      )}
    </section>
  );
}

function GlobalStat({ label, value, tone = 'green' }) {
  return (
    <div className={tone === 'amber' ? 'is-amber' : ''}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
