export default function ActivityLog({ logs }) {
  return (
    <div className="bg-[#150026] border border-purple-900/50 rounded-lg p-4 h-80 overflow-y-auto">
      <div className="font-semibold text-purple-300 mb-2">Activity Log</div>
      <ul className="text-sm space-y-1">
        {logs.length === 0 && (
          <li className="text-gray-600">No recent activity...</li>
        )}
        {logs.map((log, i) => (
          <li key={i} className="text-gray-300">
            <span className="text-purple-400 mr-2">[{log.ts}]</span>
            {log.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
