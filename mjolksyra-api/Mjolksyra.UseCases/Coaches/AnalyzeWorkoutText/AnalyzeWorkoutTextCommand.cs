using MediatR;
using Mjolksyra.Domain.Database.Models;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;

public record AnalyzeWorkoutTextCommand(
    Guid CoachUserId,
    PlannedWorkout PlannedWorkout,
    string? ReferenceId = null)
    : IRequest<OneOf<AnalyzeWorkoutTextSuccess, AnalyzeWorkoutTextError>>;
