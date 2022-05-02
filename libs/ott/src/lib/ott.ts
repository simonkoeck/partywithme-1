import { user, User } from '@pwm/db';
import { env } from '@pwm/env';
import { randomBytes } from 'crypto';
import { createClient } from 'redis';

const prefix = 'pwm-ott:';

const client = createClient({
  password: env('REDIS_PW'),
});

client.on('error', (err) => console.error(err));
client.connect();

export async function checkOneTimeToken(token: string): Promise<User> {
  const r = await client.get(`${prefix}${token}`);
  if (typeof r == 'undefined' || r == null || r == '') return null;
  // Delete token
  client.del(`${prefix}${token}`);
  const data = JSON.parse(r);
  // TODO: Check Expiration
  const u = await user.findFirst({ where: { id: data.userId } });
  return u;
}

export async function generateOneTimeToken(
  user: User,
  expiresInMinutes: number = 60 * 24 * 7
) {
  const ott = randomBytes(64).toString('hex');
  await client.set(
    `${prefix}${ott}`,
    JSON.stringify({
      exp: addMinutes(new Date(), expiresInMinutes),
      userId: user.id,
    }),
    { PX: expiresInMinutes * 60000 }
  );
  return ott;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
