import { TARKOV_NEWS_FALLBACK } from '../../src/data/tarkovNewsFallback.js';

const TIMELINE_URL = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/tarkov?dnt=true&frame=false&lang=en&theme=dark';
const CACHE_TTL_MS = 5 * 60 * 1000;

let lastGoodResponse = null;

const response = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    ...extraHeaders
  },
  body: JSON.stringify(body)
});

const normalizeMedia = (tweet) => (tweet?.extended_entities?.media || [])
  .filter((media) => media?.media_url_https)
  .map((media) => ({
    id: media.id_str,
    type: media.type,
    url: media.media_url_https,
    width: media.original_info?.width || media.sizes?.large?.w || null,
    height: media.original_info?.height || media.sizes?.large?.h || null,
    expandedUrl: media.expanded_url || null
  }));

const normalizeTweet = (tweet) => {
  const range = Array.isArray(tweet?.display_text_range) ? tweet.display_text_range : null;
  const fullText = String(tweet?.full_text || tweet?.text || '').trim();
  const displayText = range
    ? fullText.slice(Number(range[0]) || 0, Number(range[1]) || fullText.length).trim()
    : fullText;

  const parsedDate = new Date(tweet.created_at);

  return {
    id: tweet.id_str,
    text: displayText,
    createdAt: Number.isNaN(parsedDate.getTime()) ? tweet.created_at : parsedDate.toISOString(),
    url: `https://x.com${tweet.permalink || `/tarkov/status/${tweet.id_str}`}`,
    author: {
      name: tweet.user?.name || 'Escape from Tarkov',
      username: tweet.user?.screen_name || 'tarkov',
      avatar: tweet.user?.profile_image_url_https || null,
      verified: Boolean(tweet.user?.is_blue_verified || tweet.user?.verified)
    },
    metrics: {
      replies: Number(tweet.reply_count) || 0,
      reposts: Number(tweet.retweet_count) || 0,
      likes: Number(tweet.favorite_count) || 0
    },
    media: normalizeMedia(tweet)
  };
};

export const parseTimelineHtml = (html) => {
  const match = String(html || '').match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match?.[1]) throw new Error('X timeline data was not found.');

  const payload = JSON.parse(match[1]);
  const entries = payload?.props?.pageProps?.timeline?.entries || [];
  const posts = entries
    .filter((entry) => entry?.type === 'tweet' && entry?.content?.tweet?.id_str)
    .map((entry) => normalizeTweet(entry.content.tweet))
    .filter((post) => post.author.username.toLowerCase() === 'tarkov')
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 12);

  if (!posts.length) throw new Error('X timeline did not contain public @tarkov posts.');
  return posts;
};

export const handler = async () => {
  if (lastGoodResponse && Date.now() - lastGoodResponse.cachedAt < CACHE_TTL_MS) {
    return response(200, { ...lastGoodResponse.payload, source: 'cache' });
  }

  try {
    const upstream = await fetch(TIMELINE_URL, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Referer: 'https://x.com/tarkov',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
      }
    });
    if (!upstream.ok) throw new Error(`X timeline unavailable (${upstream.status}).`);

    const posts = parseTimelineHtml(await upstream.text());
    const payload = {
      posts,
      source: 'x-syndication',
      fetchedAt: new Date().toISOString()
    };
    lastGoodResponse = { cachedAt: Date.now(), payload };
    return response(200, payload);
  } catch (error) {
    if (lastGoodResponse) {
      return response(200, {
        ...lastGoodResponse.payload,
        source: 'stale-cache',
        warning: error.message
      });
    }
    return response(200, {
      posts: TARKOV_NEWS_FALLBACK,
      source: 'bundled-fallback',
      fetchedAt: '2026-07-31T00:00:00.000Z',
      warning: error.message || 'Official X timeline unavailable.'
    });
  }
};
