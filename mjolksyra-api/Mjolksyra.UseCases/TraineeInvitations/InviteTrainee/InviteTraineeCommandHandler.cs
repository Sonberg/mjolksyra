using MediatR;
using Microsoft.Extensions.Configuration;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using OneOf;

namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public class InviteTraineeCommandHandler(
    ITraineeInvitationsRepository invitationsRepository,
    IUserRepository userRepository,
    IEmailSender emailSender,
    INotificationService notificationService,
    IConfiguration configuration,
    ITraineeRepository traineeRepository
) : IRequestHandler<InviteTraineeCommand, OneOf<TraineeInvitationsResponse, InviteTraineeError>>
{
    public async Task<OneOf<TraineeInvitationsResponse, InviteTraineeError>> Handle(InviteTraineeCommand request, CancellationToken cancellationToken)
    {
        if (request.MonthlyPriceAmount <= 0)
        {
            return new InviteTraineeError
            {
                Code = InviteTraineeErrorCode.InvalidMonthlyPrice,
                Message = "Monthly price must be greater than zero."
            };
        }

        var athlete = await userRepository.GetByEmail(request.Email, cancellationToken);
        var coach = await userRepository.GetById(request.CoachUserId, cancellationToken);


        var hasActiveRelationship = athlete is not null && await traineeRepository.ExistsActiveRelationship(request.CoachUserId, athlete.Id, cancellationToken);

        if (hasActiveRelationship)
        {
            return new InviteTraineeError
            {
                Code = InviteTraineeErrorCode.RelationshipRequired,
                Message = "Coach can only invite athletes they are already coaching."
            };
        }

        var pendingInviteCount =
            await invitationsRepository.CountPendingByCoachAndEmailAsync(request.CoachUserId, request.Email, cancellationToken);
        if (pendingInviteCount >= 1)
        {
            return new InviteTraineeError
            {
                Code = InviteTraineeErrorCode.PendingInviteAlreadyExists,
                Message = "Coach can only have one pending invite to the same athlete."
            };
        }

        var invitation = await invitationsRepository.Create(new TraineeInvitation
        {
            Id = Guid.NewGuid(),
            Email = Email.From(request.Email),
            CoachUserId = request.CoachUserId,
            MonthlyPriceAmount = request.MonthlyPriceAmount,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await emailSender.SendInvitation(request.Email, new InvitationEmail
        {
            Coach = coach,
            Athlete = athlete,
            PriceSek = request.MonthlyPriceAmount
        }, cancellationToken);

        await notificationService.Notify(new NotificationRequest
        {
            UserId = request.CoachUserId,
            Type = "invite.sent",
            Title = "Invitation sent",
            Body = $"Sent invite to {request.Email} for {request.MonthlyPriceAmount} SEK/mo.",
            Href = "/app/coach/athletes",
        }, cancellationToken);

        if (athlete is not null)
        {
            await notificationService.Notify(new NotificationRequest
            {
                UserId = athlete.Id,
                Type = "invite.received",
                Title = "New coach invitation",
                Body = $"{coach.DisplayName} invited you to coaching for {request.MonthlyPriceAmount} SEK/mo.",
                Href = "/app/athlete",
            }, cancellationToken);
        }

        return TraineeInvitationsResponse.From(invitation, [coach]);
    }
    
}