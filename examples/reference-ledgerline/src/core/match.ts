import { PURCHASE_ORDERS, norm } from './accounting.ts';
import type { MatchStatus } from './types.ts';

export const TOLERANCE_PCT = 1;

/** Three-way match in code: PO exists for the supplier, goods receipt exists, gross within tolerance. */
export function threeWayMatch(supplier: string, poNumber: string | null, gross: number): {
  matchStatus: MatchStatus;
  differencePct?: number;
} {
  if (!poNumber) return { matchStatus: 'no_po' };
  const po = PURCHASE_ORDERS.find((p) => p.po === poNumber && norm(p.supplier) === norm(supplier));
  if (!po) return { matchStatus: 'no_po' };
  if (!po.receipt) return { matchStatus: 'no_receipt' };
  const differencePct = Math.round(((gross - po.gross) / po.gross) * 10000) / 100;
  if (Math.abs(differencePct) <= TOLERANCE_PCT) return { matchStatus: 'matched', differencePct };
  return { matchStatus: 'mismatch', differencePct };
}
