import debug from 'debug';
import Consul from 'consul';

import Router from 'koa-router';
import { default as rp } from 'request-promise';
import * as db from './db';
import { format } from './utils';

const dbg = debug('web-api:messages');

let consul;

async function list(ctx) {
  const { channelId } = ctx.params;
  const { anchor = 0 } = ctx.query;

  try {
    dbg(`Listing messages for channel #${channelId}`);
    const anchorISO = new Date(parseInt(anchor, 10)).toISOString();
    dbg(`Filtering messages by ${anchorISO}`);

    const chunk = await db.ChannelChunk.findOne({ channelId }).lean().exec();
    if (!chunk) {
      ctx.throw(404, 'Channel not found');
    }

    const messages = (chunk.messages || []).filter(({ createdAt }) => createdAt.toISOString() > anchorISO);

    ctx.body = {
      ok: true,
      messages: messages.map(format),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

// async function view(ctx) {
//   try {
//     const { channelId, messageId } = ctx.params;
//     dbg(`Viewing one message #${channelId}`);
//     const channel = await db.Channel.findById(channelId).lean().exec();
//
//     ctx.body = {
//       ok: true,
//       channel: format(channel),
//     };
//   } catch (e) {
//     ctx.throw(e);
//   }
// }

async function create(ctx) {
  const { channelId } = ctx.params;

  try {
    const { text } = ctx.request.body;
    const { user } = ctx.state;

    if (!user) {
      ctx.throw(403, 'Unauthorized');
    }
    dbg('Sending message as:', user);

    const message = {
      _id: db.objectId(),
      sender: user.sub,
      body: text,
      createdAt: new Date(),
    };
    dbg(`Persisting new message for channel #${channelId}`);
    await new Promise((resolve, reject) => {
      dbg('Find and update...');

      db.ChannelChunk.updateOne({ channelId }, { $push: { messages: message } }, { upsert: true }, (err, stats) => {
        if (err) {
          return reject(err);
        }

        const { ok } = stats;
        if (ok) {
          dbg('Done');

          return resolve();
        }

        return reject(new Error('Consistency error'));
      });
    });

    try {
      const { CONSUL_URL } = process.env;
      const result = await rp(`${CONSUL_URL}/v1/health/service/sse-connector`).then(res => JSON.parse(res));
      const urls = result.map(({ Service: { Address, Port } }) => `http://${Address}:${Port}`);
      dbg(`Broadcast message to channel #${channelId} at host:ports`, urls);

      await Promise.all(urls.map(url =>
        rp(`${url}/api/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelId,
            message: format(message),
          }),
        })
      ));
    } catch (e) {
      dbg(`Could not broadcast message to channel #${channelId} to all nodes.\n` +
        'For reliable delivery, use AMQP (RabbitMQ, ActiveMQ...)');
    }

    ctx.body = {
      ok: true,
      message: format(message),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

export default (app, baseUrl) => {
  consul = Consul({ promisify: true });

  const router = new Router({
    prefix: baseUrl,
  });

  router.get('/channels/:channelId/messages', list);
  router.post('/channels/:channelId/messages', create);

  dbg('Mounting messages module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
