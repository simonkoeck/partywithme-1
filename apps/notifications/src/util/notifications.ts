import { loadConfig } from '@partywithme/config-loader';
import { env } from '@pwm/env';
import { Client, HTTPError } from 'onesignal-node';
import { CreateNotificationBody } from 'onesignal-node/lib/types';

const client = new Client(
  env('ONESIGNAL_APP_ID'),
  env('ONESIGNAL_REST_API_KEY')
);

interface StringMap {
  [key: string]: string | IButton[];
}

interface IButton {
  action: string;
  text: string;
}

const conf = loadConfig<'notifications'>('notifications');

export async function sendNotification(
  externalUserIds: string[],
  title: string,
  content: string,
  buttons: IButton[] | undefined = undefined,
  image: string | undefined = undefined,
  data: StringMap | undefined = undefined,
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
        ? conf.android.channels.parties
        : channel == 'FRIENDS'
        ? conf.android.channels.friends
        : conf.android.channels.chat,
    include_external_user_ids: externalUserIds,
    large_icon: image,
    data,
  };
  try {
    const response = await client.createNotification(notification);
    if (process.env.NODE_ENV == 'development') console.log(response.body);
  } catch (e) {
    if (e instanceof HTTPError) {
      console.log(e.statusCode);
      console.log(e.body);
    }
  }
}
