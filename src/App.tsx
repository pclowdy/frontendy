import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AppLayout from './layouts/AppLayout'
import Home from './pages/Home'
import Detection from './pages/Detection'
import Healing from './pages/Healing'
import Reports from './pages/Reports'
import Setup from './pages/Setup'
import { startMockEngine } from './lib/mockEngine'

export default function App() {
  useEffect(() => {
    startMockEngine()
  }, [])

  return (
    <BrowserRouter>
      <div className="scanline" />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/detection" element={<Detection />} />
          <Route path="/healing" element={<Healing />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

