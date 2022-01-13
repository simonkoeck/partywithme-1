import { User } from '@pwm/db';
import * as amqp from 'amqplib/callback_api';

const PREFIX = 'PARTY_WITH_ME:';

type ICallback = (data: IData) => void;

interface IData {
  action: string;
  recipients: User[];
  sender?: User;
  data: any;
}

function connect(): Promise<any> {
  return new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', function (err, connection) {
      if (err) reject(err);
      else resolve(connection);
    });
  });
}

let connection;

export async function consume(queue: string, cb: ICallback) {
  if (!connection) connection = await connect();

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    const q = PREFIX + queue;
    channel.assertQueue(q, {
      durable: false,
    });

    channel.consume(
      q,
      function (msg) {
        if (msg == null) return;
        const data = JSON.parse(msg.content.toString());
        cb(data);
      },
      {
        noAck: true,
      }
    );
  });
}

export async function sendToQueue(queue: string, message: IData) {
  if (!connection) connection = await connect();

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const q = PREFIX + queue;

    channel.assertQueue(q, {
      durable: false,
    });
    channel.sendToQueue(q, Buffer.from(JSON.stringify(message)));
  });
}
