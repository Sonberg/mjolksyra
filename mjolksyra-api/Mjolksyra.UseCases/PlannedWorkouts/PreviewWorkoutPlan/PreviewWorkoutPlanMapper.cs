using Mjolksyra.Domain.AI;

namespace Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

public static class PreviewWorkoutPlanMapper
{
    public static ICollection<PreviewWorkoutPlanWorkout> FromOutputs(ICollection<AIPlannerWorkoutOutput> workouts)
    {
        return workouts.Select(w => new PreviewWorkoutPlanWorkout
        {
            PlannedAt = w.PlannedAt,
            Name = w.Name,
            Note = w.Note,
            Exercises = w.Exercises.Select(e => new PreviewWorkoutPlanExercise
            {
                Name = e.Name,
                Note = e.Note,
                PrescriptionType = e.PrescriptionType,
                Sets = e.Sets.Select(s => new PreviewWorkoutPlanSet
                {
                    Reps = s.Reps,
                    WeightKg = s.WeightKg,
                    DurationSeconds = s.DurationSeconds,
                    DistanceMeters = s.DistanceMeters,
                    Note = s.Note,
                }).ToList(),
            }).ToList(),
        }).ToList();
    }
}
