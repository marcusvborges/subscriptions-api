export interface PlanSeed {
  name: string;
  description: string;
  active: boolean;
  features: {
    seats: number;
  };
}
