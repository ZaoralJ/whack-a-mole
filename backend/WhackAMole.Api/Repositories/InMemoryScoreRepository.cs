using WhackAMole.Api.Models;

namespace WhackAMole.Api.Repositories;

public class InMemoryScoreRepository : IScoreRepository
{
    private readonly List<ScoreEntry> _scores = [];
    private int _nextId = 1;

    public Task<ScoreEntry> AddAsync(ScoreEntry entry)
    {
        entry.Id = _nextId++;
        _scores.Add(entry);
        return Task.FromResult(entry);
    }

    public Task<IReadOnlyList<ScoreEntry>> GetTopScoresAsync(int count)
    {
        var result = _scores
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.PlayedAt)
            .Take(count)
            .ToList();

        return Task.FromResult<IReadOnlyList<ScoreEntry>>(result);
    }
}
