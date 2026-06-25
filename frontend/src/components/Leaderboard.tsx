import type { ScoreResponse } from '../api/scoresApi'

interface LeaderboardProps {
  scores: ScoreResponse[]
  loading: boolean
  error: string | null
}

export function Leaderboard({ scores, loading, error }: LeaderboardProps) {
  if (loading) {
    return <p className="leaderboard-loading">Loading scores...</p>
  }

  if (error) {
    return <p className="leaderboard-error">{error}</p>
  }

  if (scores.length === 0) {
    return <p className="leaderboard-empty">No scores yet. Be the first!</p>
  }

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((entry, index) => (
            <tr key={entry.id}>
              <td>{index + 1}</td>
              <td>{entry.playerName}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
