import Link from 'next/link'
import { useRouter } from 'next/router'
import { Phone, Cpu, Bot, Settings } from 'lucide-react'

const items = [
  { icon: Phone, label: 'Dashboard', href: '/' },
  { icon: Cpu, label: 'Calls', href: '/calls' },
  { icon: Bot, label: 'Bots', href: '/bots' },
  { icon: Settings, label: 'Settings', href: '/settings' }
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="w-60 bg-[#140024] border-r border-purple-900/50 flex flex-col">
      <div className="text-center py-6 text-xl font-bold text-purple-400 border-b border-purple-900/60">
        888SIP Console
      </div>

      <nav className="flex-1 p-4 space-y-3">
        {items.map(({ icon: Icon, label, href }) => {
          const active = router.pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition ${
                active
                  ? 'bg-purple-800/40 text-purple-300'
                  : 'text-gray-300 hover:bg-purple-800/30 hover:text-purple-400'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 text-xs text-gray-500">v1.0 – Secure VoIP Dashboard</div>
    </aside>
  )
}
