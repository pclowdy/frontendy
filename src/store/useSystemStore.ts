import { create } from 'zustand'

export type ServiceStatus = 'healthy' | 'failing' | 'recovering'

export interface Service {
  id: string
  name: string
  status: ServiceStatus
  latency: number
  errorRate: number
  cpu: number
  connections: string[]
}

export interface MetricPoint {
  time: number
  latency: number
  errorRate: number
  cpu: number
}

export interface HealingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'done'
  timestamp?: number
}

export interface Incident {
  id: string
  timestamp: number
  service: string
  type: string
  severity: 'critical' | 'warning' | 'info'
  resolved: boolean
  duration?: number
}

export type ChaosAttack =
  | 'reactor-overload'
  | 'o2-disruption'
  | 'comms-jam'
  | 'power-drain'

export interface SystemState {
  services: Service[]
  anomalyScore: number
  metrics: MetricPoint[]
  activeChaos: ChaosAttack | null
  chaosTarget: string | null
  healingSteps: HealingStep[]
  incidents: Incident[]
  phase: 'normal' | 'chaos' | 'detecting' | 'healing'
  lstmScore: number
  isolationForestScore: number

  // Actions
  initiateChaos: (attack: ChaosAttack, targetId?: string) => void
  updateServices: (services: Service[]) => void
  setAnomalyScore: (score: number) => void
  pushMetric: (point: MetricPoint) => void
  setHealingSteps: (steps: HealingStep[]) => void
  updateHealingStep: (id: string, status: HealingStep['status']) => void
  setPhase: (phase: SystemState['phase']) => void
  setLstmScore: (s: number) => void
  setIsolationForestScore: (s: number) => void
  addIncident: (incident: Incident) => void
  resolveIncident: (id: string) => void
  reset: () => void
}

const INITIAL_SERVICES: Service[] = [
  { id: 'control-room', name: 'Control Room', status: 'healthy', latency: 42, errorRate: 0.2, cpu: 18, connections: ['security', 'cargo', 'storage'] },
  { id: 'security', name: 'Security', status: 'healthy', latency: 28, errorRate: 0.1, cpu: 12, connections: ['reactor'] },
  { id: 'cargo', name: 'Cargo', status: 'healthy', latency: 65, errorRate: 0.3, cpu: 24, connections: ['reactor', 'comms', 'navigation'] },
  { id: 'storage', name: 'Storage', status: 'healthy', latency: 33, errorRate: 0.1, cpu: 15, connections: ['reactor', 'comms'] },
  { id: 'reactor', name: 'Reactor', status: 'healthy', latency: 8, errorRate: 0.0, cpu: 35, connections: ['o2'] },
  { id: 'o2', name: 'O2 System', status: 'healthy', latency: 10, errorRate: 0.0, cpu: 22, connections: [] },
  { id: 'comms', name: 'Comms', status: 'healthy', latency: 3, errorRate: 0.0, cpu: 8, connections: [] },
  { id: 'navigation', name: 'Navigation', status: 'healthy', latency: 12, errorRate: 0.0, cpu: 11, connections: ['shields'] },
  { id: 'shields', name: 'Shields', status: 'healthy', latency: 90, errorRate: 0.4, cpu: 42, connections: [] },
]

const INITIAL_HEALING_STEPS: HealingStep[] = [
  { id: 'detect', label: 'Anomaly detected', status: 'pending' },
  { id: 'root-cause', label: 'Root cause identified', status: 'pending' },
  { id: 'restart', label: 'Restarting pod', status: 'pending' },
  { id: 'scale', label: 'Scaling service', status: 'pending' },
  { id: 'cache', label: 'Cache recovery', status: 'pending' },
  { id: 'verify', label: 'Health check passed', status: 'pending' },
]

const generateInitialMetrics = (): MetricPoint[] => {
  const now = Date.now()
  return Array.from({ length: 30 }, (_, i) => ({
    time: now - (29 - i) * 2000,
    latency: 40 + Math.random() * 20,
    errorRate: 0.1 + Math.random() * 0.3,
    cpu: 18 + Math.random() * 12,
  }))
}

export const useSystemStore = create<SystemState>((set) => ({
  services: INITIAL_SERVICES,
  anomalyScore: 4,
  metrics: generateInitialMetrics(),
  activeChaos: null,
  chaosTarget: null,
  healingSteps: INITIAL_HEALING_STEPS,
  incidents: [],
  phase: 'normal',
  lstmScore: 3,
  isolationForestScore: 5,

  initiateChaos: (attack, targetId) => {
    const targets = INITIAL_SERVICES.filter(s => s.id !== 'reactor' && s.id !== 'o2')
    const target = targetId || targets[Math.floor(Math.random() * targets.length)].id
    set((state) => ({
      activeChaos: attack,
      chaosTarget: target,
      phase: 'chaos',
      services: state.services.map(s =>
        s.id === target ? { ...s, status: 'failing' } : s
      ),
    }))
  },

  updateServices: (services) => set({ services }),

  setAnomalyScore: (score) => set({ anomalyScore: score }),

  pushMetric: (point) =>
    set((state) => ({
      metrics: [...state.metrics.slice(-59), point],
    })),

  setHealingSteps: (steps) => set({ healingSteps: steps }),

  updateHealingStep: (id, status) =>
    set((state) => ({
      healingSteps: state.healingSteps.map(s =>
        s.id === id ? { ...s, status, timestamp: Date.now() } : s
      ),
    })),

  setPhase: (phase) => set({ phase }),

  setLstmScore: (lstmScore) => set({ lstmScore }),
  setIsolationForestScore: (isolationForestScore) => set({ isolationForestScore }),

  addIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents] })),

  resolveIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map(i =>
        i.id === id ? { ...i, resolved: true, duration: Date.now() - i.timestamp } : i
      ),
    })),

  reset: () =>
    set({
      services: INITIAL_SERVICES.map(s => ({ ...s, status: 'healthy' })),
      anomalyScore: 4,
      activeChaos: null,
      chaosTarget: null,
      phase: 'normal',
      lstmScore: 3,
      isolationForestScore: 5,
      healingSteps: INITIAL_HEALING_STEPS,
    }),
}))
