import { env } from '@pwm/env';
import { readFileSync } from 'fs';
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

interface IConfig {
  channels: {
    friends: string;
    chat: string;
    parties: string;
  };
}
function loadConfig(): IConfig {
  try {
    const c = readFileSync('notification-config.json', 'utf8');
    return JSON.parse(c);
  } catch (e) {
    throw Error('Error loading notification config file');
  }
}

const config = loadConfig();

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
        ? config.channels.parties
        : channel == 'FRIENDS'
        ? config.channels.friends
        : config.channels.chat,
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
