using MediatR;

namespace Mjolksyra.UseCases.Users;

public class GetUserRequest : IRequest<UserResponse>
{
    public required Guid UserId { get; set; }
}