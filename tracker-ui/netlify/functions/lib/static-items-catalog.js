const findValueStart = (text, key, fromIndex = 0) => {
  const keyIndex = text.indexOf(JSON.stringify(key), fromIndex);
  if (keyIndex < 0) return -1;

  const colonIndex = text.indexOf(':', keyIndex + key.length + 2);
  if (colonIndex < 0) return -1;

  let index = colonIndex + 1;
  while (/\s/.test(text[index])) index += 1;
  return index;
};

const findJsonValueEnd = (text, startIndex) => {
  const opening = text[startIndex];
  if (opening === '"') {
    let escaped = false;
    for (let index = startIndex + 1; index < text.length; index += 1) {
      const character = text[index];
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        return index + 1;
      }
    }
    return -1;
  }

  const closing = opening === '{' ? '}' : opening === '[' ? ']' : null;
  if (!closing) return -1;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === opening) {
      depth += 1;
    } else if (character === closing) {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return -1;
};

export const extractJsonProperty = (text, key, fromIndex = 0) => {
  const startIndex = findValueStart(text, key, fromIndex);
  if (startIndex < 0) return null;

  const endIndex = findJsonValueEnd(text, startIndex);
  if (endIndex < 0) return null;

  return JSON.parse(text.slice(startIndex, endIndex));
};

export const parseProfileCatalog = (text, itemIds = [], translationsText = '') => {
  const itemsStart = findValueStart(text, 'items');
  const playerLevels = extractJsonProperty(text, 'playerLevels') || [];
  const skills = extractJsonProperty(text, 'skills') || [];
  const items = [];

  if (itemsStart >= 0) {
    for (const id of new Set(itemIds.filter(Boolean))) {
      const item = extractJsonProperty(text, id, itemsStart);
      if (item?.id === id) {
        items.push({
          ...item,
          name: extractJsonProperty(translationsText, item.name) || item.name,
          shortName: extractJsonProperty(translationsText, item.shortName) || item.shortName
        });
      }
    }
  }

  return { playerLevels, skills, items };
};
