import { useEffect, useRef } from 'react'

/**
 * Squares - React Bits Component
 * High-performance animated grid background with cursor hover illumination.
 * Drifts smoothly in specified direction (diagonal, up, down, left, right).
 * Respects prefers-reduced-motion and tracks cursor through parent element.
 */
export default function Squares({
  direction = 'diagonal',
  speed = 0.3,
  squareSize = 44,
  borderColor = 'rgba(28, 45, 74, 0.45)',
  hoverFillColor = 'rgba(40, 127, 233, 0.14)',
  className = '',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = 0
    let height = 0
    const gridOffset = { x: 0, y: 0 }
    let hoveredCell = null

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()

    const resizeObserver = new ResizeObserver(() => {
      resize()
    })
    resizeObserver.observe(canvas)

    // Track mouse on window relative to canvas so pointer-events-none still tracks cursor
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Calculate cell relative to moving grid offset
        const relX = mouseX - (gridOffset.x % squareSize)
        const relY = mouseY - (gridOffset.y % squareSize)
        const col = Math.floor(relX / squareSize)
        const row = Math.floor(relY / squareSize)
        hoveredCell = { col, row }
      } else {
        hoveredCell = null
      }
    }

    const handleMouseLeave = () => {
      hoveredCell = null
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update offset based on direction and speed
      if (!prefersReducedMotion) {
        const moveStep = speed * 0.6
        switch (direction) {
          case 'right':
            gridOffset.x += moveStep
            break
          case 'left':
            gridOffset.x -= moveStep
            break
          case 'up':
            gridOffset.y -= moveStep
            break
          case 'down':
            gridOffset.y += moveStep
            break
          case 'diagonal':
          default:
            gridOffset.x += moveStep
            gridOffset.y += moveStep
            break
        }
      }

      const startX = ((gridOffset.x % squareSize) + squareSize) % squareSize - squareSize
      const startY = ((gridOffset.y % squareSize) + squareSize) % squareSize - squareSize

      const numCols = Math.ceil((width - startX) / squareSize) + 1
      const numRows = Math.ceil((height - startY) / squareSize) + 1

      // Draw hovered cell highlight if active
      if (hoveredCell) {
        ctx.fillStyle = hoverFillColor
        const cellX = startX + hoveredCell.col * squareSize
        const cellY = startY + hoveredCell.row * squareSize
        ctx.fillRect(cellX, cellY, squareSize, squareSize)
      }

      // Draw grid lines
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 1
      ctx.beginPath()

      // Vertical lines
      for (let i = 0; i <= numCols; i++) {
        const x = startX + i * squareSize
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }

      // Horizontal lines
      for (let j = 0; j <= numRows; j++) {
        const y = startY + j * squareSize
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }

      ctx.stroke()

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      resizeObserver.disconnect()
    }
  }, [direction, speed, squareSize, borderColor, hoverFillColor])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none -z-10 ${className}`}
      style={{ display: 'block' }}
    />
  )
}

