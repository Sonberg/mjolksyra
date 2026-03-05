using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ApplyDiscountCode;

public class ApplyDiscountCodeCommand : IRequest<OneOf<ApplyDiscountCodeSuccess, DiscountCodeNotFound, DiscountCodeExpired>>
{
    public required Guid UserId { get; set; }

    public required string Code { get; set; }
}

public record ApplyDiscountCodeSuccess;

public record DiscountCodeNotFound;

public record DiscountCodeExpired;
