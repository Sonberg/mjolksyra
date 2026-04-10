using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public static class AIPlannerProposalFingerprint
{
    public static string ComputeWorkoutsFingerprint(IEnumerable<PlannedWorkout> workouts)
    {
        var payload = JsonSerializer.Serialize(
            workouts
                .OrderBy(w => w.PlannedAt)
                .ThenBy(w => w.Id)
                .Select(w => new
                {
                    w.Id,
                    PlannedAt = w.PlannedAt.ToString("yyyy-MM-dd"),
                    w.Name,
                    w.Note,
                    Exercises = w.PublishedExercises
                        .OrderBy(e => e.Id)
                        .Select(e => new
                        {
                            e.Id,
                            e.ExerciseId,
                            e.Name,
                            e.Note,
                            Type = e.Prescription?.Type.ToString(),
                            Sets = e.Prescription?.Sets?.Select(set => new
                            {
                                set.Target?.Reps,
                                set.Target?.WeightKg,
                                set.Target?.DurationSeconds,
                                set.Target?.DistanceMeters,
                                set.Target?.Note,
                            }),
                        }),
                }));

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash);
    }

    public static string ComputeWorkoutFingerprint(PlannedWorkout workout)
        => ComputeWorkoutsFingerprint([workout]);
}
