import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LandingHero from '../components/LandingHero'
import LandingLoop from '../components/LandingLoop'
import ShipSystems from '../components/ShipSystems'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Parallax configuration
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  // Wait, useScroll default attaches to window. But we have AppLayout overflow-y-auto. 
  // Let's rely on standard window scroll if we remove overflow from AppLayout. Or we pass container.

  return (
    <div className="flex flex-col relative w-full" ref={containerRef}>
      <section id="hero" className="w-full relative flex flex-col justify-center items-center" style={{ minHeight: '80vh' }}>
        <LandingHero scrollYProgress={scrollYProgress} />
      </section>

      <div className="relative z-10 w-full" style={{ background: 'hsl(var(--background))' }}>
        <section id="loop" className="py-24 flex flex-col justify-center items-center">
          <LandingLoop />
        </section>

        <section id="systems" className="pb-32 pt-12 px-6 max-w-7xl mx-auto w-full">
          <ShipSystems />
        </section>
      </div>
    </div>
  )
}

