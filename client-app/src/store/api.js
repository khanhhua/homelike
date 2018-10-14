const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

function createHeaders() {
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${authToken}`,
    };
  }

  return {
    'Content-Type': 'application/json; charset=utf-8',
  };
}

async function standardResponseHandler(res) {
  const json = await res.json();
  if (!json.ok) {
    throw json;
  }
  return json;
}

export async function register(email, password) {
  const body = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    cache: 'no-cache',
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  }).then(standardResponseHandler);

  if (body.ok) {
    return true;
  }

  return body;
}

export async function authenticate(email, password) {
  const body = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    cache: 'no-cache',
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  }).then(standardResponseHandler);

  return body;
}

export async function findUsers(userIds) {
  const body = await fetch(`${baseURL}/users?${userIds.map(id => `ids=${id}`).join('&')}`, {
    method: 'GET',
    cache: 'no-cache',
    headers: createHeaders(),
  }).then(standardResponseHandler);

  if (body.ok) {
    return body.users;
  }

  return body;
}

export async function loadChannels() {
  const body = await fetch(`${baseURL}/channels`, {
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(standardResponseHandler);

  if (body.ok) {
    return (body.channels || []).map(item => ({ ...item, chatters: item.chatters.map(id => ({ id })) }));
  }

  return body;
}

export async function loadChannel(id, { anchor }) {
  const body = await fetch(`${baseURL}/channels/${id}?anchor=${anchor || ''}`, {
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(standardResponseHandler);

  if (body.ok) {
    const { channel } = body;
    const chatters = await findUsers(channel.chatters);

    return { ...channel, chatters };
  }

  return body;
}

export async function sendMessage(channelId, message) {
  const body = await fetch(`${baseURL}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: createHeaders(),
    cache: 'no-cache',
    body: JSON.stringify({
      text: message,
    }),
  }).then(standardResponseHandler);

  if (body.ok) {
    return body.message;
  }

  return body;
}

export async function updateMessage(channelId, messageId, message) {
  const body = await fetch(`${baseURL}/channels/${channelId}/messages/${messageId}`, {
    method: 'PUT',
    headers: createHeaders(),
    cache: 'no-cache',
    body: JSON.stringify({
      text: message,
    }),
  }).then(standardResponseHandler);

  if (body.ok) {
    return body.message;
  }

  return body;
}

export async function removeMessage(channelId, messageId) {
  const body = await fetch(`${baseURL}/channels/${channelId}/messages/${messageId}`, {
    method: 'DELETE',
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(standardResponseHandler);

  if (body.ok) {
    return true;
  }

  return body;
}


export async function loadProfile() {
  const body = await fetch(`${baseURL}/profile`, {
    method: 'GET',
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(standardResponseHandler);

  if (body.ok) {
    return body.profile;
  }

  return body;
}

export async function saveProfile(profile) {
  const body = await fetch(`${baseURL}/profile`, {
    method: 'PUT',
    headers: createHeaders(),
    cache: 'no-cache',
    body: JSON.stringify(profile),
  }).then(standardResponseHandler);

  if (body.ok) {
    return body.profile;
  }

  return body;
}
