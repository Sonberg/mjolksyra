import { ApiClient } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Fragment, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalizeFirstLetter } from "@/lib/capitalizeFirstLetter";

type Options = Record<string, string[]>;

type Props = {
  trigger: ReactNode;
};

export function CreateExerciseDialog({ trigger }: Props) {
  const options = useQuery({
    queryKey: ["exercises/options"],
    queryFn: async () => {
      const response = await ApiClient.get<Options>("/api/exercises/options");

      return response.data!;
    },
    placeholderData: {},
  });

  console.log(options.data);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create exercise</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-4">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={""}
              onChange={(ev) => console.log(ev.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        {Object.entries(options.data!).map(([key, values]) => (
          <div key={key} className="grid items-center gap-4">
            <Label>{capitalizeFirstLetter(key)}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {values.map((x) => (
                    <SelectItem key={x} value={x}>
                      {capitalizeFirstLetter(x)}
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
                  }}
                >
                  Clear
                </Button>
              </SelectContent>
            </Select>
          </div>
        ))}

        <DialogFooter>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
