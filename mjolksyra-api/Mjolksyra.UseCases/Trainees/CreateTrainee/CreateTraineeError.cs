namespace Mjolksyra.UseCases.Trainees.CreateTrainee;

public enum CreateTraineeErrorCode
{
    AlreadyConnected
}

public sealed class CreateTraineeError
{
    public required CreateTraineeErrorCode Code { get; init; }
    public required string Message { get; init; }
}
