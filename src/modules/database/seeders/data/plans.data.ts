import { PlanSeed } from '../interfaces/plan-seed.interface';

export const plansSeed: PlanSeed[] = [
  {
    name: 'Basic',
    description: 'Basic subscription plan',
    active: true,
    features: {
      seats: 1,
    },
  },
  {
    name: 'Pro',
    description: 'Professional subscription plan',
    active: true,
    features: {
      seats: 5,
    },
  },
  {
    name: 'Premium',
    description: 'Premium subscription plan',
    active: true,
    features: {
      seats: 10,
    },
  },
];
