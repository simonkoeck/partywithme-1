import { loadConfig } from '@partywithme/config-loader';
import * as bcrypt from 'bcrypt';

const { salt_rounds } = loadConfig<'api'>('api');

export async function hash(password: string) {
  return await bcrypt.hash(password, salt_rounds);
}

export async function comparePasswords(
  hashedPassword: string,
  plainPassword: string
) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
