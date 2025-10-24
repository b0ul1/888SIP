import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mockData = [
  { time: '08:00', calls: 3 },
  { time: '10:00', calls: 7 },
  { time: '12:00', calls: 5 },
  { time: '14:00', calls: 9 },
  { time: '16:00', calls: 4 },
  { time: '18:00', calls: 8 }
]

export default function CallChart() {
  return (
    <div className="bg-[#150026] border border-purple-900/50 rounded-lg p-4">
      <div className="font-semibold text-purple-300 mb-2">Call Activity</div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={mockData}>
          <Line type="monotone" dataKey="calls" stroke="#a855f7" strokeWidth={2} />
          <CartesianGrid stroke="#2e1a4a" vertical={false} />
          <XAxis dataKey="time" stroke="#8b5cf6" />
          <YAxis stroke="#8b5cf6" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1b0030',
              border: '1px solid #6b21a8',
              color: '#e9d5ff'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
