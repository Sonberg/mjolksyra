using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Mjolksyra.Domain.Database.Models;
using Ndoors.Domain.Jwt;

namespace Mjolksyra.Domain.Jwt;

public interface IJwtGenerator
{
    string Generate(User user);

    string RefreshToken();
}

public class JwtGenerator : IJwtGenerator
{
    private readonly JwtOptions _options;

    public JwtGenerator(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string Generate(User user)
    {
        var claims = new List<Claim>
        {
            new("givenName", user.GivenName ?? ""),
            new("familyName", user.FamilyName ?? ""),
            new("name", $"{user.GivenName} {user.FamilyName}"),
            new("userId", user.Id.ToString()),
            new("email", user.Email),
            new(ClaimTypes.Role, "user")
        };

        return Generate(claims);
    }

    public string RefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private string Generate(List<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var jwtToken = new JwtSecurityToken(
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(15),
            audience: _options.Audience,
            issuer: _options.Issuer,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(jwtToken);
    }
}