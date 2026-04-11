using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Media;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.AddCompletedWorkoutChatMessage;

public class AddCompletedWorkoutChatMessageCommandHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    ICompletedWorkoutChatMessageRepository completedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    IMediaCompressionPublisher mediaCompressionPublisher)
    : IRequestHandler<AddCompletedWorkoutChatMessageCommand, CompletedWorkoutChatMessageResponse?>
{
    public async Task<CompletedWorkoutChatMessageResponse?> Handle(AddCompletedWorkoutChatMessageCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var completedWorkout = await completedWorkoutRepository.GetById(request.CompletedWorkoutId, cancellationToken);
        if (completedWorkout is null || completedWorkout.TraineeId != request.TraineeId)
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

        CompletedWorkoutChatRole? role;
        if (isAthlete && isCoach)
        {
            role = request.Message.Role;
        }
        else if (isAthlete)
        {
            role = CompletedWorkoutChatRole.Athlete;
        }
        else if (isCoach)
        {
            role = CompletedWorkoutChatRole.Coach;
        }
        else
        {
            role = null;
        }

        if (role is null)
        {
            return null;
        }

        if (!isCoach && role == CompletedWorkoutChatRole.Coach)
        {
            return null;
        }

        if (!isAthlete && role == CompletedWorkoutChatRole.Athlete)
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
        var saved = await completedWorkoutChatMessageRepository.Create(new CompletedWorkoutChatMessage
        {
            Id = Guid.NewGuid(),
            CompletedWorkoutId = request.CompletedWorkoutId,
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
                CompletedWorkoutId = request.CompletedWorkoutId,
                CompletedWorkoutChatMessageId = saved.Id,
            }, cancellationToken);
        }

        return CompletedWorkoutChatMessageResponse.From(saved);
    }
}
