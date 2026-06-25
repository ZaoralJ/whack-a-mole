import type { MoleState } from '../engine/types'
import { Mole } from './Mole'

interface GameBoardProps {
  moles: MoleState[]
  onWhack: (moleId: number) => void
}

export function GameBoard({ moles, onWhack }: GameBoardProps) {
  return (
    <div className="game-board">
      {moles.map(mole => (
        <Mole
          key={mole.id}
          isVisible={mole.isVisible}
          onWhack={() => onWhack(mole.id)}
        />
      ))}
    </div>
  )
}
