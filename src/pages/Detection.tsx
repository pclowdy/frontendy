import { motion } from 'framer-motion'
import { Brain, Activity, TrendingUp } from 'lucide-react'
import { useSystemStore } from '../store/useSystemStore'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts'

function ScoreBar({ label, value, color, desc }: { label: string; value: number; color: string; desc: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-muted">{desc}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color }}>{Math.round(value)}</div>
          <div className="text-xs text-muted">/100</div>
        </div>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'hsl(0 0% 10%)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted" style={{ fontSize: '9px' }}>
        <span>NOMINAL</span>
        <span>ELEVATED</span>
        <span>CRITICAL</span>
      </div>
    </div>
  )
}

function getColor(v: number) {
  if (v < 30) return 'hsl(150 70% 45%)'
  if (v < 60) return 'hsl(40 90% 55%)'
  return 'hsl(0 85% 55%)'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2" style={{ fontSize: '11px' }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(1)}
        </div>
      ))}
    </div>
  )
}

export default function Detection() {
  const metrics = useSystemStore(s => s.metrics)
  const lstmScore = useSystemStore(s => s.lstmScore)
  const isolationForestScore = useSystemStore(s => s.isolationForestScore)
  const anomalyScore = useSystemStore(s => s.anomalyScore)
  const phase = useSystemStore(s => s.phase)

  const combinedScore = (lstmScore * 0.55 + isolationForestScore * 0.45)

  const chartData = metrics.slice(-40).map(m => ({
    time: m.time,
    latency: m.latency,
    errorRate: m.errorRate * 10, // scale for visibility
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Detection</h1>
          <p className="text-xs text-muted mt-0.5">Multi-model anomaly analysis engine</p>
        </div>

        {/* AI analyzing indicator */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            background: phase === 'detecting' ? 'hsl(40 90% 55% / 0.1)' : 'hsl(var(--muted))',
            border: `1px solid ${phase === 'detecting' ? 'hsl(40 90% 55% / 0.3)' : 'hsl(var(--border))'}`,
          }}
          animate={phase === 'detecting' ? { borderColor: ['hsl(40 90% 55% / 0.3)', 'hsl(40 90% 55% / 0.7)', 'hsl(40 90% 55% / 0.3)'] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <motion.div
            animate={phase !== 'normal' ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Brain size={14} style={{ color: phase === 'detecting' ? 'hsl(var(--warning))' : 'hsl(0 0% 50%)' }} />
          </motion.div>
          <span
            className="text-xs font-medium"
            style={{ color: phase === 'detecting' ? 'hsl(var(--warning))' : 'hsl(0 0% 50%)' }}
          >
            {phase === 'detecting' ? 'AI analyzing…' : phase === 'chaos' ? 'Monitoring…' : 'Systems nominal'}
          </span>
          {phase === 'detecting' && (
            <motion.div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ background: 'hsl(var(--warning))' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Model scores */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 col-span-2 space-y-6"
        >
          <ScoreBar
            label="LSTM Anomaly Score"
            value={lstmScore}
            color={getColor(lstmScore)}
            desc="Long Short-Term Memory — time series pattern detection"
          />
          <div style={{ borderTop: '1px solid hsl(var(--border))' }} />
          <ScoreBar
            label="Isolation Forest Score"
            value={isolationForestScore}
            color={getColor(isolationForestScore)}
            desc="Unsupervised outlier detection across feature space"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 flex flex-col items-center justify-center text-center"
        >
          <div className="label-xs text-muted mb-3">Combined Score</div>
          <div
            className="text-5xl font-bold mb-2"
            style={{ color: getColor(combinedScore) }}
          >
            {Math.round(combinedScore)}
          </div>
          <div className="text-xs text-muted mb-4">weighted ensemble</div>

          <div
            className="w-full h-1.5 rounded-full mb-1"
            style={{ background: 'hsl(0 0% 10%)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: getColor(combinedScore) }}
              animate={{ width: `${combinedScore}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          <div className="mt-4 space-y-1 w-full">
            <div className="flex justify-between text-xs">
              <span className="text-muted">LSTM weight</span>
              <span style={{ color: 'hsl(0 0% 60%)' }}>55%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">IF weight</span>
              <span style={{ color: 'hsl(0 0% 60%)' }}>45%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time series chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color: 'hsl(var(--info))' }} />
            <span className="label-xs text-muted">Signal Timeline</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: 'Latency', color: 'hsl(210 80% 60%)' },
              { label: 'Error rate ×10', color: 'hsl(0 85% 55%)' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded" style={{ background: color }} />
                <span style={{ fontSize: '10px', color: 'hsl(0 0% 45%)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(0 0% 10%)" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 850]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(0 0% 25%)', strokeWidth: 1 }} />
              <ReferenceLine y={200} stroke="hsl(40 90% 55% / 0.4)" strokeDasharray="4 4" label={{ value: 'threshold', fill: 'hsl(0 0% 35%)', fontSize: 9 }} />
              <Line type="monotone" dataKey="latency" name="Latency" stroke="hsl(210 80% 60%)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="errorRate" name="Error rate" stroke="hsl(0 85% 55%)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Detection events */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} style={{ color: 'hsl(var(--info))' }} />
          <span className="label-xs text-muted">Detection Model Status</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Training data', value: '14 days', color: 'hsl(0 0% 70%)' },
            { label: 'Last retrain', value: '2h ago', color: 'hsl(0 0% 70%)' },
            { label: 'Model accuracy', value: '97.4%', color: 'hsl(var(--success))' },
            { label: 'False positive rate', value: '0.8%', color: 'hsl(var(--success))' },
            { label: 'Detection latency', value: '~1.2s', color: 'hsl(var(--info))' },
            { label: 'Active features', value: '24', color: 'hsl(0 0% 70%)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="label-xs text-muted">{label}</span>
              <span className="text-sm font-semibold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
