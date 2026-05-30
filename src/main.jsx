import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Inject background canvas before React root
const canvas = document.createElement('canvas')
canvas.id = 'bg-canvas'
document.body.prepend(canvas)

const ctx = canvas.getContext('2d')

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

// Orbs config
const orbs = Array.from({ length: 6 }, (_, i) => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: 180 + Math.random() * 220,
  hue: (i * 60 + Math.random() * 30) % 360,
  vx: (Math.random() - 0.5) * 0.4,
  vy: (Math.random() - 0.5) * 0.4,
  phase: Math.random() * Math.PI * 2,
  speed: 0.004 + Math.random() * 0.004,
}))

// Wave points
const WAVE_POINTS = 8
const waves = Array.from({ length: 3 }, (_, wi) => ({
  points: Array.from({ length: WAVE_POINTS }, (_, i) => ({
    x: (i / (WAVE_POINTS - 1)) * window.innerWidth,
    y: window.innerHeight * (0.3 + wi * 0.2),
    baseY: window.innerHeight * (0.3 + wi * 0.2),
    phase: Math.random() * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.006,
    amp: 30 + Math.random() * 50,
  })),
  hue: [260, 200, 170][wi],
  alpha: [0.04, 0.03, 0.025][wi],
}))

let t = 0

function drawOrbs() {
  orbs.forEach(orb => {
    orb.phase += orb.speed
    orb.x += orb.vx + Math.sin(orb.phase) * 0.3
    orb.y += orb.vy + Math.cos(orb.phase * 0.7) * 0.3

    // Bounce
    if (orb.x < -orb.r) orb.x = canvas.width + orb.r
    if (orb.x > canvas.width + orb.r) orb.x = -orb.r
    if (orb.y < -orb.r) orb.y = canvas.height + orb.r
    if (orb.y > canvas.height + orb.r) orb.y = -orb.r

    const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
    grad.addColorStop(0, `hsla(${orb.hue}, 70%, 55%, 0.07)`)
    grad.addColorStop(1, `hsla(${orb.hue}, 70%, 55%, 0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawWaves() {
  waves.forEach(wave => {
    // Update point y positions
    wave.points.forEach(p => {
      p.phase += p.speed
      p.y = p.baseY + Math.sin(p.phase) * p.amp
    })

    ctx.beginPath()
    ctx.moveTo(0, canvas.height)

    const pts = wave.points
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2
      const cy = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, cx, cy)
    }
    ctx.lineTo(canvas.width, canvas.height)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, `hsla(${wave.hue}, 60%, 50%, ${wave.alpha})`)
    grad.addColorStop(1, `hsla(${wave.hue}, 60%, 30%, 0)`)
    ctx.fillStyle = grad
    ctx.fill()
  })
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Dark base
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawOrbs()
  drawWaves()

  t += 0.01
  requestAnimationFrame(animate)
}

animate()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)