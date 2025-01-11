"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ChevronDown } from "lucide-react";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export default function Layout({ children }: Props) {
  return (
    <>
      <div className="min-h-16 px-6 border-b flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Workouts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-3">
          <ChevronDown className="h-5 w-5" />
          <div className="">
            <div className="text-muted-foreground text-xs">Coach</div>
            <div className="text-sm">Natalie Sleiers</div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
