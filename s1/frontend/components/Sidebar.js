import { Phone, Cpu, Bot, Settings } from 'lucide-react'

const items = [
  { icon: Phone, label: 'Dashboard' },
  { icon: Cpu, label: 'Calls' },
  { icon: Bot, label: 'Bots' },
  { icon: Settings, label: 'Settings' }
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#140024] border-r border-purple-900/50 flex flex-col">
      <div className="text-center py-6 text-xl font-bold text-purple-400 border-b border-purple-900/60">
        888SIP Console
      </div>
      <nav className="flex-1 p-4 space-y-3">
        {items.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-purple-800/30 text-gray-300 hover:text-purple-400 transition"
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-500">v1.0 – Secure VoIP Dashboard</div>
    </aside>
  )
}
