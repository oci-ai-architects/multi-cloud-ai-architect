// HMAC request signing between portal and worker. Web Crypto only, so it runs in Workers, Node and Vercel.
const enc = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const MAX_SKEW_MS = 5 * 60 * 1000;

export async function signRequest(secret: string, method: string, path: string, body: string, now = Date.now()) {
  const ts = String(now);
  const signature = await hmacHex(secret, `${ts}.${method}.${path}.${body}`);
  return { 'x-ledgerline-timestamp': ts, 'x-ledgerline-signature': signature };
}

export async function verifyRequest(secret: string, req: Request, path: string, body: string, now = Date.now()): Promise<boolean> {
  const ts = req.headers.get('x-ledgerline-timestamp');
  const sig = req.headers.get('x-ledgerline-signature');
  if (!ts || !sig || !/^\d+$/.test(ts)) return false;
  if (Math.abs(now - Number(ts)) > MAX_SKEW_MS) return false;
  const expected = await hmacHex(secret, `${ts}.${req.method}.${path}.${body}`);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
