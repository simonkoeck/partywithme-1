import { readFileSync } from 'fs';
import { IConfigData } from './interfaces';

export function loadConfig<T extends keyof IConfigData>(
  namespace: keyof IConfigData
): IConfigData[T] {
  return JSON.parse(readFileSync('conf/' + namespace + '.json', 'utf8'));
}
