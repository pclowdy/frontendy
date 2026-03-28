import { motion } from 'framer-motion'

interface CrewmateProps {
  status: 'healthy' | 'failing' | 'recovering'
  size?: number
  animate?: boolean
}

const STATUS_COLORS = {
  healthy: {
    body: '#1a8a4a',
    visor: '#5ad4ff',
    glow: 'hsl(var(--success))',
  },
  failing: {
    body: '#c0392b',
    visor: '#ff7675',
    glow: 'hsl(var(--danger))',
  },
  recovering: {
    body: '#d4a017',
    visor: '#ffeaa7',
    glow: 'hsl(var(--warning))',
  },
}

export default function Crewmate({ status, size = 32, animate = true }: CrewmateProps) {
  const colors = STATUS_COLORS[status]
  const scale = size / 32

  return (
    <motion.div
      style={{
        width: size,
        height: size * 1.25,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={
        animate
          ? {
              y: [0, -4, 0],
            }
          : {}
      }
      transition={
        animate
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 ${scale * 4}px ${colors.glow})` }}
      >
        {/* Backpack */}
        <rect x="22" y="14" width="8" height="12" rx="3" fill={colors.body} opacity="1" stroke="#000" strokeWidth="1" />

        {/* Body — capsule shape */}
        <rect x="6" y="10" width="20" height="24" rx="10" fill={colors.body} stroke="#000" strokeWidth="1" />

        {/* Head */}
        <ellipse cx="16" cy="10" rx="10" ry="9" fill={colors.body} />

        {/* Visor */}
        <ellipse cx="14" cy="9" rx="7" ry="5.5" fill={colors.visor} opacity="1" stroke="#000" strokeWidth="1" />

        {/* Visor reflection */}
        <ellipse cx="11" cy="7" rx="2.5" ry="1.5" fill="white" opacity="0.6" />

        {/* Legs */}
        <rect x="9" y="30" width="6" height="8" rx="3" fill={colors.body} opacity="1" stroke="#000" strokeWidth="1" />
        <rect x="17" y="30" width="6" height="8" rx="3" fill={colors.body} opacity="1" stroke="#000" strokeWidth="1" />
      </svg>
    </motion.div>
  )
}
