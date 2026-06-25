namespace WhackAMole.Api.Models;

public record SubmitScoreRequest(string PlayerName, int Score);

public record ScoreResponse(int Id, string PlayerName, int Score, DateTimeOffset PlayedAt);
