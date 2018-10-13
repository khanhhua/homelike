/* eslint no-underscore-dangle: "off" */
import debug from 'debug';

import Router from 'koa-router';
import { default as rp } from 'request-promise';
import * as db from './db';
import { format } from './utils';

const dbg = debug('web-api:messages');

async function broadcastChatMessage(type, channelId, message) {
  let method = null;

  switch (type) {
    case 'create': method = 'POST'; break;
    case 'edit': method = 'PUT'; break;
    case 'remove': method = 'DELETE'; break;
    default:
      return;
  }

  const { CONSUL_HOSTNAME, CONSUL_PORT } = process.env;
  if (!(CONSUL_HOSTNAME, CONSUL_PORT)) {
    dbg('Broadcast enabled only in cluster mode');
    return;
  }

  try {
    const result = await rp(`http://${CONSUL_HOSTNAME}:${CONSUL_PORT}/v1/health/service/sse-connector`)
      .then(res => JSON.parse(res));

    dbg('result:', result);
    const urls = result.map(({ Service: { Address, Port } }) => `http://${Address}:${Port}`);
    dbg(`Broadcast message to channel #${channelId} at host:ports`, urls);

    await Promise.all(urls.map(url => rp(`${url}/api/chats`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelId,
        message,
      }),
    })));
  } catch (e) {
    dbg(`Could not broadcast message to channel #${channelId} to all nodes.\n`
      + 'For reliable delivery, use AMQP (RabbitMQ, ActiveMQ...)');
  }
}

async function list(ctx) {
  const { channelId } = ctx.params;
  const { anchor = '0' } = ctx.query;

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
    dbg(e);
    ctx.throw(e);
  }
}

async function edit(ctx) {
  const { user } = ctx.state;
  const { channelId, messageId } = ctx.params;
  const { text } = ctx.request.body;

  try {
    const sender = user.sub;
    dbg(`User ${sender} editing one message located at #${channelId}/#${messageId}`);

    // TODO Iterate over chunks starting from today
    const chunk = await db.ChannelChunk.findOne({ channelId }).sort('-createdAt').select('_id').lean()
      .exec();
    if (!chunk) {
      ctx.throw(404, 'Channel chunk not found');
    }

    dbg(`Updating chunk #${chunk._id}...`);
    const result = await db.ChannelChunk.updateOne(
      {
        _id: chunk._id,
        messages: { $elemMatch: { _id: messageId, sender } },
      },
      { $set: { 'messages.$.body': text } },
    );

    dbg('Update result:', result);

    if (result.ok) {
      const message = {
        id: messageId,
        body: text,
        sender,
      };
      await broadcastChatMessage('edit', channelId, format(message));

      ctx.body = {
        ok: true,
        message,
      };
    } else {
      ctx.body = {
        ok: false,
        errors: ['Could not update message'],
      };
    }
  } catch (e) {
    ctx.throw(e);
  }
}

async function remove(ctx) {
  const { user } = ctx.state;
  const { channelId, messageId } = ctx.params;

  try {
    const sender = user.sub;
    dbg(`User ${sender} removing one message located at #${channelId}/#${messageId}`);

    // TODO Iterate over chunks starting from today
    const chunk = await db.ChannelChunk.findOne({ channelId }).sort('-createdAt').select('_id').lean()
      .exec();
    if (!chunk) {
      ctx.throw(404, 'Channel chunk not found');
    }

    dbg(`Removing chunk #${chunk._id}...`);
    const result = await db.ChannelChunk.updateOne(
      {
        _id: chunk._id,
      },
      { $pull: { messages: { _id: messageId, sender } } },
    );

    dbg('Removal result:', result);

    if (result.ok) {
      await broadcastChatMessage('remove', channelId, { id: messageId });

      ctx.body = {
        ok: true,
      };
    } else {
      ctx.body = {
        ok: false,
        errors: ['Could not remove message'],
      };
    }
  } catch (e) {
    ctx.throw(e);
  }
}

async function create(ctx) {
  const { channelId } = ctx.params;
  dbg('Sending message');

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

    await broadcastChatMessage('create', channelId, format(message));

    ctx.body = {
      ok: true,
      message: format(message),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

export default (app, baseUrl) => {
  const router = new Router({
    prefix: baseUrl,
  });

  router.put('/channels/:channelId/messages/:messageId', edit);
  router.delete('/channels/:channelId/messages/:messageId', remove);
  router.get('/channels/:channelId/messages', list);
  router.post('/channels/:channelId/messages', create);

  dbg('Mounting messages module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
