/**
 * A tiny local HTTP API for Lesson 22, so every example runs OFFLINE and
 * gives the same answer every time. It listens on port 0, which means
 * "any free port": parallel runs never fight over a port.
 *
 *   GET  /api/health      200 { status: 'ok' }
 *   GET  /api/users/1     200 a valid user
 *   GET  /api/users/2     200 a BROKEN user (wrong shape, for validation demos)
 *   POST /api/users       201 the created user, or 400 if `email` is missing
 *   GET  /api/echo?...    200 { query, authorization } echoes what you sent
 *   GET  /api/slow        200 after 500 ms (for timeout demos)
 *   anything else         404 { error: 'Not Found' }
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { once } from 'node:events';

export interface TestServer {
  /** e.g. 'http://127.0.0.1:53124' */
  readonly baseUrl: string;
  close(): Promise<void>;
}

const sendJson = (res: ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString('utf8');
  return text === '' ? {} : JSON.parse(text);
}

export async function startTestServer(): Promise<TestServer> {
  let nextUserId = 1;

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = `${req.method} ${url.pathname}`;

    if (route === 'GET /api/health') return sendJson(res, 200, { status: 'ok' });
    if (route === 'GET /api/users/1') {
      return sendJson(res, 200, { id: '1', email: 'ada@example.test', roles: ['admin'] });
    }
    if (route === 'GET /api/users/2') return sendJson(res, 200, { id: 2, mail: 'oops' });
    if (route === 'GET /api/echo') {
      return sendJson(res, 200, {
        query: Object.fromEntries(url.searchParams),
        authorization: req.headers.authorization ?? null,
      });
    }
    if (route === 'POST /api/users') {
      const body = await readBody(req);
      const email =
        typeof body === 'object' && body !== null && 'email' in body ? body.email : undefined;
      if (typeof email !== 'string' || email === '') {
        return sendJson(res, 400, { error: 'email is required' });
      }
      return sendJson(res, 201, { id: `u-${nextUserId++}`, email, roles: ['member'] });
    }
    if (route === 'GET /api/slow') {
      const timer = setTimeout(() => sendJson(res, 200, { slow: true }), 500);
      res.on('close', () => clearTimeout(timer)); // the client gave up: stop working
      return;
    }
    return sendJson(res, 404, { error: 'Not Found' });
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('Server has no port');

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      server.closeAllConnections(); // drop idle keep-alive sockets, or close() waits for them
      server.close();
      await once(server, 'close');
    },
  };
}
