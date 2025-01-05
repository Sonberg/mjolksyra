using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Jwt;

namespace Mjolksyra.UseCases.Auth.Refresh;

public class RefreshCommandHandler : IRequestHandler<RefreshCommand, RefreshResponse>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    private readonly IUserRepository _userRepository;

    private readonly IJwtGenerator _jwtGenerator;

    public RefreshCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository,
        IJwtGenerator jwtGenerator)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<RefreshResponse> Handle(RefreshCommand request, CancellationToken cancellationToken)
    {
        if (request.RefreshToken is null)
        {
            return new RefreshResponse
            {
                IsSuccessful = false
            };
        }

        var refreshToken = await _refreshTokenRepository.GetByToken(request.RefreshToken, cancellationToken);
        if (refreshToken is null)
        {
            return new RefreshResponse
            {
                IsSuccessful = false
            };
        }

        if (refreshToken.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return new RefreshResponse
            {
                IsSuccessful = false
            };
        }

        if (refreshToken.UserId is not { } userId)
        {
            return new RefreshResponse
            {
                IsSuccessful = false
            };
        }

        var user = await _userRepository.GetById(userId, cancellationToken);
        if (user is null)
        {
            return new RefreshResponse
            {
                IsSuccessful = false
            };
        }

        var updatedRefreshToken = await _refreshTokenRepository.Update(refreshToken with
        {
            ExpiresAt = DateTimeOffset.UtcNow.Add(RefreshToken.DefaultExpiration)
        }, cancellationToken);

        return new RefreshResponse
        {
            IsSuccessful = true,
            RefreshToken = updatedRefreshToken.Token,
            RefreshTokenExpiresAt = updatedRefreshToken.ExpiresAt,
            AccessToken = _jwtGenerator.Generate(user)
        };
    }
}