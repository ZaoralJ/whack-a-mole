using Microsoft.EntityFrameworkCore;
using WhackAMole.Api.Models;

namespace WhackAMole.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ScoreEntry> Scores => Set<ScoreEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ScoreEntry>(entity =>
        {
            entity.ToTable("scores");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PlayerName).HasColumnName("player_name").HasMaxLength(30).IsRequired();
            entity.Property(e => e.Score).HasColumnName("score").IsRequired();
            entity.Property(e => e.PlayedAt).HasColumnName("played_at").IsRequired();
            entity.HasIndex(e => e.Score).IsDescending();
        });
    }
}
