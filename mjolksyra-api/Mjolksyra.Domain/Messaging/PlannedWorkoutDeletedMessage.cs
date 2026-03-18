using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Messaging;

public class PlannedWorkoutDeletedMessage
{
    public required PlannedWorkout Workout { get; set; }
}
