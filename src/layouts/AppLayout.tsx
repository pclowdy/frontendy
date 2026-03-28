import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useSystemStore } from '../store/useSystemStore'
import { useEffect, useRef } from 'react'

export default function AppLayout() {
  const location = useLocation()
  const phase = useSystemStore(s => s.phase)

  // Screen shake on chaos
  useEffect(() => {
    if (phase === 'chaos') {
      document.body.classList.add('chaos-shake')
      const t = setTimeout(() => {
        document.body.classList.remove('chaos-shake')
      }, 600)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--background))' }}>
      {/* Chaos flash overlay */}
      <AnimatePresence>
        {phase === 'chaos' && (
          <motion.div
            key="chaos-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0, 0.1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ background: 'hsl(var(--danger))' }}
          />
        )}
      </AnimatePresence>

      {/* Healing flash overlay */}
      <AnimatePresence>
        {phase === 'healing' && (
          <motion.div
            key="heal-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.04, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: 2 }}
            style={{ background: 'hsl(var(--success))' }}
          />
        )}
      </AnimatePresence>

      <Sidebar />

      <main
        className="flex-1 w-full"
        style={{ paddingLeft: '220px' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        @keyframes chaos-shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-4px) translateY(2px); }
          30% { transform: translateX(4px) translateY(-2px); }
          45% { transform: translateX(-3px) translateY(1px); }
          60% { transform: translateX(3px) translateY(-1px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
        .chaos-shake {
          animation: chaos-shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  )
}

