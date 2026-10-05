import { forward } from '../../lib/forward.ts';

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).pathname.split('/').pop() ?? '';
  return forward(request, `/invoices/${encodeURIComponent(id)}`);
}
