import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { ExerciseStarred } from "./ExerciseStarred";
import { ExerciseBrowser } from "./ExerciseBrowser";
import { ExerciseSearch } from "./ExerciseSearch";

export function ExerciseLibrary() {
  const [searchMode, setSearchMode] = useState(false);
  const [freeText, setFreeText] = useState("");

  return useMemo(
    () => (
      <div className="h-full">
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
        <div className="flex flex-col gap-4 overflow-y-scroll h-full p-4">
          {searchMode ? (
            <>
              <ExerciseSearch freeText={freeText} />
            </>
          ) : (
            <>
              <ExerciseStarred />
              <ExerciseBrowser />
            </>
          )}
        </div>
      </div>
    ),
    [searchMode, freeText]
  );
}
