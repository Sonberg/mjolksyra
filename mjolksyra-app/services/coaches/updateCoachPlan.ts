export async function updateCoachPlan(planId: string): Promise<void> {
  const res = await fetch("/api/coaches/plan", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId }),
  });
  if (!res.ok) throw new Error("Failed to update coach plan");
}
