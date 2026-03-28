import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useSystemStore } from '../store/useSystemStore'

interface ChartConfig {
  key: 'latency' | 'errorRate' | 'cpu'
  label: string
  unit: string
  color: string
  domain: [number, number]
}

const CHARTS: ChartConfig[] = [
  { key: 'latency', label: 'Latency', unit: 'ms', color: 'hsl(210 80% 60%)', domain: [0, 800] },
  { key: 'errorRate', label: 'Error Rate', unit: '%', color: 'hsl(0 85% 55%)', domain: [0, 50] },
  { key: 'cpu', label: 'CPU Usage', unit: '%', color: 'hsl(40 90% 55%)', domain: [0, 100] },
]

const CustomTooltip = ({ active, payload, label: _label, unit }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2" style={{ fontSize: '11px' }}>
      <p style={{ color: 'hsl(0 0% 50%)' }}>{new Date(payload[0]?.payload?.time).toLocaleTimeString()}</p>
      <p style={{ color: payload[0]?.color, fontWeight: 600 }}>
        {Number(payload[0]?.value).toFixed(1)}{unit}
      </p>
    </div>
  )
}

export default function MetricsCharts() {
  const metrics = useSystemStore(s => s.metrics)
  const phase = useSystemStore(s => s.phase)

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {CHARTS.map(({ key, label, unit, color, domain }) => {
        const latest = metrics[metrics.length - 1]?.[key] ?? 0
        const isSpike = phase === 'chaos' || phase === 'detecting'

        return (
          <div key={key} className="glass-card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="label-xs text-muted">{label}</span>
              <span
                className="text-sm font-bold"
                style={{ color: isSpike ? 'hsl(0 85% 55%)' : color }}
              >
                {latest.toFixed(key === 'latency' ? 0 : 1)}{unit}
              </span>
            </div>
            <div className="flex-1" style={{ minHeight: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="hsl(0 0% 12%)"
                    vertical={false}
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={domain} hide />
                  <Tooltip
                    content={<CustomTooltip unit={unit} />}
                    cursor={{ stroke: 'hsl(0 0% 25%)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={1.5}
                    fill={`url(#grad-${key})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      })}
    </div>
  )
}
