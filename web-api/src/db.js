/* eslint-disable no-underscore-dangle */

import debug from 'debug';
import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

const dbg = debug('web-api:db');
const { DATABASE_URL } = process.env;

const CHUNK_EXPIRE_IN = 1; // 1 day

const schemaOptions = {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};
const UserSchema = new Schema(
  {
    email: String,
    username: String,
    password: String,
    channels: [String],
    displayName: String,
    work: String,
    phone: String,
    timezone: { type: String, default: 'Asia/Kuala_Lumpur' },
    avatarUrl: String,
  }, schemaOptions,
);
UserSchema.virtual('id').get(function () {
  return this._id.toHexString(); // eslint-disable-line
});

const ChannelSchema = new Schema(
  {
    ownerId: Schema.Types.ObjectId,
    name: String,
    chatters: [Schema.Types.ObjectId],
    activeChunk: Schema.Types.ObjectId, // Pointer to the ChannelChunkSchema chunk
    chunkExpiry: Date,
    createdAt: Date,
    lastMsgAt: Date,
  }, schemaOptions,
);
ChannelSchema.virtual('id').get(function () {
  return this._id.toHexString(); // eslint-disable-line
});

const ChannelChunkSchema = new Schema({
  channelId: Schema.Types.ObjectId,
  createdAt: Date,
  messages: [
    {
      id: String,
      sender: Schema.Types.ObjectId,
      body: String,
      createdAt: Date,
    }],
});

export const User = mongoose.model('User', UserSchema);
export const Channel = mongoose.model('Channel', ChannelSchema);
export const ChannelChunk = mongoose.model('ChannelChunk', ChannelChunkSchema);

export async function initDb() {
  console.log(`Initializing database for the given URL ${DATABASE_URL}...`);
  const options = {
    useNewUrlParser: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  };
  await mongoose.connect(DATABASE_URL, options);

  if (process.env.DEFAULT_CHANNELS) {
    const defaultChannels = process.env.DEFAULT_CHANNELS.split(',').map(item => item.trim()).filter(Boolean);
    if (defaultChannels.length) {
      console.log('Ensuring default channels...');
      try {
        await defaultChannels.reduce(async (promise, channelName) => {
          await promise;
          dbg(`Upserting ${channelName}...`);
          return Channel.updateOne(
            { name: channelName },
            {
              createdAt: moment().utc().toDate(),
              chatters: [],
              activeChunk: null,
              chunkExpiry: null,
            }, { upsert: true },
          ).exec();
        }, Promise.resolve());

        console.log('Done loading default channels');
      } catch (e) {
        console.error(e.stackTrace);
      }
    }
  }
  dbg('Done');
}

export function objectId() {
  return mongoose.Types.ObjectId();
}

/**
 * Allocate a new channel chunk for storing new messages
 *
 * @param channelId {string}
 * @returns {Promise<string>}
 */
export async function allocateChunk(channelId) {
  const today = moment().utc().startOf('day');
  let newChunkExpiry = null;
  dbg('Allocating channel chunk for today', today.toISOString());

  const channel = await Channel.findById(channelId).select('activeChunk chunkExpiry').lean().exec();
  let activeChunk = await ChannelChunk.findById(channel.activeChunk).select('id').lean().exec();

  if (!activeChunk) {
    dbg(`No chunk for channel #${channelId}. Making one afresh...`);
  } else if (moment(channel.chunkExpiry).isSameOrBefore(today, 'day')) {
    dbg(`Existing for channel #${channelId} has expired. Making one afresh...`);
  }

  if (!activeChunk || (moment(channel.chunkExpiry).isSameOrBefore(today, 'day'))) {
    // NOTICE: Addressing the concurrent update issue
    const result = await ChannelChunk.updateOne(
      {
        channelId,
        createdAt: today,
      }, {}, { upsert: true },
    ).exec();

    if (result.ok && result.upserted && result.upserted.length) {
      activeChunk = { _id: result.upserted[0]._id };
    } else if (result.ok) {
      dbg('Another process had created channel chunk');
      activeChunk = await ChannelChunk.findOne(
        {
          channelId,
          createdAt: today,
        },
      ).select('id').lean().exec();
    }

    newChunkExpiry = today.add(CHUNK_EXPIRE_IN, 'day');
  }

  if (newChunkExpiry) {
    dbg(`Updating active chunk #${activeChunk._id} and chunkExpiry for channel #${channelId}...`);
    await Channel.findByIdAndUpdate(channelId,
      {
        $set:
          {
            activeChunk: activeChunk._id,
            chunkExpiry: newChunkExpiry,
          },
      });
  } else {
    dbg(`Reusing existing chunk #${activeChunk._id} for channel #${channelId}...`);
  }

  return activeChunk._id;
}

export async function queryMessagesByAnchor(channelId, anchorISO = null) {
  const error404 = new Error('Channel/Chunk not found');
  error404.status = 404; // eslint-disable-line

  let chunk;

  if (!anchorISO) {
    const channel = await Channel.findById(channelId).lean().exec();
    if (!channel) {
      throw error404;
    }
    chunk = await ChannelChunk.findById(channel.activeChunk).lean().exec();
  } else {
    chunk = await ChannelChunk.findOne({
      channelId,
      createdAt: anchorISO.clone().startOf('day').toDate(), // Round down to beginning of day (UTC)
    }).lean().exec();
  }

  if (!chunk) {
    throw error404;
  } else {
    dbg(`Channel chunk #${chunk._id} contains ${(chunk.messages || []).length} messages`);
  }

  const anchorISOTimestamp = anchorISO && anchorISO.toDate().getTime();
  const messages = (chunk.messages || [])
    .filter(({ createdAt }) => !anchorISOTimestamp || createdAt.getTime() > anchorISOTimestamp);

  return messages;
}
