using Microsoft.EntityFrameworkCore;
using WhackAMole.Api.Models;

namespace WhackAMole.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Score> Scores => Set<Score>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Score>(entity =>
        {
            entity.ToTable("scores");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PlayerName).HasColumnName("player_name").HasMaxLength(30).IsRequired();
            entity.Property(e => e.Points).HasColumnName("score").IsRequired();
            entity.Property(e => e.PlayedAt).HasColumnName("played_at").IsRequired();
        });
    }
}
