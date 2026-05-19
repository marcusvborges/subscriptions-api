import { BillingInterval } from '../../../plan/enum/billingInterval.enum';

export interface PlanPriceSeed {
  planName: string;
  interval: BillingInterval;
  amount: number;
  currency: string;
  trialAvailable: boolean;
  trialDays?: number;
}
