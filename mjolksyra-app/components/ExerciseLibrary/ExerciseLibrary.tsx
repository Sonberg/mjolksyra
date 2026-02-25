"use client";

import { PlusIcon, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { ExerciseStarred } from "./ExerciseStarred";
import { ExerciseBrowser } from "./ExerciseBrowser";
import { ExerciseSearch } from "./ExerciseSearch";
import { Button } from "../ui/button";

import { CreateExerciseDialog } from "@/dialogs/CreateExerciseDialog";
import { CreateExercise } from "@/services/exercises/createExercise";
import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { GetExercises } from "@/services/exercises/getExercises";
import { SearchExercises } from "@/services/exercises/searchExercises";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";
import { TooltipProvider } from "../ui/tooltip";

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
  const isSearching = searchMode && freeText.trim().length > 0;

  return useMemo(
    () => (
      <TooltipProvider>
        <div className="relative flex h-full min-h-0 flex-col border-l border-zinc-900 bg-black">
          <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-[var(--font-display)] text-sm font-semibold tracking-[0.08em] text-zinc-100">
                  Exercise Library
                </p>
                <p className="text-xs text-zinc-500">
                  Drag exercises directly into your planner.
                </p>
              </div>
              {searchMode ? (
                <button
                  style={{ fontSize: "0.7rem" }}
                  className="rounded-full border border-zinc-700 px-3 py-1 font-semibold uppercase tracking-[0.08em] text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                  onClick={() => {
                    setSearchMode(false);
                    setFreeText("");
                  }}
                >
                  Close
                </button>
              ) : null}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder={searchMode ? "Find by name or keyword" : "Search exercises"}
                className="h-9 rounded-lg border-zinc-700 bg-zinc-900 pl-8 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-500"
                value={freeText}
                onFocus={() => setSearchMode(true)}
                onChange={(event) => setFreeText(event.target.value)}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24">
            {isSearching ? (
              <>
                <ExerciseSearch freeText={freeText} exercises={exercies} />
              </>
            ) : (
              <>
                <ExerciseStarred exercises={exercies} />
                <ExerciseBrowser exercies={exercies} />
              </>
            )}
          </div>

          <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-gradient-to-b from-black/0 via-black/90 to-black px-4 pb-4 pt-3">
            <CreateExerciseDialog
              exercises={exercies}
              trigger={
                <Button className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Exercise
                </Button>
              }
            />
          </div>
        </div>
      </TooltipProvider>
    ),
    [searchMode, freeText, exercies, isSearching]
  );
}
