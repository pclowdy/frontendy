import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Cpu, MemoryStick, Wifi, Timer, X, AlertTriangle, ChevronRight } from 'lucide-react'
import { useSystemStore, ChaosAttack } from '../store/useSystemStore'
import { useNavigate } from 'react-router-dom'

interface AttackDef {
  id: ChaosAttack
  label: string
  icon: React.ElementType
  desc: string
  severity: 'critical' | 'high' | 'medium'
  details: string
  impact: string[]
}

const ATTACKS: AttackDef[] = [
  {
    id: 'pod-crash',
    label: 'Pod Crash',
    icon: Zap,
    desc: 'Abruptly terminates a running pod',
    severity: 'critical',
    details: 'Simulates an unexpected process crash. Tests pod restart policies and readiness probes.',
    impact: ['Pod restart triggered', 'Traffic rerouted', 'Readiness probe fails'],
  },
  {
    id: 'cpu-stress',
    label: 'CPU Stress',
    icon: Cpu,
    desc: 'Saturates CPU resources to 95%',
    severity: 'high',
    details: 'Spins up CPU-intensive workers to consume all available cores. Tests throttling behavior.',
    impact: ['Request latency increases', 'Scheduler deprioritizes pod', 'HPA triggers scale-out'],
  },
  {
    id: 'memory-leak',
    label: 'Memory Leak',
    icon: MemoryStick,
    desc: 'Slowly allocates memory until OOM',
    severity: 'high',
    details: 'Gradually fills heap to trigger OOM killer. Tests memory limits and eviction policies.',
    impact: ['Memory limits breached', 'OOM kill triggered', 'Container restarts'],
  },
  {
    id: 'network-delay',
    label: 'Network Delay',
    icon: Wifi,
    desc: 'Adds 500ms latency to all egress',
    severity: 'medium',
    details: 'Uses tc-netem to inject latency into network packets. Tests timeout and retry logic.',
    impact: ['Cascading timeouts', 'Retry storms possible', 'Circuit breakers trip'],
  },
  {
    id: 'latency-injection',
    label: 'Latency Injection',
    icon: Timer,
    desc: 'Injects jitter into service responses',
    severity: 'medium',
    details: 'Adds random delay to HTTP responses. Tests client timeout configuration and SLOs.',
    impact: ['p99 latency spikes', 'SLO breach triggered', 'Alerts fired'],
  },
]

const SEVERITY_COLORS = {
  critical: 'hsl(var(--danger))',
  high: 'hsl(var(--warning))',
  medium: 'hsl(var(--info))',
}

const SEVERITY_BG = {
  critical: 'hsl(var(--danger) / 0.08)',
  high: 'hsl(var(--warning) / 0.08)',
  medium: 'hsl(var(--info) / 0.08)',
}

export default function Chaos() {
  const [selected, setSelected] = useState<ChaosAttack | null>(null)
  const [modalAttack, setModalAttack] = useState<AttackDef | null>(null)
  const { initiateChaos, phase, activeChaos, services } = useSystemStore()
  const navigate = useNavigate()
  const isChaosActive = phase === 'chaos' || phase === 'detecting' || phase === 'healing'

  const handleInitiate = () => {
    if (!selected || isChaosActive) return
    initiateChaos(selected)
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Chaos Control</h1>
          <p className="text-xs text-muted mt-0.5">Select an attack vector and initiate chaos</p>
        </div>
        {isChaosActive && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'hsl(var(--danger) / 0.1)', border: '1px solid hsl(var(--danger) / 0.3)' }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ background: 'hsl(var(--danger))' }}
            />
            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--danger))' }}>
              CHAOS ACTIVE: {activeChaos?.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        )}
      </motion.div>

      {/* Target service selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4"
      >
        <div className="label-xs text-muted mb-3">Target Services</div>
        <div className="flex flex-wrap gap-2">
          {services.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: s.status === 'failing' ? 'hsl(var(--danger) / 0.1)' : 'hsl(var(--muted))',
                border: `1px solid ${s.status === 'failing' ? 'hsl(var(--danger) / 0.3)' : 'hsl(var(--border))'}`,
                color: s.status === 'failing' ? 'hsl(var(--danger))' : 'hsl(0 0% 60%)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: s.status === 'healthy' ? 'hsl(var(--success))' :
                    s.status === 'failing' ? 'hsl(var(--danger))' : 'hsl(var(--warning))',
                }}
              />
              {s.name}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-2" style={{ fontSize: '10px' }}>
          Attack will target a random healthy service unless specified
        </p>
      </motion.div>

      {/* Attack cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {ATTACKS.map((attack, i) => {
          const Icon = attack.icon
          const isSelected = selected === attack.id
          const color = SEVERITY_COLORS[attack.severity]

          return (
            <motion.div
              key={attack.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => setSelected(isSelected ? null : attack.id)}
              className="glass-card-hover cursor-pointer p-5 relative"
              style={{
                border: isSelected
                  ? `1px solid ${color}60`
                  : '1px solid hsl(var(--border))',
                background: isSelected ? SEVERITY_BG[attack.severity] : 'hsl(var(--card))',
                boxShadow: isSelected ? `0 0 24px ${color}20` : 'none',
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: color }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{attack.label}</div>
                  <div
                    className="text-xs mt-0.5"
                    style={{
                      color,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                    }}
                  >
                    {attack.severity}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted mb-4" style={{ lineHeight: 1.5 }}>
                {attack.desc}
              </p>

              <button
                onClick={(e) => { e.stopPropagation(); setModalAttack(attack) }}
                className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: 'hsl(0 0% 40%)' }}
              >
                Configure
                <ChevronRight size={11} />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Initiate CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 flex items-center justify-between"
      >
        <div>
          <div className="font-semibold mb-1">
            {selected
              ? `Ready to initiate: ${ATTACKS.find(a => a.id === selected)?.label}`
              : 'Select an attack vector above'}
          </div>
          <p className="text-xs text-muted">
            {isChaosActive
              ? 'Wait for current chaos cycle to complete before injecting again.'
              : 'This will immediately impact a production service. The AI will auto-recover.'}
          </p>
        </div>

        <motion.button
          onClick={handleInitiate}
          disabled={!selected || isChaosActive}
          className="btn-danger"
          whileTap={{ scale: 0.97 }}
          style={{
            opacity: (!selected || isChaosActive) ? 0.35 : 1,
            cursor: (!selected || isChaosActive) ? 'not-allowed' : 'pointer',
            minWidth: 200,
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={16} />
          INITIATE CHAOS
        </motion.button>
      </motion.div>

      {/* Configure modal */}
      <AnimatePresence>
        {modalAttack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            style={{ background: 'hsl(0 0% 0% / 0.7)' }}
            onClick={() => setModalAttack(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: `${SEVERITY_COLORS[modalAttack.severity]}15` }}>
                    <modalAttack.icon size={18} style={{ color: SEVERITY_COLORS[modalAttack.severity] }} />
                  </div>
                  <div>
                    <div className="font-semibold">{modalAttack.label}</div>
                    <div className="label-xs mt-0.5" style={{ color: SEVERITY_COLORS[modalAttack.severity] }}>
                      {modalAttack.severity.toUpperCase()}
                    </div>
                  </div>
                </div>
                <button onClick={() => setModalAttack(null)} className="text-muted hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-muted mb-5" style={{ lineHeight: 1.6 }}>
                {modalAttack.details}
              </p>

              <div className="mb-5">
                <div className="label-xs text-muted mb-3">Expected Impact</div>
                <div className="space-y-2">
                  {modalAttack.impact.map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(0 0% 65%)' }}>
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[modalAttack.severity] }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'hsl(var(--muted))', color: 'hsl(0 0% 60%)' }}
                  onClick={() => setModalAttack(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 btn-danger py-2 justify-center"
                  onClick={() => {
                    setSelected(modalAttack.id)
                    setModalAttack(null)
                  }}
                >
                  Select Attack
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
