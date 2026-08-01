import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
  operational: '#8f9f7f',
  degraded: '#ffcf66',
  down: '#ff6b6b'
};

const formatTime = (value, locale) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString(locale);
};

export default function HealthMonitorPanel() {
  const { i18n, t } = useTranslation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/app-health', {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const payload = await response.json();
      if (!response.ok || !Array.isArray(payload.modules)) {
        throw new Error(payload.error || 'Health endpoint unavailable.');
      }
      setReport(payload);
      setError('');
    } catch (requestError) {
      setError(requestError?.message || t('admin.health.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadHealth, 0);
    const interval = window.setInterval(loadHealth, 5 * 60 * 1000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadHealth]);

  const affectedModules = useMemo(
    () => report?.modules?.filter((module) => module.status !== 'operational').length || 0,
    [report]
  );

  return (
    <section className="admin-health-panel">
      <div className="admin-health-panel__header">
        <div>
          <span>{t('admin.health.eyebrow')}</span>
          <h2>{t('admin.health.title')}</h2>
          <p>{t('admin.health.description')}</p>
        </div>
        <button type="button" onClick={loadHealth} disabled={loading}>
          {loading ? t('admin.health.checking') : t('admin.actions.refresh')}
        </button>
      </div>

      {error && !report && <p className="admin-health-panel__error">{t('admin.health.loadError')}: {error}</p>}

      {report && (
        <>
          <div className="admin-health-summary">
            <article>
              <span>{t('admin.health.overall')}</span>
              <strong style={{ color: STATUS_COLORS[report.overall] }}>
                {t(`admin.health.status.${report.overall}`)}
              </strong>
            </article>
            <article>
              <span>{t('admin.health.healthyModules')}</span>
              <strong>{report.summary?.operational || 0}/{report.modules.length}</strong>
            </article>
            <article>
              <span>{t('admin.health.affectedModules')}</span>
              <strong style={{ color: affectedModules ? STATUS_COLORS.degraded : STATUS_COLORS.operational }}>
                {affectedModules}
              </strong>
            </article>
            <article>
              <span>{t('admin.health.lastCheck')}</span>
              <strong>{formatTime(report.checkedAt, locale)}</strong>
            </article>
          </div>

          <div className="admin-health-modules">
            {report.modules.map((module) => (
              <article key={module.id}>
                <span className="admin-health-dot" style={{ background: STATUS_COLORS[module.status] }} />
                <div>
                  <strong>{module.label}</strong>
                  <span style={{ color: STATUS_COLORS[module.status] }}>
                    {t(`admin.health.status.${module.status}`)}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <details className="admin-health-sources">
            <summary>{t('admin.health.sources')}</summary>
            <div>
              {report.sources.map((source) => (
                <article key={source.id}>
                  <span className="admin-health-dot" style={{ background: STATUS_COLORS[source.status] }} />
                  <strong>{source.label}</strong>
                  <span>{t('admin.health.records', { count: source.count })}</span>
                  <span>{source.latencyMs} ms</span>
                  <small title={source.warning || ''}>
                    {source.warning || (source.updatedAt
                      ? t('admin.health.dataUpdated', { date: formatTime(source.updatedAt, locale) })
                      : t('admin.health.validated'))}
                  </small>
                </article>
              ))}
            </div>
          </details>
        </>
      )}
    </section>
  );
}
