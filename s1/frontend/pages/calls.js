import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Calls() {
  const [calls, setCalls] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/call/logs`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCalls(data))
      .catch(() => setCalls([]))
  }, [])

  return (
    <div className="flex h-screen bg-[#0a0016] text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-purple-300 mb-4">Active & Historical Calls</h1>
          <div className="bg-[#150026] p-6 border border-purple-900/50 rounded-lg">
            {calls.length === 0 ? (
              <p className="text-gray-400">No calls logged yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-purple-900/40">
                  <tr>
                    <th className="text-left py-2">Number</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Start</th>
                    <th className="text-left py-2">End</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map(call => (
                    <tr key={call.id} className="border-b border-purple-900/20">
                      <td>{call.number}</td>
                      <td className={call.status === 'completed' ? 'text-green-400' : 'text-red-400'}>
                        {call.status}
                      </td>
                      <td>{new Date(call.start_time).toLocaleString()}</td>
                      <td>{call.end_time ? new Date(call.end_time).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
