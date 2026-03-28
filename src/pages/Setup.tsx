import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Package, Search, BarChart2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Step {
  id: number
  icon: React.ElementType
  label: string
  title: string
  desc: string
  fields: { label: string; placeholder: string; type?: string }[]
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: Server,
    label: 'Connect Cluster',
    title: 'Connect your Kubernetes cluster',
    desc: 'NEXUS needs access to your cluster to inject chaos and monitor services. Enter your kubeconfig or API server endpoint.',
    fields: [
      { label: 'API Server URL', placeholder: 'https://k8s.internal:6443' },
      { label: 'Namespace', placeholder: 'production' },
      { label: 'Service Account Token', placeholder: 'eyJhbGciOiJSUzI1NiIs...', type: 'password' },
    ],
  },
  {
    id: 2,
    icon: Package,
    label: 'Deploy Agent',
    title: 'Deploy the NEXUS agent',
    desc: 'The agent runs as a DaemonSet in your cluster and handles chaos injection at the node level with minimal overhead.',
    fields: [
      { label: 'Agent Version', placeholder: 'latest (v0.1.0)' },
      { label: 'Resource Limits (CPU)', placeholder: '100m' },
      { label: 'Resource Limits (Memory)', placeholder: '128Mi' },
    ],
  },
  {
    id: 3,
    icon: Search,
    label: 'Detect Services',
    title: 'Auto-discover services',
    desc: 'NEXUS will scan your cluster for running services and build the initial topology graph automatically.',
    fields: [
      { label: 'Label selector', placeholder: 'app.kubernetes.io/part-of=my-app' },
      { label: 'Exclude namespaces', placeholder: 'kube-system, monitoring' },
    ],
  },
  {
    id: 4,
    icon: BarChart2,
    label: 'Configure Monitoring',
    title: 'Connect observability stack',
    desc: 'Point NEXUS at your existing metrics and tracing infrastructure for richer anomaly detection signals.',
    fields: [
      { label: 'Prometheus URL', placeholder: 'http://prometheus:9090' },
      { label: 'Jaeger URL', placeholder: 'http://jaeger:16686' },
      { label: 'Alert webhook', placeholder: 'https://hooks.slack.com/...' },
    ],
  },
]

export default function Setup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completed, setCompleted] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const step = STEPS[currentStep - 1]
  const Icon = step.icon
  const isLast = currentStep === STEPS.length

  const handleNext = () => {
    setCompleted(prev => [...new Set([...prev, currentStep])])
    if (isLast) {
      setDone(true)
    } else {
      setCurrentStep(c => c + 1)
    }
  }

  const handleBack = () => setCurrentStep(c => c - 1)

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <CheckCircle2 size={60} style={{ color: 'hsl(var(--success))' }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-2">NEXUS is ready</h2>
          <p className="text-muted">Your cluster is connected and monitoring is live.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/dashboard')}
          className="btn-danger px-8"
        >
          Open Dashboard
          <ChevronRight size={16} />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold tracking-tight">Setup Wizard</h1>
        <p className="text-xs text-muted mt-0.5">Connect NEXUS to your infrastructure in 4 steps</p>
      </motion.div>

      {/* Steps indicator */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon
            const isActive = s.id === currentStep
            const isDone = completed.includes(s.id)
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => isDone && setCurrentStep(s.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                  style={{ cursor: isDone ? 'pointer' : 'default' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isDone
                        ? 'hsl(150 70% 45% / 0.2)'
                        : isActive
                        ? 'hsl(0 85% 55% / 0.15)'
                        : 'hsl(0 0% 10%)',
                      border: `1px solid ${
                        isDone ? 'hsl(var(--success))' :
                        isActive ? 'hsl(var(--danger))' :
                        'hsl(0 0% 18%)'
                      }`,
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} style={{ color: 'hsl(var(--success))' }} />
                    ) : (
                      <StepIcon size={16} style={{ color: isActive ? 'hsl(var(--danger))' : 'hsl(0 0% 35%)' }} />
                    )}
                  </div>
                  <span
                    className="label-xs text-center"
                    style={{
                      color: isDone ? 'hsl(var(--success))' : isActive ? 'white' : 'hsl(0 0% 35%)',
                    }}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-px mx-3 mb-5"
                    style={{ background: completed.includes(s.id) ? 'hsl(var(--success) / 0.5)' : 'hsl(0 0% 14%)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'hsl(var(--danger) / 0.1)', border: '1px solid hsl(var(--danger) / 0.2)' }}>
              <Icon size={22} style={{ color: 'hsl(var(--danger))' }} />
            </div>
            <div>
              <div className="font-semibold text-lg">{step.title}</div>
              <p className="text-sm text-muted mt-1" style={{ lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          </div>

          <div className="space-y-4">
            {step.fields.map(field => (
              <div key={field.label}>
                <label className="label-xs text-muted block mb-1.5">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'hsl(0 0% 8%)',
                    border: '1px solid hsl(var(--border))',
                    color: 'white',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'hsl(0 0% 35%)' }}
                  onBlur={e => { e.target.style.borderColor = 'hsl(var(--border))' }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
              Back
            </button>

            <button onClick={handleNext} className="btn-primary">
              {isLast ? 'Finish Setup' : 'Continue'}
              <ChevronRight size={15} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <span className="text-xs text-muted">Step {currentStep} of {STEPS.length}</span>
      </motion.div>
    </div>
  )
}
