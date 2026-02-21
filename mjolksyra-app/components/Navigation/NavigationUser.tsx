import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGravatar } from "@/hooks/useGravatar";
import Link from "next/link";

export function NavigationUser() {
  const { user } = useUser();
  const initial =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "");
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const url = useGravatar(email, 32);

  return (
    <Link href="/app">
      <Avatar className="h-8 w-8">
        <AvatarImage src={url} alt="@user" />
        <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
