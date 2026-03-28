import { motion } from 'framer-motion'
import { FileText, Download, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { useSystemStore } from '../store/useSystemStore'

const MOCK_HISTORICAL = [
  { id: 'inc-0001', timestamp: Date.now() - 3600000 * 8, service: 'order-svc', type: 'pod-crash', severity: 'critical', resolved: true, duration: 28000 },
  { id: 'inc-0002', timestamp: Date.now() - 3600000 * 4, service: 'api-gateway', type: 'cpu-stress', severity: 'critical', resolved: true, duration: 45000 },
  { id: 'inc-0003', timestamp: Date.now() - 3600000 * 2, service: 'cache', type: 'network-delay', severity: 'warning', resolved: true, duration: 12000 },
  { id: 'inc-0004', timestamp: Date.now() - 3600000 * 1, service: 'auth-svc', type: 'memory-leak', severity: 'critical', resolved: true, duration: 61000 },
]

const TYPE_LABELS: Record<string, string> = {
  'pod-crash': 'Pod Crash',
  'cpu-stress': 'CPU Stress',
  'memory-leak': 'Memory Leak',
  'network-delay': 'Network Delay',
  'latency-injection': 'Latency Injection',
}

function formatDuration(ms: number) {
  if (!ms) return '—'
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function Reports() {
  const liveIncidents = useSystemStore(s => s.incidents)
  const allIncidents = [...liveIncidents, ...MOCK_HISTORICAL].sort((a, b) => b.timestamp - a.timestamp)

  const totalIncidents = allIncidents.length
  const resolved = allIncidents.filter(i => i.resolved).length
  const criticals = allIncidents.filter(i => i.severity === 'critical').length
  const avgDuration = allIncidents
    .filter(i => i.duration)
    .reduce((sum, i) => sum + (i.duration ?? 0), 0) / Math.max(1, allIncidents.filter(i => i.duration).length)

  const handleExport = () => {
    const csv = [
      'ID,Timestamp,Service,Type,Severity,Resolved,Duration(ms)',
      ...allIncidents.map(i =>
        `${i.id},${new Date(i.timestamp).toISOString()},${i.service},${i.type},${i.severity},${i.resolved},${i.duration ?? ''}`
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexus-incidents-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-xl font-bold tracking-tight">Incident Reports</h1>
          <p className="text-xs text-muted mt-0.5">Full history of chaos experiments and auto-recoveries</p>
        </div>
        <button onClick={handleExport} className="btn-primary">
          <Download size={14} />
          Export CSV
        </button>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-4"
      >
        {[
          { label: 'Total incidents', value: totalIncidents, icon: FileText, color: 'hsl(var(--info))' },
          { label: 'Resolved', value: `${resolved}/${totalIncidents}`, icon: CheckCircle2, color: 'hsl(var(--success))' },
          { label: 'Critical events', value: criticals, icon: AlertTriangle, color: 'hsl(var(--danger))' },
          { label: 'Avg recovery', value: formatDuration(avgDuration), icon: Clock, color: 'hsl(var(--warning))' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="label-xs text-muted">{label}</span>
              <Icon size={13} style={{ color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Incident table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <span className="label-xs text-muted">Incident Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                {['Incident ID', 'Time', 'Service', 'Attack Type', 'Severity', 'Status', 'Duration'].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 label-xs text-muted"
                    style={{ fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allIncidents.map((incident, i) => (
                <motion.tr
                  key={incident.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.04 }}
                  style={{
                    borderBottom: '1px solid hsl(0 0% 9%)',
                  }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3 text-xs font-mono" style={{ color: 'hsl(0 0% 55%)' }}>
                    {incident.id}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'hsl(0 0% 55%)' }}>
                    {formatTime(incident.timestamp)}
                  </td>
                  <td className="px-5 py-3 text-xs font-medium text-white">
                    {incident.service}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'hsl(0 0% 65%)' }}>
                    {TYPE_LABELS[incident.type] || incident.type}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge-${incident.severity === 'critical' ? 'danger' : incident.severity === 'warning' ? 'warning' : 'success'}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {incident.resolved ? (
                        <CheckCircle2 size={12} style={{ color: 'hsl(var(--success))' }} />
                      ) : (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'hsl(var(--danger))' }}
                        />
                      )}
                      <span
                        className="text-xs"
                        style={{ color: incident.resolved ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}
                      >
                        {incident.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'hsl(0 0% 55%)' }}>
                    {formatDuration(incident.duration ?? 0)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {allIncidents.length === 0 && (
          <div className="text-center py-16 text-muted">
            <FileText size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No incidents recorded yet</p>
            <p className="text-xs mt-1 opacity-50">Inject chaos to generate incident reports</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
