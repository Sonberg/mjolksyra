namespace Mjolksyra.UseCases.Trainees;

public class TraineeResponse
{
    public required Guid Id { get; set; }

    public required TraineeUserResponse Coach { get; set; }

    public required TraineeUserResponse Athlete { get; set; }

    public required TraineePriceResponse? Price { get; set; }

    public required DateTimeOffset? LastWorkoutAt { get; set; }

    public required DateTimeOffset? NextWorkoutAt { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}