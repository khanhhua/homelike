const baseURL = 'http://localhost:3000/api';

export async function loadChannels() {
  const body = await fetch(`${baseURL}/channels`).then(res => res.json());

  return body;
}

export async function loadChannel(id, { anchor }) {
  const body = await fetch(`${baseURL}/channels/${id}?anchor=${anchor || 0}`).then(res => res.json());

  return body;
}
