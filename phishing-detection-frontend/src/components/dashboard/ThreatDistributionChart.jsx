import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { THREAT_DISTRIBUTION_DATA } from '../../data/mockData'
import { useTheme } from '../../context/ThemeContext'

export default function ThreatDistributionChart() {
  const { isDark } = useTheme()

  return (
    <div className="p-5 rounded-2xl bg-[#0f172a]/90 light:bg-white border border-[#1e293b] light:border-slate-200 shadow-lg shadow-black/5 flex flex-col justify-between">
      <div className="pb-4 border-b border-slate-800/80 light:border-slate-100">
        <div className="flex items-center space-x-2">
          <PieIcon className="w-4 h-4 text-violet-400 light:text-violet-600" />
          <h3 className="text-base font-bold text-white light:text-slate-900">
            Threat Attack Vectors
          </h3>
        </div>
        <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
          Distribution of intercepted campaign taxonomy
        </p>
      </div>

      <div className="h-56 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={THREAT_DISTRIBUTION_DATA}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {THREAT_DISTRIBUTION_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0a0f1d' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#cbd5e1',
                borderRadius: '0.75rem',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              }}
              formatter={(value, name) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-white light:text-slate-900 leading-none">
            2,140
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
            Intercepts
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 light:border-slate-100">
        {THREAT_DISTRIBUTION_DATA.map((threat) => (
          <div key={threat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: threat.color }}></span>
              <span className="text-slate-300 light:text-slate-700 truncate max-w-[150px]">
                {threat.name}
              </span>
            </div>
            <span className="font-semibold text-slate-400 light:text-slate-600">
              {threat.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
