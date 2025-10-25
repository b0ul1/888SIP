import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Calls() {
  const [calls, setCalls] = useState([])
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  // Chargement des logs d'appels
  useEffect(() => {
    fetch(`${API_URL}/api/call/logs`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setCalls(data))
      .catch(() => setCalls([]))
  }, [])

  // Démarrage d'un appel automatisé
  async function startCall() {
    if (!number || !message) {
      setStatus('Please enter both a phone number and a message.')
      return
    }
    setLoading(true)
    setStatus('Sending call request...')

    try {
      const res = await fetch(`${API_URL}/api/call/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, text: message })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(`✅ Call started to ${number}`)
        // Recharge les logs après un appel
        setTimeout(() => {
          fetch(`${API_URL}/api/call/logs`)
            .then(r => (r.ok ? r.json() : []))
            .then(d => setCalls(d))
        }, 3000)
      } else {
        setStatus(`❌ Error: ${data.error || 'Unknown backend error'}`)
      }
    } catch (err) {
      setStatus(`❌ Connection failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0016] text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-8">
          {/* Section : lancer un appel */}
          <section>
            <h1 className="text-2xl font-semibold text-purple-300 mb-4">Start Automated Call</h1>
            <div className="bg-[#150026] p-6 border border-purple-900/50 rounded-lg space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Target Number</label>
                <input
                  type="text"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="e.g. 1001"
                  className="w-full p-2 bg-[#0e001c] border border-purple-900/50 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Message (TTS)</label>
                <textarea
                  rows="4"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter the text to be spoken..."
                  className="w-full p-2 bg-[#0e001c] border border-purple-900/50 rounded-md focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={startCall}
                disabled={loading}
                className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 px-4 py-2 rounded-md text-white font-semibold"
              >
                {loading ? 'Calling...' : '📞 Start Call'}
              </button>

              {status && (
                <div className="mt-3 text-sm text-gray-300 bg-[#0e001c] p-2 rounded border border-purple-900/30">
                  {status}
                </div>
              )}
            </div>
          </section>

          {/* Section : historique des appels */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Call History</h2>
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
                        <td
                          className={
                            call.status === 'completed'
                              ? 'text-green-400'
                              : call.status === 'failed'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }
                        >
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
          </section>
        </main>
      </div>
    </div>
  )
}
