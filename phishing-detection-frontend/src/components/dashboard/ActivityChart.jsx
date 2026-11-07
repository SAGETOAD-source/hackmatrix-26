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
    <div className="cyber-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 mb-3.5 border-b border-[#24344B] light:border-[#E2E8F0] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#287FE9]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
              Telemetry Throughput & Detection Trends
            </h3>
          </div>
          <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
            Aggregated classification breakdown across Safe, Suspicious, and Phishing vectors
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex items-center space-x-1 p-0.5 rounded-md bg-[#0D1728] light:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono">
          {['7d', '30d', '90d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                timeframe === t
                  ? 'bg-[#287FE9] text-white'
                  : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033]'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SCAN_ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#24344B' : '#E2E8F0'}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke={isDark ? '#9EACC2' : '#64748B'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#9EACC2' : '#64748B'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#111E32' : '#FFFFFF',
                borderColor: isDark ? '#24344B' : '#E2E8F0',
                borderRadius: '0.5rem',
                color: isDark ? '#F1F5FF' : '#172033',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="safe"
              name="Legitimate"
              stroke="#22C55E"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorSafe)"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              name="Suspicious"
              stroke="#F59E0B"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorSuspicious)"
            />
            <Area
              type="monotone"
              dataKey="phishing"
              name="Phishing Confirmed"
              stroke="#EF4444"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorPhishing)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
