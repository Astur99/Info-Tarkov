import { TARKOV_NEWS_FALLBACK } from '../../src/data/tarkovNewsFallback.js';

const TIMELINE_URL = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/tarkov?dnt=true&frame=false&lang=en&theme=dark';
const READER_TIMELINE_URL = 'https://r.jina.ai/https://twitter.com/tarkov?lang=en';
const CACHE_TTL_MS = 5 * 60 * 1000;
const TWITTER_EPOCH_MS = 1288834974657n;

const TARKOV_AUTHOR = {
  name: 'Escape from Tarkov',
  username: 'tarkov',
  avatar: 'https://pbs.twimg.com/profile_images/2058838438900617216/3MT4g_A3_normal.jpg',
  verified: true
};

let lastGoodResponse = null;

const response = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
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

const snowflakeToIsoDate = (id) => {
  try {
    return new Date(Number((BigInt(id) >> 22n) + TWITTER_EPOCH_MS)).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const parseCompactMetric = (value) => {
  const normalized = String(value || '').trim().replace(',', '.').toUpperCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)([KMB])?$/);
  if (!match) return 0;
  const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[match[2]] || 1;
  return Math.round(Number(match[1]) * multiplier);
};

const markdownToText = (value) => String(value || '')
  .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
  .replace(/\s*Show more\s*$/i, '')
  .replace(/\s+/g, ' ')
  .replace(/\s+([.,!?;:])/g, '$1')
  .trim();

const extractReaderPost = (segment) => {
  const timeLink = segment.match(
    /\[([^\]]+)\]\(https:\/\/(?:twitter|x)\.com\/tarkov\/status\/(\d+)\)/i
  );
  if (!timeLink) return null;

  const [, , id] = timeLink;
  const body = segment.slice((timeLink.index || 0) + timeLink[0].length);
  const contentBoundary = body.search(
    /\s{2,}(?:\[!\[Image|\[Video\b|\[\]\(https:\/\/(?:twitter|x)\.com\/tarkov\/status\/\d+\/quotes\)|\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*)/i
  );
  const text = markdownToText(contentBoundary >= 0 ? body.slice(0, contentBoundary) : body);
  if (!text) return null;

  const mediaMatch = body.match(
    /!\[Image[^\]]*\]\((https:\/\/pbs\.twimg\.com\/(?!profile_images)[^)]+)\)/i
  );
  const metricsMatch = body.match(
    /\s(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+\[\]\(https:\/\/(?:twitter|x)\.com\/tarkov\/status\/\d+\/quotes\)/i
  );

  return {
    id,
    text,
    createdAt: snowflakeToIsoDate(id),
    url: `https://x.com/tarkov/status/${id}`,
    author: TARKOV_AUTHOR,
    metrics: {
      replies: parseCompactMetric(metricsMatch?.[1]),
      reposts: parseCompactMetric(metricsMatch?.[2]),
      likes: parseCompactMetric(metricsMatch?.[3])
    },
    media: mediaMatch ? [{
      type: /video_thumb/i.test(mediaMatch[1]) ? 'video' : 'photo',
      url: mediaMatch[1].replace(/&amp;/g, '&')
    }] : []
  };
};

export const parseReaderTimeline = (payload) => {
  const content = typeof payload === 'string' ? payload : payload?.data?.content;
  if (!content) throw new Error('X reader timeline data was not found.');

  const posts = String(content)
    .split(/(?=\*\s+(?:\s*Pinned\s+)?\[!\[Image[^\]]*user avatar)/i)
    .map(extractReaderPost)
    .filter(Boolean);

  const uniquePosts = [...new Map(posts.map((post) => [post.id, post])).values()]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 12);

  if (!uniquePosts.length) throw new Error('X reader did not contain public @tarkov posts.');
  return uniquePosts;
};

const fetchSyndicationTimeline = async () => {
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
  return parseTimelineHtml(await upstream.text());
};

const fetchReaderTimeline = async () => {
  const upstream = await fetch(READER_TIMELINE_URL, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'User-Agent': 'InfoTarkov/1.3 (+https://infotarkov.com)'
    }
  });
  if (!upstream.ok) throw new Error(`X reader unavailable (${upstream.status}).`);
  return parseReaderTimeline(await upstream.json());
};

export const handler = async () => {
  if (lastGoodResponse && Date.now() - lastGoodResponse.cachedAt < CACHE_TTL_MS) {
    return response(200, { ...lastGoodResponse.payload, source: 'cache' });
  }

  let syndicationError;
  try {
    const posts = await fetchSyndicationTimeline();
    const payload = {
      posts,
      source: 'x-syndication',
      fetchedAt: new Date().toISOString()
    };
    lastGoodResponse = { cachedAt: Date.now(), payload };
    return response(200, payload);
  } catch (error) {
    syndicationError = error;
  }

  try {
    const posts = await fetchReaderTimeline();
    const payload = {
      posts,
      source: 'x-reader',
      fetchedAt: new Date().toISOString(),
      warning: syndicationError?.message
    };
    lastGoodResponse = { cachedAt: Date.now(), payload };
    return response(200, payload);
  } catch (readerError) {
    if (lastGoodResponse) {
      return response(200, {
        ...lastGoodResponse.payload,
        source: 'stale-cache',
        warning: `${syndicationError?.message || 'X timeline unavailable.'} ${readerError.message}`
      });
    }
    return response(200, {
      posts: TARKOV_NEWS_FALLBACK,
      source: 'bundled-fallback',
      fetchedAt: '2026-07-31T00:00:00.000Z',
      warning: `${syndicationError?.message || 'X timeline unavailable.'} ${readerError.message}`
    });
  }
};
