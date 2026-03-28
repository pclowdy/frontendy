import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import Crewmate from '../components/Crewmate'

const LOOP_STEPS = [
  { label: 'INJECT', color: 'hsl(0 85% 55%)', desc: 'Introduce failure' },
  { label: 'DETECT', color: 'hsl(40 90% 55%)', desc: 'AI spots anomaly' },
  { label: 'DECIDE', color: 'hsl(210 80% 60%)', desc: 'Root cause found' },
  { label: 'RECOVER', color: 'hsl(150 70% 45%)', desc: 'Auto-remediation' },
]

const SERVICES = ['api-gateway', 'auth', 'orders', 'users', 'db', 'cache']

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'hsl(0 0% 2%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(0 0% 8% / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(0 0% 8% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, hsl(0 85% 55% / 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Floating crewmates */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {SERVICES.map((id, i) => (
          <motion.div
            key={id}
            className="absolute"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${15 + (i % 3) * 25}%`,
              opacity: 0.25,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          >
            <Crewmate
              status={i === 0 ? 'failing' : i === 3 ? 'recovering' : 'healthy'}
              size={24}
              animate={false}
            />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-3xl px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
          style={{
            background: 'hsl(0 85% 55% / 0.1)',
            border: '1px solid hsl(0 85% 55% / 0.25)',
          }}
        >
          <Zap size={12} style={{ color: 'hsl(var(--danger))' }} />
          <span className="label-xs" style={{ color: 'hsl(var(--danger))' }}>
            Autonomous Chaos Engineering Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl font-bold tracking-tight mb-4 leading-none"
          style={{ letterSpacing: '-0.03em' }}
        >
          Break your system.
          <br />
          <span
            className="font-serif italic"
            style={{ color: 'hsl(var(--success))' }}
          >
            Watch it heal itself.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted text-lg mb-12"
          style={{ lineHeight: 1.6 }}
        >
          NEXUS injects chaos into your distributed systems, detects failures with AI,
          and autonomously recovers — before your users notice.
        </motion.p>

        {/* Loop diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-0 mb-12"
        >
          {LOOP_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl"
                style={{
                  background: `${step.color}12`,
                  border: `1px solid ${step.color}30`,
                  minWidth: 110,
                }}
                animate={{
                  borderColor: [`${step.color}30`, `${step.color}70`, `${step.color}30`],
                  boxShadow: [
                    `0 0 0px ${step.color}00`,
                    `0 0 20px ${step.color}30`,
                    `0 0 0px ${step.color}00`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
              >
                <span
                  className="label-xs"
                  style={{ color: step.color, letterSpacing: '0.12em' }}
                >
                  {step.label}
                </span>
                <span className="text-xs text-muted">{step.desc}</span>
              </motion.div>

              {i < LOOP_STEPS.length - 1 && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  className="flex items-center px-1"
                >
                  <ArrowRight size={14} style={{ color: 'hsl(0 0% 35%)' }} />
                </motion.div>
              )}
            </div>
          ))}

          {/* Return arrow */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
            className="ml-1"
          >
            <div
              className="px-2 py-1 rounded text-xs"
              style={{ color: 'hsl(0 0% 30%)', fontSize: '10px' }}
            >
              ↩ loops
            </div>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-danger text-base px-8 py-3"
            style={{ fontSize: '0.95rem', letterSpacing: '0.04em' }}
          >
            <Zap size={16} />
            Enter the Platform
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="btn-primary"
            style={{ background: 'transparent', color: 'hsl(0 0% 60%)', border: '1px solid hsl(var(--border))' }}
          >
            Setup Wizard
          </button>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(0 0% 2%), transparent)',
        }}
      />
    </div>
  )
}
