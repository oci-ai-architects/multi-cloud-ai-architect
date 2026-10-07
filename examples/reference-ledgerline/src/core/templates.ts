export const TEMPLATES = {
  'missing-po-v2': (invoiceNumber: string, supplier: string) =>
    `Dear ${supplier}, we received invoice ${invoiceNumber} without a purchase order number. ` +
    'Please reply with the PO number so we can process it. Thank you, Accounts Payable.',
} as const;
