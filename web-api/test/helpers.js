import makeApp from "../src/app";
import supertest from "supertest";

export function withAccesToken(accessToken, method) {
  return method.bind({ accessToken });
}

export async function post(url, data) {
  const app = makeApp();
  const req = supertest(app.callback())
    .post(url)
    .set('Content-Type', 'application/json');
  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  await seq.send(data);
}

export async function get(url, data) {
  const app = makeApp();
  const req = supertest(app.callback())
    .get(url)
    .set('Content-Type', 'application/json');

  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  await seq.send(data);
}

export async function put(url, data, expectedStatus) {
  const app = makeApp();
  const req = supertest(app.callback())
    .put(url)
    .set('Content-Type', 'application/json');

  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  return req.send(data);
}


export async function getExpect(url, expectedStatus) {
  const app = makeApp();
  const req = supertest(app.callback())
    .get(url)
    .set('Content-Type', 'application/json');

  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  return req.send()
    .expect(expectedStatus);
}

export async function postExpect(url, data, expectedStatus) {
  const app = makeApp();
  const req = supertest(app.callback())
    .post(url)
    .set('Content-Type', 'application/json');

  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  return req.send(data)
    .expect(expectedStatus);
}

export async function putExpect(url, data, expectedStatus) {
  const app = makeApp();
  const req = supertest(app.callback())
    .put(url)
    .set('Content-Type', 'application/json');

  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  return req.send(data)
    .expect(expectedStatus);
}

export async function delExpect(url, expectedStatus) {
  const app = makeApp();
  const req = supertest(app.callback())
    .delete(url)
    .set('Content-Type', 'application/json');

  if (this && this.accessToken) {
    req.set('Authorization', `Bearer ${this.accessToken}`);
  }

  return req.send()
    .expect(expectedStatus);
}

export function mockQuery(result) {
  return {
    select() {
      return this;
    },
    limit() {
      return this;
    },
    lean() {
      return this;
    },
    exec() {
      return Promise.resolve(result);
    },
  };
}
