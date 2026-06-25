using System.Net;
using System.Net.Http.Json;
using WhackAMole.Api.Models;
using WhackAMole.Api.Tests.Helpers;

namespace WhackAMole.Api.Tests;

public class ScoresControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ScoresControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
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

    [Fact]
    public async Task Post_EmptyName_Returns400()
    {
        var request = new SubmitScoreRequest("", 5);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_WhitespaceName_Returns400()
    {
        var request = new SubmitScoreRequest("   ", 5);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_NameTooLong_Returns400()
    {
        var request = new SubmitScoreRequest(new string('A', 31), 5);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_NameExactly30Chars_Returns201()
    {
        var request = new SubmitScoreRequest(new string('B', 30), 5);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Post_NegativeScore_Returns400()
    {
        var request = new SubmitScoreRequest("Bob", -1);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_ScoreAbove99_Returns400()
    {
        var request = new SubmitScoreRequest("Bob", 100);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_ScoreZero_Returns201()
    {
        var request = new SubmitScoreRequest("Zero", 0);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Post_Score99_Returns201()
    {
        var request = new SubmitScoreRequest("Max", 99);

        var response = await _client.PostAsJsonAsync("/api/scores", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Get_ReturnsOrderedByScoreDescending()
    {
        var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Low", 3));
        await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("High", 20));
        await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Mid", 10));

        var response = await client.GetAsync("/api/scores");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();
        Assert.NotNull(scores);
        Assert.Equal(3, scores.Count);
        Assert.Equal("High", scores[0].PlayerName);
        Assert.Equal("Mid", scores[1].PlayerName);
        Assert.Equal("Low", scores[2].PlayerName);
    }

    [Fact]
    public async Task Get_TopLimitsResults()
    {
        var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        for (int i = 0; i < 5; i++)
            await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest($"Player{i}", i * 5));

        var response = await client.GetAsync("/api/scores?top=3");

        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();
        Assert.NotNull(scores);
        Assert.Equal(3, scores.Count);
    }

    [Fact]
    public async Task Get_TopClampedTo50WhenExceeded()
    {
        var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("Solo", 10));

        var response = await client.GetAsync("/api/scores?top=100");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();
        Assert.NotNull(scores);
        Assert.Single(scores);
    }

    [Fact]
    public async Task Post_TrimmedName_StoredWithoutLeadingTrailingSpaces()
    {
        var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("  Padded  ", 7));

        var response = await client.GetAsync("/api/scores");
        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();

        Assert.NotNull(scores);
        Assert.Equal("Padded", scores[0].PlayerName);
    }

    [Fact]
    public async Task PostThenGet_RoundTrip()
    {
        var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest("RoundTrip", 42));

        var response = await client.GetAsync("/api/scores");
        var scores = await response.Content.ReadFromJsonAsync<List<ScoreResponse>>();

        Assert.NotNull(scores);
        Assert.Contains(scores, s => s.PlayerName == "RoundTrip" && s.Score == 42);
    }
}
