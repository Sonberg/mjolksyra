import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

type Option = { label: string; value: string };

type SingleSelectProps = {
  placeholder: string;
  options: Option[];
  value: string | null;
  setSelectedOption: Dispatch<SetStateAction<string | null>>;
};

export function SingleSelect({
  placeholder,
  options,
  value,
  setSelectedOption,
}: SingleSelectProps) {
  return (
    <Select value={value ?? ""} onValueChange={setSelectedOption}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((x) => (
            <SelectItem key={x.value} value={x.value}>
              {x.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <Button
          className="w-full px-2"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOption(null);
          }}
        >
          Clear
        </Button>
      </SelectContent>
    </Select>
  );
}
