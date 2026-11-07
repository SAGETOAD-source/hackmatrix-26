import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Activity } from 'lucide-react'
import { SCAN_ACTIVITY_DATA } from '../../data/mockData'
import { useTheme } from '../../context/ThemeContext'

export default function ActivityChart() {
  const { isDark } = useTheme()
  const [timeframe, setTimeframe] = useState('7d')

  return (
    <div className="p-5 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-lg shadow-black/15 light:shadow-slate-200/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#1C2D4A] light:border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#55B7FF] light:text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#F1F5FF] light:text-[#172033]">
              Scan Activity & Detection Trends
            </h3>
          </div>
          <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
            Real-time throughput across Safe, Suspicious, and Phishing classifications
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-xs">
          {['7d', '30d', '90d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-[#287FE9] text-white shadow-xs'
                  : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033]'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SCAN_ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1C2D4A' : '#E2E8F0'}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke={isDark ? '#9EACC2' : '#64748B'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#9EACC2' : '#64748B'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#111E32' : '#FFFFFF',
                borderColor: isDark ? '#1C2D4A' : '#E2E8F0',
                borderRadius: '0.75rem',
                color: isDark ? '#F1F5FF' : '#172033',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="safe"
              name="Safe"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSafe)"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              name="Suspicious"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuspicious)"
            />
            <Area
              type="monotone"
              dataKey="phishing"
              name="Phishing"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPhishing)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
