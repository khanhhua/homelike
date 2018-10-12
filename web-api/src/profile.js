import Router from 'koa-router';
import loPickBy from 'lodash.pickby';
import debug from 'debug';

import { User } from './db';
import { format } from './utils';

const dbg = debug('web-api:profile');

/**
 *
 * @param ctx
 * @returns {Promise<ProfileResponse>}
 */
async function view(ctx) {
  const { user } = ctx.state;

  try {
    dbg(`Finding user profile #${user.sub}`);
    const profile = await User.findById(user.sub).lean().exec(); // TODO drop password

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

  router.get('/profile', view);
  router.put('/profile', update);

  dbg('Mounting profile module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
