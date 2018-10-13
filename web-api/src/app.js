import debug from 'debug';
import path from 'path';
import fs from 'fs';

import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import * as swagger from 'swagger2';
import { validate } from 'swagger2-koa';

import jwtMiddleware from 'koa-jwt';

import auth from './auth';
import channels from './channels';
import messages from './messages';
import profile from './profile';

const JWT_SECRET = process.env.JWT_SECRET || 's@cret';
const STATIC_ROOT = process.env.STATIC_ROOT || path.resolve(path.join(__dirname, '..', 'static'));

export default function makeApp() {
  const dbg = debug('web-api:app');

  const app = new Koa();
  const document = swagger.loadDocumentSync('./swagger/api.yaml');

  if (fs.existsSync(STATIC_ROOT)) {
    dbg(`Serving static assets from ${STATIC_ROOT}. Use a real web server in production instead!`);
    app.use(serve(STATIC_ROOT));
  }

  app.use(jwtMiddleware({ secret: JWT_SECRET }).unless({ path: ['/health', /^\/swagger/, /^\/api\/v1\/auth/] }));
  app.use(async (ctx, next) => {
    if (ctx.path === '/health') {
      ctx.body = 'OK';

      return;
    }

    await next();
  });
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    try {
      await next();

      if (ctx.body && ctx.body.code === 'SWAGGER_REQUEST_VALIDATION_FAILED') {
        const devError = ctx.body;
        dbg(devError);

        ctx.body = {
          ok: false,
          code: 400,
          type: 'error',
          message: 'Bad Request',
          errors: ctx.body.errors.map(({ error }) => error),
        };
      }
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = {
        ok: false,
        code: err.status || 500,
        type: 'error',
        message: err.message || 'Bad Request',
      };

      ctx.app.emit('error', err, ctx);
    }
  });

  app.use(validate(document));
  // Mounting modules as we go
  auth(app, '/api/v1');
  channels(app, '/api/v1');
  messages(app, '/api/v1');
  profile(app, '/api/v1');

  return app;
}
