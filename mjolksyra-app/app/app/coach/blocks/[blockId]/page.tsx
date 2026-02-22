import { getAuth } from "@/context/Auth";
import { BlockEditorContent } from "./page-content";

type Props = {
  params: Promise<{ blockId: string }>;
};

export default async function Page({ params }: Props) {
  await getAuth({ redirect: "/" });

  return <BlockEditorContent blockId={(await params).blockId} />;
}
