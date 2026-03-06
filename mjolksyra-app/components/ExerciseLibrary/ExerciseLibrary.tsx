"use client";

import { PlusIcon, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { ExerciseStarred } from "./ExerciseStarred";
import { ExerciseBrowser } from "./ExerciseBrowser";
import { ExerciseSearch } from "./ExerciseSearch";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { SingleSelect } from "../Select/SingleSelect";

import { CreateExerciseDialog } from "@/dialogs/CreateExerciseDialog";
import { CreateExercise } from "@/services/exercises/createExercise";
import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { GetExercises } from "@/services/exercises/getExercises";
import { SearchExercises } from "@/services/exercises/searchExercises";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";
import { TooltipProvider } from "../ui/tooltip";
import { ApiClient } from "@/services/client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { capitalizeFirstLetter } from "@/lib/capitalizeFirstLetter";

type Props = {
  exercies: {
    starred: StarredExercises;
    star: StarExercise;
    search: SearchExercises;
    get: GetExercises;
    delete: DeleteExercise;
    create: CreateExercise;
  };
};

export function ExerciseLibrary({ exercies }: Props) {
  const [searchMode, setSearchMode] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [force, setForce] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [mechanic, setMechanic] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [createdByMe, setCreatedByMe] = useState(false);

  const { isSignedIn } = useUser();
  const options = useQuery({
    queryKey: ["exercises/options"],
    queryFn: async () => {
      const response = await ApiClient.get<Record<string, string[]>>(
        "/api/exercises/options"
      );

      return response.data!;
    },
    placeholderData: {},
    enabled: isSignedIn === true,
  });

  const filters = useMemo(
    () => ({
      force,
      level,
      mechanic,
      category,
      createdByMe,
    }),
    [force, level, mechanic, category, createdByMe]
  );

  const hasActiveFilters =
    force !== null
    || level !== null
    || mechanic !== null
    || category !== null
    || createdByMe;

  const isSearching = searchMode && (freeText.trim().length > 0 || hasActiveFilters);

  const getSelectOptions = (key: "force" | "level" | "mechanic" | "category") =>
    (options.data?.[key] ?? []).map((value) => ({
      label: capitalizeFirstLetter(value),
      value,
    }));

  return (
    <TooltipProvider>
      <div className="relative flex h-full min-h-0 flex-col border-[var(--shell-border)] bg-[var(--shell-surface)]">
        <div className="sticky top-0 z-20 border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface)]/95 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-[var(--font-display)] text-sm font-semibold tracking-[0.08em] text-[var(--shell-ink)]">
                Exercise Library
              </p>
              <p className="text-xs text-[var(--shell-muted)]">
                Drag exercises directly into your planner.
              </p>
            </div>
            {searchMode ? (
              <button
                style={{ fontSize: "0.7rem" }}
                className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-1 font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)]"
                onClick={() => {
                  setSearchMode(false);
                  setFreeText("");
                  setForce(null);
                  setLevel(null);
                  setMechanic(null);
                  setCategory(null);
                  setCreatedByMe(false);
                }}
              >
                Close
              </button>
            ) : null}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--shell-muted)]" />
            <Input
              placeholder={searchMode ? "Find by name or keyword" : "Search exercises"}
              className="h-9 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] pl-8 text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus-visible:ring-[var(--shell-accent)]"
              value={freeText}
              onFocus={() => setSearchMode(true)}
              onChange={(event) => setFreeText(event.target.value)}
            />
          </div>

          {searchMode ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SingleSelect
                placeholder="Force"
                options={getSelectOptions("force")}
                value={force}
                setSelectedOption={setForce}
              />
              <SingleSelect
                placeholder="Level"
                options={getSelectOptions("level")}
                value={level}
                setSelectedOption={setLevel}
              />
              <SingleSelect
                placeholder="Mechanic"
                options={getSelectOptions("mechanic")}
                value={mechanic}
                setSelectedOption={setMechanic}
              />
              <SingleSelect
                placeholder="Category"
                options={getSelectOptions("category")}
                value={category}
                setSelectedOption={setCategory}
              />
              <div className="col-span-2 flex items-center justify-between rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
                <Label htmlFor="created-by-me" className="text-xs font-medium text-[var(--shell-ink)]">
                  Created by me
                </Label>
                <Switch
                  id="created-by-me"
                  checked={createdByMe}
                  onCheckedChange={(checked) => setCreatedByMe(checked === true)}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24">
          {isSearching ? (
            <ExerciseSearch freeText={freeText} filters={filters} exercises={exercies} />
          ) : (
            <>
              <ExerciseStarred exercises={exercies} />
              <ExerciseBrowser exercies={exercies} />
            </>
          )}
        </div>

        <div className="sticky bottom-0 left-0 right-0 z-20 border-t-2 border-[var(--shell-border)] bg-gradient-to-b from-[var(--shell-surface)]/0 via-[var(--shell-surface)]/90 to-[var(--shell-surface)] px-4 pb-4 pt-3">
          <CreateExerciseDialog
            exercises={exercies}
            trigger={
              <Button className="h-10 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] px-4 text-sm font-semibold text-[var(--shell-accent-ink)] transition hover:bg-[#ce2f10]">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Exercise
              </Button>
            }
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
