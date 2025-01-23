import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

type Secret = "JWT_SECRET" | "API_URL" | string;

const keyVaultUrl = process.env["KEY_VAULT_URL"];
const client = keyVaultUrl
  ? new SecretClient(keyVaultUrl, new DefaultAzureCredential())
  : null;

export async function secret(name: Secret) {
  if (process.env[name]) {
    return process.env[name];
  }

  if (typeof window !== "undefined") {
    throw new Error("Only allows on server-side");
  }

  if (!client) {
    throw new Error("Key vault url not set");
  }

  const secretName = name.replaceAll("_", "-");
  const secret = await client.getSecret(secretName);

  return secret.value;
}
