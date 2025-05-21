using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;

namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public class InviteTraineeCommandHandler(
    ITraineeInvitationsRepository invitationsRepository,
    IUserRepository userRepository,
    IEmailSender emailSender
) : IRequestHandler<InviteTraineeCommand, TraineeInvitationsResponse>
{
    public async Task<TraineeInvitationsResponse> Handle(InviteTraineeCommand request, CancellationToken cancellationToken)
    {
        var athlete = await userRepository.GetByEmail(request.Email, cancellationToken);
        var coach = await userRepository.GetById(request.CoachUserId, cancellationToken);
        var invitation = await invitationsRepository.Create(new TraineeInvitation
        {
            Id = Guid.NewGuid(),
            Email = Email.From(request.Email),
            CoachUserId = request.CoachUserId,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await emailSender.SendInvitation(request.Email, new InvitationEmail
        {
            Coach = coach.GivenName!,
            Text = athlete is not null ? "Log in to your account" : "Create an account",
            Link = "http://localhost:30000"
        }, cancellationToken);

        return TraineeInvitationsResponse.From(invitation, [coach]);
    }
}