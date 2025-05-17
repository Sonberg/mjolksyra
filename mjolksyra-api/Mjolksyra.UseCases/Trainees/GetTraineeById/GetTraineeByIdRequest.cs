using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Trainees.GetTraineeById;

public class GetTraineeByIdRequest : IRequest<TraineeResponse?>
{
    public required Guid TraineeId { get; set; }
}

public class GetTraineeByIdRequestHandler(
    ITraineeRepository repository,
    ITraineeResponseBuilder builder
) : IRequestHandler<GetTraineeByIdRequest, TraineeResponse?>
{
    public async Task<TraineeResponse?> Handle(GetTraineeByIdRequest request, CancellationToken cancellationToken)
    {
        if (await repository.GetById(request.TraineeId, cancellationToken) is { } trainee)
        {
            return await builder.Build(trainee, cancellationToken);
        }

        return null;
    }
}