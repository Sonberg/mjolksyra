namespace Mjolksyra.UseCases.Users;

public class UserTraineeResponse
{
    public required Guid TraineeId { get; set; }

    public required string? GivenName { get; set; }

    public required string? FamilyName { get; set; }

    public required UserTraineeStatus Status { get; set; }
}