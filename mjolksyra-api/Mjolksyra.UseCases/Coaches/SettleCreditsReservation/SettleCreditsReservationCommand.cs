using MediatR;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Coaches.SettleCreditsReservation;

public record SettleCreditsReservationCommand(
    Guid CoachUserId,
    int IncludedAmount,
    int PurchasedAmount,
    CreditAction Action,
    string? ReferenceId = null) : IRequest<SettleCreditsReservationResult>;

public record SettleCreditsReservationResult(bool Success);
