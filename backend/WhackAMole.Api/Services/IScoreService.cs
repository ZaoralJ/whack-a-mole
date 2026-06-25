using WhackAMole.Api.Models;

namespace WhackAMole.Api.Services;

public interface IScoreService
{
    Task<ScoreResponse> SubmitScoreAsync(SubmitScoreRequest request);
    Task<IReadOnlyList<ScoreResponse>> GetTopScoresAsync(int count);
}
