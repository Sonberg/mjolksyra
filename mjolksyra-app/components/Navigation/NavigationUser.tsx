import { useAuth } from "@/context/Auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGravatar } from "@/hooks/useGravatar";
import Link from "next/link";

export function NavigationUser() {
  const auth = useAuth();
  const initial = (auth.givenName?.[0] ?? "") + (auth.familyName?.[0] ?? "");
  const url = useGravatar(auth.email ?? "", 32);

  return (
    <Link href="/app">
      <Avatar className="h-8 w-8">
        <AvatarImage src={url} alt="@shadcn" />
        <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
      </Avatar>
    </Link>
  );

  // return (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger asChild>
  //       <Button variant="ghost" className="relative h-8 w-8 rounded-full">
  //         <Avatar className="h-8 w-8">
  //           <AvatarImage src={url} alt="@shadcn" />
  //           <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
  //         </Avatar>
  //       </Button>
  //     </DropdownMenuTrigger>
  //     <DropdownMenuContent className="w-56" align="end" forceMount>
  //       <DropdownMenuLabel className="font-normal">
  //         <div className="flex flex-col space-y-1">
  //           <p className="text-sm font-medium leading-none">{auth.name}</p>
  //           <p className="text-xs leading-none text-muted-foreground">
  //             {auth.email}
  //           </p>
  //         </div>
  //       </DropdownMenuLabel>
  //       <DropdownMenuSeparator />
  //       <DropdownMenuGroup>
  //         <DropdownMenuLabel className="flex items-center justify-between">
  //           Mode
  //           {theme.resolvedTheme === "light" ? (
  //             <Sun className="h-4 w-4" />
  //           ) : (
  //             <Moon className="h-4 w-4 " />
  //           )}
  //         </DropdownMenuLabel>
  //         <DropdownMenuItem onClick={() => theme.setTheme("light")}>
  //           {theme.theme === "light" ? <Check /> : null} Light
  //         </DropdownMenuItem>
  //         <DropdownMenuItem onClick={() => theme.setTheme("dark")}>
  //           {theme.theme === "dark" ? <Check /> : null} Dark
  //         </DropdownMenuItem>
  //         <DropdownMenuItem onClick={() => theme.setTheme("system")}>
  //           {theme.theme === "system" ? <Check /> : null} System
  //         </DropdownMenuItem>
  //       </DropdownMenuGroup>
  //       <DropdownMenuSeparator />
  //       <DropdownMenuItem
  //         onClick={() => {
  //           auth.logout();
  //           router.push("/");
  //         }}
  //       >
  //         Log out
  //         <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
  //       </DropdownMenuItem>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // );
}
