export default function StatsGrid({ stats }) {
  const cards = [
    { label: 'Total Calls', value: stats.total, color: 'purple' },
    { label: 'Completed', value: stats.completed, color: 'green' },
    { label: 'Failed', value: stats.failed, color: 'red' },
    { label: 'Active', value: stats.active ? 'Yes' : 'No', color: 'blue' }
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div
          key={c.label}
          className="bg-[#150026] p-4 rounded-lg border border-purple-900/50 shadow-inner shadow-purple-950/30"
        >
          <div className="text-sm text-gray-400">{c.label}</div>
          <div className={`text-2xl font-bold text-${c.color}-400`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
