interface MoleProps {
  isVisible: boolean
  onWhack: () => void
}

export function Mole({ isVisible, onWhack }: MoleProps) {
  return (
    <button
      className={`mole-hole ${isVisible ? 'mole-visible' : ''}`}
      onClick={onWhack}
      disabled={!isVisible}
      aria-label={isVisible ? 'Whack the mole!' : 'Empty hole'}
    >
      <span className="mole-emoji">{isVisible ? '🐹' : ''}</span>
    </button>
  )
}
