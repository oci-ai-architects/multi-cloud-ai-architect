// Synthetic accounting-system fixture. Suppliers, IBANs and amounts are invented for testing.
export interface Vendor { name: string; iban: string }
export interface PurchaseOrder { po: string; supplier: string; gross: number; receipt: string | null }

export const VENDORS: Vendor[] = [
  { name: 'Acme Tools BV', iban: 'NL91ABNA0417164300' },
  { name: 'Northbay Supplies Ltd', iban: 'GB82WEST12345698765432' },
  { name: 'Kestrel Components GmbH', iban: 'DE89370400440532013000' },
  { name: 'Meridian Freight BV', iban: 'NL02ABNA0123456789' },
  { name: 'Whitelake Services BV', iban: 'NL86INGB0002445588' },
  { name: 'Brightside Cleaning BV', iban: 'NL69INGB0123456789' },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { po: 'PO-2291', supplier: 'Acme Tools BV', gross: 1450.0, receipt: 'GR-1180' },
  { po: 'PO-2292', supplier: 'Acme Tools BV', gross: 600.0, receipt: 'GR-1181' },
  { po: 'PO-2293', supplier: 'Acme Tools BV', gross: 800.0, receipt: 'GR-1182' },
  { po: 'PO-NB-77', supplier: 'Northbay Supplies Ltd', gross: 900.0, receipt: 'GR-NB-77' },
  { po: 'PO-NB-80', supplier: 'Northbay Supplies Ltd', gross: 1000.0, receipt: 'GR-NB-80' },
  { po: 'PO-K-98', supplier: 'Kestrel Components GmbH', gross: 1452.0, receipt: 'GR-K-98' },
  { po: 'PO-MP-2207', supplier: 'Meridian Freight BV', gross: 5130.4, receipt: 'GR-MP-2207' },
  { po: 'PO-WL-21', supplier: 'Whitelake Services BV', gross: 1200.0, receipt: 'GR-WL-21' },
];

export const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ');
export const normIban = (s: string): string => s.replace(/\s+/g, '').toUpperCase();
