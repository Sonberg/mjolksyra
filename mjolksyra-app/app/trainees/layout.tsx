"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
              <BreadcrumbPage>Trainees</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="default" size={"sm"}>
          <Plus />
          Invite
        </Button>
      </div>
      {children}
    </>
  );
}
