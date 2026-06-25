interface ScoreboardProps {
  score: number
  timeRemainingMs: number
}

export function Scoreboard({ score, timeRemainingMs }: ScoreboardProps) {
  const seconds = Math.ceil(timeRemainingMs / 1000)

  return (
    <div className="scoreboard">
      <span className="score-display">Score: {score}</span>
      <span className="timer-display">Time: {seconds}s</span>
    </div>
  )
}
