using Microsoft.AspNetCore.Mvc;
using WhackAMole.Api.Models;
using WhackAMole.Api.Services;

namespace WhackAMole.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoresController : ControllerBase
{
    private readonly IScoreService _scoreService;

    public ScoresController(IScoreService scoreService)
    {
        _scoreService = scoreService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ScoreResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Submit([FromBody] SubmitScoreRequest request)
    {
        try
        {
            var response = await _scoreService.SubmitScoreAsync(request);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ScoreResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTopScores([FromQuery] int top = 10)
    {
        var scores = await _scoreService.GetTopScoresAsync(top);
        return Ok(scores);
    }
}
