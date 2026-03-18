namespace Mjolksyra.Domain.Messaging;

public interface IPlannedWorkoutDeletedPublisher
{
    Task Publish(PlannedWorkoutDeletedMessage message, CancellationToken cancellationToken);
}
