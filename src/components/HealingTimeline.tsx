import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useSystemStore } from '../store/useSystemStore'

export default function HealingTimeline() {
  const healingSteps = useSystemStore(s => s.healingSteps)
  const phase = useSystemStore(s => s.phase)

  const allDone = healingSteps.every(s => s.status === 'done')
  const anyActive = healingSteps.some(s => s.status !== 'pending')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="label-xs text-muted">Recovery Timeline</span>
        {anyActive && (
          <span className={`badge-${allDone ? 'success' : 'warning'}`}>
            {allDone ? 'RESOLVED' : 'IN PROGRESS'}
          </span>
        )}
      </div>

      {!anyActive && phase === 'normal' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div style={{ color: 'hsl(0 0% 30%)' }}>
            <CheckCircle2 size={28} />
          </div>
          <p className="text-xs text-muted">All systems nominal</p>
          <p style={{ fontSize: '10px', color: 'hsl(0 0% 28%)' }}>Timeline appears during recovery</p>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {healingSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: step.status === 'pending' ? 0.35 : 1, x: 0 }}
              transition={{ delay: i * 0.6, duration: 1.2, ease: "easeOut" }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{
                background: step.status === 'done'
                  ? 'hsl(150 70% 45% / 0.08)'
                  : step.status === 'active'
                  ? 'hsl(40 90% 55% / 0.08)'
                  : 'transparent',
                border: `1px solid ${
                  step.status === 'done'
                    ? 'hsl(150 70% 45% / 0.2)'
                    : step.status === 'active'
                    ? 'hsl(40 90% 55% / 0.2)'
                    : 'transparent'
                }`,
              }}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {step.status === 'done' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle2 size={14} style={{ color: 'hsl(var(--success))' }} />
                  </motion.div>
                ) : step.status === 'active' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 size={14} style={{ color: 'hsl(var(--warning))' }} />
                  </motion.div>
                ) : (
                  <Circle size={14} style={{ color: 'hsl(0 0% 25%)' }} />
                )}
              </div>

              {/* Label */}
              <span
                className="text-xs font-medium flex-1"
                style={{
                  color: step.status === 'done'
                    ? 'hsl(var(--success))'
                    : step.status === 'active'
                    ? 'hsl(var(--warning))'
                    : 'hsl(0 0% 35%)',
                }}
              >
                {step.label}
              </span>

              {/* Timestamp */}
              {step.timestamp && (
                <span style={{ fontSize: '9px', color: 'hsl(0 0% 35%)' }}>
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Connector line decoration */}
      {anyActive && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <div className="flex items-center gap-2">
            <div
              className="h-1 rounded-full flex-1"
              style={{ background: 'hsl(0 0% 10%)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'hsl(var(--success))' }}
                animate={{
                  width: `${(healingSteps.filter(s => s.status === 'done').length / healingSteps.length) * 100}%`,
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <span style={{ fontSize: '9px', color: 'hsl(0 0% 35%)' }}>
              {healingSteps.filter(s => s.status === 'done').length}/{healingSteps.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
