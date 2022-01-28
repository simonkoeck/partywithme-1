import { Client, HTTPError } from 'onesignal-node';
import { CreateNotificationBody } from 'onesignal-node/lib/types';

const client = new Client(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_REST_API_KEY
);

export async function sendNotification(
  externalUserIds: string[],
  title: string,
  content: string,
  buttons: any[] | undefined = undefined,
  image: any = undefined,
  data: any = undefined,
  channel: 'PARTIES' | 'FRIENDS' | 'CHAT'
) {
  if (externalUserIds.length == 0) return;
  data.buttons = buttons ?? [];
  const notification: CreateNotificationBody = {
    contents: {
      en: content,
      de: content,
    },
    headings: {
      en: title,
      de: title,
    },
    android_channel_id:
      channel == 'PARTIES'
        ? 'd5ec83b0-143f-422c-b560-c82ea8e3faa6'
        : channel == 'FRIENDS'
        ? '7c885d6f-a313-4976-8ee8-1b753511add0'
        : '7754885d-7095-470f-9678-89a246ccdbff',
    include_external_user_ids: externalUserIds,
    large_icon: image,
    data,
  };
  try {
    const response = await client.createNotification(notification);
    if (process.env.NODE_ENV == 'development') console.log(response.body);
  } catch (e) {
    if (e instanceof HTTPError) {
      // When status code of HTTP response is not 2xx, HTTPError is thrown.
      console.log(e.statusCode);
      console.log(e.body);
    }
  }
}
