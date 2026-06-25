import fs from 'node:fs/promises';

const localeFiles = ['de', 'fr', 'it', 'ru'].map((language) => `src/i18n/locales/${language}.json`);

const replacements = [
  ['rereact-i18next', 'react-i18next'],
  ['React-i18next', 'react-i18next'],
  ['réagir-i18next', 'react-i18next'],
  ['réagir-i18next', 'react-i18next'],
  ['reagire-i18nex', 'react-i18next'],
  ['reagire-i18next', 'react-i18next'],
  ['реакция-i18next', 'react-i18next'],
  ['Улицы __ИТК_3__', 'Streets of Tarkov'],
  ['Занятие __ИТК_0__/__ИТК_1__ прод. / {{material}}', 'Класс {{class}} / {{durability}} прочн. / {{material}}']
];

for (const file of localeFiles) {
  let text = await fs.readFile(file, 'utf8');
  text = text.replace(/^\uFEFF/, '');

  for (const [search, replace] of replacements) {
    text = text.replaceAll(search, replace);
  }

  const parsed = JSON.parse(text);
  await fs.writeFile(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}
