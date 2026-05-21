import { Buffer } from 'node:buffer';

const ALLOWED_IMAGE_HOSTS = new Set([
  'assets.tarkov.dev',
  'static.tarkov.dev'
]);

const MAX_IMAGE_BYTES = 1_500_000;

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400',
  'Netlify-CDN-Cache-Control': 'public, max-age=86400'
};

export const handler = async (event) => {
  try {
    const rawUrl = event.queryStringParameters?.url;
    if (!rawUrl) {
      return {
        statusCode: 400,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing image url.' })
      };
    }

    const imageUrl = new URL(rawUrl);
    if (imageUrl.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(imageUrl.hostname)) {
      return {
        statusCode: 403,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image host not allowed.' })
      };
    }

    const upstream = await fetch(imageUrl, {
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*',
        'User-Agent': 'InfoTarkov/0.14.17'
      }
    });

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Image source unavailable (${upstream.status}).` })
      };
    }

    const contentType = upstream.headers.get('content-type') || 'image/webp';
    const contentLength = Number(upstream.headers.get('content-length') || 0);
    if (!contentType.startsWith('image/') || contentLength > MAX_IMAGE_BYTES) {
      return {
        statusCode: 415,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image response not supported.' })
      };
    }

    const imageBuffer = Buffer.from(await upstream.arrayBuffer());
    if (imageBuffer.length > MAX_IMAGE_BYTES) {
      return {
        statusCode: 413,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image too large.' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...responseHeaders,
        'Content-Type': contentType
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error?.message || 'Image proxy failed.' })
    };
  }
};
