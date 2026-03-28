import { motion } from 'framer-motion'
import { useSystemStore } from '../store/useSystemStore'
import TopologyGraph from '../components/TopologyGraph'
import AnomalyGauge from '../components/AnomalyGauge'
import MetricsCharts from '../components/MetricsCharts'
import HealingTimeline from '../components/HealingTimeline'
import Crewmate from '../components/Crewmate'
import { Activity, Server, AlertTriangle, TrendingUp } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const services = useSystemStore(s => s.services)
  const phase = useSystemStore(s => s.phase)
  const anomalyScore = useSystemStore(s => s.anomalyScore)
  const metrics = useSystemStore(s => s.metrics)

  const healthyCount = services.filter(s => s.status === 'healthy').length
  const failingCount = services.filter(s => s.status === 'failing').length
  const latestMetric = metrics[metrics.length - 1]

  const statCards = [
    {
      label: 'Services',
      value: `${healthyCount}/${services.length}`,
      sub: failingCount > 0 ? `${failingCount} failing` : 'all healthy',
      icon: Server,
      color: failingCount > 0 ? 'hsl(var(--danger))' : 'hsl(var(--success))',
    },
    {
      label: 'Anomaly Score',
      value: Math.round(anomalyScore),
      sub: anomalyScore > 50 ? 'critical threshold' : 'within range',
      icon: AlertTriangle,
      color: anomalyScore > 50 ? 'hsl(var(--danger))' : anomalyScore > 20 ? 'hsl(var(--warning))' : 'hsl(var(--success))',
    },
    {
      label: 'Avg Latency',
      value: `${Math.round(latestMetric?.latency ?? 0)}ms`,
      sub: latestMetric?.latency > 200 ? 'elevated' : 'nominal',
      icon: Activity,
      color: latestMetric?.latency > 200 ? 'hsl(var(--warning))' : 'hsl(var(--info))',
    },
    {
      label: 'Error Rate',
      value: `${(latestMetric?.errorRate ?? 0).toFixed(1)}%`,
      sub: latestMetric?.errorRate > 5 ? 'above SLO' : 'within SLO',
      icon: TrendingUp,
      color: latestMetric?.errorRate > 5 ? 'hsl(var(--danger))' : 'hsl(var(--success))',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">System Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">Real-time chaos engineering overview</p>
        </div>
        <div className="flex items-center gap-3">
          {services
            .filter(s => s.status !== 'healthy')
            .slice(0, 3)
            .map(s => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
                <Crewmate status={s.status} size={18} animate />
                <span className="text-xs font-medium">{s.name}</span>
                <span className={`badge-${s.status === 'failing' ? 'danger' : 'warning'}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            ))}
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: phase === 'normal' ? 'hsl(150 70% 45% / 0.12)' :
                phase === 'chaos' ? 'hsl(var(--danger) / 0.12)' :
                phase === 'healing' ? 'hsl(var(--info) / 0.12)' : 'hsl(var(--warning) / 0.12)',
              color: phase === 'normal' ? 'hsl(var(--success))' :
                phase === 'chaos' ? 'hsl(var(--danger))' :
                phase === 'healing' ? 'hsl(var(--info))' : 'hsl(var(--warning))',
              border: `1px solid ${phase === 'normal' ? 'hsl(150 70% 45% / 0.25)' :
                phase === 'chaos' ? 'hsl(var(--danger) / 0.25)' :
                phase === 'healing' ? 'hsl(var(--info) / 0.25)' : 'hsl(var(--warning) / 0.25)'}`,
            }}
          >
            {phase.toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-4 gap-4"
      >
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
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card col-span-2"
          style={{ height: 320 }}
        >
          <div className="px-4 pt-4 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            <span className="label-xs text-muted">Service Topology</span>
            <div className="flex items-center gap-4">
              {[
                { label: 'Healthy', color: 'hsl(var(--success))' },
                { label: 'Failing', color: 'hsl(var(--danger))' },
                { label: 'Recovering', color: 'hsl(var(--warning))' },
              ].map(({ label, color }) => (
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

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass-card p-4"
          style={{ height: 320 }}
        >
          <AnomalyGauge />
        </motion.div>
      </div>

      {/* Metrics + Healing */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="col-span-2"
          style={{ height: 160 }}
        >
          <MetricsCharts />
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="glass-card p-4"
          style={{ height: 160 }}
        >
          <HealingTimeline />
        </motion.div>
      </div>
    </div>
  )
}
