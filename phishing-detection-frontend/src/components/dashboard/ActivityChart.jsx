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
    <div className="p-5 sm:p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#24454C] light:border-[#C2E2DA] gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#167D83]/15 border border-[#167D83]/30 flex items-center justify-center text-[#55B9AD]">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-bold text-sm tracking-wide text-[#F5F7F6] light:text-[#101C22]">
              Telemetry Throughput & Detection Trends
            </h3>
          </div>
          <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
            Aggregated classification breakdown across Safe, Suspicious, and Phishing vectors
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-[#101C22] light:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] text-xs font-mono">
          {['7d', '30d', '90d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-[#167D83] text-[#F5F7F6] shadow-xs'
                  : 'text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22]'
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
                <stop offset="5%" stopColor="#55B9AD" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#55B9AD" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E9B65B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E9B65B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF6464" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#EF6464" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#24454C' : '#C2E2DA'}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke={isDark ? '#A4B8B5' : '#4B6B67'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#A4B8B5' : '#4B6B67'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#18343A' : '#FFFFFF',
                borderColor: isDark ? '#24454C' : '#C2E2DA',
                borderRadius: '0.75rem',
                color: isDark ? '#F5F7F6' : '#101C22',
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
              stroke="#55B9AD"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSafe)"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              name="Suspicious"
              stroke="#E9B65B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuspicious)"
            />
            <Area
              type="monotone"
              dataKey="phishing"
              name="Phishing Confirmed"
              stroke="#EF6464"
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
