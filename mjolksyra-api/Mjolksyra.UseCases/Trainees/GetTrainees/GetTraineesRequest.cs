using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Trainees.GetTrainees;

public class GetTraineesRequest : IRequest<ICollection<TraineeResponse>>;

public class GetTraineesRequestHandler : IRequestHandler<GetTraineesRequest, ICollection<TraineeResponse>>
{
    private readonly ITraineeRepository _traineeRepository;

    private readonly ITraineeResponseBuilder _traineeResponseBuilder;

    private readonly IUserContext _userContext;

    public GetTraineesRequestHandler(ITraineeRepository traineeRepository, ITraineeResponseBuilder traineeResponseBuilder, IUserContext userContext)
    {
        _traineeRepository = traineeRepository;
        _traineeResponseBuilder = traineeResponseBuilder;
        _userContext = userContext;
    }

    public async Task<ICollection<TraineeResponse>> Handle(GetTraineesRequest request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return [];
        }

        var trainees = (await _traineeRepository.Get(userId, cancellationToken))
            .Where(x => x.CoachUserId == userId && x.Status == TraineeStatus.Active)
            .ToList();
        var resultTask = trainees.Select(x => _traineeResponseBuilder.Build(x, cancellationToken)).ToList();

        return await Task.WhenAll(resultTask);
    }
}
