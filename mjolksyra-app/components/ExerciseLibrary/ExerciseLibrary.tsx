import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { ExerciseStarred } from "./ExerciseStarred";
import { ExerciseBrowser } from "./ExerciseBrowser";
import { ExerciseSearch } from "./ExerciseSearch";

export function ExerciseLibrary() {
  const [searchMode, setSearchMode] = useState(false);
  const [freeText, setFreeText] = useState("");

  const cancelSearch = () => {
    setSearchMode(false);
    setFreeText("");
  };

  return (
    <div>
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/6 mb-4">
        {searchMode ? (
          <div className="mb-6 flex justify-between items-center">
            Search
            <button
              style={{ fontSize: "0.75rem" }}
              className="py-1 px-3 bg-zinc-900  hover:bg-zinc-800 rounded-full"
              onClick={cancelSearch}
            >
              Cancel
            </button>
          </div>
        ) : null}
        <div className="relative mb-8">
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
      <div
        className="flex flex-col gap-4 overflow-y-scroll"
        style={{ height: "75rem" }}
      >
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
  );
}
