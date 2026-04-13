using MediatR;

namespace Mjolksyra.UseCases.Coaches.ReleaseCreditsReservation;

public record ReleaseCreditsReservationCommand(
    Guid CoachUserId,
    int IncludedAmount,
    int PurchasedAmount,
    string? ReferenceId = null) : IRequest<ReleaseCreditsReservationResult>;

public record ReleaseCreditsReservationResult(bool Success);
