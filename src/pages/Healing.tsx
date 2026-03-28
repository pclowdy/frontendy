import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, HeartPulse, Zap } from 'lucide-react'
import { useSystemStore } from '../store/useSystemStore'
import { useNavigate } from 'react-router-dom'

const STEP_ICONS: Record<string, React.ElementType> = {
  detect: Zap,
  'root-cause': Zap,
  restart: HeartPulse,
  scale: HeartPulse,
  cache: HeartPulse,
  verify: CheckCircle2,
}

export default function Healing() {
  const healingSteps = useSystemStore(s => s.healingSteps)
  const phase = useSystemStore(s => s.phase)
  const services = useSystemStore(s => s.services)
  const chaosTarget = useSystemStore(s => s.chaosTarget)
  const navigate = useNavigate()

  const targetService = services.find(s => s.id === chaosTarget)
  const doneCount = healingSteps.filter(s => s.status === 'done').length
  const totalCount = healingSteps.length
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0
  const isHealing = phase === 'healing' || phase === 'detecting'
  const allDone = doneCount === totalCount && phase === 'normal' && healingSteps.some(s => s.timestamp)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Self-Healing</h1>
          <p className="text-xs text-muted mt-0.5">Autonomous recovery engine</p>
        </div>
        {isHealing && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'hsl(var(--info) / 0.1)', border: '1px solid hsl(var(--info) / 0.3)' }}
            animate={{ borderColor: ['hsl(var(--info) / 0.3)', 'hsl(var(--info) / 0.7)', 'hsl(var(--info) / 0.3)'] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <Loader2 size={14} style={{ color: 'hsl(var(--info))' }} />
            </motion.div>
            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--info))' }}>
              RECOVERY IN PROGRESS
            </span>
          </motion.div>
        )}
        {allDone && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'hsl(var(--success) / 0.1)', border: '1px solid hsl(var(--success) / 0.3)' }}>
            <CheckCircle2 size={14} style={{ color: 'hsl(var(--success))' }} />
            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--success))' }}>
              FULLY RECOVERED
            </span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        {/* Timeline — main */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="label-xs text-muted">Recovery Steps</span>
            {(isHealing || allDone) && (
              <span className="text-xs" style={{ color: 'hsl(0 0% 50%)' }}>
                {doneCount}/{totalCount} complete
              </span>
            )}
          </div>

          {!isHealing && !allDone ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div style={{ color: 'hsl(0 0% 25%)' }}>
                <HeartPulse size={40} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(0 0% 50%)' }}>All systems healthy</p>
                <p className="text-xs text-muted mt-1">Timeline activates when anomaly is detected</p>
              </div>
              <button
                onClick={() => navigate('/chaos')}
                className="btn-danger mt-2 text-xs px-4 py-2"
              >
                <Zap size={12} />
                Inject Chaos
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-5 top-5 bottom-5 w-px"
                style={{ background: 'hsl(0 0% 12%)' }}
              />
              {/* Progress line */}
              <motion.div
                className="absolute left-5 top-5 w-px"
                style={{ background: 'hsl(var(--success))' }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              <div className="space-y-2">
                {healingSteps.map((step, i) => {
                  const Icon = STEP_ICONS[step.id] || Circle
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35 }}
                      className="flex items-start gap-4 pl-1"
                    >
                      {/* Timeline node */}
                      <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: step.status === 'done'
                            ? 'hsl(150 70% 45% / 0.2)'
                            : step.status === 'active'
                            ? 'hsl(40 90% 55% / 0.2)'
                            : 'hsl(0 0% 8%)',
                          border: `1px solid ${
                            step.status === 'done' ? 'hsl(var(--success))' :
                            step.status === 'active' ? 'hsl(var(--warning))' :
                            'hsl(0 0% 18%)'
                          }`,
                        }}
                      >
                        {step.status === 'done' ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                            <CheckCircle2 size={14} style={{ color: 'hsl(var(--success))' }} />
                          </motion.div>
                        ) : step.status === 'active' ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <Loader2 size={14} style={{ color: 'hsl(var(--warning))' }} />
                          </motion.div>
                        ) : (
                          <Circle size={14} style={{ color: 'hsl(0 0% 28%)' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className="flex-1 py-2 px-4 rounded-lg mb-2"
                        style={{
                          background: step.status === 'done'
                            ? 'hsl(150 70% 45% / 0.06)'
                            : step.status === 'active'
                            ? 'hsl(40 90% 55% / 0.06)'
                            : 'hsl(0 0% 5%)',
                          border: `1px solid ${
                            step.status === 'done' ? 'hsl(var(--success) / 0.15)' :
                            step.status === 'active' ? 'hsl(var(--warning) / 0.15)' :
                            'hsl(0 0% 10%)'
                          }`,
                          opacity: step.status === 'pending' ? 0.4 : 1,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: step.status === 'done' ? 'hsl(var(--success))' :
                                step.status === 'active' ? 'hsl(var(--warning))' :
                                'hsl(0 0% 40%)',
                            }}
                          >
                            {step.label}
                          </span>
                          {step.timestamp && (
                            <span style={{ fontSize: '10px', color: 'hsl(0 0% 35%)' }}>
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {step.status === 'active' && (
                          <motion.div
                            className="mt-2 h-0.5 rounded-full"
                            style={{ background: 'hsl(0 0% 12%)' }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: 'hsl(var(--warning))' }}
                              animate={{ width: ['0%', '100%'] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* Affected service */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="label-xs text-muted mb-3">Affected Service</div>
            {targetService ? (
              <div>
                <div className="font-semibold text-sm mb-1">{targetService.name}</div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: targetService.status === 'healthy' ? 'hsl(var(--success))' :
                        targetService.status === 'failing' ? 'hsl(var(--danger))' : 'hsl(var(--warning))',
                    }}
                  />
                  <span className="text-xs capitalize" style={{ color: 'hsl(0 0% 55%)' }}>
                    {targetService.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted">No active incident</div>
            )}
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5"
          >
            <div className="label-xs text-muted mb-3">Recovery Progress</div>
            <div className="text-3xl font-bold mb-2" style={{ color: progress === 100 ? 'hsl(var(--success))' : 'hsl(var(--info))' }}>
              {Math.round(progress)}%
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'hsl(0 0% 10%)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: progress === 100 ? 'hsl(var(--success))' : 'hsl(var(--info))' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Metrics snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="label-xs text-muted mb-3">Recovery Playbook</div>
            <div className="space-y-2">
              {[
                'Terminate failing pod',
                'Drain connections',
                'Scale replacement pod',
                'Warm cache layer',
                'Re-route traffic',
                'Verify health check',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(0 0% 45%)' }}>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'hsl(0 0% 25%)' }} />
                  {step}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
