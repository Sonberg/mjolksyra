using System.Text.Json;
using System.Text.Json.Serialization;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Blocks.Planner;

public class BlockPlannerToolDispatcher(
    IBlockRepository blockRepository,
    IExerciseRepository exerciseRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    Guid blockId) : IBlockPlannerToolDispatcher
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<string> GetBlockStructureAsync(CancellationToken ct)
    {
        var block = await blockRepository.Get(blockId, ct);
        if (block is null)
        {
            return "{}";
        }

        var dto = new
        {
            id = block.Id,
            name = block.Name,
            numberOfWeeks = block.NumberOfWeeks,
            workouts = block.Workouts.OrderBy(w => w.Week).ThenBy(w => w.DayOfWeek).Select(w => new
            {
                id = w.Id,
                week = w.Week,
                dayOfWeek = w.DayOfWeek,
                name = w.Name,
                note = w.Note,
                exercises = w.Exercises.Select(e => new
                {
                    id = e.Id,
                    exerciseId = e.ExerciseId,
                    name = e.Name,
                    note = e.Note,
                    sets = e.Prescription?.Sets?.Select(s => new
                    {
                        reps = s.Target?.Reps,
                        weightKg = s.Target?.WeightKg,
                        durationSeconds = s.Target?.DurationSeconds,
                        distanceMeters = s.Target?.DistanceMeters,
                    }),
                }),
            }),
        };

        return JsonSerializer.Serialize(dto, JsonOptions);
    }

    public async Task<string> SearchExercisesAsync(string name, CancellationToken ct)
    {
        var exercises = await exerciseRepository.Search(name, [], [], null, ct);
        var entries = exercises.Take(20).Select(e => new { id = e.Id, name = e.Name, type = e.Type.ToString() });
        return JsonSerializer.Serialize(entries, JsonOptions);
    }

    public async Task<string> GetTraineeInsightsAsync(Guid traineeId, CancellationToken ct)
    {
        var insights = await traineeInsightsRepository.GetByTraineeId(traineeId, ct);
        if (insights is null)
        {
            return "{}";
        }

        return JsonSerializer.Serialize(new
        {
            insights.AthleteProfile,
            insights.FatigueRisk,
            insights.ProgressionSummary,
            insights.Strengths,
            insights.Weaknesses,
            insights.Recommendations,
        }, JsonOptions);
    }
}
