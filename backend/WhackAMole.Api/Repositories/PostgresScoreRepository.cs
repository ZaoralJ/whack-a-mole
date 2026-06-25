using Microsoft.EntityFrameworkCore;
using WhackAMole.Api.Data;
using WhackAMole.Api.Models;

namespace WhackAMole.Api.Repositories;

public class PostgresScoreRepository : IScoreRepository
{
    private readonly AppDbContext _db;

    public PostgresScoreRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ScoreEntry> AddAsync(ScoreEntry entry)
    {
        _db.Scores.Add(entry);
        await _db.SaveChangesAsync();
        return entry;
    }

    public async Task<IReadOnlyList<ScoreEntry>> GetTopScoresAsync(int count)
    {
        return await _db.Scores
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.PlayedAt)
            .Take(count)
            .ToListAsync();
    }
}
