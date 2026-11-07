import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { THREAT_DISTRIBUTION_DATA } from '../../data/mockData'
import { useTheme } from '../../context/ThemeContext'

export default function ThreatDistributionChart() {
  const { isDark } = useTheme()

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between">
      <div className="pb-3.5 border-b border-[#24344B] light:border-[#E2E8F0]">
        <div className="flex items-center space-x-2">
          <PieIcon className="w-4 h-4 text-[#287FE9]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
            Attack Vector Taxonomy
          </h3>
        </div>
        <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
          Proportional breakdown of classified threat categories
        </p>
      </div>

      <div className="h-52 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={THREAT_DISTRIBUTION_DATA}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {THREAT_DISTRIBUTION_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#111E32' : '#FFFFFF',
                borderColor: isDark ? '#24344B' : '#E2E8F0',
                borderRadius: '0.5rem',
                color: isDark ? '#F1F5FF' : '#172033',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
              formatter={(value, name) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-[#F1F5FF] light:text-[#172033] leading-none">
            2,140
          </span>
          <span className="text-[10px] font-mono text-[#9EACC2] uppercase tracking-wider mt-1">
            Intercepts
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 pt-3 border-t border-[#24344B] light:border-[#E2E8F0]">
        {THREAT_DISTRIBUTION_DATA.map((threat) => (
          <div key={threat.name} className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: threat.color }}></span>
              <span className="text-[#9EACC2] light:text-[#172033] truncate max-w-[140px]">
                {threat.name}
              </span>
            </div>
            <span className="font-semibold text-[#F1F5FF] light:text-[#64748B]">
              {threat.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
