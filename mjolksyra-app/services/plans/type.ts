export type Plan = {
  id: string;
  name: string;
  monthlyPriceSek: number;
  includedAthletes: number;
  includedCreditsPerCycle: number;
  extraAthletePriceSek: number;
  sortOrder: number;
};
