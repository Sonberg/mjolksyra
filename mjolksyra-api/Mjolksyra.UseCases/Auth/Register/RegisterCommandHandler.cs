using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Jwt;
using Mjolksyra.Domain.Password;

namespace Mjolksyra.UseCases.Auth.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IUserRepository _userRepository;

    private readonly IRefreshTokenRepository _refreshTokenRepository;

    private readonly IPasswordHasher _passwordHasher;

    private readonly IJwtGenerator _jwtGenerator;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtGenerator jwtGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return new RegisterResponse
            {
                IsSuccessful = false,
                Error = "Passwords do not match"
            };
        }

        var user = await _userRepository.GetByEmail(request.Email, cancellationToken);
        if (user is not null)
        {
            return new RegisterResponse
            {
                IsSuccessful = false,
                Error = "User already exists"
            };
        }

        var password = _passwordHasher.Hash(request.Password);
        var newUser = await _userRepository.Create(new User
        {
            GivenName = request.GivenName,
            FamilyName = request.FamilyName,
            Email = Email.From(request.Email),
            Password = password.HashedPassword,
            PasswordSalt = password.Salt,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        var token = _jwtGenerator.Generate(newUser);
        var refreshToken = await _refreshTokenRepository.Create(new RefreshToken
        {
            UserId = newUser.Id,
            Token = _jwtGenerator.RefreshToken(),
            ExpiresAt = DateTimeOffset.UtcNow.Add(RefreshToken.DefaultExpiration),
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        return new RegisterResponse
        {
            IsSuccessful = true,
            AccessToken = token,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiresAt = refreshToken.ExpiresAt
        };
    }
}