import {
  computePlanCost,
  pickCheapestPlan,
  sortPlans,
} from "./calculatorUtils";
import type { Plan } from "@/services/plans/type";

const plans: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    monthlyPriceSek: 399,
    includedAthletes: 10,
    extraAthletePriceSek: 39,
    sortOrder: 2,
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPriceSek: 199,
    includedAthletes: 5,
    extraAthletePriceSek: 49,
    sortOrder: 1,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPriceSek: 699,
    includedAthletes: 20,
    extraAthletePriceSek: 29,
    sortOrder: 3,
  },
];

describe("calculatorUtils", () => {
  describe("computePlanCost", () => {
    test("returns base monthly price when athlete count is below included athletes", () => {
      expect(computePlanCost(plans[0], 7)).toBe(399);
    });

    test("returns base monthly price when athlete count equals included athletes", () => {
      expect(computePlanCost(plans[0], 10)).toBe(399);
    });

    test("adds overage athletes above included athletes", () => {
      expect(computePlanCost(plans[0], 13)).toBe(516);
    });
  });

  describe("pickCheapestPlan", () => {
    test("returns cheapest plan by total cost for athlete count", () => {
      expect(pickCheapestPlan(plans, 8)?.id).toBe("pro");
    });

    test("respects tie order from sorted plans", () => {
      const tiePlans: Plan[] = [
        {
          id: "a",
          name: "A",
          monthlyPriceSek: 399,
          includedAthletes: 10,
          extraAthletePriceSek: 39,
          sortOrder: 2,
        },
        {
          id: "b",
          name: "B",
          monthlyPriceSek: 399,
          includedAthletes: 10,
          extraAthletePriceSek: 39,
          sortOrder: 1,
        },
      ];

      expect(pickCheapestPlan(tiePlans, 10)?.id).toBe("b");
    });

    test("returns null for empty plans", () => {
      expect(pickCheapestPlan([], 10)).toBeNull();
    });
  });

  describe("sortPlans", () => {
    test("sorts by sortOrder then monthlyPriceSek", () => {
      const sorted = sortPlans([
        {
          id: "x",
          name: "X",
          monthlyPriceSek: 499,
          includedAthletes: 5,
          extraAthletePriceSek: 39,
          sortOrder: 2,
        },
        {
          id: "y",
          name: "Y",
          monthlyPriceSek: 299,
          includedAthletes: 5,
          extraAthletePriceSek: 39,
          sortOrder: 2,
        },
        {
          id: "z",
          name: "Z",
          monthlyPriceSek: 999,
          includedAthletes: 5,
          extraAthletePriceSek: 39,
          sortOrder: 1,
        },
      ]);

      expect(sorted.map((x) => x.id)).toEqual(["z", "y", "x"]);
    });
  });
});
