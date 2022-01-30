import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/notifications/.env' });
dotenv.config({ path: '.env' });

import { User } from '@pwm/db';
import { generateOneTimeToken } from '@pwm/ott';
import { consume } from '@pwm/queue';
import { translate } from './util/localization';
import { sendNotification } from './util/notifications';

consume('notifications', (data) => {
  switch (data.action) {
    case 'PARTY_CREATED':
      data.recipients.forEach(async (u: User) => {
        const ott = await generateOneTimeToken(u);
        sendNotification(
          [u.onesignal_external_user_id],
          translate(u.locale, 'created_party_title').replace(
            '%USERNAME%',
            data.sender.username
          ),
          translate(u.locale, 'created_party_text').replace(
            '%USERNAME%',
            data.sender.username
          ),
          [
            {
              action: 'PARTICIPATE_PARTY',
              text: translate(u.locale, 'participate'),
            },
          ],
          `${env('CDN_URL')}/dl/av/${data.sender.id}-100x100.jpg`,
          {
            scope: 'PARTY',
            id: data.data.party.id,
            ott,
            api_url: env('API_URL'),
          },
          'PARTIES'
        );
      });
      break;
    case 'PARTY_DELETED':
      data.recipients.forEach((user: User) => {
        sendNotification(
          [user.onesignal_external_user_id],
          translate(user.locale, 'deleted_party_title').replace(
            '%USERNAME%',
            data.sender.username
          ),
          translate(user.locale, 'deleted_party_text').replace(
            '%USERNAME%',
            data.sender.username
          ),
          [],
          `${env('CDN_URL')}/dl/av/${data.sender.id}-100x100.jpg`,
          {
            scope: 'PARTY',
          },
          'PARTIES'
        );
      });
      break;
    case 'ADDED_AS_FRIEND':
      data.recipients.forEach(async (user: User) => {
        const ott = await generateOneTimeToken(user);
        sendNotification(
          [user.onesignal_external_user_id],
          translate(user.locale, 'added_as_friend_title').replace(
            '%USERNAME%',
            data.sender.username
          ),
          translate(user.locale, 'added_as_friend_text').replace(
            '%USERNAME%',
            data.sender.username
          ),
          [
            {
              action: 'ACCEPT_FRIEND',
              text: translate(user.locale, 'accept_friend'),
            },
            {
              action: 'DECLINE_FRIEND',
              text: translate(user.locale, 'decline_friend'),
            },
          ],
          `${env('CDN_URL')}/dl/av/${data.sender.id}-100x100.jpg`,
          {
            scope: 'FRIENDS',
            id: data.sender.id,
            ott,
            api_url: env('API_URL'),
          },
          'FRIENDS'
        );
      });
      break;
    case 'ACCEPTED_FRIEND_REQUEST':
      data.recipients.forEach((user: User) => {
        sendNotification(
          [user.onesignal_external_user_id],
          translate(user.locale, 'accept_friend_request_title').replace(
            '%USERNAME%',
            data.sender.username
          ),
          translate(user.locale, 'accept_friend_request_text').replace(
            '%USERNAME%',
            data.sender.username
          ),
          [],
          `${env('CDN_URL')}/dl/av/${data.sender.id}-100x100.jpg`,
          {
            scope: 'FRIENDS',
          },
          'FRIENDS'
        );
      });

      break;
    case 'MESSAGE_RECEIVED':
      data.recipients.forEach(async (user: User) => {
        const ott = await generateOneTimeToken(user);

        sendNotification(
          [user.onesignal_external_user_id],
          data.sender.username,
          data.data.message.content,
          [],
          undefined,
          {
            scope: 'CHAT',
            conversation: data.data.conversation_id,
            conversation_name: data.data.conversation_name,
            message: data.data.message,
            ott,
            api_url: env('API_URL'),
          },
          'CHAT'
        );
      });
  }
});

//
//  E-Mail
//
import { readFileSync } from 'fs';
import { lookup } from 'geoip-lite';
import * as NodeGeocoder from 'node-geocoder';
import { init, sendEmail } from './util/email';
import { env } from '@pwm/env';

const forgotPasswordTemplateHtml = readFileSync(
  'templates/forgot_password_de.html',
  {
    encoding: 'utf-8',
  }
);
const forgotPasswordTemplateTxt = readFileSync(
  'templates/forgot_password_de.html',
  {
    encoding: 'utf-8',
  }
);
const verificationTemplateHtml = readFileSync(
  'templates/verification_de.html',
  {
    encoding: 'utf-8',
  }
);
const verificationTemplateTxt = readFileSync('templates/verification_de.html', {
  encoding: 'utf-8',
});

const options: NodeGeocoder.Options = {
  provider: 'opencage',
  apiKey: env('OPENCAGE_API_KEY'),
  formatter: null,
};

const geocoder = NodeGeocoder(options);

(async () => {
  await init();

  consume('email', async (data) => {
    if (data.action == 'FORGOT_PASSWORD') {
      const l = lookup(data.data.ip);

      let html = forgotPasswordTemplateHtml
        .replace(/%USERNAME%/g, data.recipients[0].username)
        .replace(
          /%LINK%/g,
          `${env('WEBSITE_URL')}/reset-password?token=${data.data.token}`
        );
      let text = forgotPasswordTemplateTxt
        .replace(/%USERNAME%/g, data.recipients[0].username)
        .replace(
          /%LINK%/g,
          `${env('WEBSITE_URL')}/reset-password?token=${data.data.token}`
        );
      if (l != null) {
        let res: NodeGeocoder.Entry[] = [];
        try {
          res = await geocoder.reverse({
            lat: l.ll[0],
            lon: l.ll[1],
          });
        } catch (e) {
          console.error(e);
        }
        if (res.length != 0) {
          html = html.replace(
            /%IP%/g,
            res[0].city + ', ' + res[0].country + ' (IP=' + data.data.ip + ')'
          );
          text = text.replace(
            /%IP%/g,
            res[0].city + ', ' + res[0].country + ' (IP=' + data.data.ip + ')'
          );
        }
      } else {
        html = html.replace(/%IP%/g, data.data.ip);
        text = text.replace(/%IP%/g, data.data.ip);
      }
      sendEmail(data.recipients[0].email, html, text, 'Passwort vergessen');
    } else if (data.action == 'VERIFICATION') {
      const html = verificationTemplateHtml
        .replace(/%USERNAME%/g, data.recipients[0].username)
        .replace(
          /%LINK%/g,
          `${env('WEBSITE_URL')}/verify?token=${data.data.token}`
        );
      const text = verificationTemplateTxt
        .replace(/%USERNAME%/g, data.recipients[0].username)
        .replace(
          /%LINK%/g,
          `${env('WEBSITE_URL')}/verify?token=${data.data.token}`
        );
      sendEmail(data.recipients[0].email, html, text, 'Account aktivieren');
    }
  });
})();
