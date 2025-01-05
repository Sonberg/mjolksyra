using System.Security.Cryptography;
using System.Text;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Password;

public class PasswordHasher : IPasswordHasher
{
    public (string HashedPassword, string Salt) Hash(string password)
    {
        var saltBytes = GenerateSalt();
        var hashedPassword = Hash(password, saltBytes);
        var base64Salt = Convert.ToBase64String(saltBytes);
        var retrievedSaltBytes = Convert.FromBase64String(base64Salt);
        var salt = Encoding.UTF8.GetString(retrievedSaltBytes, 0, retrievedSaltBytes.Length);

        return (hashedPassword, salt);
    }

    public bool Verify(User user, string password)
    {
        var saltBytes = Encoding.UTF8.GetBytes(user.PasswordSalt);
        var hashed = Hash(password, saltBytes);

        return hashed == user.Password;
    }

    private static byte[] GenerateSalt()
    {
        return RandomNumberGenerator.GetBytes(16);
    }

    private static string Hash(string password, byte[] salt)
    {
        var passwordBytes = Encoding.UTF8.GetBytes(password);
        var saltedPassword = new byte[passwordBytes.Length + salt.Length];

        // Concatenate password and salt
        Buffer.BlockCopy(passwordBytes, 0, saltedPassword, 0, passwordBytes.Length);
        Buffer.BlockCopy(salt, 0, saltedPassword, passwordBytes.Length, salt.Length);

        // Hash the concatenated password and salt
        var hashedBytes = SHA256.HashData(saltedPassword);

        // Concatenate the salt and hashed password for storage
        var hashedPasswordWithSalt = new byte[hashedBytes.Length + salt.Length];
        Buffer.BlockCopy(salt, 0, hashedPasswordWithSalt, 0, salt.Length);
        Buffer.BlockCopy(hashedBytes, 0, hashedPasswordWithSalt, salt.Length, hashedBytes.Length);

        return Convert.ToBase64String(hashedPasswordWithSalt);
    }
}