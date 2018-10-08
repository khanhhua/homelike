import URL from 'url';
import Route from 'route-parser';
import uuidV4 from 'uuid/v4';
import debug from 'debug';

const dbg = debug('services:sse-client');
const sockets = {};
const users = {};
const channels = {};

const personalRoute = new Route('/sse/users/:userId');
const channelRoute = new Route('/sse/channels/:channelId');

const packet = (type, data) => ({
  event: type,
  data,
});

/**
 *
 * @param params
 * @return {{uuid: string, socket, userId}[]}
 */
export const query = (params = {}) => {
  const { userId = null, channelId = null } = params;
  if (userId) {
    return users[userId].map(({ socket, uuid }) => ({ uuid, socket, userId }));
  }

  if (channelId) {
    return channels[channelId].map(({ socket, uuid }) => ({ uuid, socket, channelId }));
  }

  return Object.entries(sockets).map(([uuid, { socket, userId, channelId }]) => // eslint-disable-line
    ({ uuid, socket, userId, channelId })); // eslint-disable-line
};

export const registerClient = (socket, _query) => {
  const uuid = uuidV4();
  const url = URL.parse(socket.req.url);

  const { userId } = personalRoute.match(url.pathname) || {};
  const { channelId } = channelRoute.match(url.pathname) || {};

  if (!(userId || channelId)) {
    dbg('Invalid socket connection');
    socket.close();
    return;
  }

  sockets[uuid] = {
    socket,
    userId,
    channelId,
  };

  if (userId) {
    if (userId in users) {
      users[userId].push({ socket, uuid });
    } else {
      users[userId] = [{ socket, uuid }];
    }

    dbg(`Registered socket with process as user #${userId} => #${uuid}`);
  }

  if (channelId) {
    if (channelId in channels) {
      channels[channelId].push({ socket, uuid });
    } else {
      channels[channelId] = [{ socket, uuid }];
    }

    dbg(`Registered socket with process as channel #${channelId} => #${uuid}`);
  }

  socket.on('close', () => {
    dbg('Disconnecting...');

    if (userId) {
      const index = users[userId].findIndex(({ uuid: key }) => key === userId);

      if (index !== -1) {
        users[userId].splice(index, 1);
      }
    }

    if (channelId) {
      const index = channels[channelId].findIndex(({ uuid: key }) => key === userId);

      if (index !== -1) {
        channels[channelId].splice(index, 1);
      }
    }

    delete sockets[uuid];
  });
  socket.send(packet('pong', uuid.toString()));
};

export const sendTo = ({ userId, channelId }, message) => {
  let clientSockets;

  if (userId) {
    dbg(`Broadcasting to user #${userId}`);
    clientSockets = (users[userId] || []).map(({ socket }) => socket);
  } else if (channelId) {
    dbg(`Broadcasting to channel #${channelId}`);
    clientSockets = (channels[channelId] || []).map(({ socket }) => socket);
  } else {
    return;
  }

  let serializedMessage;
  if (typeof message === 'string') {
    serializedMessage = message;
  } else {
    serializedMessage = JSON.stringify(message);
  }

  clientSockets.forEach((socket) => {
    socket.send(packet('chat', serializedMessage));
  });
};
