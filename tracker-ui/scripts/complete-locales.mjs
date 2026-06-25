import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';
const TARGETS = process.argv.slice(2).length ? process.argv.slice(2) : ['de', 'fr', 'it', 'ru'];

const LANGUAGE_NAMES = {
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский'
};

const PROTECTED_TERMS = [
  'Info Tarkov',
  'Escape from Tarkov',
  'Escape From Tarkov',
  'Tarkov',
  'PMC',
  'Scav',
  'Kappa',
  'Collector',
  'Fence',
  'Flea Market',
  'Flea',
  'Hideout',
  'Goons',
  'Knight',
  'Big Pipe',
  'Birdeye',
  'Lightkeeper',
  'Prapor',
  'Therapist',
  'Skier',
  'Peacekeeper',
  'Mechanic',
  'Ragman',
  'Jaeger',
  'PvP',
  'PvE',
  'PVP',
  'PVE',
  'FIR',
  'TTK',
  'DPS',
  'API',
  'JSON',
  'GraphQL',
  'React',
  'Vite',
  'i18next',
  'react-i18next',
  'PostgreSQL',
  'Auth',
  'RLS',
  'Netlify',
  'Supabase',
  'tarkov.dev',
  'players.tarkov.dev',
  'tarkov-goon-tracker.com'
];

const languageLabelOverrides = {
  de: { label: 'Sprache', es: 'ES', en: 'EN', de: 'DE', fr: 'FR', it: 'IT', ru: 'RU' },
  fr: { label: 'Langue', es: 'ES', en: 'EN', de: 'DE', fr: 'FR', it: 'IT', ru: 'RU' },
  it: { label: 'Lingua', es: 'ES', en: 'EN', de: 'DE', fr: 'FR', it: 'IT', ru: 'RU' },
  ru: { label: 'Язык', es: 'ES', en: 'EN', de: 'DE', fr: 'FR', it: 'IT', ru: 'RU' }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const writeJson = async (filePath, data) => {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const protectText = (text) => {
  const replacements = [];
  let protectedText = String(text);

  const protect = (pattern, value) => {
    const token = `__ITK_${replacements.length}__`;
    replacements.push([token, value]);
    protectedText = protectedText.replace(pattern, token);
  };

  protectedText = protectedText.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__ITK_${replacements.length}__`;
    replacements.push([token, match]);
    return token;
  });

  protectedText = protectedText.replace(/`[^`]+`/g, (match) => {
    const token = `__ITK_${replacements.length}__`;
    replacements.push([token, match]);
    return token;
  });

  for (const term of PROTECTED_TERMS) {
    protect(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), term);
  }

  return { protectedText, replacements };
};

const restoreText = (text, replacements) => {
  let restored = String(text);
  for (const [token, value] of replacements) {
    restored = restored.replaceAll(token, value);
    restored = restored.replaceAll(token.toLowerCase(), value);
    restored = restored.replaceAll(token.replaceAll('_', ' '), value);
  }
  return restored;
};

const shouldKeepAsIs = (value) => {
  const text = String(value);
  if (!text.trim()) return true;
  if (/^[A-Z0-9_./: -]+$/.test(text) && text.length <= 16) return true;
  if (/^https?:\/\//i.test(text)) return true;
  return false;
};

const splitText = (text, maxLength = 450) => {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let current = '';
  const parts = text.split(/(?<=[.!?;:])\s+/);

  for (const part of parts) {
    if ((current + ' ' + part).trim().length > maxLength) {
      if (current.trim()) chunks.push(current.trim());
      current = part;
    } else {
      current = `${current} ${part}`.trim();
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks.flatMap((chunk) => {
    if (chunk.length <= maxLength) return [chunk];
    const hardChunks = [];
    for (let index = 0; index < chunk.length; index += maxLength) {
      hardChunks.push(chunk.slice(index, index + maxLength));
    }
    return hardChunks;
  });
};

const requestTranslation = async (text, targetLanguage) => {
  if (shouldKeepAsIs(text)) return text;

  const { protectedText, replacements } = protectText(text);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', SOURCE_LOCALE);
  url.searchParams.set('tl', targetLanguage);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', protectedText);

  let response;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'InfoTarkovLocaleBuilder/1.0'
      }
    });

    if (response.ok) break;
    await sleep(700 * attempt);
  }

  if (!response.ok) {
    throw new Error(`Translation failed for ${targetLanguage}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((part) => part?.[0] || '').join('')
    : protectedText;

  return restoreText(translated, replacements);
};

const translateString = async (text, targetLanguage) => {
  if (shouldKeepAsIs(text)) return text;

  const chunks = splitText(String(text));
  const translatedChunks = [];

  for (const chunk of chunks) {
    translatedChunks.push(await requestTranslation(chunk, targetLanguage));
  }

  return translatedChunks.join(' ');
};

const translateValue = async (value, targetLanguage, cache, pathTrace = []) => {
  if (typeof value === 'string') {
    const cacheKey = `${targetLanguage}:${value}`;
    if (!cache.has(cacheKey)) {
      try {
        cache.set(cacheKey, await translateString(value, targetLanguage));
      } catch (error) {
        error.message = `${error.message} at ${pathTrace.join('.')}: ${String(value).slice(0, 160)}`;
        throw error;
      }
      await sleep(90);
    }
    return cache.get(cacheKey);
  }

  if (Array.isArray(value)) {
    const translatedArray = [];
    for (const [index, item] of value.entries()) {
      translatedArray.push(await translateValue(item, targetLanguage, cache, [...pathTrace, index]));
    }
    return translatedArray;
  }

  if (value && typeof value === 'object') {
    const translatedObject = {};
    for (const [key, child] of Object.entries(value)) {
      translatedObject[key] = await translateValue(child, targetLanguage, cache, [...pathTrace, key]);
    }
    return translatedObject;
  }

  return value;
};

const countLeafStrings = (value) => {
  if (typeof value === 'string') return 1;
  if (Array.isArray(value)) return value.reduce((count, item) => count + countLeafStrings(item), 0);
  if (value && typeof value === 'object') {
    return Object.values(value).reduce((count, item) => count + countLeafStrings(item), 0);
  }
  return 0;
};

const main = async () => {
  const source = await readJson(path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`));
  const cache = new Map();
  const total = countLeafStrings(source);

  for (const target of TARGETS) {
    console.log(`Translating ${target} (${LANGUAGE_NAMES[target]}) from ${total} strings...`);
    const translated = await translateValue(source, target, cache);
    translated.language = languageLabelOverrides[target];
    await writeJson(path.join(LOCALES_DIR, `${target}.json`), translated);
    console.log(`Completed ${target}.`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
