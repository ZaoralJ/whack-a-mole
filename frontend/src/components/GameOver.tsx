import { useState } from 'react'

interface GameOverProps {
  score: number
  onSubmit: (playerName: string) => Promise<boolean>
  onPlayAgain: () => void
}

export function GameOver({ score, onSubmit, onPlayAgain }: GameOverProps) {
  const [playerName, setPlayerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim() || submitting || submitted) return

    setSubmitting(true)
    setSubmitError(null)

    const success = await onSubmit(playerName.trim())

    if (success) {
      setSubmitted(true)
    } else {
      setSubmitError('Failed to submit score. Try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="game-over">
      <h2>Game Over!</h2>
      <p className="final-score">Your score: {score}</p>
      {submitted ? (
        <p className="submit-success">Score submitted!</p>
      ) : (
        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={30}
            aria-label="Player name"
            disabled={submitting}
          />
          <button type="submit" disabled={!playerName.trim() || submitting}>
            {submitting ? 'Submitting...' : 'Submit Score'}
          </button>
          {submitError && <p className="submit-error">{submitError}</p>}
        </form>
      )}
      <button onClick={onPlayAgain} className="play-again-btn">
        Play Again
      </button>
    </div>
  )
}
