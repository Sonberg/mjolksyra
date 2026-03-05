import { getAuth } from "@/context/Auth";
import { getDiscountCodes } from "@/services/admin/getDiscountCodes";
import { DiscountCodesSection } from "../DiscountCodesSection";

export default async function AdminDiscountPage() {
  const auth = await getAuth({ redirect: true });
  const discountCodes = await getDiscountCodes({ accessToken: auth!.accessToken });

  return <DiscountCodesSection initialCodes={discountCodes} />;
}
