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
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
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
    from: 'Party With Me <' + env('SMTP_FROM') + '>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  });

  console.log('Message sent: %s', info.messageId);

  if (env('NODE_ENV') == 'development')
    console.log('Preview URL: %s', getTestMessageUrl(info));
}
