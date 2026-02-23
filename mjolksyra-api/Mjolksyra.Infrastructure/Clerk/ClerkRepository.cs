using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Clerk;

namespace Mjolksyra.Infrastructure.Clerk;

public class ClerkRepository : IClerkRepository
{
    private readonly HttpClient _httpClient;
    private readonly ClerkOptions _clerkOptions;

    public ClerkRepository(HttpClient httpClient, IOptions<ClerkOptions> clerkOptions)
    {
        _httpClient = httpClient;
        _clerkOptions = clerkOptions.Value;
    }

    public async Task<ClerkUserProfile?> GetUser(string clerkUserId, CancellationToken cancellationToken = default)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, $"v1/users/{clerkUserId}");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _clerkOptions.SecretKey);

        using var res = await _httpClient.SendAsync(req, cancellationToken);
        if (!res.IsSuccessStatusCode) return null;

        await using var stream = await res.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = doc.RootElement;

        var email = root.TryGetProperty("email_addresses", out var emails) &&
                    emails.ValueKind == JsonValueKind.Array &&
                    emails.GetArrayLength() > 0 &&
                    emails[0].TryGetProperty("email_address", out var firstEmail)
            ? firstEmail.GetString()
            : null;

        var givenName = root.TryGetProperty("first_name", out var firstName)
            ? firstName.GetString()
            : null;
        var familyName = root.TryGetProperty("last_name", out var lastName)
            ? lastName.GetString()
            : null;

        return new ClerkUserProfile
        {
            Email = email,
            GivenName = givenName,
            FamilyName = familyName,
        };
    }
}
