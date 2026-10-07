import { forward } from '../../../lib/forward.ts';

export async function POST(request: Request): Promise<Response> {
  const parts = new URL(request.url).pathname.split('/');
  const id = parts[parts.length - 2] ?? '';
  return forward(request, `/invoices/${encodeURIComponent(id)}/messages`);
}
