import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const X_WIDGET_SCRIPT_ID = 'x-widgets-script';
const X_WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';
const TARKOV_X_URL = 'https://x.com/tarkov';

export default function OfficialNewsPanel() {
  const { t } = useTranslation();
  const timelineRef = useRef(null);
  const [widgetState, setWidgetState] = useState('loading');

  useEffect(() => {
    const renderTimeline = () => {
      if (window.twttr?.widgets && timelineRef.current) {
        window.twttr.widgets.load(timelineRef.current);
      }
    };

    const visibilityCheck = window.setInterval(() => {
      const iframe = timelineRef.current?.querySelector('iframe');
      if (iframe?.getBoundingClientRect().height > 100) {
        setWidgetState('ready');
        window.clearInterval(visibilityCheck);
      }
    }, 500);
    const unavailableTimeout = window.setTimeout(() => {
      setWidgetState((current) => current === 'ready' ? current : 'unavailable');
      window.clearInterval(visibilityCheck);
    }, 8000);

    const cleanup = (script) => {
      script?.removeEventListener('load', renderTimeline);
      window.clearInterval(visibilityCheck);
      window.clearTimeout(unavailableTimeout);
    };

    const existingScript = document.getElementById(X_WIDGET_SCRIPT_ID);
    if (existingScript) {
      if (window.twttr?.widgets) renderTimeline();
      else existingScript.addEventListener('load', renderTimeline, { once: true });
      return () => cleanup(existingScript);
    }

    const script = document.createElement('script');
    script.id = X_WIDGET_SCRIPT_ID;
    script.src = X_WIDGET_SCRIPT_URL;
    script.async = true;
    script.charset = 'utf-8';
    script.addEventListener('load', renderTimeline, { once: true });
    document.body.appendChild(script);

    return () => cleanup(script);
  }, []);

  return (
    <aside className="home-news-panel" aria-labelledby="official-news-title">
      <header className="home-news-panel__header">
        <div>
          <span className="home-news-panel__eyebrow">@tarkov · X</span>
          <h2 id="official-news-title">{t('home.news.title')}</h2>
        </div>
        <span className="home-news-panel__live" aria-label={t('home.news.automatic')}>
          <span aria-hidden="true" />
          LIVE
        </span>
      </header>

      <p className="home-news-panel__description">{t('home.news.description')}</p>

      <div className={`home-news-panel__timeline home-news-panel__timeline--${widgetState}`} ref={timelineRef}>
        <a
          className="twitter-timeline"
          href={TARKOV_X_URL}
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-dnt="true"
          data-height="520"
          data-link-color="#8f9f7f"
        >
          {t('home.news.loading')}
        </a>
        {widgetState === 'unavailable' && (
          <div className="home-news-panel__fallback" role="status">
            <strong aria-hidden="true">X</strong>
            <span>{t('home.news.unavailable')}</span>
          </div>
        )}
      </div>

      <a
        className="home-news-panel__profile-link"
        href={TARKOV_X_URL}
        target="_blank"
        rel="noreferrer"
      >
        {t('home.news.openProfile')} ↗
      </a>
    </aside>
  );
}
