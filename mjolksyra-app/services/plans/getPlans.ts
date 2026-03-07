import type { Plan } from "./type";

export async function getPlans(): Promise<Plan[]> {
  const url =
    typeof window === "undefined"
      ? `${process.env.API_URL}/api/plans`
      : "/api/plans";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json();
}
