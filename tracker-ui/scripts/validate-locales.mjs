import fs from 'node:fs';

const localesPath = 'src/i18n/locales';
const targets = ['de', 'fr', 'it', 'ru'];
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
const source = readJson(`${localesPath}/en.json`);

const keys = (value, prefix = '') => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keys(item, `${prefix}${index}.`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}${key}.`));
  }

  return [prefix.slice(0, -1)];
};

const placeholders = (value) =>
  [...String(value).matchAll(/\{\{[^}]+\}\}/g)].map((match) => match[0]).sort().join('|');

const sourceKeys = keys(source).sort();
let ok = true;

const walk = (sourceValue, targetValue, trace = '') => {
  if (typeof sourceValue === 'string') {
    const sourcePlaceholders = placeholders(sourceValue);
    const targetPlaceholders = placeholders(targetValue);
    if (sourcePlaceholders !== targetPlaceholders) {
      console.log('placeholder mismatch', trace, sourcePlaceholders, targetPlaceholders);
      ok = false;
    }
    return;
  }

  if (Array.isArray(sourceValue)) {
    sourceValue.forEach((item, index) => walk(item, targetValue?.[index], `${trace}.${index}`));
    return;
  }

  if (sourceValue && typeof sourceValue === 'object') {
    Object.entries(sourceValue).forEach(([key, child]) => {
      walk(child, targetValue?.[key], trace ? `${trace}.${key}` : key);
    });
  }
};

for (const target of targets) {
  const targetPath = `${localesPath}/${target}.json`;
  const data = readJson(targetPath);
  const targetKeys = keys(data).sort();
  const sameKeys = JSON.stringify(sourceKeys) === JSON.stringify(targetKeys);
  const raw = fs.readFileSync(targetPath, 'utf8');
  const leftoverTokens = (raw.match(/__ITK_[0-9]+__/g) || []).length;

  console.log(target, 'keys', targetKeys.length, 'expected', sourceKeys.length, 'same', sameKeys);
  console.log(target, 'leftover tokens', leftoverTokens);

  if (!sameKeys || leftoverTokens) ok = false;
  walk(source, data);
}

process.exit(ok ? 0 : 1);
