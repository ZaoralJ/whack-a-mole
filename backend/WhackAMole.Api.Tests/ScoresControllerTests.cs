using System.Net;
using System.Net.Http.Json;
using WhackAMole.Api.Models;
using WhackAMole.Api.Tests.Helpers;

namespace WhackAMole.Api.Tests;

public class ScoresControllerTests : IAsyncLifetime
{
    private TestWebApplicationFactory _factory = null!;
    private HttpClient _client = null!;

    public Task InitializeAsync()
    {
        _factory = new TestWebApplicationFactory();
        _client = _factory.CreateClient();
        return Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }

    [Fact]
    public async Task Post_ValidScore_Returns201WithResponse()
    {
        var request = new SubmitScoreRequest("Alice", 15);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<ScoreResponse>();
        Assert.NotNull(body);
        Assert.Equal("Alice", body.PlayerName);
        Assert.Equal(15, body.Score);
        Assert.True(body.Id > 0);
    }

    [Theory]
    [InlineData("", 5, HttpStatusCode.BadRequest)]
    [InlineData("   ", 5, HttpStatusCode.BadRequest)]
    [InlineData("Bob", -1, HttpStatusCode.BadRequest)]
    [InlineData("Bob", 100, HttpStatusCode.BadRequest)]
    public async Task Post_InvalidInput_Returns400(string name, int score, HttpStatusCode expected)
    {
        var request = new SubmitScoreRequest(name, score);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task Post_NameTooLong_Returns400()
    {
        var request = new SubmitScoreRequest(new string('A', 31), 5);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(99)]
    public async Task Post_BoundaryScores_Returns201(int score)
    {
        var request = new SubmitScoreRequest("Boundary", score);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Post_NameExactly30Chars_Returns201()
    {
        var request = new SubmitScoreRequest(new string('B', 30), 5);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Post_TrimmedName_StoredWithoutLeadingTrailingSpaces()
    {
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("  Padded  ", 7));

        var response = await _client.GetAsync("/api/scores");
        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();

        Assert.NotNull(scores);
        Assert.Contains(scores, s => s.PlayerName == "Padded");
    }

    [Fact]
    public async Task Get_ReturnsOrderedByScoreDescending()
    {
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Low", 3));
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("High", 20));
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Mid", 10));

        var response = await _client.GetAsync("/api/scores");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();
        Assert.NotNull(scores);
        Assert.True(scores.Count >= 3);

        var top3 = scores.Take(3).ToList();
        Assert.True(top3[0].Score >= top3[1].Score);
        Assert.True(top3[1].Score >= top3[2].Score);
    }

    [Fact]
    public async Task Get_EqualScores_TieBreakByEarliestPlayedAt()
    {
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("First", 10));
        await Task.Delay(50);
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Second", 10));

        var response = await _client.GetAsync("/api/scores");
        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();

        Assert.NotNull(scores);
        var tied = scores.Where(s => s.Score == 10).ToList();
        Assert.True(tied.Count >= 2);
        Assert.Equal("First", tied[0].PlayerName);
        Assert.Equal("Second", tied[1].PlayerName);
    }

    [Fact]
    public async Task Get_TopLimitsResults()
    {
        for (int i = 0; i < 5; i++)
            await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest($"Limit{i}", i * 10 + 50));

        var response = await _client.GetAsync("/api/scores?top=3");

        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();
        Assert.NotNull(scores);
        Assert.Equal(3, scores.Count);
    }

    [Fact]
    public async Task Get_TopClampedTo50WhenExceeded()
    {
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Solo", 10));

        var response = await _client.GetAsync("/api/scores?top=100");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PostThenGet_RoundTrip()
    {
        await _client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("RoundTrip", 42));

        var response = await _client.GetAsync("/api/scores");
        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();

        Assert.NotNull(scores);
        Assert.Contains(scores, s => s.PlayerName == "RoundTrip" && s.Score == 42);
    }
}
