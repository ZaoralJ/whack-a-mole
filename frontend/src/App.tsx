import { useEffect, useRef } from 'react'
import { useGameEngine } from './hooks/useGameEngine'
import { useLeaderboard } from './hooks/useLeaderboard'
import { GameBoard } from './components/GameBoard'
import { Scoreboard } from './components/Scoreboard'
import { GameOver } from './components/GameOver'
import { Leaderboard } from './components/Leaderboard'

export default function App() {
  const { gameState, startGame, whackMole } = useGameEngine()
  const { scores, loading, error, fetchScores, submitPlayerScore } = useLeaderboard()
  const prevStatusRef = useRef(gameState.status)

  useEffect(() => {
    if (prevStatusRef.current === 'playing' && gameState.status === 'gameOver') {
      fetchScores()
    }
    prevStatusRef.current = gameState.status
  }, [gameState.status, fetchScores])

  const handleSubmitScore = async (playerName: string): Promise<boolean> => {
    return submitPlayerScore(playerName, gameState.score)
  }

  return (
    <div className="app">
      <h1>Whack-a-Mole</h1>

      {gameState.status === 'idle' && (
        <div className="start-screen">
          <button onClick={startGame} className="start-btn">
            Start Game
          </button>
          <Leaderboard scores={scores} loading={loading} error={error} />
        </div>
      )}

      {gameState.status === 'playing' && (
        <>
          <Scoreboard score={gameState.score} timeRemainingMs={gameState.timeRemainingMs} />
          <GameBoard moles={gameState.moles} onWhack={whackMole} />
        </>
      )}

      {gameState.status === 'gameOver' && (
        <>
          <GameOver
            score={gameState.score}
            onSubmit={handleSubmitScore}
            onPlayAgain={startGame}
          />
          <Leaderboard scores={scores} loading={loading} error={error} />
        </>
      )}
    </div>
  )
}
