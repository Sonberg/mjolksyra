using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Jwt;
using Mjolksyra.Domain.Password;

namespace Mjolksyra.UseCases.Auth.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;

    private readonly IRefreshTokenRepository _refreshTokenRepository;

    private readonly IPasswordHasher _passwordHasher;

    private readonly IJwtGenerator _jwtGenerator;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IJwtGenerator jwtGenerator)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmail(request.Email, cancellationToken);
        if (user is null)
        {
            return new LoginResponse
            {
                IsSuccessful = false
            };
        }

        var isSuccessful = _passwordHasher.Verify(user, request.Password);
        if (!isSuccessful)
        {
            return new LoginResponse
            {
                IsSuccessful = false
            };
        }

        var token = _jwtGenerator.Generate(user);
        var refreshToken = await _refreshTokenRepository.Create(new RefreshToken
        {
            UserId = user.Id,
            Token = _jwtGenerator.RefreshToken(),
            ExpiresAt = DateTimeOffset.UtcNow.Add(RefreshToken.DefaultExpiration),
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        return new LoginResponse
        {
            IsSuccessful = true,
            AccessToken = token,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiresAt = refreshToken.ExpiresAt
        };
    }
}