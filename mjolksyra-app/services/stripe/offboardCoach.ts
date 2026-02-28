import { ApiClient } from "../client";

export async function offboardCoach() {
  await ApiClient.delete("/api/stripe/account");
}
