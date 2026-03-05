import { ApiClient } from "../client";

type Args = {
  accessToken: string;
  code: string;
};

export async function applyDiscountCode({ accessToken, code }: Args): Promise<void> {
  await ApiClient.post(
    `${process.env.API_URL}/api/coaches/discount-code`,
    { code },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}
