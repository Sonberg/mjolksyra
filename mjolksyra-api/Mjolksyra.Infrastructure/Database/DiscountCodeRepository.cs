using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace Mjolksyra.Infrastructure.Database;

public class DiscountCodeRepository : IDiscountCodeRepository
{
    private readonly IMongoDbContext _context;

    public DiscountCodeRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<DiscountCode?> GetByCode(string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code))
            return null;

        var normalizedCode = code.Trim();
        var exactMatchIgnoreCasePattern = $"^{Regex.Escape(normalizedCode)}$";
        var filter = Builders<DiscountCode>.Filter.Regex(x => x.Code, new BsonRegularExpression(exactMatchIgnoreCasePattern, "i"));

        return await _context.DiscountCodes
            .Find(filter)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<DiscountCode?> GetById(Guid id, CancellationToken ct)
    {
        return await _context.DiscountCodes
            .Find(x => x.Id == id)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<ICollection<DiscountCode>> GetAllAsync(CancellationToken ct)
    {
        return await _context.DiscountCodes
            .Find(Builders<DiscountCode>.Filter.Empty)
            .ToListAsync(ct);
    }

    public async Task<DiscountCode> Create(DiscountCode code, CancellationToken ct)
    {
        await _context.DiscountCodes.InsertOneAsync(code, new InsertOneOptions(), ct);
        return code;
    }

    public async Task<DiscountCode> Update(DiscountCode code, CancellationToken ct)
    {
        await _context.DiscountCodes.ReplaceOneAsync(x => x.Id == code.Id, code, new ReplaceOptions
        {
            IsUpsert = false
        }, ct);
        return code;
    }
}
