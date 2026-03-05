import { getAuth } from "@/context/Auth";
import { getDiscountCodes } from "@/services/admin/getDiscountCodes";
import { DiscountCodesSection } from "../DiscountCodesSection";

export default async function AdminDiscountPage() {
  const auth = await getAuth({ redirect: true });
  const discountCodes = await getDiscountCodes({ accessToken: auth!.accessToken });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DiscountCodesSection initialCodes={discountCodes} />
    </div>
  );
}
