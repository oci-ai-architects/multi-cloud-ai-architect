export type Status = 'queued' | 'processing' | 'ready' | 'needs_human' | 'duplicate';
export type IbanStatus = 'match' | 'mismatch' | 'unknown_vendor' | 'missing';
export type MatchStatus = 'matched' | 'mismatch' | 'no_po' | 'no_receipt';

export interface Span {
  text: string;
  /** White-on-white or otherwise invisible text found in the PDF text layer. */
  hidden?: boolean;
}

/**
 * The document as the extraction layer hands it over. Real PDF parsing and OCR are not
 * implemented in this reference build: fixtures supply the text layer, and `ocrFixtureText`
 * stands in for an OCR engine's output on scanned pages.
 */
export interface DocumentInput {
  pages: number;
  textLayer: Span[];
  scanned?: boolean;
  ocrFixtureText?: string;
}

export interface IngestRequest {
  document: DocumentInput;
  emailBody?: string;
}

export interface MessageRequest {
  kind: 'email' | 'reply';
  body: string;
}

export interface Line {
  description: string;
  amount: number;
}

export interface Extraction {
  supplier: string;
  invoiceNumber: string;
  date: string;
  currency: string;
  net: number;
  tax: number;
  gross: number;
  iban: string | null;
  poNumber: string | null;
  lines: Line[];
}

export interface Flag {
  code: string;
  detail: Record<string, string | number | boolean | null>;
}

export interface TraceEntry {
  span: string;
  detail?: Record<string, string | number | boolean | null>;
}

export interface ToolCall {
  tool: string;
  outcome: 'ok' | 'refused';
  reason?: string;
}

export interface ContentNote {
  kind: 'email' | 'reply' | 'hidden_span';
  untrusted: true;
  text: string;
}

export interface InvoiceRecord {
  id: string;
  status: Status;
  reason?: string;
  fields?: Extraction;
  matchStatus?: MatchStatus;
  matchDifferencePct?: number;
  ibanStatus?: IbanStatus;
  duplicateOf?: string;
  draftId?: string;
  flags: Flag[];
  explanation?: string;
  supplierQuery?: { templateId: string; text: string; sent: false };
  contentNotes: ContentNote[];
  trace: TraceEntry[];
  toolCalls: ToolCall[];
}

/** The model seam. Product code calls these two tasks and never names a provider. */
export interface ModelSeam {
  readonly id: string;
  extractInvoice(untrustedInvoiceText: string): Promise<unknown>;
  explainFlag(evidence: ExplainEvidence): Promise<string>;
}

export interface ExplainEvidence {
  flags: Flag[];
  untrustedInvoiceText: string;
  untrustedEmailBody?: string;
}
