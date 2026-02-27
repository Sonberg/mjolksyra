namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public enum InviteTraineeErrorCode
{
    InvalidMonthlyPrice,
    AthleteNotFound,
    RelationshipRequired,
    PendingInviteAlreadyExists
}

public sealed class InviteTraineeError
{
    public required InviteTraineeErrorCode Code { get; init; }
    public required string Message { get; init; }
}
