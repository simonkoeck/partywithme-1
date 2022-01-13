import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verify(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: [
      // IOS
      '636649038596-guk03q91n5pja3kv6rehcqht2n30pebn.apps.googleusercontent.com',
      // Android
      '636649038596-6rovs236b7j4bsoj8qtnav2u7t15n7qt.apps.googleusercontent.com',
    ],
  });
  return ticket.getPayload();
}
