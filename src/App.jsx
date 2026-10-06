import { useState } from 'react'
import './App.css'
import Snake from './games/Snake'
import MemoryMatch from './games/MemoryMatch'
import WhackAPixel from './games/WhackAPixel'

const games = [
  {
    id: 'snake',
    label: 'Snake 44',
    icon: '🐍',
    description: 'Grab pixels, grow longer, avoid becoming your own bug.',
    component: Snake,
  },
  {
    id: 'memory',
    label: 'Memory Match',
    icon: '🧠',
    description: 'Flip the grid and match all eight retro pairs.',
    component: MemoryMatch,
  },
  {
    id: 'whack',
    label: 'Whack-a-Pixel',
    icon: '👾',
    description: 'Twenty seconds. One blinking invader. Questionable reflexes.',
    component: WhackAPixel,
  },
]

function App() {
  const [activeGame, setActiveGame] = useState('snake')
  const selected = games.find((game) => game.id === activeGame)
  const Game = selected.component

  return (
    <main className="arcade-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">BASE CODE LAB // INSERT COIN</p>
          <h1>Retro Arcade <span>44</span></h1>
          <p className="hero-description">
            A tiny playable React arcade built for testing, tinkering, and shipping changes.
          </p>
        </div>
        <div className="status-panel" aria-label="Demo app status">
          <span className="status-light" />
          <div>
            <strong>3 games online</strong>
            <small>React + Vite · no backend</small>
          </div>
        </div>
      </header>

      <section className="game-picker" aria-label="Choose a game">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            className={game.id === activeGame ? 'game-card active' : 'game-card'}
            onClick={() => setActiveGame(game.id)}
            aria-pressed={game.id === activeGame}
          >
            <span className="game-icon" aria-hidden="true">{game.icon}</span>
            <span>
              <strong>{game.label}</strong>
              <small>{game.description}</small>
            </span>
          </button>
        ))}
      </section>

      <section className="cabinet" aria-labelledby="game-title">
        <div className="cabinet-top">
          <div>
            <p className="cabinet-kicker">NOW PLAYING</p>
            <h2 id="game-title">{selected.icon} {selected.label}</h2>
          </div>
          <div className="cabinet-lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="screen">
          <Game />
        </div>
      </section>

      <footer>
        <p>Retro Arcade 44 · Conflict test.</p>
        <code>READY PLAYER ONE</code>
      </footer>
    </main>
  )
}

export default App
