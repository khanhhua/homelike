import Router from 'koa-router';
import loPickBy from 'lodash.pickby';
import debug from 'debug';

import { User } from './db';
import { format } from './utils';

const dbg = debug('web-api:profile');

const PROFILE_PROJECTION = 'username displayName email work phone avatarUrl';
/**
 *
 * @param ctx
 * @returns {Promise<ProfileResponse>}
 */
async function view(ctx) {
  const { user } = ctx.state;

  try {
    dbg(`Finding user profile #${user.sub}`);
    const profile = await User.findById(user.sub)
      .select(PROFILE_PROJECTION).lean()
      .exec();

    if (!profile) {
      ctx.throw(400, 'User not found'); // which is strange!
    }

    ctx.body = {
      ok: true,
      profile: format(profile),
    };
  } catch (e) {
    ctx.throw(500, e);
  }
}

/**
 *
 * @param ctx
 * @returns {Promise<ProfileResponse>}
 */
async function list(ctx) {
  const { ids } = ctx.query;

  try {
    dbg(`Querying user profiles: ${ids}`);

    const criteria = {};
    if (ids) {
      criteria._id = { $in: ids }; // eslint-disable-line
    }
    const users = await User.find(criteria).limit(100)
      .select(PROFILE_PROJECTION).lean()
      .exec();

    ctx.body = {
      ok: true,
      users: users.map(format),
    };
  } catch (e) {
    ctx.throw(500, e);
  }
}

async function update(ctx) {
  const { user } = ctx.state;
  const { body: profile } = ctx.request;

  if (profile.id && user.sub !== profile.id) {
    ctx.throw(403);
  }

  try {
    const projection = ['username', 'email', 'displayName', 'work', 'phone', 'timezone', 'avatarUrl'].join(' ');
    const {
      displayName,
      work,
      phone,
      timezone,
      avatarBlob,
    } = profile;

    const avatarUrl = avatarBlob ? `data:${avatarBlob.mime};base64,${avatarBlob.data}` : undefined;
    const data = loPickBy({
      displayName,
      work,
      phone,
      timezone,
      avatarUrl,
    }, item => typeof item !== 'undefined');

    dbg(`Updating user profile #${user.sub} with`, {
      displayName,
      work,
      phone,
      timezone,
      avatarBlob: avatarBlob ? avatarBlob.mime : 'NONE',
    });
    const updatedProfile = await User.updateOne({ _id: user.sub }, { $set: data })
      .exec()
      .then(async () => User.findById(user.sub).select(projection).lean());

    dbg(`Updated ${user.sub}`);

    ctx.body = {
      ok: true,
      profile: format(updatedProfile),
    };
  } catch (e) {
    ctx.throw(500, e);
  }
}

export default (app, baseUrl) => {
  const router = new Router({
    prefix: baseUrl,
  });

  router.get('/users', list);
  router.get('/profile', view);
  router.put('/profile', update);

  dbg('Mounting profile module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
