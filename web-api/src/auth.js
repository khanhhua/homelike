import jwt from 'jsonwebtoken';
import Router from 'koa-router';
import debug from 'debug';
import crypto from 'crypto';
import * as db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 's@cret';
const PASS_SALT = process.env.PASS_SALT || 'saltysalt';
const dbg = debug('web-api:auth');

function hash(password) {
  return crypto.createHash('SHA1').update(`${PASS_SALT}:${password}`).digest().toString('hex');
}

async function authenticate(ctx) {
  const { body: payload } = ctx.request;
  const { email, password } = payload;

  try {
    dbg(`Finding user with email: ${email}`);
    const hashedPass = hash(password);
    const user = await db.User.findOne({ email, password: hashedPass }).exec();

    if (!user) {
      ctx.throw(403, 'Not authorized');
    }

    const authToken = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1 day',
      });

    ctx.body = {
      ok: true,
      authToken,
      user: {
        id: user.id,
        username: user.username,
        channels: user.channels,
      },
    };
  } catch (e) {
    ctx.throw(e);
  }
}

async function register(ctx) {
  const { body: payload } = ctx.request;
  const { email, password } = payload;

  try {
    dbg(`Registering user with email: ${email}`);
    const user = await db.User.findOne({ email }).exec();
    if (user) {
      ctx.body = {
        ok: false,
        errors: ['Email has already been registered to another user'],
      };
      ctx.status = 400;
      return;
    }

    const [username] = email.split('@');
    const hashedPass = hash(password);
    await db.User.create({ username, email, password: hashedPass });

    ctx.body = {
      ok: true,
    };
  } catch (e) {
    ctx.throw(e);
  }
}

export default (app, baseUrl) => {
  const router = new Router({
    prefix: baseUrl,
  });

  router.post('/auth/login', authenticate);
  router.post('/auth/register', register);

  dbg('Mounting auth module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
