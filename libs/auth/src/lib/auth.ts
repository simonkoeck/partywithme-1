import { sign, verify } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { loadConfig } from '@partywithme/config-loader';

const conf = loadConfig<'auth'>('auth');

const ISSUER = conf.issuer;

const privateKey = readFileSync(conf.private_key_path, 'utf-8');
export const publicKey = readFileSync(conf.public_key_path, 'utf-8');

if (!privateKey || !publicKey) throw new Error('Private/Public key not set.');

interface IAuthUser {
  id: string;
  username: string;
}

export function generateAccessToken(user: IAuthUser) {
  return sign(
    {
      user: { id: user.id, username: user.username },
      typ: 'Bearer',
    },
    privateKey,
    {
      expiresIn: conf.access_token_exp,
      issuer: ISSUER,
      subject: user.id,
      algorithm: 'RS256',
    }
  );
}

export function generateRefreshToken(user: IAuthUser) {
  return sign(
    { user: { id: user.id, username: user.username }, typ: 'RT' },
    privateKey,
    {
      expiresIn: conf.refresh_token_exp,
      issuer: ISSUER,
      subject: user.id.toString(),
      algorithm: 'RS256',
    }
  );
}

export async function verifyAccessToken(accessToken: string) {
  const verified = await verify(accessToken, publicKey, {
    issuer: ISSUER,
  });
  return verified;
}

export async function verifyRefreshToken(refreshToken: string) {
  const verified = await verify(refreshToken, publicKey);
  return verified;
}
