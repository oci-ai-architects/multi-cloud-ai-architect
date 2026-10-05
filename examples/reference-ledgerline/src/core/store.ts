import type { InvoiceRecord } from './types.ts';

/** In-memory store. Durable storage (Postgres on Railway, D1 or a Durable Object on Cloudflare) is not built. */
export class MemoryStore {
  private records = new Map<string, InvoiceRecord>();
  private keys = new Map<string, string>();
  private counter = 0;

  nextId(): string {
    this.counter += 1;
    return `inv-${String(this.counter).padStart(4, '0')}`;
  }
  put(r: InvoiceRecord): void { this.records.set(r.id, r); }
  get(id: string): InvoiceRecord | undefined { return this.records.get(id); }
  firstWithKey(key: string): string | undefined { return this.keys.get(key); }
  setKey(key: string, id: string): void { if (!this.keys.has(key)) this.keys.set(key, id); }
  clear(): void { this.records.clear(); this.keys.clear(); this.counter = 0; }
}
