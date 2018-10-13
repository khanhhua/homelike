import Router from 'koa-router';
import debug from 'debug';
// import _get from 'lodash.get';
import moment from 'moment';
import * as db from './db';
import { format } from './utils';

const dbg = debug('web-api:channels');

async function list(ctx) {
  try {
    dbg('Listing all channels');
    const channels = await db.Channel.find({}, null, { limit: 10 }).lean().exec();

    ctx.body = {
      ok: true,
      channels: channels.map(format),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

async function view(ctx) {
  const { channelId } = ctx.params;
  const { anchor } = ctx.query;

  let anchorISO;
  if (anchor) {
    anchorISO = moment(parseInt(anchor, 10)).utc(); // normalize to UTC
  }

  try {
    dbg(`Viewing one channel #${channelId}`);
    const channel = await db.Channel.findById(channelId).lean().exec();
    dbg(`Filtering messages by ${anchorISO || 'latest'}`);
    const messages = await db.queryMessagesByAnchor(channelId, anchorISO);

    ctx.body = {
      ok: true,
      channel: {
        ...format(channel),
        messages: messages.map(format),
      },
    };
  } catch (e) {
    ctx.throw(e);
  }
}

export default (app, baseUrl) => {
  const router = new Router({
    prefix: baseUrl,
  });

  router.get('/channels', list);
  router.get('/channels/:channelId', view);

  dbg('Mounting channels module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
