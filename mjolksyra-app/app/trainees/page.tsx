import { getAuth } from "@/context/Auth";

export default async function Page() {
  const auth = await getAuth();
  return (
    <div className="p-6">
      <div className="text-3xl font-bold">Trainees</div>
    </div>
  );
}
