export interface GameConfig {
  gridSize: number
  gameDurationMs: number
  moleVisibleMs: number
  maxVisibleMoles: number
  spawnIntervalMs: number
}

export interface MoleState {
  id: number
  isVisible: boolean
  visibleSince: number
}

export type GameStatus = 'idle' | 'playing' | 'gameOver'

export interface GameState {
  moles: MoleState[]
  score: number
  timeRemainingMs: number
  status: GameStatus
}

export const DEFAULT_CONFIG: GameConfig = {
  gridSize: 3,
  gameDurationMs: 30_000,
  moleVisibleMs: 1_000,
  maxVisibleMoles: 2,
  spawnIntervalMs: 800,
}
