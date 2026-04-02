using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Media;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.AddPlannedWorkoutChatMessage;

public class AddPlannedWorkoutChatMessageCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IPlannedWorkoutChatMessageRepository plannedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    IMediaCompressionPublisher mediaCompressionPublisher) : IRequestHandler<AddPlannedWorkoutChatMessageCommand, PlannedWorkoutChatMessageResponse?>
{
    public async Task<PlannedWorkoutChatMessageResponse?> Handle(AddPlannedWorkoutChatMessageCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null)
        {
            return null;
        }

        var isAthlete = trainee.AthleteUserId == userId;
        var isCoach = trainee.CoachUserId == userId;

        PlannedWorkoutChatRole? role;
        if (isAthlete && isCoach)
        {
            role = request.Message.Role;
        }
        else if (isAthlete)
        {
            role = PlannedWorkoutChatRole.Athlete;
        }
        else if (isCoach)
        {
            role = PlannedWorkoutChatRole.Coach;
        }
        else
        {
            role = null;
        }

        if (role is null)
        {
            return null;
        }

        if (!isCoach && role == PlannedWorkoutChatRole.Coach)
        {
            return null;
        }

        if (!isAthlete && role == PlannedWorkoutChatRole.Athlete)
        {
            return null;
        }

        var messageBody = request.Message.Message.Trim();
        var media = request.Message.MediaUrls
            .Select(url => new PlannedWorkoutMedia
            {
                RawUrl = url,
                Type = MediaUrlHelper.IsVideoUrl(url) ? PlannedWorkoutMediaType.Video : PlannedWorkoutMediaType.Image,
            })
            .ToList();

        if (string.IsNullOrWhiteSpace(messageBody) && media.Count == 0)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var saved = await plannedWorkoutChatMessageRepository.Create(new PlannedWorkoutChatMessage
        {
            Id = Guid.NewGuid(),
            PlannedWorkoutId = request.PlannedWorkoutId,
            TraineeId = request.TraineeId,
            UserId = userId,
            Message = messageBody,
            Media = media,
            Role = role.Value,
            CreatedAt = now,
            ModifiedAt = now,
        }, cancellationToken);

        foreach (var url in saved.Media.Select(x => x.RawUrl))
        {
            await mediaCompressionPublisher.Publish(new MediaCompressionRequestedMessage
            {
                FileUrl = url,
                PlannedWorkoutId = request.PlannedWorkoutId,
                PlannedWorkoutChatMessageId = saved.Id,
            }, cancellationToken);
        }

        return PlannedWorkoutChatMessageResponse.From(saved);
    }
}
