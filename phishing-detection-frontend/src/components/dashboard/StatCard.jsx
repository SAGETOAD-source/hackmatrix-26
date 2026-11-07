import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

const ICON_MAP = {
  primary: Shield,
  danger: ShieldAlert,
  success: CheckCircle,
  warning: AlertTriangle,
}

const BADGE_MAP = {
  primary: 'bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border-[#287FE9]/25',
  danger: 'bg-rose-500/10 text-rose-400 light:text-rose-600 border-rose-500/25',
  success: 'bg-emerald-500/10 text-emerald-400 light:text-emerald-600 border-emerald-500/25',
  warning: 'bg-amber-500/10 text-amber-400 light:text-amber-600 border-amber-500/25',
}

const ICON_COLOR = {
  primary: 'text-[#287FE9]',
  danger: 'text-rose-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
}

export default function StatCard({ item }) {
  const Icon = ICON_MAP[item.type] || Shield
  const badgeStyle = BADGE_MAP[item.type] || BADGE_MAP.primary
  const iconColor = ICON_COLOR[item.type] || ICON_COLOR.primary
  const isUp = item.trend === 'up'

  return (
    <div className="cyber-card p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
            {item.title}
          </span>
          <div className="w-7 h-7 rounded-md bg-[#0D1728] light:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0] flex items-center justify-center">
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <h3 className="text-2xl font-bold font-mono tracking-tight text-[#F1F5FF] light:text-[#172033]">
            {item.value}
          </h3>
          <div className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium border ${badgeStyle}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{item.change}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[#9EACC2] light:text-[#64748B] pt-2 border-t border-[#24344B]/60 light:border-[#E2E8F0]">
        {item.description}
      </p>
    </div>
  )
}
