import { motion, useSpring, useTransform } from 'framer-motion'
import { useSystemStore } from '../store/useSystemStore'
import { useEffect } from 'react'

const SIZE = 180
const STROKE = 14
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R
const START_ANGLE = 135
const END_ANGLE = 405
const ARC_FRACTION = (END_ANGLE - START_ANGLE) / 360

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polarToCartesian(cx, cy, r, startAngle)
  const e = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

function getColor(score: number) {
  if (score < 30) return 'hsl(150 70% 45%)'
  if (score < 60) return 'hsl(40 90% 55%)'
  return 'hsl(0 85% 55%)'
}

function getLabel(score: number) {
  if (score < 20) return 'NOMINAL'
  if (score < 50) return 'ELEVATED'
  if (score < 75) return 'CRITICAL'
  return 'FAILURE'
}

export default function AnomalyGauge() {
  const anomalyScore = useSystemStore(s => s.anomalyScore)
  const phase = useSystemStore(s => s.phase)
  const springScore = useSpring(anomalyScore, { stiffness: 60, damping: 20 })

  useEffect(() => {
    springScore.set(anomalyScore)
  }, [anomalyScore, springScore])

  const dashOffset = useTransform(
    springScore,
    [0, 100],
    [CIRC * ARC_FRACTION, 0]
  )

  const color = getColor(anomalyScore)
  const label = getLabel(anomalyScore)
  const cx = SIZE / 2
  const cy = SIZE / 2

  const bgPath = describeArc(cx, cy, R, START_ANGLE, END_ANGLE)
  const fgPath = describeArc(cx, cy, R, START_ANGLE, END_ANGLE)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="label-xs text-muted">Anomaly Score</div>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE}>
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={bgPath}
            fill="none"
            stroke="hsl(0 0% 12%)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = START_ANGLE + (i / 10) * (END_ANGLE - START_ANGLE)
            const inner = polarToCartesian(cx, cy, R - STROKE / 2 - 4, angle)
            const outer = polarToCartesian(cx, cy, R + STROKE / 2 + 2, angle)
            return (
              <line
                key={i}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="hsl(0 0% 18%)"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
              />
            )
          })}

          {/* Foreground arc */}
          <motion.path
            d={fgPath}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            pathLength={CIRC * ARC_FRACTION}
            style={{
              strokeDasharray: CIRC * ARC_FRACTION,
              strokeDashoffset: dashOffset,
              filter: 'url(#gauge-glow)',
            }}
          />

          {/* Center content */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize="32"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            fill="white"
          >
            {Math.round(anomalyScore)}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            letterSpacing="0.1em"
            fontFamily="Inter, sans-serif"
            fill={color}
          >
            {label}
          </text>
          <text
            x={cx}
            y={cy + 28}
            textAnchor="middle"
            fontSize="7"
            fontFamily="Inter, sans-serif"
            fill="hsl(0 0% 35%)"
          >
            / 100
          </text>

          {/* Min/Max labels */}
          <text x="14" y={SIZE - 10} fontSize="8" fill="hsl(0 0% 35%)" fontFamily="Inter, sans-serif">0</text>
          <text x={SIZE - 20} y={SIZE - 10} fontSize="8" fill="hsl(0 0% 35%)" fontFamily="Inter, sans-serif">100</text>
        </svg>

        {/* Phase badge */}
        {phase !== 'normal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          >
            <span className={`badge-${phase === 'chaos' ? 'danger' : phase === 'healing' ? 'success' : 'warning'}`}>
              {phase.toUpperCase()}
            </span>
          </motion.div>
        )}
      </div>

      {/* Sub-scores */}
      <div className="w-full space-y-2 mt-1">
        {[
          { label: 'LSTM model', value: useSystemStore.getState().lstmScore },
          { label: 'Isolation forest', value: useSystemStore.getState().isolationForestScore },
        ].map(({ label: l, value }) => (
          <div key={l}>
            <div className="flex justify-between mb-1">
              <span className="label-xs text-muted">{l}</span>
              <span className="label-xs" style={{ color: getColor(value) }}>{Math.round(value)}</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'hsl(0 0% 12%)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: getColor(value) }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
