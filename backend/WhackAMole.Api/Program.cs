using Microsoft.EntityFrameworkCore;
using WhackAMole.Api.Data;
using WhackAMole.Api.Repositories;
using WhackAMole.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IScoreRepository, PostgresScoreRepository>();
builder.Services.AddScoped<IScoreService, ScoreService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(policy => policy
    .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
    .AllowAnyMethod()
    .AllowAnyHeader());

app.MapControllers();

app.Run();

public partial class Program { }
