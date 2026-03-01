using Mjolksyra.Infrastructure.Database;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public abstract class IndexBuilder : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger _logger;

    protected IndexBuilder(IServiceProvider serviceProvider, ILogger logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();

        try
        {
            await Build(context, stoppingToken);
            _logger.LogInformation("{Builder} index migration completed.", GetType().Name);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("{Builder} index migration cancelled.", GetType().Name);
        }
        catch (Exception buildException)
        {
            _logger.LogWarning(
                buildException,
                "{Builder} failed while creating index.",
                GetType().Name);

            if (!ShouldAttemptRebuild(buildException))
            {
                // Do not crash host for non-recoverable infrastructure states (e.g. low disk).
                return;
            }

            try
            {
                await Drop(context, stoppingToken);
            }
            catch (Exception dropException) when (IsIndexNotFound(dropException))
            {
                _logger.LogInformation(
                    "{Builder} drop skipped because index did not exist.",
                    GetType().Name);
            }
            catch (Exception dropException)
            {
                _logger.LogWarning(
                    dropException,
                    "{Builder} failed while dropping index before rebuild.",
                    GetType().Name);
                return;
            }

            try
            {
                await Build(context, stoppingToken);
                _logger.LogInformation(
                    "{Builder} index rebuild completed after drop.",
                    GetType().Name);
            }
            catch (Exception rebuildException)
            {
                _logger.LogWarning(
                    rebuildException,
                    "{Builder} index rebuild failed after drop. Continuing startup without crashing host.",
                    GetType().Name);
            }
        }
    }

    private static bool ShouldAttemptRebuild(Exception exception)
    {
        if (exception is not MongoCommandException commandException)
        {
            return false;
        }

        if (commandException.CodeName == "OutOfDiskSpace")
        {
            return false;
        }

        if (commandException.Message.Contains("available disk space", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return true;
    }

    private static bool IsIndexNotFound(Exception exception)
    {
        return exception is MongoCommandException commandException
               && (commandException.CodeName == "IndexNotFound"
                   || commandException.Message.Contains("index not found", StringComparison.OrdinalIgnoreCase));
    }

    protected abstract Task Build(IMongoDbContext context, CancellationToken stoppingToken);

    protected abstract Task Drop(IMongoDbContext context, CancellationToken stoppingToken);
}
