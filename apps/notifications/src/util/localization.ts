import { readFileSync } from 'fs';

interface KeyValue {
  [key: string]: string;
}

interface ITranslation {
  de: KeyValue;
  en: KeyValue;
}

const translations: ITranslation = {
  de: JSON.parse(readFileSync('lang/de.json', 'utf-8')),
  en: JSON.parse(readFileSync('lang/en.json', 'utf-8')),
};

export function translate(locale: string, key: string): string {
  let languageCode = locale.split('_')[0];
  if (!translations[languageCode]) languageCode = 'en';
  return translations[languageCode][key];
}
