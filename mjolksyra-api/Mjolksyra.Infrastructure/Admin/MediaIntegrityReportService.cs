using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using Mjolksyra.Infrastructure.R2;
using Mjolksyra.UseCases.Admin.GetMediaIntegrity;
using MongoDB.Driver;
using System.Net;

namespace Mjolksyra.Infrastructure.Admin;

public class AttachmentIntegrityReportService(
    IMongoDbContext context,
    IOptions<R2Options> r2Options,
    IHttpClientFactory httpClientFactory) : IAttachmentIntegrityReportService
{
    public async Task<AttachmentIntegrityReportResponse> GenerateAsync(CancellationToken cancellationToken)
    {
        var publicBaseUrl = r2Options.Value.PublicBaseUrl;

        var completedWorkoutsTask = context.CompletedWorkouts.Find(FilterDefinition<CompletedWorkout>.Empty).ToListAsync(cancellationToken);
        var chatMessagesTask = context.CompletedWorkoutChatMessages.Find(FilterDefinition<CompletedWorkoutChatMessage>.Empty).ToListAsync(cancellationToken);
        var analysesTask = context.WorkoutMediaAnalyses.Find(FilterDefinition<WorkoutMediaAnalysisRecord>.Empty).ToListAsync(cancellationToken);
        var r2ObjectsTask = ListWorkoutObjectsAsync(cancellationToken);

        await Task.WhenAll(completedWorkoutsTask, chatMessagesTask, analysesTask, r2ObjectsTask);

        var referencedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var deadReferences = new List<DeadMediaReferenceResponse>();
        var rawWithCompressed = new List<RawWithCompressedResponse>();
        var externalUrls = new List<(string SourceType, Guid TraineeId, string OwnerId, string Url)>();
        var r2References = new List<(string SourceType, Guid TraineeId, string OwnerId, string Url, string Key)>();

        foreach (var workout in completedWorkoutsTask.Result)
        {
            CollectMediaReferences(
                "completed-workout-media",
                workout.TraineeId,
                workout.Id.ToString(),
                workout.Media,
                publicBaseUrl,
                referencedKeys,
                rawWithCompressed,
                r2References,
                externalUrls);
        }

        foreach (var message in chatMessagesTask.Result)
        {
            CollectMediaReferences(
                "completed-workout-chat-attachments",
                message.TraineeId,
                message.Id.ToString(),
                message.Media,
                publicBaseUrl,
                referencedKeys,
                rawWithCompressed,
                r2References,
                externalUrls);
        }

        foreach (var analysis in analysesTask.Result)
        {
            foreach (var url in analysis.MediaUrls.Where(url => !string.IsNullOrWhiteSpace(url)))
            {
                CollectSingleUrl(
                    "completed-workout-analysis-attachments",
                    analysis.TraineeId,
                    analysis.Id.ToString(),
                    url,
                    publicBaseUrl,
                    referencedKeys,
                    r2References,
                    externalUrls);
            }
        }

        var r2Objects = r2ObjectsTask.Result;
        var r2ObjectKeys = r2Objects
            .Select(x => x.Key)
            .Where(key => !string.IsNullOrWhiteSpace(key))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        deadReferences.AddRange(
            r2References
                .Where(x => !r2ObjectKeys.Contains(x.Key))
                .Select(x => new DeadMediaReferenceResponse
                {
                    SourceType = x.SourceType,
                    TraineeId = x.TraineeId,
                    OwnerId = x.OwnerId,
                    Url = x.Url,
                    Key = x.Key,
                    Reason = "R2 object is missing.",
                }));

        foreach (var external in externalUrls)
        {
            if (!await UrlRespondsAsync(external.Url, cancellationToken))
            {
                deadReferences.Add(new DeadMediaReferenceResponse
                {
                    SourceType = external.SourceType,
                    TraineeId = external.TraineeId,
                    OwnerId = external.OwnerId,
                    Url = external.Url,
                    Reason = "URL did not respond successfully.",
                });
            }
        }

        var orphanObjects = r2Objects
            .Where(x => !referencedKeys.Contains(x.Key))
            .Select(x => new OrphanMediaObjectResponse
            {
                Key = x.Key,
                SizeBytes = x.Size,
                LastModifiedAt = x.LastModified,
            })
            .OrderByDescending(x => x.SizeBytes)
            .ToList();

        return new AttachmentIntegrityReportResponse
        {
            GeneratedAt = DateTimeOffset.UtcNow,
            Summary = new AttachmentIntegritySummaryResponse
            {
                TotalReferencedMediaUrls = referencedKeys.Count + externalUrls.Count,
                TotalR2Objects = r2Objects.Count,
                OrphanObjectCount = orphanObjects.Count,
                RawWithCompressedCount = rawWithCompressed.Count,
                DeadReferenceCount = deadReferences.Count,
            },
            OrphanObjects = orphanObjects,
            RawWithCompressed = rawWithCompressed
                .OrderBy(x => x.SourceType)
                .ThenBy(x => x.OwnerId)
                .ToList(),
            DeadReferences = deadReferences
                .OrderBy(x => x.SourceType)
                .ThenBy(x => x.OwnerId)
                .ToList(),
        };
    }

    private static void CollectMediaReferences(
        string sourceType,
        Guid traineeId,
        string ownerId,
        IEnumerable<PlannedWorkoutMedia> mediaItems,
        string publicBaseUrl,
        HashSet<string> referencedKeys,
        ICollection<RawWithCompressedResponse> rawWithCompressed,
        ICollection<(string SourceType, Guid TraineeId, string OwnerId, string Url, string Key)> r2References,
        ICollection<(string SourceType, Guid TraineeId, string OwnerId, string Url)> externalUrls)
    {
        foreach (var media in mediaItems)
        {
            if (!string.IsNullOrWhiteSpace(media.RawUrl))
            {
                CollectSingleUrl(sourceType, traineeId, ownerId, media.RawUrl, publicBaseUrl, referencedKeys, r2References, externalUrls);
            }

            if (!string.IsNullOrWhiteSpace(media.CompressedUrl))
            {
                CollectSingleUrl(sourceType, traineeId, ownerId, media.CompressedUrl!, publicBaseUrl, referencedKeys, r2References, externalUrls);
            }

            var rawKey = R2UrlHelper.ExtractKey(media.RawUrl, publicBaseUrl);
            var compressedKey = string.IsNullOrWhiteSpace(media.CompressedUrl)
                ? string.Empty
                : R2UrlHelper.ExtractKey(media.CompressedUrl!, publicBaseUrl);

            if (!string.IsNullOrWhiteSpace(rawKey) && !string.IsNullOrWhiteSpace(compressedKey))
            {
                rawWithCompressed.Add(new RawWithCompressedResponse
                {
                    SourceType = sourceType,
                    TraineeId = traineeId,
                    OwnerId = ownerId,
                    RawUrl = media.RawUrl,
                    RawKey = rawKey,
                    CompressedUrl = media.CompressedUrl!,
                    CompressedKey = compressedKey,
                });
            }
        }
    }

    private static void CollectSingleUrl(
        string sourceType,
        Guid traineeId,
        string ownerId,
        string url,
        string publicBaseUrl,
        HashSet<string> referencedKeys,
        ICollection<(string SourceType, Guid TraineeId, string OwnerId, string Url, string Key)> r2References,
        ICollection<(string SourceType, Guid TraineeId, string OwnerId, string Url)> externalUrls)
    {
        var key = R2UrlHelper.ExtractKey(url, publicBaseUrl);
        if (!string.IsNullOrWhiteSpace(key))
        {
            referencedKeys.Add(key);
            r2References.Add((sourceType, traineeId, ownerId, url, key));
            return;
        }

        externalUrls.Add((sourceType, traineeId, ownerId, url));
    }

    private async Task<List<R2ObjectInfo>> ListWorkoutObjectsAsync(CancellationToken cancellationToken)
    {
        var opts = r2Options.Value;
        using var client = CreateClient(opts);

        var results = new List<R2ObjectInfo>();
        string? continuationToken = null;

        do
        {
            var response = await client.ListObjectsV2Async(new ListObjectsV2Request
            {
                BucketName = opts.BucketName,
                Prefix = "workouts/",
                ContinuationToken = continuationToken,
            }, cancellationToken);

            results.AddRange(response.S3Objects.Select(obj => new R2ObjectInfo
            {
                Key = obj.Key,
                Size = obj.Size,
                LastModified = obj.LastModified == default ? null : new DateTimeOffset(obj.LastModified),
            }));

            continuationToken = response.IsTruncated ? response.NextContinuationToken : null;
        } while (continuationToken is not null);

        return results;
    }

    private async Task<bool> UrlRespondsAsync(string url, CancellationToken cancellationToken)
    {
        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);

            using var headRequest = new HttpRequestMessage(HttpMethod.Head, url);
            using var headResponse = await client.SendAsync(headRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if ((int)headResponse.StatusCode >= 200 && (int)headResponse.StatusCode < 400)
            {
                return true;
            }

            if (headResponse.StatusCode != HttpStatusCode.MethodNotAllowed)
            {
                return false;
            }

            using var getRequest = new HttpRequestMessage(HttpMethod.Get, url);
            using var getResponse = await client.SendAsync(getRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            return (int)getResponse.StatusCode >= 200 && (int)getResponse.StatusCode < 400;
        }
        catch
        {
            return false;
        }
    }

    private static AmazonS3Client CreateClient(R2Options opts)
    {
        var credentials = new BasicAWSCredentials(opts.AccessKeyId, opts.SecretAccessKey);
        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{opts.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
        };
        return new AmazonS3Client(credentials, config);
    }

    private class R2ObjectInfo
    {
        public required string Key { get; set; }
        public long Size { get; set; }
        public DateTimeOffset? LastModified { get; set; }
    }
}
