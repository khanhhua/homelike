const baseURL = 'http://localhost:3000/api';

export async function loadChannels() {
  const body = await fetch(`${baseURL}/channels`).then(res => res.json());

  return body;
}

export async function loadChannel(id) {
  const body = await fetch(`${baseURL}/channels/${id}`).then(res => res.json());

  return body;
}
