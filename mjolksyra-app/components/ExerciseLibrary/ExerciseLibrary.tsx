"use client";

import { PlusIcon, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { ExerciseStarred } from "./ExerciseStarred";
import { ExerciseBrowser } from "./ExerciseBrowser";
import { ExerciseSearch } from "./ExerciseSearch";
import { Button } from "../ui/button";

import { CreateExerciseDialog } from "@/dialogs/CreateExerciseDialog";
import { CreateExercise } from "@/api/exercises/createExercise";
import { DeleteExercise } from "@/api/exercises/deleteExercise";
import { GetExercises } from "@/api/exercises/getExercises";
import { SearchExercises } from "@/api/exercises/searchExercises";
import { StarExercise } from "@/api/exercises/starExercise";
import { StarredExercises } from "@/api/exercises/starredExercises";
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

  return useMemo(
    () => (
      <TooltipProvider>
        <div className="h-full relative">
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/6 m-4">
            {searchMode ? (
              <div className="mb-6 flex justify-between items-center">
                <div className="font-bold">Search</div>
                <button
                  style={{ fontSize: "0.75rem" }}
                  className="py-1 px-3 bg-accent  hover:bg-accent-foreground hover:text-accent rounded-full"
                  onClick={() => {
                    setSearchMode(false);
                    setFreeText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : null}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchMode ? "Type anything..." : "Search"}
                className="pl-8"
                value={freeText}
                onFocus={() => setSearchMode(true)}
                onChange={(event) => setFreeText(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto h-full p-4 pb-16">
            {searchMode ? (
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

          <div className="absolute bottom-4 left-0 right-0 grid place-items-end pb-6 pt-2 px-6 bg-gradient-to-b from-transparent to-background via-background/70">
            <CreateExerciseDialog
              exercises={exercies}
              trigger={
                <Button className="rounded-full h-9 w-9 p-0">
                  <PlusIcon />
                </Button>
              }
            />
          </div>
        </div>
      </TooltipProvider>
    ),
    [searchMode, freeText, exercies]
  );
}
