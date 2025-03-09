using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;

public class GetTraineeInvitationsRequestHandler : IRequestHandler<GetTraineeInvitationsRequest, ICollection<TraineeInvitationsResponse>>
{
    private readonly IUserRepository _userRepository;

    private readonly ITraineeInvitationsRepository _traineeInvitationsRepository;

    public GetTraineeInvitationsRequestHandler(IUserRepository userRepository, ITraineeInvitationsRepository traineeInvitationsRepository)
    {
        _userRepository = userRepository;
        _traineeInvitationsRepository = traineeInvitationsRepository;
    }

    public async Task<ICollection<TraineeInvitationsResponse>> Handle(GetTraineeInvitationsRequest request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetById(request.UserId, cancellationToken);
        var invitations = await _traineeInvitationsRepository.GetAsync(user.Email, cancellationToken);
        var coachUserIds = invitations.Select(x => x.CoachUserId).Distinct().ToList();
        var coaches = await _userRepository.GetManyById(coachUserIds, cancellationToken);

        return invitations.Select(x => TraineeInvitationsResponse.From(x, coaches)).ToList();
    }
}