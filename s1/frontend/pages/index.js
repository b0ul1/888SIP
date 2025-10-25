import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatsGrid from '../components/StatsGrid'
import ActivityLog from '../components/ActivityLog'
import BotsList from '../components/BotsList'
import CallChart from '../components/CallChart'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const socket = io(API_URL)

export default function Dashboard() {
  const [logs, setLogs] = useState([])
  const [bots, setBots] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    active: 0
  })

  useEffect(() => {
    fetchBots()
    fetchStats()
    socket.on('call_started', handleNewCall)
    return () => socket.off('call_started', handleNewCall)
  }, [])

  async function fetchBots() {
    const res = await fetch(`${API_URL}/api/bots`)
    if (res.ok) {
      const data = await res.json()
      setBots(data)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_URL}/health`)
      if (res.ok) setStats(prev => ({ ...prev, active: 1 }))
    } catch (e) {
      setStats(prev => ({ ...prev, active: 0 }))
    }
  }

  function handleNewCall(data) {
    setLogs(prev => [
      { ts: new Date().toLocaleTimeString(), text: `New call started to ${data.number}` },
      ...prev.slice(0, 19)
    ])
    setStats(prev => ({ ...prev, total: prev.total + 1 }))
  }

  return (
    <div className="flex h-screen bg-[#0a0016] text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <StatsGrid stats={stats} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-2">
              <CallChart />
            </div>
            <div className="col-span-1">
              <ActivityLog logs={logs} />
            </div>
          </div>
          <BotsList bots={bots} />
        </main>
      </div>
    </div>
  )
}
