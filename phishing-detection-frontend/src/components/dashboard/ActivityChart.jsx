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
    <div className="p-5 sm:p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#2A2650] light:border-[#E2DEFA] gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#A78BFF]">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-bold text-sm tracking-wide text-[#F2F0FF] light:text-[#1E1B4B]">
              Telemetry Throughput & Detection Trends
            </h3>
          </div>
          <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-1">
            Aggregated classification breakdown across Safe, Suspicious, and Phishing vectors
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-[#0B0A14] light:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono">
          {['7d', '30d', '90d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-[#7C5CFF] text-[#F2F0FF] shadow-xs'
                  : 'text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B]'
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
                <stop offset="5%" stopColor="#34E0A1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34E0A1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB020" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFB020" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#2A2650' : '#E2DEFA'}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke={isDark ? '#A29FC9' : '#6E6893'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#A29FC9' : '#6E6893'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#14122A' : '#FFFFFF',
                borderColor: isDark ? '#2A2650' : '#E2DEFA',
                borderRadius: '0.75rem',
                color: isDark ? '#F2F0FF' : '#1E1B4B',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="safe"
              name="Legitimate"
              stroke="#34E0A1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSafe)"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              name="Suspicious"
              stroke="#FFB020"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuspicious)"
            />
            <Area
              type="monotone"
              dataKey="phishing"
              name="Phishing Confirmed"
              stroke="#FF4D6D"
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
