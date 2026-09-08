/**
 * Servidor HTTP para Render (Web Service).
 * Mismo contrato que Appwrite Function: POST { action, payload }
 *
 * Render:
 *   Root Directory: functions/huella-api
 *   Build: npm install
 *   Start: npm start
 *   Health: GET /
 */
import http from 'node:http';
import { dispatch } from './src/router/router.js';
import { handleError } from './src/middleware/error-handler.js';

const PORT = Number(process.env.PORT) || 10000;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function corsHeaders(origin) {
  const allowed = (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allow =
    allowed.includes('*') || !origin
      ? '*'
      : allowed.includes(origin)
        ? origin
        : allowed[0] || '*';

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Appwrite-User-JWT, X-Appwrite-Project',
    'Access-Control-Max-Age': '86400',
  };
}

function send(res, status, body, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders(origin),
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

/** Adapta IncomingMessage al shape que espera el router (req.headers, bodyJson). */
function toDispatchReq(nodeReq, body) {
  const headers = {};
  for (const [k, v] of Object.entries(nodeReq.headers || {})) {
    headers[String(k).toLowerCase()] = Array.isArray(v) ? v[0] : v;
  }

  // Authorization: Bearer <jwt> → x-appwrite-user-jwt
  const auth = headers['authorization'] || '';
  if (auth.toLowerCase().startsWith('bearer ') && !headers['x-appwrite-user-jwt']) {
    headers['x-appwrite-user-jwt'] = auth.slice(7).trim();
  }

  return {
    headers,
    bodyJson: body,
    body: JSON.stringify(body),
    method: nodeReq.method,
  };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    return res.end();
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    return send(
      res,
      200,
      {
        success: true,
        data: {
          service: 'huella-api',
          runtime: 'render',
          version: '2.0.0',
          hint: 'POST { action, payload }',
        },
      },
      origin,
    );
  }

  if (req.method !== 'POST') {
    return send(
      res,
      405,
      { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
      origin,
    );
  }

  try {
    const body = await readBody(req);
    const dispatchReq = toDispatchReq(req, body);
    const result = await dispatch(dispatchReq, console.log);
    return send(res, 200, result, origin);
  } catch (err) {
    console.error('[huella-api]', err?.stack || err);
    const { status, body } = handleError(err, console.error);
    return send(res, status, body, origin);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[huella-api] listening on 0.0.0.0:${PORT}`);
});
