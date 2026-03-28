import { useSystemStore } from '../store/useSystemStore'

let engineInterval: ReturnType<typeof setInterval> | null = null
let healingTimeout: ReturnType<typeof setTimeout> | null = null
let tick = 0

const jitter = (base: number, variance: number) =>
  base + (Math.random() - 0.5) * variance * 2

export function startMockEngine() {
  if (engineInterval) return

  engineInterval = setInterval(() => {
    tick++
    const store = useSystemStore.getState()
    const { phase } = store

    const now = Date.now()

    if (phase === 'normal') {
      // Gentle normal fluctuations
      store.pushMetric({
        time: now,
        latency: jitter(45, 8),
        errorRate: jitter(0.2, 0.1),
        cpu: jitter(22, 5),
      })
      store.setAnomalyScore(Math.max(0, Math.min(10, jitter(4, 1.5))))
      store.setLstmScore(Math.max(0, Math.min(100, jitter(5, 3))))
      store.setIsolationForestScore(Math.max(0, Math.min(100, jitter(6, 3))))

      // Heal all services back to healthy
      store.updateServices(
        store.services.map(s => ({ ...s, status: 'healthy' as const }))
      )
    }

    if (phase === 'chaos') {
      // Spike metrics hard
      const spike = Math.min(1, (tick % 30) / 10)
      store.pushMetric({
        time: now,
        latency: jitter(350 + spike * 400, 60),
        errorRate: jitter(18 + spike * 30, 5),
        cpu: jitter(75 + spike * 20, 8),
      })
      store.setAnomalyScore(Math.min(100, jitter(55 + spike * 40, 8)))
      store.setLstmScore(Math.min(100, jitter(60 + spike * 35, 10)))
      store.setIsolationForestScore(Math.min(100, jitter(65 + spike * 30, 10)))

      // After 3 seconds, transition to detecting
      if (tick % 15 === 3) {
        store.setPhase('detecting')
        tick = 0
      }
    }

    if (phase === 'detecting') {
      store.pushMetric({
        time: now,
        latency: jitter(280, 40),
        errorRate: jitter(22, 4),
        cpu: jitter(82, 6),
      })
      store.setAnomalyScore(Math.min(100, jitter(88, 5)))
      store.setLstmScore(Math.min(100, jitter(85, 5)))
      store.setIsolationForestScore(Math.min(100, jitter(82, 5)))

      // Add incident record
      if (tick === 1) {
        const target = store.chaosTarget || 'unknown-svc'
        store.addIncident({
          id: `inc-${Date.now()}`,
          timestamp: now,
          service: target,
          type: store.activeChaos || 'pod-crash',
          severity: 'critical',
          resolved: false,
        })
      }

      // After detecting, start healing
      if (tick === 6) {
        store.setPhase('healing')
        tick = 0
        startHealingSequence()
      }
    }

    if (phase === 'healing') {
      // Gradually recover metrics
      const progress = Math.min(1, tick / 25)
      store.pushMetric({
        time: now,
        latency: jitter(280 - progress * 235, 20),
        errorRate: jitter(22 - progress * 21.8, 2),
        cpu: jitter(82 - progress * 60, 5),
      })
      store.setAnomalyScore(Math.max(4, 88 - progress * 84 + jitter(0, 3)))
      store.setLstmScore(Math.max(5, 85 - progress * 80 + jitter(0, 3)))
      store.setIsolationForestScore(Math.max(6, 82 - progress * 76 + jitter(0, 3)))

      // Mark target as recovering
      const target = store.chaosTarget
      if (target) {
        store.updateServices(
          store.services.map(s =>
            s.id === target ? { ...s, status: 'recovering' as const } : s
          )
        )
      }

      if (tick >= 25) {
        // All healed
        store.setPhase('normal')
        store.reset()
        const incidentToResolve = store.incidents.find(i => !i.resolved)
        if (incidentToResolve) {
          store.resolveIncident(incidentToResolve.id)
        }
        tick = 0
      }
    }
  }, 500)
}

function startHealingSequence() {
  const store = useSystemStore.getState()
  const steps = ['detect', 'root-cause', 'restart', 'scale', 'cache', 'verify']

  // Reset steps
  store.setHealingSteps(
    steps.map((id, i) => ({
      id,
      label: [
        'Anomaly detected',
        'Root cause identified',
        'Restarting pod',
        'Scaling service',
        'Cache recovery',
        'Health check passed',
      ][i],
      status: 'pending',
    }))
  )

  steps.forEach((stepId, i) => {
    const delay = i * 1800
    healingTimeout = setTimeout(() => {
      useSystemStore.getState().updateHealingStep(stepId, i === 0 ? 'done' : 'active')
      if (i > 0) {
        setTimeout(() => {
          useSystemStore.getState().updateHealingStep(stepId, 'done')
        }, 1200)
      }
    }, delay)
  })
}

export function stopMockEngine() {
  if (engineInterval) {
    clearInterval(engineInterval)
    engineInterval = null
  }
  if (healingTimeout) {
    clearTimeout(healingTimeout)
    healingTimeout = null
  }
  tick = 0
}
