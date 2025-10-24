import { useEffect, useState } from 'react'

export default function Header() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString())
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-[#1b0030] border-b border-purple-900/50 flex justify-between items-center px-6 py-3">
      <h1 className="text-lg font-semibold text-purple-300">VoIP Control Center</h1>
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <div>System status: <span className="text-green-400">Online</span></div>
        <div suppressHydrationWarning>{time}</div>
        <button className="px-3 py-1 border border-purple-800 rounded-md text-gray-400 hover:bg-purple-800/40 hover:text-purple-200">
          Logout
        </button>
      </div>
    </header>
  )
}
