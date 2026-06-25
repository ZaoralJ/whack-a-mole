import { useCallback, useEffect, useRef, useState } from 'react'
import { GameEngine } from '../engine/GameEngine'
import type { GameState } from '../engine/types'
import { DEFAULT_CONFIG } from '../engine/types'

export function useGameEngine() {
  const engineRef = useRef<GameEngine>(new GameEngine(DEFAULT_CONFIG))
  const animationFrameRef = useRef<number>(0)
  const lastTickRef = useRef<number>(0)
  const [gameState, setGameState] = useState<GameState>(engineRef.current.getState())

  const gameLoop = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTickRef.current
    lastTickRef.current = now

    const state = engineRef.current.tick(delta)
    setGameState(state)

    if (state.status === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [])

  const startGame = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    const state = engineRef.current.start()
    setGameState(state)
    lastTickRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  const whackMole = useCallback((moleId: number) => {
    const state = engineRef.current.whack(moleId)
    setGameState(state)
  }, [])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return { gameState, startGame, whackMole }
}
