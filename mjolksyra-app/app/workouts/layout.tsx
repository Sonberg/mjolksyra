"use client";

import { InviteTraineeDialog } from "@/dialogs/InviteTraineeDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export default function Layout({ children }: Props) {
  return (
    <>
      <div className="h-16 px-6 border-b flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Workouts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <InviteTraineeDialog
          trigger={
            <Button variant="default" size={"sm"}>
              <Plus />
              Invite
            </Button>
          }
        />
      </div>
      {children}
    </>
  );
}
