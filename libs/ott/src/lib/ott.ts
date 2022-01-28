import { user, User } from '@pwm/db';
import { randomBytes } from 'crypto';
import { createClient } from 'redis';

const prefix = 'pwm-ott:';

const client = createClient({
  password: process.env.REDIS_PW,
});

client.on('error', (err) => console.error(err));

let connected = false;

export async function connect() {
  await client.connect();
  connected = true;
}

export async function checkOneTimeToken(token: string): Promise<User> {
  if (!connected) await connect();
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
  if (!connected) await connect();
  const ott = randomBytes(64).toString('hex');
  await client.set(
    `${prefix}${ott}`,
    JSON.stringify({
      exp: addMinutes(new Date(), expiresInMinutes),
      userId: user.id,
    })
  );
  return ott;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
