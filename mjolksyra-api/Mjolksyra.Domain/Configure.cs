using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.Domain.Jwt;
using Mjolksyra.Domain.Password;
using Ndoors.Domain.Jwt;

namespace Mjolksyra.Domain;

public static class Configure
{
    public static void AddDomain(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .ValidateOnStart();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtGenerator, JwtGenerator>();
    }
}