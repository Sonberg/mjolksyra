using MediatR;

namespace Mjolksyra.UseCases.Auth.Refresh;

public class RefreshCommand : IRequest<RefreshResponse>
{
    public required string? RefreshToken { get; set; }
}