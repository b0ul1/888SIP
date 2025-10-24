export default function BotsList({ bots }) {
  return (
    <div className="bg-[#150026] border border-purple-900/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-purple-300">Active Bots</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-purple-900/40">
          <tr>
            <th className="text-left py-1">Name</th>
            <th className="text-left py-1">Target</th>
            <th className="text-left py-1">Voice</th>
            <th className="text-left py-1">Schedule</th>
            <th className="text-left py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {bots.length === 0 && (
            <tr><td colSpan="5" className="text-gray-600 py-3">No bots available.</td></tr>
          )}
          {bots.map(bot => (
            <tr key={bot.id} className="border-b border-purple-900/20">
              <td className="py-1">{bot.name}</td>
              <td>{bot.target_number}</td>
              <td>{bot.voice}</td>
              <td>{bot.schedule_cron || '—'}</td>
              <td className={bot.active ? 'text-green-400' : 'text-red-400'}>
                {bot.active ? 'Active' : 'Disabled'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
