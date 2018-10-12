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

export async function register(email, password) {
  const body = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    cache: 'no-cache',
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  }).then(res => res.json());

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
  }).then(res => res.json());

  return body;
}

export async function loadChannels() {
  const body = await fetch(`${baseURL}/channels`, {
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(res => res.json());

  if (body.ok) {
    return body.channels;
  }

  return body;
}

export async function loadChannel(id, { anchor }) {
  const body = await fetch(`${baseURL}/channels/${id}?anchor=${anchor || 0}`, {
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(res => res.json());

  if (body.ok) {
    return body.channel;
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
  }).then(res => res.json());

  if (body.ok) {
    return body.message;
  }

  return body;
}

export async function loadProfile() {
  const body = await fetch(`${baseURL}/profile`, {
    method: 'GET',
    headers: createHeaders(),
    cache: 'no-cache',
  }).then(res => res.json());

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
  }).then(res => res.json());

  if (body.ok) {
    return body.profile;
  }

  return body;
}
