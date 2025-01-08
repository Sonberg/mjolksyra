using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees;

public class TraineeUserResponse
{
    public required Guid Id { get; set; }

    public required string Email { get; set; }

    public required string Name { get; set; }

    public required string? GivenName { get; set; }

    public required string? FamilyName { get; set; }

    public static TraineeUserResponse From(User user)
    {
        return new TraineeUserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = $"{user.GivenName} {user.FamilyName}",
            GivenName = user.GivenName,
            FamilyName = user.FamilyName
        };
    }
}