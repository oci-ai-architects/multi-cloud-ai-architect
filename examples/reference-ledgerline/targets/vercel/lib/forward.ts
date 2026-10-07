// Portal-side helper. Self-contained on purpose: the Vercel project root is targets/vercel and
// must not import from ../../src.
const enc = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function authorised(request: Request, token: string | undefined): boolean {
  if (!token) return false;
  const given = request.headers.get('authorization') ?? '';
  const want = `Bearer ${token}`;
  if (given.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= given.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks the portal bearer token, signs the request, forwards it to the worker and returns the
 * worker's answer. The portal does no extraction and holds no model key.
 * Clerk SSO is not built; the bearer token stands in for it.
 */
export async function forward(request: Request, workerPath: string): Promise<Response> {
  const { PORTAL_API_TOKEN, RAILWAY_WORKER_URL, LEDGERLINE_SHARED_SECRET } = process.env;
  if (!RAILWAY_WORKER_URL || !LEDGERLINE_SHARED_SECRET) {
    return Response.json({ error: 'portal is not configured' }, { status: 503 });
  }
  if (!authorised(request, PORTAL_API_TOKEN)) return Response.json({ error: 'unauthorised' }, { status: 401 });
  const body = request.method === 'GET' ? '' : await request.text();
  const ts = String(Date.now());
  const signature = await hmacHex(LEDGERLINE_SHARED_SECRET, `${ts}.${request.method}.${workerPath}.${body}`);
  const upstream = await fetch(new URL(workerPath, RAILWAY_WORKER_URL), {
    method: request.method,
    headers: { 'content-type': 'application/json', 'x-ledgerline-timestamp': ts, 'x-ledgerline-signature': signature },
    ...(request.method === 'GET' ? {} : { body }),
  });
  return new Response(await upstream.text(), { status: upstream.status, headers: { 'content-type': 'application/json' } });
}
