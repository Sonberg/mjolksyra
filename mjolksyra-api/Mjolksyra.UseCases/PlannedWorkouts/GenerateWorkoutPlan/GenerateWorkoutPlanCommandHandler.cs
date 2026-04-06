using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using OneOf;

namespace Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

public class GenerateWorkoutPlanCommandHandler(
    IMediator mediator,
    IAIWorkoutPlannerAgent plannerAgent,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    IAIPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GenerateWorkoutPlanCommand, OneOf<GenerateWorkoutPlanResponse, GenerateWorkoutPlanForbidden, GenerateWorkoutPlanInsufficientCredits>>
{
    public async Task<OneOf<GenerateWorkoutPlanResponse, GenerateWorkoutPlanForbidden, GenerateWorkoutPlanInsufficientCredits>> Handle(GenerateWorkoutPlanCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new GenerateWorkoutPlanForbidden();
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return new GenerateWorkoutPlanForbidden();
        }

        if (!DateOnly.TryParse(request.Params.StartDate, out var startDate))
        {
            return new GenerateWorkoutPlanForbidden();
        }

        var consumeResult = await mediator.Send(
            new ConsumeCreditsCommand(
                userId,
                CreditAction.GenerateWorkoutPlan,
                request.SessionId?.ToString()),
            cancellationToken);

        if (consumeResult.IsT1)
        {
            return new GenerateWorkoutPlanInsufficientCredits(consumeResult.AsT1.Reason);
        }

        var endDate = startDate.AddDays(request.Params.NumberOfWeeks * 7 - 1);

        var innerDispatcher = new AIPlannerToolDispatcher(
            plannedWorkoutRepository,
            workoutMediaAnalysisRepository,
            exerciseRepository,
            request.TraineeId);

        var loggingDispatcher = new LoggingAIPlannerToolDispatcher(innerDispatcher);

        var workoutOutputs = await plannerAgent.GenerateAsync(new AIPlannerGenerateInput
        {
            Description = request.Description,
            FilesContent = request.FilesContent,
            ConversationHistory = request.ConversationHistory,
            Params = new AIPlannerGenerateParams
            {
                StartDate = request.Params.StartDate,
                NumberOfWeeks = request.Params.NumberOfWeeks,
                ConflictStrategy = request.Params.ConflictStrategy,
            },
            ToolDispatcher = loggingDispatcher,
        }, cancellationToken);

        if (workoutOutputs.Count == 0)
        {
            return new GenerateWorkoutPlanResponse
            {
                WorkoutsCreated = 0,
                Summary = "No workouts could be generated from the provided information.",
                DateFrom = startDate.ToString("yyyy-MM-dd"),
                DateTo = endDate.ToString("yyyy-MM-dd"),
            };
        }

        var strategy = request.Params.ConflictStrategy;

        if (strategy == "Replace")
        {
            var existing = await plannedWorkoutRepository.Get(new PlannedWorkoutCursor
            {
                Page = 0,
                Size = 1000,
                TraineeId = request.TraineeId,
                FromDate = startDate,
                ToDate = endDate,
                SortBy = null,
                Order = SortOrder.Asc,
                DraftOnly = false,
            }, cancellationToken);

            await Task.WhenAll(existing.Data.Select(w =>
                plannedWorkoutRepository.Delete(w.Id, cancellationToken)));
        }

        var existingByDate = strategy == "Skip" || strategy == "Append"
            ? await GetExistingByDate(request.TraineeId, startDate, endDate, cancellationToken)
            : new Dictionary<DateOnly, PlannedWorkout?>();

        var created = 0;

        foreach (var workoutOutput in workoutOutputs)
        {
            if (!DateOnly.TryParse(workoutOutput.PlannedAt, out var plannedAt))
            {
                continue;
            }

            if (strategy == "Skip" && existingByDate.ContainsKey(plannedAt))
            {
                continue;
            }

            if (strategy == "Append" && existingByDate.TryGetValue(plannedAt, out var existingWorkout) && existingWorkout is not null)
            {
                var mergedExercises = existingWorkout.Exercises.ToList();
                mergedExercises.AddRange(MapExercises(workoutOutput.Exercises, isPublished: false));
                existingWorkout.Exercises = mergedExercises;
                await plannedWorkoutRepository.Update(existingWorkout, cancellationToken);
                created++;
                continue;
            }

            await plannedWorkoutRepository.Create(new PlannedWorkout
            {
                Id = Guid.NewGuid(),
                TraineeId = request.TraineeId,
                Name = workoutOutput.Name,
                Note = workoutOutput.Note,
                PlannedAt = plannedAt,
                Exercises = MapExercises(workoutOutput.Exercises, isPublished: false),
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            created++;
        }

        var plural = created == 1 ? "workout" : "workouts";
        var response = new GenerateWorkoutPlanResponse
        {
            WorkoutsCreated = created,
            Summary = $"Generated {created} {plural} from {startDate:MMM d} to {endDate:MMM d, yyyy}.",
            DateFrom = startDate.ToString("yyyy-MM-dd"),
            DateTo = endDate.ToString("yyyy-MM-dd"),
        };

        if (request.SessionId.HasValue)
        {
            var session = await sessionRepository.GetById(request.SessionId.Value, cancellationToken);
            if (session is not null)
            {
                foreach (var call in loggingDispatcher.Calls)
                {
                    session.ToolCalls.Add(call);
                }

                session.GenerationResult = new AIPlannerSessionGenerationResult
                {
                    WorkoutsCreated = created,
                    Summary = response.Summary,
                    DateFrom = response.DateFrom,
                    DateTo = response.DateTo,
                    GeneratedAt = DateTimeOffset.UtcNow,
                };
                session.UpdatedAt = DateTimeOffset.UtcNow;
                await sessionRepository.Update(session, cancellationToken);
            }
        }

        return response;
    }

    private async Task<Dictionary<DateOnly, PlannedWorkout?>> GetExistingByDate(
        Guid traineeId, DateOnly from, DateOnly to, CancellationToken ct)
    {
        var existing = await plannedWorkoutRepository.Get(new PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1000,
            TraineeId = traineeId,
            FromDate = from,
            ToDate = to,
            SortBy = null,
            Order = SortOrder.Asc,
            DraftOnly = false,
        }, ct);

        return existing.Data
            .GroupBy(w => w.PlannedAt)
            .ToDictionary(g => g.Key, g => g.FirstOrDefault());
    }

    private static List<PlannedExercise> MapExercises(
        ICollection<AIPlannerExerciseOutput> exercises, bool isPublished)
    {
        return exercises.Select(e =>
        {
            var prescriptionType = e.PrescriptionType switch
            {
                "SetsReps" => ExerciseType.SetsReps,
                "DurationSeconds" => ExerciseType.DurationSeconds,
                "DistanceMeters" => ExerciseType.DistanceMeters,
                _ => ExerciseType.SetsReps,
            };

            var hasPrescription = e.Sets.Count > 0;

            return new PlannedExercise
            {
                Id = Guid.NewGuid(),
                ExerciseId = null,
                Name = e.Name,
                Note = e.Note,
                IsPublished = isPublished,
                Prescription = hasPrescription ? new ExercisePrescription
                {
                    Type = prescriptionType,
                    Sets = e.Sets.Select(s => new ExercisePrescriptionSet
                    {
                        Target = new ExercisePrescriptionSetTarget
                        {
                            Reps = s.Reps,
                            WeightKg = s.WeightKg,
                            DurationSeconds = s.DurationSeconds,
                            DistanceMeters = s.DistanceMeters,
                            Note = s.Note,
                        },
                        Actual = null,
                    }).ToList(),
                } : null,
            };
        }).ToList();
    }
}
