import { useState } from 'react'

interface GameOverProps {
  score: number
  onSubmit: (playerName: string) => void
  onPlayAgain: () => void
}

export function GameOver({ score, onSubmit, onPlayAgain }: GameOverProps) {
  const [playerName, setPlayerName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onSubmit(playerName.trim())
    }
  }

  return (
    <div className="game-over">
      <h2>Game Over!</h2>
      <p className="final-score">Your score: {score}</p>
      <form onSubmit={handleSubmit} className="name-form">
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={30}
          aria-label="Player name"
        />
        <button type="submit" disabled={!playerName.trim()}>
          Submit Score
        </button>
      </form>
      <button onClick={onPlayAgain} className="play-again-btn">
        Play Again
      </button>
    </div>
  )
}
