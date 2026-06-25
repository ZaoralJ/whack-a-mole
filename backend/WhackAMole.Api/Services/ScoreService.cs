using WhackAMole.Api.Models;
using WhackAMole.Api.Repositories;

namespace WhackAMole.Api.Services;

public class ScoreService : IScoreService
{
    private readonly IScoreRepository _repository;

    public ScoreService(IScoreRepository repository)
    {
        _repository = repository;
    }

    public async Task<ScoreResponse> SubmitScoreAsync(SubmitScoreRequest request)
    {
        var trimmedName = request.PlayerName?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(trimmedName))
            throw new ArgumentException("Player name is required.");

        if (trimmedName.Length > 30)
            throw new ArgumentException("Player name must be 30 characters or fewer.");

        if (request.Score < 0 || request.Score > 99)
            throw new ArgumentException("Score must be between 0 and 99.");

        var entry = new ScoreEntry
        {
            PlayerName = trimmedName,
            Score = request.Score,
            PlayedAt = DateTimeOffset.UtcNow
        };

        var saved = await _repository.AddAsync(entry);

        return new ScoreResponse(saved.Id, saved.PlayerName, saved.Score, saved.PlayedAt);
    }

    public async Task<IReadOnlyList<ScoreResponse>> GetTopScoresAsync(int count)
    {
        if (count is < 1 or > 50)
            count = 10;

        var entries = await _repository.GetTopScoresAsync(count);

        return entries
            .Select(e => new ScoreResponse(e.Id, e.PlayerName, e.Score, e.PlayedAt))
            .ToList();
    }
}
