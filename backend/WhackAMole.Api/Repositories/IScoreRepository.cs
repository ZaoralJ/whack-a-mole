using WhackAMole.Api.Models;

namespace WhackAMole.Api.Repositories;

public interface IScoreRepository
{
    Task<ScoreEntry> AddAsync(ScoreEntry entry);
    Task<IReadOnlyList<ScoreEntry>> GetTopScoresAsync(int count);
}
