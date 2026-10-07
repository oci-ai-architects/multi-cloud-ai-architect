import { ExtractionSchema } from './schema.ts';
import { norm } from './accounting.ts';
import { checkIban } from './iban.ts';
import { threeWayMatch } from './match.ts';
import { createPaymentDraft, DEFAULT_GUARD, type DraftGuard } from './draft.ts';
import { TEMPLATES } from './templates.ts';
import type { MemoryStore } from './store.ts';
import type { Extraction, IngestRequest, InvoiceRecord, ModelSeam } from './types.ts';

export interface PipelineDeps {
  store: MemoryStore;
  seam: ModelSeam;
  guard?: DraftGuard;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
export const dupKey = (e: Extraction): string => `${norm(e.supplier)}|${norm(e.invoiceNumber)}|${round2(e.gross).toFixed(2)}`;

export function newRecord(store: MemoryStore): InvoiceRecord {
  const rec: InvoiceRecord = { id: store.nextId(), status: 'queued', flags: [], contentNotes: [], trace: [], toolCalls: [] };
  store.put(rec);
  return rec;
}

function needsHuman(rec: InvoiceRecord, reason: string): void {
  rec.status = 'needs_human';
  rec.reason = reason;
}

/** Fixed step list. The model chooses nothing about what happens next. */
export async function runPipeline(rec: InvoiceRecord, req: IngestRequest, deps: PipelineDeps): Promise<void> {
  const { store, seam } = deps;
  const guard = deps.guard ?? DEFAULT_GUARD;
  rec.status = 'processing';
  rec.trace.push({ span: 'ingest.start' });

  // Step 1: text. Hidden spans are logged and withheld from the model. Scanned pages go through OCR.
  const doc = req.document;
  const hidden = doc.textLayer.filter((s) => s.hidden);
  for (const h of hidden) {
    rec.trace.push({ span: 'text.hidden_span_logged', detail: { text: h.text } });
    rec.contentNotes.push({ kind: 'hidden_span', untrusted: true, text: h.text });
  }
  let text = doc.textLayer.filter((s) => !s.hidden).map((s) => s.text).join('\n');
  if (text.trim() === '') {
    if (doc.ocrFixtureText) {
      rec.trace.push({ span: 'ocr.run', detail: { pages: doc.pages } });
      text = doc.ocrFixtureText;
    } else {
      rec.trace.push({ span: 'ocr.unavailable' });
      return needsHuman(rec, 'empty text layer and no OCR output');
    }
  }

  if (req.emailBody) {
    rec.contentNotes.push({ kind: 'email', untrusted: true, text: req.emailBody });
  }

  // Step 2: model extraction, then validation in code.
  let fields: Extraction;
  try {
    rec.trace.push({ span: 'model.extract', detail: { seam: seam.id } });
    const raw = await seam.extractInvoice(text);
    const parsed = ExtractionSchema.safeParse(raw);
    if (!parsed.success) {
      rec.trace.push({ span: 'validate.failed', detail: { issues: parsed.error.issues.length } });
      return needsHuman(rec, `extraction failed schema validation: ${parsed.error.issues[0]?.message ?? 'unknown'}`);
    }
    fields = parsed.data;
  } catch (err) {
    rec.trace.push({ span: 'model.error' });
    return needsHuman(rec, `model error: ${err instanceof Error ? err.message : 'unknown'}`);
  }
  rec.fields = fields;
  const lineSum = round2(fields.lines.reduce((a, l) => a + l.amount, 0));
  if (fields.lines.length > 0 && Math.abs(lineSum - fields.net) > 0.005) {
    rec.flags.push({ code: 'line_total_mismatch', detail: { lineSum, net: fields.net } });
  }
  if (Math.abs(round2(fields.net + fields.tax) - fields.gross) > 0.005) {
    rec.flags.push({ code: 'gross_arithmetic_mismatch', detail: { net: fields.net, tax: fields.tax, gross: fields.gross } });
  }

  // Step 3: deterministic checks.
  const key = dupKey(fields);
  const first = store.firstWithKey(key);
  const duplicate = first !== undefined && first !== rec.id;
  rec.trace.push({ span: 'duplicate.checked', detail: { duplicate } });
  if (duplicate) {
    rec.duplicateOf = first;
    rec.status = 'duplicate';
    rec.reason = `duplicate of ${first}`;
    rec.flags.push({ code: 'duplicate', detail: { of: first } });
    return finishWithExplanation(rec, text, req, deps);
  }
  store.setKey(key, rec.id);

  const iban = checkIban(fields.supplier, fields.iban);
  rec.ibanStatus = iban.ibanStatus;
  rec.trace.push({ span: 'iban.checked', detail: { ibanStatus: iban.ibanStatus } });
  if (iban.ibanStatus === 'mismatch') {
    rec.flags.push({ code: 'iban_mismatch', detail: { expected: iban.expected ?? null, found: iban.found ?? null } });
  } else if (iban.ibanStatus !== 'match') {
    rec.flags.push({ code: `iban_${iban.ibanStatus}`, detail: {} });
  }

  const match = threeWayMatch(fields.supplier, fields.poNumber, fields.gross);
  rec.matchStatus = match.matchStatus;
  if (match.differencePct !== undefined) rec.matchDifferencePct = match.differencePct;
  rec.trace.push({ span: 'match.done', detail: { matchStatus: match.matchStatus } });
  if (match.matchStatus !== 'matched') {
    rec.flags.push({ code: `match_${match.matchStatus}`, detail: { differencePct: match.differencePct ?? null } });
  }
  if (match.matchStatus === 'no_po') {
    rec.supplierQuery = {
      templateId: 'missing-po-v2',
      text: TEMPLATES['missing-po-v2'](fields.invoiceNumber, fields.supplier),
      sent: false,
    };
  }

  // Step 4: the draft tool is the single enforcement point. Arithmetic flags go to a human first.
  const soft = rec.flags.filter((f) => f.code === 'line_total_mismatch' || f.code === 'gross_arithmetic_mismatch');
  if (soft.length > 0) {
    needsHuman(rec, `flags: ${soft.map((f) => f.code).join(', ')}`);
  } else {
    const result = createPaymentDraft(
      { invoiceId: rec.id, ibanStatus: iban.ibanStatus, matchStatus: match.matchStatus, duplicate },
      guard,
      rec.toolCalls,
    );
    if ('draftId' in result) {
      rec.draftId = result.draftId;
      rec.status = 'ready';
      rec.trace.push({ span: 'draft.create' }, { span: 'invoice.ready' });
    } else {
      rec.trace.push({ span: 'draft.refused', detail: { reason: result.refused } });
      needsHuman(rec, `draft refused: ${result.refused}`);
    }
  }
  return finishWithExplanation(rec, text, req, deps);
}

async function finishWithExplanation(rec: InvoiceRecord, text: string, req: IngestRequest, deps: PipelineDeps): Promise<void> {
  if (rec.flags.length === 0 && !req.emailBody) return;
  try {
    rec.trace.push({ span: 'model.explain', detail: { seam: deps.seam.id } });
    rec.explanation = await deps.seam.explainFlag({
      flags: rec.flags,
      untrustedInvoiceText: text,
      ...(req.emailBody ? { untrustedEmailBody: req.emailBody } : {}),
    });
  } catch {
    rec.trace.push({ span: 'model.explain_error' });
  }
}
