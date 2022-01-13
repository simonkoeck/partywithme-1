import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hash(password: string) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (e) {
    console.error(e);
    throw e;
  }
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
