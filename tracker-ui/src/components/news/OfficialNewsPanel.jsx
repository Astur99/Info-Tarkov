import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TARKOV_NEWS_FALLBACK } from '../../data/tarkovNewsFallback';

const TARKOV_X_URL = 'https://x.com/tarkov';

const XLogo = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15">
    <path
      fill="currentColor"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
    />
  </svg>
);

const formatMetric = (value, locale) => new Intl.NumberFormat(locale, {
  notation: Number(value) >= 1000 ? 'compact' : 'standard',
  maximumFractionDigits: 1
}).format(Number(value) || 0);

const fetchOfficialNews = async (signal) => {
  const request = await fetch('/api/tarkov-news', {
    headers: { Accept: 'application/json' },
    signal
  });
  const payload = await request.json();
  if (!request.ok || !Array.isArray(payload.posts)) {
    throw new Error(payload.error || 'Official news unavailable.');
  }
  return payload.posts;
};

export default function OfficialNewsPanel() {
  const { i18n, t } = useTranslation();
  const [posts, setPosts] = useState(TARKOV_NEWS_FALLBACK);
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  useEffect(() => {
    const controller = new AbortController();
    fetchOfficialNews(controller.signal)
      .then((nextPosts) => {
        if (nextPosts.length) setPosts(nextPosts);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <aside className="home-news-panel" aria-labelledby="official-news-title">
      <header className="home-news-panel__header">
        <h2 id="official-news-title">{t('home.news.title')}</h2>
        <a
          className="home-news-panel__x-link"
          href={TARKOV_X_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={t('home.news.openProfile')}
        >
          <XLogo />
        </a>
      </header>

      <div className="home-news-panel__status">
        <span aria-hidden="true" />
        {t('home.news.automatic')}
      </div>

      <div className="home-news-panel__timeline" aria-live="polite">
        {posts.map((post) => (
          <article className="home-news-post" key={post.id}>
            <div className="home-news-post__author">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="" loading="lazy" />
              ) : (
                <span aria-hidden="true">IT</span>
              )}
              <div>
                <strong>{post.author.name}</strong>
                <span>@{post.author.username}</span>
              </div>
              <a href={post.url} target="_blank" rel="noreferrer" aria-label={t('home.news.openPost')}>
                <XLogo />
              </a>
            </div>

            <a className="home-news-post__body" href={post.url} target="_blank" rel="noreferrer">
              <p>{post.text}</p>
              {post.media?.[0]?.url && (
                <img
                  className="home-news-post__media"
                  src={post.media[0].url}
                  alt=""
                  loading="lazy"
                />
              )}
              <time dateTime={post.createdAt}>
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(post.createdAt))}
              </time>
            </a>

            <div className="home-news-post__metrics" aria-label={t('home.news.metrics')}>
              <span>↩ {formatMetric(post.metrics.replies, locale)}</span>
              <span>↻ {formatMetric(post.metrics.reposts, locale)}</span>
              <span>♥ {formatMetric(post.metrics.likes, locale)}</span>
            </div>
          </article>
        ))}
      </div>

      <a
        className="home-news-panel__profile-link"
        href={TARKOV_X_URL}
        target="_blank"
        rel="noreferrer"
      >
        {t('home.news.openProfile')}
        <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
