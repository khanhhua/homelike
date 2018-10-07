const baseURL = 'http://localhost:3000/api';

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

export async function authenticate(email, password) {
  const body = await fetch(`${baseURL}/auth`, {
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
  }).then(res => res.json());

  return body;
}

export async function loadChannel(id, { anchor }) {
  const body = await fetch(`${baseURL}/channels/${id}?anchor=${anchor || 0}`, {
    headers: createHeaders(),
  }).then(res => res.json());

  return body;
}
