import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Zap,
  HeartPulse,
  Brain,
  FileText,
  Settings,
  Rocket
} from 'lucide-react'
import { useSystemStore } from '../store/useSystemStore'
import Crewmate from './Crewmate'

const ANCHOR_ITEMS = [
  { href: '#hero', icon: Rocket, label: 'Spaceship' },
  { href: '#loop', icon: Zap, label: 'Chaos Loop' },
  { href: '#systems', icon: HeartPulse, label: 'Ship Systems' },
]

const ROUTE_ITEMS = [
  { to: '/detection', icon: Brain, label: 'AI Detection' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/setup', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const phase = useSystemStore(s => s.phase)
  const anomalyScore = useSystemStore(s => s.anomalyScore)
  const activeChaos = useSystemStore(s => s.activeChaos)
  const location = useLocation()
  
  const [activeAnchor, setActiveAnchor] = useState('#hero')

  useEffect(() => {
    if (location.pathname !== '/') return

    const handleScroll = () => {
      const sections = ['hero', 'loop', 'systems']
      let current = sections[0]

      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= (el.offsetTop - 300)) {
          current = id
        }
      }
      setActiveAnchor(`#${current}`)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const getBadge = (path: string) => {
    if (path === '#systems' && (phase === 'chaos' || activeChaos)) return 'danger'
    if (path === '/detection' && (phase === 'detecting' || anomalyScore > 40)) return 'warning'
    if (path === '#systems' && phase === 'healing') return 'success'
    return null
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col"
      style={{
        width: '220px',
        background: 'hsl(0 0% 4%)',
        borderRight: '1px solid hsl(var(--border))',
      }}
    >
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <Crewmate
          status={phase === 'chaos' ? 'failing' : phase === 'healing' ? 'recovering' : 'healthy'}
          size={28}
        />
        <div>
          <div className="font-bold text-sm tracking-widest text-white">NEXUS</div>
          <div className="text-xs" style={{ color: 'hsl(0 0% 40%)' }}>chaos engineering</div>
        </div>
      </div>

      <div className="mx-4 my-3 px-3 py-2 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
        <div className="label-xs text-muted mb-1">system phase</div>
        <div className="flex items-center gap-2">
          <span
            className="status-dot"
            style={{
              background: phase === 'normal' ? 'hsl(var(--success))' :
                phase === 'chaos' ? 'hsl(var(--danger))' :
                phase === 'detecting' ? 'hsl(var(--warning))' :
                'hsl(var(--info))',
              boxShadow: `0 0 6px ${
                phase === 'normal' ? 'hsl(var(--success) / 0.6)' :
                phase === 'chaos' ? 'hsl(var(--danger) / 0.6)' :
                phase === 'detecting' ? 'hsl(var(--warning) / 0.6)' :
                'hsl(var(--info) / 0.6)'
              }`,
            }}
          />
          <span className="text-xs font-medium text-white capitalize">{phase === 'chaos' ? 'SABOTAGE' : phase}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {ANCHOR_ITEMS.map(({ href, icon: Icon, label }) => {
          const badge = getBadge(href)
          const isActive = location.pathname === '/' && activeAnchor === href
          return (
            <a
              key={href}
              href={location.pathname === '/' ? href : `/${href}`}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={15} />
                <span>{label}</span>
              </div>
              {badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`badge-${badge}`}
                >
                  {badge === 'danger' ? 'LIVE' : badge === 'warning' ? 'ALERT' : 'RUN'}
                </motion.span>
              )}
            </a>
          )
        })}

        <div className="my-2 border-t border-white/5 mx-2" />

        {ROUTE_ITEMS.map(({ to, icon: Icon, label }) => {
          const badge = getBadge(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={15} />
                <span>{label}</span>
              </div>
              {badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`badge-${badge}`}
                >
                  {badge === 'danger' ? 'LIVE' : badge === 'warning' ? 'ALERT' : 'RUN'}
                </motion.span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 py-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="status-dot status-dot-healthy" />
          <span className="text-xs" style={{ color: 'hsl(0 0% 40%)' }}>Engine running</span>
        </div>
        <div className="text-xs" style={{ color: 'hsl(0 0% 28%)' }}>
          v0.2.0 · Spaceship Active
        </div>
      </div>
    </aside>
  )
}
