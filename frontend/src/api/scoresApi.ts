const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5255'

export interface ScoreResponse {
  id: number
  playerName: string
  score: number
  playedAt: string
}

export interface SubmitScoreRequest {
  playerName: string
  score: number
}

export async function submitScore(request: SubmitScoreRequest): Promise<ScoreResponse> {
  const response = await fetch(`${API_BASE}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Submit failed' }))
    throw new Error(error.error ?? 'Submit failed')
  }

  return response.json()
}

export async function getTopScores(top: number = 10): Promise<ScoreResponse[]> {
  const response = await fetch(`${API_BASE}/api/scores?top=${top}`)

  if (!response.ok) {
    throw new Error('Failed to fetch scores')
  }

  return response.json()
}
