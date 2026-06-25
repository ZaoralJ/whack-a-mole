import { useCallback, useEffect, useState } from 'react'
import { getTopScores, submitScore } from '../api/scoresApi'
import type { ScoreResponse } from '../api/scoresApi'

export function useLeaderboard() {
  const [scores, setScores] = useState<ScoreResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchScores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTopScores(10)
      setScores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scores')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitPlayerScore = useCallback(async (playerName: string, score: number): Promise<boolean> => {
    setError(null)
    try {
      await submitScore({ playerName, score })
      await fetchScores()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit score')
      return false
    }
  }, [fetchScores])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  return { scores, loading, error, fetchScores, submitPlayerScore }
}
