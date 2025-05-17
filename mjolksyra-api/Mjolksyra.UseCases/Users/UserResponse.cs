namespace Mjolksyra.UseCases.Users;

public enum UserOnboardingStatus
{
    NotStarted,
    Started,
    Completed,
}

public class UserOnboardingResponse
{
    public required UserOnboardingStatus Coach { get; set; }

    public required UserOnboardingStatus Athlete { get; set; }
}

public class UserResponse
{
    public required Guid Id { get; set; }

    public required string? GivenName { get; set; }

    public required string? FamilyName { get; set; }

    public required UserOnboardingResponse Onboarding { get; set; }

    public required List<UserTraineeResponse> Athletes { get; set; }

    public required List<UserTraineeResponse> Coaches { get; set; }

    public required List<UserInvitationResponse> Invitations { get; set; }
}