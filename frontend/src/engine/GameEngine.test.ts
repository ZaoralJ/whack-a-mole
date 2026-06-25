import { describe, it, expect } from 'vitest'
import { GameEngine } from './GameEngine'
import type { GameConfig } from './types'

const testConfig: GameConfig = {
  gridSize: 3,
  gameDurationMs: 30_000,
  moleVisibleMs: 1_000,
  maxVisibleMoles: 2,
  spawnIntervalMs: 800,
}

function createSeededEngine(seed: number = 0.5): GameEngine {
  let value = seed
  const rng = () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
  return new GameEngine(testConfig, rng)
}

describe('GameEngine', () => {
  describe('initial state', () => {
    it('starts in idle status', () => {
      const engine = new GameEngine(testConfig)
      const state = engine.getState()

      expect(state.status).toBe('idle')
      expect(state.score).toBe(0)
      expect(state.timeRemainingMs).toBe(30_000)
    })

    it('has correct number of moles', () => {
      const engine = new GameEngine(testConfig)
      const state = engine.getState()

      expect(state.moles).toHaveLength(9)
    })

    it('all moles start hidden', () => {
      const engine = new GameEngine(testConfig)
      const state = engine.getState()

      expect(state.moles.every(m => !m.isVisible)).toBe(true)
    })
  })

  describe('start()', () => {
    it('sets status to playing', () => {
      const engine = new GameEngine(testConfig)
      const state = engine.start()

      expect(state.status).toBe('playing')
    })

    it('resets score to 0', () => {
      const engine = new GameEngine(testConfig)
      engine.start()
      engine.whack(0)
      const state = engine.start()

      expect(state.score).toBe(0)
    })
  })

  describe('tick()', () => {
    it('decreases time remaining', () => {
      const engine = createSeededEngine()
      engine.start()

      const state = engine.tick(100)

      expect(state.timeRemainingMs).toBe(29_900)
    })

    it('does nothing when idle', () => {
      const engine = new GameEngine(testConfig)
      const state = engine.tick(100)

      expect(state.status).toBe('idle')
      expect(state.timeRemainingMs).toBe(30_000)
    })

    it('ends game when time runs out', () => {
      const engine = createSeededEngine()
      engine.start()

      const state = engine.tick(30_000)

      expect(state.status).toBe('gameOver')
      expect(state.timeRemainingMs).toBe(0)
    })

    it('hides all moles on game over', () => {
      const engine = createSeededEngine()
      engine.start()
      engine.tick(800)

      const state = engine.tick(29_200)

      expect(state.status).toBe('gameOver')
      expect(state.moles.every(m => !m.isVisible)).toBe(true)
    })

    it('spawns a mole after spawn interval', () => {
      const engine = createSeededEngine()
      engine.start()

      const state = engine.tick(800)

      const visibleCount = state.moles.filter(m => m.isVisible).length
      expect(visibleCount).toBeGreaterThanOrEqual(1)
    })

    it('does not spawn before spawn interval', () => {
      const engine = createSeededEngine()
      engine.start()

      const state = engine.tick(799)

      const visibleCount = state.moles.filter(m => m.isVisible).length
      expect(visibleCount).toBe(0)
    })

    it('does not exceed maxVisibleMoles', () => {
      const engine = createSeededEngine()
      engine.start()

      for (let i = 0; i < 20; i++) {
        engine.tick(800)
      }

      const state = engine.getState()
      const visibleCount = state.moles.filter(m => m.isVisible).length
      expect(visibleCount).toBeLessThanOrEqual(testConfig.maxVisibleMoles)
    })

    it('mole disappears after moleVisibleMs', () => {
      const engine = createSeededEngine()
      engine.start()

      engine.tick(800)
      const afterSpawn = engine.getState()
      const spawnedMole = afterSpawn.moles.find(m => m.isVisible)
      expect(spawnedMole).toBeDefined()

      engine.tick(1_000)
      const afterExpiry = engine.getState()
      const sameMole = afterExpiry.moles[spawnedMole!.id]
      expect(sameMole.isVisible).toBe(false)
    })

    it('time remaining never goes below 0', () => {
      const engine = createSeededEngine()
      engine.start()

      const state = engine.tick(50_000)

      expect(state.timeRemainingMs).toBe(0)
    })
  })

  describe('whack()', () => {
    it('increments score when whacking a visible mole', () => {
      const engine = createSeededEngine()
      engine.start()
      engine.tick(800)

      const state = engine.getState()
      const visibleMole = state.moles.find(m => m.isVisible)
      expect(visibleMole).toBeDefined()

      const afterWhack = engine.whack(visibleMole!.id)
      expect(afterWhack.score).toBe(1)
    })

    it('hides the mole after whacking', () => {
      const engine = createSeededEngine()
      engine.start()
      engine.tick(800)

      const state = engine.getState()
      const visibleMole = state.moles.find(m => m.isVisible)

      const afterWhack = engine.whack(visibleMole!.id)
      expect(afterWhack.moles[visibleMole!.id].isVisible).toBe(false)
    })

    it('does not increment score when whacking a hidden mole', () => {
      const engine = createSeededEngine()
      engine.start()

      const state = engine.whack(0)

      expect(state.score).toBe(0)
    })

    it('does nothing when game is idle', () => {
      const engine = new GameEngine(testConfig)

      const state = engine.whack(0)

      expect(state.score).toBe(0)
      expect(state.status).toBe('idle')
    })

    it('does nothing when game is over', () => {
      const engine = createSeededEngine()
      engine.start()
      engine.tick(30_000)

      const state = engine.whack(0)

      expect(state.score).toBe(0)
      expect(state.status).toBe('gameOver')
    })
  })

  describe('getState()', () => {
    it('returns a copy (mutations do not affect engine)', () => {
      const engine = new GameEngine(testConfig)
      const state = engine.getState()

      state.score = 999
      state.moles[0].isVisible = true

      const freshState = engine.getState()
      expect(freshState.score).toBe(0)
      expect(freshState.moles[0].isVisible).toBe(false)
    })
  })
})
