"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useCallback, useMemo } from "react";

type Option = { label: string; value: string };

type MultiSelectProps = {
  placeholder: string;
  options: Option[];
  selectedOptions: string[];
  setSelectedOptions: (_: string[]) => void;
};

export function MultiSelect({
  placeholder,
  options,
  selectedOptions,
  setSelectedOptions,
}: MultiSelectProps) {
  const handleSelectChange = useCallback(
    (value: string) => {
      if (!selectedOptions.includes(value)) {
        setSelectedOptions([...selectedOptions, value]);
      } else {
        setSelectedOptions([...selectedOptions].filter((x) => x !== value));
      }
    },
    [selectedOptions, setSelectedOptions]
  );

  const isOptionSelected = useCallback(
    (value: string): boolean => {
      return selectedOptions.includes(value) ? true : false;
    },
    [selectedOptions]
  );

  const name = useMemo(
    () =>
      selectedOptions.length
        ? `${selectedOptions.length} selected`
        : placeholder,
    [placeholder, selectedOptions]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
          >
            <div className="text-ellipsis">{name}</div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-full"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {options.map((value: Option, index: number) => {
            return (
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                key={index}
                checked={isOptionSelected(value.value)}
                onCheckedChange={() => handleSelectChange(value.value)}
              >
                {value.label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
