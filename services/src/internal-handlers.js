import debug from 'debug';
import Router from 'koa-router';
import { query, sendTo, EVENT_TYPE_CREATE, EVENT_TYPE_EDIT } from './sse-client';

const dbg = debug('services:internal-handlers');

export default function (app) {
  const router = new Router({
    prefix: '/api',
  });

  router.get('/clients', (ctx) => {
    const clients = query().map(({ uuid, userId }) => ({ uuid, userId }));

    ctx.body = {
      ok: true,
      clients,
    };
  });

  router.post('/chats', (ctx) => {
    const { body } = ctx.request;
    const { userId, channelId, message } = body;
    dbg('Broadcasting new message:', message);

    sendTo({ userId, channelId }, 'chat', message);

    ctx.body = {
      ok: true,
    };
  });

  router.put('/chats', (ctx) => {
    const { body } = ctx.request;
    const { userId, channelId, message } = body;
    dbg('Broadcasting edit for message:', message);

    sendTo({ userId, channelId }, 'chat.edit', message);

    ctx.body = {
      ok: true,
    };
  });

  router.delete('/chats', (ctx) => {
    const { body } = ctx.request;
    const { userId, channelId, message } = body;
    dbg('Broadcasting removal for message:', message);

    sendTo({ userId, channelId }, 'chat.remove', message);

    ctx.body = {
      ok: true,
    };
  });

  dbg('Mounting internal handlers...');
  app.use(router.allowedMethods());
  app.use(router.routes());
}
