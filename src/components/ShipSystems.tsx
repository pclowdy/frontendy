import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore, ChaosAttack } from '../store/useSystemStore'
import TopologyGraph from './TopologyGraph'
import AnomalyGauge from './AnomalyGauge'
import MetricsCharts from './MetricsCharts'
import HealingTimeline from './HealingTimeline'
import Crewmate from './Crewmate'
import { Server, AlertTriangle, TrendingUp, Activity, Zap, ShieldAlert, Cpu, Wifi, BatteryWarning } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
}

const ATTACKS: { id: ChaosAttack; label: string; icon: any }[] = [
  { id: 'reactor-overload', label: 'Reactor Overload', icon: Cpu },
  { id: 'o2-disruption', label: 'O2 Disruption', icon: ShieldAlert },
  { id: 'comms-jam', label: 'Comms Jam', icon: Wifi },
  { id: 'power-drain', label: 'Power Drain', icon: BatteryWarning },
]

export default function ShipSystems() {
  const [showSabotageMenu, setShowSabotageMenu] = useState(false)
  const { services, phase, anomalyScore, metrics, initiateChaos } = useSystemStore()

  const healthyCount = services.filter(s => s.status === 'healthy').length
  const failingCount = services.filter(s => s.status === 'failing').length
  const latestMetric = metrics[metrics.length - 1]

  const isChaosActive = phase === 'chaos' || phase === 'detecting' || phase === 'healing'

  const handleSabotage = (attackId: ChaosAttack, targetId: string) => {
    if (isChaosActive) return
    initiateChaos(attackId, targetId)
    setShowSabotageMenu(false)
  }

  const statCards = [
    { label: 'Ship Systems', value: `${healthyCount}/${services.length}`, sub: failingCount > 0 ? `${failingCount} offline` : 'all operational', icon: Server, color: failingCount > 0 ? 'hsl(var(--danger))' : 'hsl(var(--success))' },
    { label: 'Anomaly Score', value: Math.round(anomalyScore), sub: anomalyScore > 50 ? 'SYSTEM FAILURE DETECTED' : 'nominal', icon: AlertTriangle, color: anomalyScore > 50 ? 'hsl(var(--danger))' : anomalyScore > 20 ? 'hsl(var(--warning))' : 'hsl(var(--success))' },
    { label: 'Reactor Heat', value: `${Math.round(latestMetric?.latency ?? 0)}°C`, sub: latestMetric?.latency > 200 ? 'critical' : 'stable', icon: Activity, color: latestMetric?.latency > 200 ? 'hsl(var(--warning))' : 'hsl(var(--info))' },
    { label: 'Power Drain', value: `${(latestMetric?.errorRate ?? 0).toFixed(1)}%`, sub: latestMetric?.errorRate > 5 ? 'critical loss' : 'optimal', icon: TrendingUp, color: latestMetric?.errorRate > 5 ? 'hsl(var(--danger))' : 'hsl(var(--success))' },
  ]

  return (
    <div className="space-y-6">
      {/* Sabotage Header */}
      <motion.div {...fadeUp} transition={{ duration: 1.2, ease: "easeOut" }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ship Systems Map</h2>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setShowSabotageMenu(!showSabotageMenu)}
            disabled={isChaosActive}
            animate={isChaosActive ? {} : { boxShadow: ['0 0 0px hsl(var(--danger)/0)', '0 0 16px hsl(var(--danger)/0.5)', '0 0 0px hsl(var(--danger)/0)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="btn-danger flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold"
            style={{ opacity: isChaosActive ? 0.4 : 1 }}
          >
            <Zap size={18} />
            {isChaosActive ? 'SABOTAGE IN PROGRESS' : 'SABOTAGE SYSTEM'}
          </motion.button>

          {/* Sabotage Dropdown Menu */}
          <AnimatePresence>
            {showSabotageMenu && !isChaosActive && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-14 right-0 w-80 p-4 rounded-xl z-50 glass-card"
                style={{ border: '1px solid hsl(var(--danger)/0.3)' }}
              >
                <div className="text-xs font-semibold uppercase mb-3 text-[hsl(var(--danger))] bg-[hsl(var(--danger)/0.1)] px-2 py-1 rounded inline-block">
                  Select Target System
                </div>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {services.filter(s => s.status === 'healthy').map(s => (
                    <div key={s.id} className="p-2 border rounded-lg bg-black/40 border-white/5 hover:border-[hsl(var(--danger)/0.5)] transition-colors group">
                      <div className="text-xs font-bold text-white mb-2">{s.name}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {ATTACKS.map(attack => (
                          <button
                            key={attack.id}
                            onClick={() => handleSabotage(attack.id, s.id)}
                            className="bg-[hsl(0_0%_10%)] hover:bg-[hsl(0_85%_55%/0.2)] hover:text-[hsl(var(--danger))] px-2 py-1.5 rounded text-[10px] flex items-center justify-between transition-colors border border-transparent group-hover:border-[hsl(var(--danger)/0.2)]"
                          >
                            <span>{attack.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div {...fadeUp} transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }} className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="label-xs text-muted">{label}</span>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs text-muted mt-1">{sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Main grid — topology + gauge */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div {...fadeUp} transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }} className="glass-card col-span-2" style={{ height: 360 }}>
          <div className="px-4 pt-4 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            <span className="label-xs text-muted">System Map</span>
            <div className="flex items-center gap-4">
              {[{ label: 'Operational', color: 'hsl(var(--success))' }, { label: 'Sabotaged', color: 'hsl(var(--danger))' }, { label: 'Repairing', color: 'hsl(var(--warning))' }].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span style={{ fontSize: '10px', color: 'hsl(0 0% 45%)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-2" style={{ height: 'calc(100% - 44px)' }}>
            <TopologyGraph />
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }} className="glass-card p-4" style={{ height: 360 }}>
          <AnomalyGauge />
        </motion.div>
      </div>

      {/* Metrics + Healing */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div {...fadeUp} transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }} className="glass-card col-span-2 p-4" style={{ height: 260 }}>
          <div className="label-xs text-muted mb-2">Metrics Stream</div>
          <div style={{ height: '220px' }}>
            <MetricsCharts />
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 1.2, delay: 1, ease: "easeOut" }} className="glass-card p-4" style={{ height: 260 }}>
          <HealingTimeline />
        </motion.div>
      </div>
    </div>
  )
}
