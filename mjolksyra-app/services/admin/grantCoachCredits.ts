export async function grantCoachCredits(args: {
  coachUserId: string;
  purchasedCredits: number;
  reason?: string;
}): Promise<void> {
  const response = await fetch(`/api/admin/coaches/${args.coachUserId}/credits/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purchasedCredits: args.purchasedCredits,
      reason: args.reason ?? null,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.title ?? "Failed to grant credits.");
  }
}
