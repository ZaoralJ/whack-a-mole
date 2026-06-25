import type { GameConfig, GameState, MoleState } from './types'
import { DEFAULT_CONFIG } from './types'

export class GameEngine {
  private config: GameConfig
  private state: GameState
  private elapsedSinceLastSpawn: number
  private rng: () => number

  constructor(config: GameConfig = DEFAULT_CONFIG, rng: () => number = Math.random) {
    this.config = config
    this.rng = rng
    this.elapsedSinceLastSpawn = 0
    this.state = this.createInitialState()
  }

  start(): GameState {
    this.state = {
      ...this.createInitialState(),
      status: 'playing',
    }
    this.elapsedSinceLastSpawn = 0
    return this.getState()
  }

  tick(deltaMs: number): GameState {
    if (this.state.status !== 'playing') {
      return this.getState()
    }

    this.state.timeRemainingMs = Math.max(0, this.state.timeRemainingMs - deltaMs)

    if (this.state.timeRemainingMs <= 0) {
      this.state.status = 'gameOver'
      this.state.moles = this.state.moles.map(m => ({ ...m, isVisible: false }))
      return this.getState()
    }

    const currentTime = this.config.gameDurationMs - this.state.timeRemainingMs
    this.expireVisibleMoles(currentTime)
    this.elapsedSinceLastSpawn += deltaMs
    this.trySpawnMole(currentTime)

    return this.getState()
  }

  whack(moleId: number): GameState {
    if (this.state.status !== 'playing') {
      return this.getState()
    }

    const mole = this.state.moles[moleId]
    if (mole && mole.isVisible) {
      this.state.moles[moleId] = { ...mole, isVisible: false }
      this.state.score += 1
    }

    return this.getState()
  }

  getState(): GameState {
    return {
      ...this.state,
      moles: this.state.moles.map(m => ({ ...m })),
    }
  }

  private createInitialState(): GameState {
    const totalHoles = this.config.gridSize * this.config.gridSize
    const moles: MoleState[] = Array.from({ length: totalHoles }, (_, id) => ({
      id,
      isVisible: false,
      visibleSince: 0,
    }))

    return {
      moles,
      score: 0,
      timeRemainingMs: this.config.gameDurationMs,
      status: 'idle',
    }
  }

  private expireVisibleMoles(currentTime: number): void {
    this.state.moles = this.state.moles.map(mole => {
      if (mole.isVisible && currentTime - mole.visibleSince >= this.config.moleVisibleMs) {
        return { ...mole, isVisible: false }
      }
      return mole
    })
  }

  private trySpawnMole(currentTime: number): void {
    if (this.elapsedSinceLastSpawn < this.config.spawnIntervalMs) {
      return
    }

    this.elapsedSinceLastSpawn = 0

    const visibleCount = this.state.moles.filter(m => m.isVisible).length
    if (visibleCount >= this.config.maxVisibleMoles) {
      return
    }

    const hiddenMoles = this.state.moles.filter(m => !m.isVisible)
    if (hiddenMoles.length === 0) {
      return
    }

    const randomIndex = Math.floor(this.rng() * hiddenMoles.length)
    const chosenMole = hiddenMoles[randomIndex]

    this.state.moles[chosenMole.id] = {
      ...chosenMole,
      isVisible: true,
      visibleSince: currentTime,
    }
  }
}
