using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Users;

public class GetUserRequestHandler(
    IUserRepository userRepository,
    ITraineeRepository traineeRepository,
    ITraineeInvitationsRepository traineeInvitationsRepository
) : IRequestHandler<GetUserRequest, UserResponse>
{
    public async Task<UserResponse> Handle(GetUserRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetById(request.UserId, cancellationToken);
        var invitations = await traineeInvitationsRepository.GetAsync(user.Email, cancellationToken);
        var trainees = await traineeRepository.Get(request.UserId, cancellationToken);
        var activeTrainees = trainees.Where(x => x.Status == Domain.Database.Models.TraineeStatus.Active).ToList();
        var userIds = trainees
            .SelectMany(x => (Guid[]) [x.CoachUserId, x.AthleteUserId])
            .Concat(invitations.Select(x => x.CoachUserId))
            .Distinct()
            .ToList();

        var traineeUsers = await userRepository.GetManyById(userIds, cancellationToken);
        var traineeUsersLookup = traineeUsers.ToDictionary(x => x.Id);
        var response = new UserResponse
        {
            Id = user.Id,
            GivenName = user.GivenName,
            FamilyName = user.FamilyName,
            Onboarding = new UserOnboardingResponse
            {
                Athlete = user.Athlete?.Stripe switch
                {
                    null => UserOnboardingStatus.NotStarted,
                    { Status: StripeStatus.Succeeded } => UserOnboardingStatus.Completed,
                    _ => UserOnboardingStatus.Started
                },
                Coach = user.Coach?.Stripe switch
                {
                    null => UserOnboardingStatus.NotStarted,
                    { Status: StripeStatus.Succeeded } => UserOnboardingStatus.Completed,
                    { AccountId: not null } => UserOnboardingStatus.Started,
                    _ => UserOnboardingStatus.NotStarted
                },
            },
            Athletes = activeTrainees
                .Where(x => x.CoachUserId == request.UserId)
                .Select(x => new UserTraineeResponse
                {
                    TraineeId = x.Id,
                    GivenName = traineeUsersLookup[x.AthleteUserId].GivenName,
                    FamilyName = traineeUsersLookup[x.AthleteUserId].FamilyName,
                    Status = UserTraineeStatus.Active
                })
                .ToList(),
            Coaches = activeTrainees
                .Where(x => x.AthleteUserId == request.UserId)
                .Select(x => new UserTraineeResponse
                {
                    TraineeId = x.Id,
                    GivenName = traineeUsersLookup[x.CoachUserId].GivenName,
                    FamilyName = traineeUsersLookup[x.CoachUserId].FamilyName,
                    Status = UserTraineeStatus.Active
                })
                .ToList(),
            Invitations = invitations
                .Select(x => new UserInvitationResponse
                {
                    Id = x.Id,
                    GivenName = traineeUsersLookup[x.CoachUserId].GivenName,
                    FamilyName = traineeUsersLookup[x.CoachUserId].FamilyName,
                    CreatedAt = x.CreatedAt
                })
                .ToList()
        };

        return response;
    }
}
