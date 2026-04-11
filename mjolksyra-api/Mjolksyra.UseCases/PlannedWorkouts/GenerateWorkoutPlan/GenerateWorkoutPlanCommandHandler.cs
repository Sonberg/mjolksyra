using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using OneOf;

namespace Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

public class GenerateWorkoutPlanCommandHandler(
    IMediator mediator,
    IAIWorkoutPlannerAgent plannerAgent,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    IPlannedWorkoutDeletedPublisher plannedWorkoutDeletedPublisher,
    IPlannerSessionRepository sessionRepository,
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

        PlannerSession? session = null;
        if (request.SessionId.HasValue)
        {
            session = await sessionRepository.GetById(request.SessionId.Value, cancellationToken);
            if (session is null || session.TraineeId != request.TraineeId || session.CoachUserId != userId)
            {
                return new GenerateWorkoutPlanForbidden();
            }
        }

        var innerDispatcher = new AIPlannerToolDispatcher(
            plannedWorkoutRepository,
            completedWorkoutRepository,
            workoutMediaAnalysisRepository,
            exerciseRepository,
            plannedWorkoutDeletedPublisher,
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
        var resolvedExercises = new Dictionary<string, Exercise>(StringComparer.OrdinalIgnoreCase);

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
                var mergedDraft = (existingWorkout.DraftExercises ?? existingWorkout.PublishedExercises).ToList();
                mergedDraft.AddRange(await MapExercises(
                    workoutOutput.Exercises,
                    isPublished: false,
                    createdByUserId: userId,
                    resolvedExercises: resolvedExercises,
                    cancellationToken: cancellationToken));
                existingWorkout.DraftExercises = mergedDraft;
                await plannedWorkoutRepository.Update(existingWorkout, cancellationToken);
                created++;
                continue;
            }

            var newWorkout = await plannedWorkoutRepository.Create(new PlannedWorkout
            {
                Id = Guid.NewGuid(),
                TraineeId = request.TraineeId,
                Name = workoutOutput.Name,
                Note = workoutOutput.Note,
                PlannedAt = plannedAt,
                PublishedExercises = [],
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            var newDraftExercises = await MapExercises(
                workoutOutput.Exercises,
                isPublished: false,
                createdByUserId: userId,
                resolvedExercises: resolvedExercises,
                cancellationToken: cancellationToken);

            newWorkout.DraftExercises = newDraftExercises;
            await plannedWorkoutRepository.Update(newWorkout, cancellationToken);

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

        if (session is not null)
        {
            foreach (var call in loggingDispatcher.Calls)
            {
                session.ToolCalls.Add(call);
            }

            session.GenerationResult = new PlannerSessionGenerationResult
            {
                ActionsApplied = created,
                Summary = response.Summary,
                DateFrom = response.DateFrom,
                DateTo = response.DateTo,
                GeneratedAt = DateTimeOffset.UtcNow,
            };
            session.UpdatedAt = DateTimeOffset.UtcNow;
            await sessionRepository.Update(session, cancellationToken);
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

    private async Task<List<PlannedExercise>> MapExercises(
        ICollection<AIPlannerExerciseOutput> exercises,
        bool isPublished,
        Guid createdByUserId,
        IDictionary<string, Exercise> resolvedExercises,
        CancellationToken cancellationToken)
    {
        var plannedExercises = new List<PlannedExercise>(exercises.Count);

        foreach (var e in exercises)
        {
            var prescriptionType = e.PrescriptionType switch
            {
                "SetsReps" => ExerciseType.SetsReps,
                "DurationSeconds" => ExerciseType.DurationSeconds,
                "DistanceMeters" => ExerciseType.DistanceMeters,
                _ => ExerciseType.SetsReps,
            };

            var hasPrescription = e.Sets.Count > 0;
            var resolvedExercise = await ResolveExerciseAsync(
                e.Name,
                prescriptionType,
                createdByUserId,
                resolvedExercises,
                cancellationToken);

            plannedExercises.Add(new PlannedExercise
            {
                Id = Guid.NewGuid(),
                ExerciseId = resolvedExercise.Id,
                Name = e.Name,
                Note = e.Note,
                IsPublished = isPublished,
                AddedBy = ExerciseAddedBy.Coach,
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
            });
        }

        return plannedExercises;
    }

    private async Task<Exercise> ResolveExerciseAsync(
        string exerciseName,
        ExerciseType exerciseType,
        Guid createdByUserId,
        IDictionary<string, Exercise> resolvedExercises,
        CancellationToken cancellationToken)
    {
        var normalizedName = exerciseName.Trim();
        if (resolvedExercises.TryGetValue(normalizedName, out var cached))
        {
            return cached;
        }

        var existing = await exerciseRepository.Search(normalizedName, [], [], null, cancellationToken);
        var resolved = existing.FirstOrDefault(x =>
                           string.Equals(x.Name.Trim(), normalizedName, StringComparison.OrdinalIgnoreCase) &&
                           x.Type == exerciseType)
                       ?? existing.FirstOrDefault(x =>
                           string.Equals(x.Name.Trim(), normalizedName, StringComparison.OrdinalIgnoreCase));

        if (resolved is null)
        {
            resolved = await exerciseRepository.Create(new Exercise
            {
                Id = Guid.NewGuid(),
                Name = normalizedName,
                Type = exerciseType,
                CreatedBy = createdByUserId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);
        }

        resolvedExercises[normalizedName] = resolved;
        return resolved;
    }
}
