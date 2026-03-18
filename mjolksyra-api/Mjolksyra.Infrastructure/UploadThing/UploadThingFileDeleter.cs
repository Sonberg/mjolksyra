using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mjolksyra.Infrastructure.UploadThing;

public class UploadThingFileDeleter(
    HttpClient httpClient,
    IOptions<UploadThingOptions> options,
    ILogger<UploadThingFileDeleter> logger) : IUploadThingFileDeleter
{
    private const string DeleteFilesUrl = "https://api.uploadthing.com/v6/deleteFiles";

    public async Task DeleteAsync(IEnumerable<string> fileKeys, CancellationToken cancellationToken)
    {
        var keys = fileKeys.ToList();
        if (keys.Count == 0) return;

        var body = JsonSerializer.Serialize(new { fileKeys = keys });
        var request = new HttpRequestMessage(HttpMethod.Post, DeleteFilesUrl)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("x-uploadthing-api-key", options.Value.GetApiKey());

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning(
                "UploadThing deletion failed for {Count} file(s). Status: {Status}",
                keys.Count, response.StatusCode);
        }
    }
}
