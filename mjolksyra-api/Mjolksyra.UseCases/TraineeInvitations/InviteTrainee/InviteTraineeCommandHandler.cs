using MediatR;
using Microsoft.Extensions.Configuration;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;

namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public class InviteTraineeCommandHandler(
    ITraineeInvitationsRepository invitationsRepository,
    IUserRepository userRepository,
    IEmailSender emailSender,
    IConfiguration configuration,
    ITraineeRepository traineeRepository
) : IRequestHandler<InviteTraineeCommand, TraineeInvitationsResponse>
{
    public async Task<TraineeInvitationsResponse> Handle(InviteTraineeCommand request, CancellationToken cancellationToken)
    {
        if (request.MonthlyPriceAmount <= 0)
        {
            throw new InvalidOperationException("Monthly price must be greater than zero.");
        }

        var athlete = await userRepository.GetByEmail(request.Email, cancellationToken);
        var coach = await userRepository.GetById(request.CoachUserId, cancellationToken);

        if (athlete is not null)
        {
            var exists = await traineeRepository.ExistsActiveRelationship(request.CoachUserId, athlete.Id, cancellationToken);
            if (exists)
            {
                throw new InvalidOperationException("Athlete is already connected to this coach.");
            }
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

        return TraineeInvitationsResponse.From(invitation, [coach]);
    }
}
