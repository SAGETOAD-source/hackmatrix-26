import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { THREAT_DISTRIBUTION_DATA } from '../../data/mockData'
import { useTheme } from '../../context/ThemeContext'

// Color map adhering strictly to design tokens
const MAPPED_DATA = THREAT_DISTRIBUTION_DATA.map((item, idx) => {
  const palette = ['#FF4D6D', '#FF8096', '#FFB020', '#7C5CFF', '#34E0A1']
  return {
    ...item,
    color: palette[idx % palette.length]
  }
})

export default function ThreatDistributionChart() {
  const { isDark } = useTheme()

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-sm flex flex-col justify-between">
      <div className="pb-4 border-b border-[#2A2650] light:border-[#E2DEFA]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#A78BFF]">
            <PieIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-heading font-bold text-sm tracking-wide text-[#F2F0FF] light:text-[#1E1B4B]">
            Attack Vector Taxonomy
          </h3>
        </div>
        <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-1">
          Proportional breakdown of classified threat categories
        </p>
      </div>

      <div className="h-52 w-full relative my-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={MAPPED_DATA}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
            >
              {MAPPED_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
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
              formatter={(value, name) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-[#F2F0FF] light:text-[#1E1B4B] leading-none">
            2,140
          </span>
          <span className="text-[10px] font-mono text-[#A29FC9] light:text-[#6E6893] uppercase tracking-wider mt-1">
            Intercepts
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 pt-3 border-t border-[#2A2650] light:border-[#E2DEFA]">
        {MAPPED_DATA.map((threat) => (
          <div key={threat.name} className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: threat.color }}></span>
              <span className="text-[#A29FC9] light:text-[#1E1B4B] truncate">
                {threat.name}
              </span>
            </div>
            <span className="font-semibold text-[#F2F0FF] light:text-[#1E1B4B] shrink-0">
              {threat.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
