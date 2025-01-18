import { z } from "zod";
import { ApiClient } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { capitalizeFirstLetter } from "@/lib/capitalizeFirstLetter";
import { SingleSelect } from "@/components/Select/SingleSelect";
import { useValidation } from "@/hooks/useValidation";
import { CreateExercise } from "@/api/exercises/createExercise";

const schema = z.object({
  name: z.string(),
  force: z.string().nullable(),
  level: z.string().nullable(),
  mechanic: z.string().nullable(),
  equipment: z.string().nullable(),
  category: z.string().nullable(),
});

type Values = z.infer<typeof schema>;

type Props = {
  trigger: ReactNode;
  exercises: {
    create: CreateExercise;
  };
};

export function CreateExerciseDialog({ trigger, exercises }: Props) {
  const [isOpen, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});

  const query = useQueryClient();
  const options = useQuery({
    queryKey: ["exercises/options"],
    queryFn: async () => {
      const response = await ApiClient.get<Record<string, string[]>>(
        "/api/exercises/options"
      );

      return response.data!;
    },
    placeholderData: {},
  });

  const validation = useValidation<Values>({
    schema,
    values: {
      name: "",
      force: null,
      level: null,
      mechanic: null,
      equipment: null,
      category: null,
      ...values,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create exercise</DialogTitle>
          <DialogDescription>
            Exercises created by you, will only be visible for you and your
            trainee's
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={`${values["name"] ?? ""}`}
              onChange={(ev) =>
                setValues((state) => ({ ...state, name: ev.target.value }))
              }
              className="col-span-3"
            />
          </div>
        </div>

        {Object.entries(options.data!).map(([key, rawOptions]) => {
          const options = rawOptions.map((value) => ({
            label: capitalizeFirstLetter(value),
            value,
          }));

          return (
            <div key={key} className="grid items-center gap-2 mb-4">
              <Label>{capitalizeFirstLetter(key)}</Label>
              <SingleSelect
                placeholder="-"
                options={options}
                value={values[key] ? `${values[key]}` : null}
                setSelectedOption={(state) =>
                  setValues((prev) => ({ ...prev, [key]: state }))
                }
              />
            </div>
          );
        })}

        <DialogFooter>
          <Button
            onClick={async () => {
              if (!validation.success) {
                return validation.showAllError();
              }

              await exercises.create(validation.parsed!);
              await query.refetchQueries({
                queryKey: ["exercises"],
              });

              setOpen(false);
              setValues({});
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
