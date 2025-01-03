import { Search } from "lucide-react";
import { Exercise } from "./Exercise";
import { Input } from "../ui/input";

const exercises = [
  {
    id: "bench",
    name: "Barbell Bench press",
  },
  {
    id: "squat",
    name: "Squat",
  },
  {
    id: "deadlife",
    name: "Deadlife",
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
  },
];

export function ExerciseLibrary() {
  return (
    <div>
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/6 mb-4">
        <form>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-8" />
          </div>
        </form>
      </div>
      <div className="flex flex-col gap-4">
        {exercises.map((x) => (
          <Exercise key={x.id} {...x} />
        ))}
      </div>
    </div>
  );
}
