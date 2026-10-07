import type { IbanStatus, MatchStatus, ToolCall } from './types.ts';

export interface DraftGuard {
  requireIbanMatch: boolean;
  requireMatched: boolean;
  requireNotDuplicate: boolean;
}
export const DEFAULT_GUARD: DraftGuard = { requireIbanMatch: true, requireMatched: true, requireNotDuplicate: true };

/**
 * The single enforcement point for creating a payment draft. All three inputs are written by code
 * (iban.ts, match.ts, the duplicate index). The model holds no tool and cannot reach this function.
 */
export function createPaymentDraft(
  call: { invoiceId: string; ibanStatus: IbanStatus; matchStatus: MatchStatus; duplicate: boolean },
  guard: DraftGuard,
  log: ToolCall[],
): { draftId: string } | { refused: string } {
  const reasons: string[] = [];
  if (guard.requireIbanMatch && call.ibanStatus !== 'match') reasons.push(`ibanStatus ${call.ibanStatus}`);
  if (guard.requireMatched && call.matchStatus !== 'matched') reasons.push(`matchStatus ${call.matchStatus}`);
  if (guard.requireNotDuplicate && call.duplicate) reasons.push('duplicate');
  if (reasons.length > 0) {
    const reason = reasons.join(', ');
    log.push({ tool: 'create_payment_draft', outcome: 'refused', reason });
    return { refused: reason };
  }
  log.push({ tool: 'create_payment_draft', outcome: 'ok' });
  return { draftId: `draft-${call.invoiceId}` };
}
