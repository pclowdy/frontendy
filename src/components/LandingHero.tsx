import { motion, useScroll, useTransform } from 'framer-motion'
import { Zap } from 'lucide-react'
import Crewmate from './Crewmate'

export default function LandingHero({ scrollYProgress }: { scrollYProgress: any }) {
  // Parallax parallax effect for background
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" 
         style={{ background: 'hsl(0 0% 2%)' }}>
      
      {/* 2D Spaceship Background with Parallax */}
      <motion.img 
        src="/assets/skeld.png"
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        style={{ y: yBg }}
        onError={(e) => {
          // Fallback if asset is missing
          e.currentTarget.style.display = 'none'
        }}
      />
      {/* Dark overlay that gets darker as we scroll down to smoothly transition into next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 pointer-events-none" />

      {/* Floating Crewmate */}
      <motion.div
        className="absolute right-[15%] top-[25%] z-10 w-24 h-24 opacity-80"
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Crewmate status="healthy" size={80} animate={false} />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-3xl px-8 mt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
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

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="text-6xl font-bold tracking-tight mb-4 leading-none"
          style={{ letterSpacing: '-0.03em' }}
        >
          Control the Chaos.
          <br />
          <span
            className="font-serif italic"
            style={{ color: 'hsl(var(--success))' }}
          >
            Watch the ship heal.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="text-muted text-lg mb-12"
          style={{ lineHeight: 1.6 }}
        >
          NEXUS injects sabotage into your ship's vital systems, detects failures with AI,
          and autonomously repairs — before the impostor wins.
        </motion.p>
      </div>
    </div>
  )
}

