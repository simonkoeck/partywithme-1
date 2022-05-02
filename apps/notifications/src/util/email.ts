import { env } from '@pwm/env';
import {
  createTransport,
  createTestAccount,
  Transporter,
  getTestMessageUrl,
} from 'nodemailer';

let tr: Transporter;

export async function init() {
  if (env('NODE_ENV') == 'development') {
    const testAccount = await createTestAccount();
    tr = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    tr = createTransport({
      host: env('SMTP_HOST'),
      port: env('SMTP_PORT'),
      secure: true,
      auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASSWORD'),
      },
    });
  }
}

export async function sendEmail(
  email: string,
  html: string,
  text: string,
  subject: string
) {
  const info = await tr.sendMail({
    from: 'Party With Me <' + env('SMTP_FROM') + '>',
    to: email,
    subject: subject,
    text: text,
    html: html,
  });

  if (env('NODE_ENV') == 'development') {
    console.log('Preview URL: %s', getTestMessageUrl(info));
    console.log('Message sent: %s', info.messageId);
  }
}
