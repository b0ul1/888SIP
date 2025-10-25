import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Bots() {
  const [bots, setBots] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/bots`)
      .then(res => res.json())
      .then(data => setBots(data))
      .catch(() => setBots([]))
  }, [])

  return (
    <div className="flex h-screen bg-[#0a0016] text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-purple-300 mb-4">Bot Systems</h1>
          <div className="bg-[#150026] p-6 rounded-lg border border-purple-900/50">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-purple-900/40">
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Message</th>
                  <th className="text-left py-2">Schedule</th>
                  <th className="text-left py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {bots.map(bot => (
                  <tr key={bot.id} className="border-b border-purple-900/20">
                    <td>{bot.name}</td>
                    <td className="text-gray-400 truncate max-w-xs">{bot.message}</td>
                    <td>{bot.schedule_cron || '—'}</td>
                    <td className={bot.active ? 'text-green-400' : 'text-red-400'}>
                      {bot.active ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
