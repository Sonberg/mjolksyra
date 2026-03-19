export type Plan = {
  id: string;
  name: string;
  monthlyPriceSek: number;
  includedAthletes: number;
  extraAthletePriceSek: number;
  sortOrder: number;
  includedCreditsPerCycle: number;
};
