'use client'

/**
 * Pure-SVG radar chart for 6 skills (no chart library).
 */
interface SkillRadarProps {
  data: Array<{ label: string; value: number }> // value 0-9 (IELTS band)
  max?: number
  size?: number
}

export function SkillRadar({ data, max = 9, size = 240 }: SkillRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const r = (size / 2) * 0.78
  const n = data.length

  const point = (value: number, idx: number, radius: number) => {
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2
    return {
      x: cx + Math.cos(angle) * radius * (value / max),
      y: cy + Math.sin(angle) * radius * (value / max),
    }
  }

  const valuePoints = data.map((d, i) => point(d.value, i, r))
  const polygon = valuePoints.map(p => `${p.x},${p.y}`).join(' ')

  // Background rings
  const rings = [0.25, 0.5, 0.75, 1].map(f => {
    const pts = data.map((_, i) => point(max, i, r * f))
    return pts.map(p => `${p.x},${p.y}`).join(' ')
  })

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Rings */}
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgb(226, 232, 240)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {data.map((_, i) => {
        const end = point(max, i, r)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgb(226, 232, 240)" strokeWidth="1" />
      })}
      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(99, 102, 241, 0.2)" stroke="rgb(99, 102, 241)" strokeWidth="2" />
      {/* Data points */}
      {valuePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="rgb(99, 102, 241)" stroke="white" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const lx = cx + Math.cos(angle) * (r + 18)
        const ly = cy + Math.sin(angle) * (r + 18)
        return (
          <g key={i}>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="500" fill="rgb(71, 85, 105)">
              {d.label}
            </text>
            <text x={lx} y={ly + 12} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="rgb(99, 102, 241)">
              {d.value.toFixed(1)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
