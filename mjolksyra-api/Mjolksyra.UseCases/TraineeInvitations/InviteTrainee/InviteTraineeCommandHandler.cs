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

        if (athlete is null)
        {
            return new InviteTraineeError
            {
                Code = InviteTraineeErrorCode.AthleteNotFound,
                Message = "Athlete must already exist and be coached by this coach."
            };
        }

        var hasActiveRelationship =
            await traineeRepository.ExistsActiveRelationship(request.CoachUserId, athlete.Id, cancellationToken);
        if (!hasActiveRelationship)
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
            Coach = coach.GivenName!,
            Text = athlete is not null ? "Log in to your account" : "Create an account",
            Link = configuration["App:BaseUrl"] ?? "http://localhost:3000",
            Email = request.Email,
            PriceSek = request.MonthlyPriceAmount
        }, cancellationToken);

        await notificationService.Notify(request.CoachUserId,
            "invite.sent",
            "Invitation sent",
            $"Sent invite to {request.Email} for {request.MonthlyPriceAmount} SEK/mo.",
            "/app/coach/athletes",
            cancellationToken);

        if (athlete is not null)
        {
            await notificationService.Notify(athlete.Id,
                "invite.received",
                "New coach invitation",
                $"{DisplayName(coach)} invited you to coaching for {request.MonthlyPriceAmount} SEK/mo.",
                "/app/athlete",
                cancellationToken);
        }

        return TraineeInvitationsResponse.From(invitation, [coach]);
    }

    private static string DisplayName(User user)
        => string.Join(" ", new[]
            {
                user.GivenName, user.FamilyName
            }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim() switch
            {
                "" => user.Email.Value,
                var value => value
            };
}
