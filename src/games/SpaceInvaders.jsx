import { useCallback, useEffect, useRef, useState } from 'react'

const WIDTH = 480
const HEIGHT = 360
const ROWS = 4
const COLS = 8
const PIXEL = 2
const ALIEN_W = 22
const ALIEN_H = 16
const CELL_W = 44
const CELL_H = 30
const FLEET_LEFT = 75
const FLEET_TOP = 40
const MARCH_STEP = 8
const MARCH_DROP = 14
const SHIP_W = 22
const SHIP_H = 16
const SHIP_Y = HEIGHT - 34
const SHIP_SPEED = 220
const BULLET_SPEED = 340
const BOMB_SPEED = 105
const MAX_BULLETS = 2
const START_LIVES = 3

const ALIEN_COLORS = ['#ff4fd8', '#4de9ff', '#ffe66d', '#a7ff4f']

const ALIEN_FRAMES = [
  [
    '00100000100',
    '00010001000',
    '00111111100',
    '01101110110',
    '11111111111',
    '10111111101',
    '10100000101',
    '00011011000',
  ],
  [
    '00100000100',
    '00110001100',
    '00111111100',
    '01101110110',
    '11111111111',
    '10111111101',
    '10100000101',
    '00110110011',
  ],
]

const SHIP_BITMAP = [
  '00000100000',
  '00001110000',
  '00001110000',
  '01111111110',
  '11111111111',
  '11111111111',
  '11111111111',
  '11000000011',
]

function createGame() {
  const aliens = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      aliens.push({ row, col, alive: true })
    }
  }

  return {
    aliens,
    offsetX: 0,
    offsetY: 0,
    dir: 1,
    shipX: WIDTH / 2,
    bullets: [],
    bombs: [],
    marchTimer: 0,
    frame: 0,
    bombTimer: 0,
    invulnerable: 0,
    lives: START_LIVES,
    score: 0,
    running: false,
    result: null,
  }
}

function drawBitmap(ctx, bitmap, x, y, color) {
  ctx.fillStyle = color
  bitmap.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column += 1) {
      if (row[column] === '1') {
        ctx.fillRect(x + column * PIXEL, y + rowIndex * PIXEL, PIXEL, PIXEL)
      }
    }
  })
}

function SpaceInvaders() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  if (gameRef.current === null) gameRef.current = createGame()
  const keysRef = useRef({ left: false, right: false })

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Insert coin. Arrows or A/D move, Space fires.')
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('retro44-invaders-high')) || 0
    } catch {
      return 0
    }
  })

  const shoot = useCallback(() => {
    const game = gameRef.current
    if (!game.running || game.bullets.length >= MAX_BULLETS) return
    game.bullets.push({ x: game.shipX, y: SHIP_Y - 4 })
  }, [])

  const start = () => {
    const game = gameRef.current
    Object.assign(game, createGame(), { running: true })
    setScore(0)
    setLives(START_LIVES)
    setStatus('running')
    setMessage('Aliens inbound — hold the line.')
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault()
        keysRef.current.left = true
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault()
        keysRef.current.right = true
        return
      }
      if (event.key === ' ' && gameRef.current.running) {
        event.preventDefault()
        if (!event.repeat) shoot()
      }
    }

    const onKeyUp = (event) => {
      // Stop a focused button (e.g. RESTART) from being activated by Space mid-game.
      if (event.key === ' ' && gameRef.current.running) event.preventDefault()
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') keysRef.current.left = false
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') keysRef.current.right = false
    }

    const releaseKeys = () => {
      keysRef.current.left = false
      keysRef.current.right = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseKeys)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseKeys)
    }
  }, [shoot])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    let raf = 0
    let last = performance.now()

    const addScore = (game, points) => {
      game.score += points
      setScore(game.score)
      setHighScore((current) => {
        if (game.score <= current) return current
        try {
          localStorage.setItem('retro44-invaders-high', String(game.score))
        } catch {
          // High score persistence is optional.
        }
        return game.score
      })
    }

    const finish = (game, result) => {
      game.running = false
      game.result = result
      game.bombs = []
      game.bullets = []
      setStatus(result)
      setMessage(
        result === 'won'
          ? `Wave cleared! Final score: ${game.score}.`
          : `Game over. Final score: ${game.score}.`,
      )
    }

    const hitShip = (game) => {
      game.lives -= 1
      game.invulnerable = 1.6
      game.bombs = []
      setLives(game.lives)
      if (game.lives <= 0) finish(game, 'lost')
    }

    const update = (game, dt) => {
      if (keysRef.current.left) game.shipX -= SHIP_SPEED * dt
      if (keysRef.current.right) game.shipX += SHIP_SPEED * dt
      game.shipX = Math.min(Math.max(game.shipX, SHIP_W / 2 + 8), WIDTH - SHIP_W / 2 - 8)
      game.invulnerable = Math.max(0, game.invulnerable - dt)

      game.bullets.forEach((bullet) => { bullet.y -= BULLET_SPEED * dt })
      game.bullets = game.bullets.filter((bullet) => bullet.y > -12)
      game.bombs.forEach((bomb) => { bomb.y += BOMB_SPEED * dt })
      game.bombs = game.bombs.filter((bomb) => bomb.y < HEIGHT)

      const alive = game.aliens.filter((alien) => alien.alive)
      if (!alive.length) {
        finish(game, 'won')
        return
      }

      game.marchTimer += dt * 1000
      if (game.marchTimer >= 150 + alive.length * 18) {
        game.marchTimer = 0
        game.frame = game.frame === 1 ? 0 : 1
        const nextOffsetX = game.offsetX + game.dir * MARCH_STEP
        let minX = Infinity
        let maxX = -Infinity
        alive.forEach((alien) => {
          minX = Math.min(minX, FLEET_LEFT + alien.col * CELL_W + nextOffsetX)
          maxX = Math.max(maxX, FLEET_LEFT + alien.col * CELL_W + nextOffsetX + ALIEN_W)
        })
        if (minX < 10 || maxX > WIDTH - 10) {
          game.dir *= -1
          game.offsetY += MARCH_DROP
        } else {
          game.offsetX = nextOffsetX
        }
      }

      const lowest = Math.max(
        ...alive.map((alien) => FLEET_TOP + alien.row * CELL_H + game.offsetY + ALIEN_H),
      )
      if (lowest >= SHIP_Y - 2) {
        game.offsetX = 0
        game.offsetY = 0
        game.dir = 1
        game.marchTimer = 0
        hitShip(game)
        if (!game.running) return
      }

      game.bullets = game.bullets.filter((bullet) => {
        const target = alive.find((alien) => {
          const x = FLEET_LEFT + alien.col * CELL_W + game.offsetX
          const y = FLEET_TOP + alien.row * CELL_H + game.offsetY
          return bullet.x >= x && bullet.x <= x + ALIEN_W && bullet.y >= y && bullet.y <= y + ALIEN_H
        })
        if (!target) return true
        target.alive = false
        addScore(game, 10)
        return false
      })

      if (!game.aliens.some((alien) => alien.alive)) {
        finish(game, 'won')
        return
      }

      if (game.invulnerable <= 0) {
        const shipLeft = game.shipX - SHIP_W / 2
        const shipHit = game.bombs.some((bomb) => (
          bomb.x >= shipLeft &&
          bomb.x <= shipLeft + SHIP_W &&
          bomb.y >= SHIP_Y &&
          bomb.y <= SHIP_Y + SHIP_H
        ))
        if (shipHit) {
          hitShip(game)
          if (!game.running) return
        }
      }

      game.bombTimer -= dt
      if (game.bombTimer <= 0) {
        game.bombTimer = 0.9
        const shooters = game.aliens.filter((alien) => alien.alive)
        if (shooters.length) {
          const shooter = shooters[Math.floor(Math.random() * shooters.length)]
          game.bombs.push({
            x: FLEET_LEFT + shooter.col * CELL_W + game.offsetX + ALIEN_W / 2,
            y: FLEET_TOP + shooter.row * CELL_H + game.offsetY + ALIEN_H,
          })
        }
      }
    }

    const draw = (game) => {
      ctx.fillStyle = '#05050a'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      ctx.fillStyle = '#1c1930'
      ctx.fillRect(0, SHIP_Y + SHIP_H + 8, WIDTH, 2)

      game.aliens.forEach((alien) => {
        if (!alien.alive) return
        drawBitmap(
          ctx,
          ALIEN_FRAMES[game.frame],
          FLEET_LEFT + alien.col * CELL_W + game.offsetX,
          FLEET_TOP + alien.row * CELL_H + game.offsetY,
          ALIEN_COLORS[alien.row],
        )
      })

      ctx.fillStyle = '#4de9ff'
      game.bullets.forEach((bullet) => ctx.fillRect(bullet.x - 1.5, bullet.y, 3, 10))
      ctx.fillStyle = '#ff4fd8'
      game.bombs.forEach((bomb) => ctx.fillRect(bomb.x - 1.5, bomb.y - 10, 3, 10))

      const blinking = game.invulnerable > 0 && Math.floor(game.invulnerable * 8) % 2 === 0
      if (!blinking) {
        drawBitmap(ctx, SHIP_BITMAP, game.shipX - SHIP_W / 2, SHIP_Y, '#a7ff4f')
      }

      if (game.result) {
        ctx.fillStyle = 'rgba(5, 5, 10, 0.74)'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)
        ctx.fillStyle = game.result === 'won' ? '#a7ff4f' : '#ff4fd8'
        ctx.font = 'bold 26px "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(game.result === 'won' ? 'WAVE CLEARED' : 'GAME OVER', WIDTH / 2, HEIGHT / 2)
        ctx.textAlign = 'start'
      }
    }

    const tick = (now) => {
      const dt = Math.min(now - last, 60) / 1000
      last = now
      const game = gameRef.current
      if (game.running) update(game, dt)
      draw(game)
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  const setKey = (key, value) => {
    keysRef.current[key] = value
  }

  const buttonLabel = status === 'running' ? 'RESTART' : status === 'idle' ? 'START' : 'PLAY AGAIN'

  return (
    <div className="game-layout">
      <div>
        <div className="game-stage">
          <canvas
            ref={canvasRef}
            className="invaders-canvas"
            width={WIDTH}
            height={HEIGHT}
            aria-label="Space Invaders game screen"
          />
        </div>

        <div className="invaders-controls" aria-label="Space Invaders touch controls">
          <button
            className="control-button"
            type="button"
            aria-label="Move left"
            onPointerDown={(event) => { event.preventDefault(); setKey('left', true) }}
            onPointerUp={() => setKey('left', false)}
            onPointerLeave={() => setKey('left', false)}
            onPointerCancel={() => setKey('left', false)}
          >
            ←
          </button>
          <button
            className="control-button fire"
            type="button"
            aria-label="Fire"
            onPointerDown={(event) => { event.preventDefault(); shoot() }}
          >
            FIRE
          </button>
          <button
            className="control-button"
            type="button"
            aria-label="Move right"
            onPointerDown={(event) => { event.preventDefault(); setKey('right', true) }}
            onPointerUp={() => setKey('right', false)}
            onPointerLeave={() => setKey('right', false)}
            onPointerCancel={() => setKey('right', false)}
          >
            →
          </button>
        </div>
      </div>

      <aside className="game-sidebar">
        <div className="stat-card">
          <small>SCORE</small>
          <strong>{score.toString().padStart(2, '0')}</strong>
        </div>
        <div className="stat-card">
          <small>HIGH SCORE</small>
          <strong>{highScore.toString().padStart(2, '0')}</strong>
        </div>
        <div className="stat-card">
          <small>LIVES</small>
          <strong>{'♥'.repeat(Math.max(lives, 0)) || '—'}</strong>
        </div>
        <p className="instructions">
          Desktop: ← → or A/D to move, Space to fire. Mobile: hold the arrows and tap FIRE.
          Clear all four rows before the fleet reaches your ship.
        </p>
        <button className="pixel-button" type="button" onClick={start}>
          {buttonLabel}
        </button>
        <p className="game-message" aria-live="polite">{message}</p>
      </aside>
    </div>
  )
}

export default SpaceInvaders
