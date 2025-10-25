import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function Settings() {
  return (
    <div className="flex h-screen bg-[#0a0016] text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-purple-300 mb-4">Settings</h1>
          <div className="bg-[#150026] p-6 border border-purple-900/50 rounded-lg text-gray-400 space-y-4">
            <p>• System configuration options (ports, SIP credentials, ARI settings)</p>
            <p>• Voice synthesis engine (Google TTS, Coqui TTS)</p>
            <p>• Backend diagnostics & logging level</p>
            <p className="text-purple-400 italic">Feature placeholders – will be connected later.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
