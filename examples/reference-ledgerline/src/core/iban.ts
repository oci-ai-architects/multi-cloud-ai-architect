import { VENDORS, norm, normIban } from './accounting.ts';
import type { IbanStatus } from './types.ts';

/** The only module that writes an ibanStatus value. The model never sees the vendor master. */
export function checkIban(supplier: string, iban: string | null): {
  ibanStatus: IbanStatus;
  expected?: string;
  found?: string;
} {
  const vendor = VENDORS.find((v) => norm(v.name) === norm(supplier));
  if (!vendor) return { ibanStatus: 'unknown_vendor' };
  if (!iban) return { ibanStatus: 'missing', expected: vendor.iban };
  if (normIban(iban) === normIban(vendor.iban)) return { ibanStatus: 'match' };
  return { ibanStatus: 'mismatch', expected: vendor.iban, found: normIban(iban) };
}
