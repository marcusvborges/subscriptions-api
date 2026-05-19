import { BillingInterval } from '../../../plan/enum/billingInterval.enum';
import { PlanPriceSeed } from '../interfaces/plan-price-seed.interface';

export const planPricesSeed: PlanPriceSeed[] = [
  {
    planName: 'Basic',
    interval: BillingInterval.MONTH,
    amount: 19.9,
    currency: 'BRL',
    trialAvailable: false,
  },
  {
    planName: 'Pro',
    interval: BillingInterval.MONTH,
    amount: 49.9,
    currency: 'BRL',
    trialAvailable: true,
    trialDays: 7,
  },
  {
    planName: 'Premium',
    interval: BillingInterval.MONTH,
    amount: 99.9,
    currency: 'BRL',
    trialAvailable: true,
    trialDays: 14,
  },
  {
    planName: 'Basic',
    interval: BillingInterval.YEAR,
    amount: 199.9,
    currency: 'BRL',
    trialAvailable: false,
  },
  {
    planName: 'Pro',
    interval: BillingInterval.YEAR,
    amount: 499.9,
    currency: 'BRL',
    trialAvailable: true,
    trialDays: 7,
  },
  {
    planName: 'Premium',
    interval: BillingInterval.YEAR,
    amount: 999.9,
    currency: 'BRL',
    trialAvailable: true,
    trialDays: 14,
  },
];
