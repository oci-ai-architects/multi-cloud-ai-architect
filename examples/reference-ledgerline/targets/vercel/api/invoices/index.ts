import { forward } from '../../lib/forward.ts';

export async function POST(request: Request): Promise<Response> {
  return forward(request, '/invoices');
}
