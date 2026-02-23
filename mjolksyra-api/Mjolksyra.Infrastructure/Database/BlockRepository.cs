using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class BlockRepository : IBlockRepository
{
    private readonly IMongoDbContext _context;

    public BlockRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<Block> Create(Block block, CancellationToken cancellationToken)
    {
        await _context.Blocks.InsertOneAsync(block, new InsertOneOptions(), cancellationToken);

        return block;
    }

    public async Task<Block?> Get(Guid blockId, CancellationToken cancellationToken)
    {
        return await _context.Blocks.Find(x => x.Id == blockId)
            .ToListAsync(cancellationToken)
            .ContinueWith(t => t.Result.SingleOrDefault(), cancellationToken);
    }

    public async Task<ICollection<Block>> GetByCoach(Guid coachId, CancellationToken cancellationToken)
    {
        return await _context.Blocks.Find(x => x.CoachId == coachId)
            .ToListAsync(cancellationToken);
    }

    public async Task Update(Block block, CancellationToken cancellationToken)
    {
        await _context.Blocks.ReplaceOneAsync(x => x.Id == block.Id, block, new ReplaceOptions
        {
            IsUpsert = false
        }, cancellationToken);
    }

    public async Task Delete(Guid blockId, CancellationToken cancellationToken)
    {
        await _context.Blocks.FindOneAndDeleteAsync(x => x.Id == blockId, cancellationToken: cancellationToken);
    }
}
