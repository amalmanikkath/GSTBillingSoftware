export interface GstResult {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
}

/**
 * Calculates GST based on intra-state or inter-state rules.
 * 
 * @param basePrice - Price per unit
 * @param qty - Quantity
 * @param supplierState - 2-digit GST state code of supplier
 * @param customerState - 2-digit GST state code of customer
 * @param taxRate - GST rate (e.g., 18 for 18%)
 * @param isInclusive - true if basePrice includes GST
 */
export function calculateGst(
  basePrice: number,
  qty: number,
  supplierState: number,
  customerState: number,
  taxRate: number,
  isInclusive: boolean = false
): GstResult {
  let taxableValue = 0;
  let totalAmount = 0;

  if (isInclusive) {
    totalAmount = basePrice * qty;
    taxableValue = totalAmount / (1 + taxRate / 100);
  } else {
    taxableValue = basePrice * qty;
    totalAmount = taxableValue * (1 + taxRate / 100);
  }

  const totalTax = totalAmount - taxableValue;
  const isIntraState = supplierState === customerState;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIntraState) {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  } else {
    igst = totalTax;
  }

  return {
    taxableValue: Number(taxableValue.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * Utility to format currency in INR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}
