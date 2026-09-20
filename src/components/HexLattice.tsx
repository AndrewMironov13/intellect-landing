import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

type Cell = { x: number; y: number; delay: number; glow: number }

/**
 * Сотовый свет бокса: решётка шестиугольников, которая «включается» волной при загрузке,
 * а потом подсвечивается под курсором. Один canvas, рисуем только пока что-то меняется.
 */
export function HexLattice({ origin = [0.66, 0.42], hostRef }: { origin?: [number, number]; hostRef: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const host = hostRef.current
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cells: Cell[] = []
    let W = 0, H = 0, R = 44, maxDelay = 0
    let raf = 0, t0 = 0, ignited = false, looping = false
    const ptr = { x: -1e4, y: -1e4, on: false }

    const hex = (x: number, y: number, r: number) => {
      ctx.moveTo(x, y - r)
      for (let i = 1; i < 6; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 3; ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) }
      ctx.closePath()
    }

    const build = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      W = rect.width; H = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = W < 760 ? 30 : 46
      const w = Math.sqrt(3) * R, h = 1.5 * R
      const ox = origin[0] * W, oy = origin[1] * H
      const maxD = Math.hypot(W, H) * 0.9
      cells = []; maxDelay = 0
      for (let row = -1; row * h < H + R; row++) {
        for (let col = -1; col * w < W + w; col++) {
          const x = col * w + (row % 2 ? w / 2 : 0), y = row * h
          const delay = (Math.hypot(x - ox, y - oy) / maxD) * 1.7 + Math.random() * 0.3
          maxDelay = Math.max(maxDelay, delay)
          cells.push({ x, y, delay, glow: 0 })
        }
      }
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 1
      const r = R - 3
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]
        const p = Math.min(1, Math.max(0, (t - c.delay) / 0.6))
        if (p <= 0) continue
        const flash = Math.sin(p * Math.PI)
        const g = c.glow
        const a = 0.22 + flash * 0.55 + g * 0.6
        ctx.beginPath(); hex(c.x, c.y, r)
        if (g > 0.02) { ctx.fillStyle = `rgba(46,200,198,${(g * 0.16).toFixed(3)})`; ctx.fill() }
        ctx.strokeStyle = `rgba(46,200,198,${Math.min(1, a).toFixed(3)})`; ctx.stroke()
        if (flash > 0.35 || g > 0.5) { ctx.strokeStyle = `rgba(255,255,255,${(Math.max(flash - 0.35, g - 0.5) * 0.6).toFixed(3)})`; ctx.stroke() }
      }
    }

    const tick = (now: number) => {
      if (!t0) t0 = now
      const t = (now - t0) / 1000
      // подсветка под курсором догоняет цель, потом гаснет
      let active = false
      const rad = R * 5.5
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]
        let target = 0
        if (ptr.on) { const d = Math.hypot(c.x - ptr.x, c.y - ptr.y); if (d < rad) { const k = 1 - d / rad; target = k * k } }
        c.glow += (target - c.glow) * 0.14
        if (c.glow > 0.004) active = true
        else c.glow = 0
      }
      draw(ignited ? 1e3 : t)
      if (!ignited && t > maxDelay + 0.7) ignited = true
      if (!ignited || active || ptr.on) raf = requestAnimationFrame(tick)
      else looping = false
    }
    const loop = () => { if (!looping) { looping = true; raf = requestAnimationFrame(tick) } }

    build()
    if (reduce) { ignited = true; draw(1e3) } else loop()

    const onMove = (e: PointerEvent) => {
      if (reduce) return
      const rect = canvas.getBoundingClientRect()
      ptr.x = e.clientX - rect.left; ptr.y = e.clientY - rect.top; ptr.on = true
      loop()
    }
    const onLeave = () => { ptr.on = false; loop() }
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    const ro = new ResizeObserver(() => { build(); if (ignited) draw(1e3); else loop() })
    ro.observe(canvas.parentElement!)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave) }
  }, [origin, reduce, hostRef])

  return <canvas ref={ref} aria-hidden="true" />
}
