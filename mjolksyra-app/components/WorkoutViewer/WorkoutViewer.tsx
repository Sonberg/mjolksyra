import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { useWorkouts } from "./hooks/useWorkouts";

type Props = {
  traineeId: string;
};

export function WorkoutViewer({ traineeId }: Props) {
  const { data } = useWorkouts({ traineeId });
  return (
    <div className="overflow-y-auto p-6 grid gap-8">
      {data.map((x) => (
        <Card key={x.id}>
          <CardHeader>{x.plannedAt}</CardHeader>
          <CardDescription>{x.note}</CardDescription>
          <CardContent>
            <pre>{JSON.stringify(x, null, 2)}</pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
