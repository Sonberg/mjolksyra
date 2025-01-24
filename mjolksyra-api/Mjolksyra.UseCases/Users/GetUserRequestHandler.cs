using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Users;

public class GetUserRequestHandler : IRequestHandler<GetUserRequest, UserResponse>
{
    private readonly IUserRepository _userRepository;

    private readonly ITraineeRepository _traineeRepository;

    public GetUserRequestHandler(IUserRepository userRepository, ITraineeRepository traineeRepository)
    {
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
    }

    public async Task<UserResponse> Handle(GetUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetById(request.UserId, cancellationToken);
        var trainees = await _traineeRepository.Get(request.UserId, cancellationToken);
        var userIds = trainees
            .SelectMany(x => (Guid[]) [x.CoachUserId, x.AthleteUserId])
            .Distinct()
            .ToList();

        var traineeUsers = await _userRepository.GetManyById(userIds, cancellationToken);
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
                    { AccountId: not null } => UserOnboardingStatus.Started,
                    _ => UserOnboardingStatus.Completed
                },
            },
            Athletes = trainees
                .Where(x => x.CoachUserId == request.UserId)
                .Select(x => new UserTraineeResponse
                {
                    TraineeId = x.Id,
                    GivenName = traineeUsersLookup[x.AthleteUserId].GivenName,
                    FamilyName = traineeUsersLookup[x.AthleteUserId].FamilyName,
                    Status = UserTraineeStatus.Active
                })
                .ToList(),
            Coaches = trainees
                .Where(x => x.AthleteUserId == request.UserId)
                .Select(x => new UserTraineeResponse
                {
                    TraineeId = x.Id,
                    GivenName = traineeUsersLookup[x.CoachUserId].GivenName,
                    FamilyName = traineeUsersLookup[x.CoachUserId].FamilyName,
                    Status = UserTraineeStatus.Active
                })
                .ToList()
        };

        return response;
    }
}