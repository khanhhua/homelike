import debug from 'debug';
import Router from 'koa-router';
import { query, sendTo } from './sse-client';

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
    dbg('message:', message);

    sendTo({ userId, channelId }, message);

    ctx.body = {
      ok: true,
    };
  });

  dbg('Mounting internal handlers...');
  app.use(router.allowedMethods());
  app.use(router.routes());
}
