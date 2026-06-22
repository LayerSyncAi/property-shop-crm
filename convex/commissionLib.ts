/**
 * Commission calculation helpers.
 *
 * Business rule: the gross commission earned on a closed deal is a fixed
 * percentage of the sale value (the "commission rate"). The split percentages
 * configured per scenario (property agent / lead agent / company) describe how
 * that commission pool is divided — they sum to 100% of the COMMISSION, not of
 * the sale value.
 *
 *   commissionAmount  = dealValue * COMMISSION_RATE      // e.g. 5% of the sale
 *   <party>Amount     = commissionAmount * <party>Percent / 100
 */

/** Fixed gross commission rate applied to the sale value (5%). */
export const COMMISSION_RATE = 0.05;

/** The commission rate expressed as a whole-number percentage (5). */
export const COMMISSION_RATE_PERCENT = COMMISSION_RATE * 100;

/** Gross commission pool earned on a deal of the given sale value. */
export function commissionPool(dealValue: number): number {
  return dealValue * COMMISSION_RATE;
}

export interface CommissionSplitPercents {
  propertyAgentPercent: number;
  leadAgentPercent: number;
  companyPercent: number;
}

export interface CommissionSplit {
  /** Gross commission pool (sale value * COMMISSION_RATE). */
  commissionAmount: number;
  propertyAgentAmount: number;
  leadAgentAmount: number;
  companyAmount: number;
}

/**
 * Split the gross commission pool among the three parties. The percentages are
 * shares of the commission pool and are expected to sum to 100.
 */
export function computeCommissionSplit(
  dealValue: number,
  { propertyAgentPercent, leadAgentPercent, companyPercent }: CommissionSplitPercents
): CommissionSplit {
  const commissionAmount = commissionPool(dealValue);
  return {
    commissionAmount,
    propertyAgentAmount: (commissionAmount * propertyAgentPercent) / 100,
    leadAgentAmount: (commissionAmount * leadAgentPercent) / 100,
    companyAmount: (commissionAmount * companyPercent) / 100,
  };
}
