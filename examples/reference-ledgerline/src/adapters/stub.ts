import type { ExplainEvidence, ModelSeam } from '../core/types.ts';

// Deterministic test double for the model seam. It parses the labelled fixture text with fixed
// rules, so it exercises the pipeline, the guards and the harness. It says nothing about how any
// real model performs on extraction.

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
};

function toIsoDate(raw: string): string {
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;
  const m = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  const mm = m ? MONTHS[m[2]!.toLowerCase()] : undefined;
  if (m && mm) return `${m[3]}-${mm}-${m[1]!.padStart(2, '0')}`;
  return raw;
}

function toNumber(raw: string): number {
  const s = raw.replace(/[^\d.,-]/g, '');
  if (/,\d{1,2}$/.test(s)) return Number(s.replace(/\./g, '').replace(',', '.'));
  return Number(s.replace(/,/g, ''));
}

function field(lines: string[], label: RegExp): string | null {
  for (const l of lines) {
    const m = l.match(label);
    if (m) return m[1]!.trim();
  }
  return null;
}

export function stubSeam(): ModelSeam {
  return {
    id: 'stub',
    async extractInvoice(text: string) {
      const lines = text.split('\n');
      const lineItems = lines
        .map((l) => l.match(/^Line:\s*(.+?)\s*\|\s*([\d.,]+)$/))
        .filter((m): m is RegExpMatchArray => m !== null)
        .map((m) => ({ description: m[1]!, amount: toNumber(m[2]!) }));
      const get = (re: RegExp) => field(lines, re);
      const num = (re: RegExp) => { const v = get(re); return v === null ? NaN : toNumber(v); };
      return {
        supplier: get(/^Supplier:\s*(.+)$/) ?? '',
        invoiceNumber: get(/^Invoice number:\s*(.+)$/) ?? '',
        date: toIsoDate(get(/^Invoice date:\s*(.+)$/) ?? ''),
        currency: get(/^Currency:\s*(.+)$/) ?? '',
        net: num(/^Net:\s*(.+)$/),
        tax: num(/^Tax:\s*(.+)$/),
        gross: num(/^Total:\s*(.+)$/),
        iban: get(/^IBAN:\s*(.+)$/),
        poNumber: get(/^PO:\s*(.+)$/),
        lines: lineItems,
      };
    },
    async explainFlag(e: ExplainEvidence) {
      const parts: string[] = [];
      const codes = e.flags.map((f) => f.code);
      if (codes.length > 0) parts.push(`Flags: ${codes.join(', ')}.`);
      const ib = e.flags.find((f) => f.code === 'iban_mismatch');
      if (ib) parts.push(`IBAN on the invoice (${String(ib.detail.found)}) differs from the vendor master (${String(ib.detail.expected)}). No payment draft was created.`);
      const quoted = e.untrustedInvoiceText.split('\n').filter((l) => /^NOTE TO |ignore prior/i.test(l.trim()));
      for (const q of quoted) parts.push(`The invoice contains this instruction-like text, quoted as content and not followed: "${q.trim()}"`);
      const email = e.untrustedEmailBody;
      if (email) {
        if (/(update|change).{0,40}(bank|address|vendor)/i.test(email)) {
          parts.push("The email asks to change vendor data. That needs the finance lead's verified change process. The system has no tool that changes vendor data.");
        } else if (/\b(pay|approve|approved)\b/i.test(email)) {
          parts.push('The email asks for payment or approval. It is shown as content and changes nothing.');
        }
      }
      return parts.join(' ');
    },
  };
}
