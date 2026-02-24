namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public class InviteTraineeRequest
{
    public required string Email { get; set; }
    public required int MonthlyPriceAmount { get; set; }

    public InviteTraineeCommand ToCommand(Guid userId)
    {
        return new InviteTraineeCommand
        {
            CoachUserId = userId,
            Email = Email,
            MonthlyPriceAmount = MonthlyPriceAmount
        };
    }
}
