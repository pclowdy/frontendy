import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const LOOP_STEPS = [
  { label: 'SABOTAGE', color: 'hsl(0 85% 55%)', desc: 'Introduce failure' },
  { label: 'DETECT', color: 'hsl(40 90% 55%)', desc: 'AI spots anomaly' },
  { label: 'DECIDE', color: 'hsl(210 80% 60%)', desc: 'Isolate system' },
  { label: 'REPAIR', color: 'hsl(150 70% 45%)', desc: 'Auto-remediation' },
]

export default function LandingLoop() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-2xl font-bold mb-12"
      >
        The Chaos Loop
      </motion.h2>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {LOOP_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: i * 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-2 px-6 py-5 rounded-xl bg-[hsl(var(--card))] border border-white/5 relative"
              style={{ minWidth: 140 }}
            >
              {/* Sequential glow */}
              <motion.div 
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0, boxShadow: '0 0 0px transparent' }}
                whileInView={{ opacity: [0, 1, 0], boxShadow: [`0 0 0px transparent`, `0 0 24px ${step.color}40`, `0 0 0px transparent`] }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 2, delay: i * 0.6 + 0.5, ease: "easeInOut" }}
                style={{ border: `1px solid ${step.color}60` }}
              />

              <span
                className="label-xs"
                style={{ color: step.color, letterSpacing: '0.12em' }}
              >
                {step.label}
              </span>
              <span className="text-xs text-muted text-center">{step.desc}</span>
            </motion.div>

            {i < LOOP_STEPS.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: i * 0.6 + 0.3, ease: "easeOut" }}
                className="flex items-center px-1"
              >
                <ArrowRight size={18} style={{ color: 'hsl(0 0% 35%)' }} />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
