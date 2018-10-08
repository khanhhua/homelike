import debug from 'debug';
import Router from 'koa-router';
import { query, sendTo } from "./sse-client";

const dbg = debug('services:internal-handlers');

export default function(app) {
  const router = new Router({
    prefix: '/api'
  });

  router.get('/clients', (ctx) => {
    const clients = query().map(({ uuid, userId }) => ({ uuid, userId }));

    ctx.body = {
      ok: true,
      clients,
    };
  });

  router.post('/chats/:userId', (ctx) => {
    const { userId } = ctx.params;
    const body = ctx.request.body;
    const message = (typeof body === 'string') ? body: JSON.stringify(body);

    sendTo(userId, message);

    ctx.body = {
      ok: true
    };
  });

  dbg('Mounting internal handlers...');
  app.use(router.allowedMethods());
  app.use(router.routes());
}
