using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Password;

public interface IPasswordHasher
{
    public (string HashedPassword, string Salt) Hash(string password);

    public bool Verify(User user, string password);
}