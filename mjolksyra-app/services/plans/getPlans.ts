import type { Plan } from "./type";

export async function getPlans(): Promise<Plan[]> {
  const res = await fetch("/api/plans", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json();
}
