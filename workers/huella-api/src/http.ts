import type { Env } from './env';

export function json(status: number, body: unknown, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(extra || {}),
    },
  });
}

export function ok(data: unknown) {
  return { success: true as const, data };
}

export function fail(code: string, message: string, status = 400) {
  return { body: { success: false as const, error: { code, message } }, status };
}

export function withCors(req: Request, env: Env, res: Response): Response {
  const origin = req.headers.get('origin') || '';
  const allowedList = (env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allow =
    allowedList.includes('*') || !origin
      ? '*'
      : allowedList.includes(origin)
        ? origin
        : allowedList[0] || '*';

  const headers = new Headers(res.headers);
  headers.set('access-control-allow-origin', allow);
  headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  headers.set(
    'access-control-allow-headers',
    'content-type, authorization, x-appwrite-user-jwt',
  );
  headers.set('access-control-max-age', '86400');
  headers.set('vary', 'origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
