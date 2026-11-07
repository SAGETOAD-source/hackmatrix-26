import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

const ICON_MAP = {
  primary: Shield,
  danger: ShieldAlert,
  success: CheckCircle,
  warning: AlertTriangle,
}

const COLOR_MAP = {
  primary: {
    iconBg: 'from-[#287FE9] to-[#55B7FF]',
    iconColor: 'text-[#55B7FF] light:text-[#2563EB]',
    borderColor: 'border-[#1C2D4A] light:border-[#E2E8F0]',
    badge: 'bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border-[#287FE9]/30',
  },
  danger: {
    iconBg: 'from-rose-600 to-red-600',
    iconColor: 'text-rose-400 light:text-rose-600',
    borderColor: 'border-rose-500/20 light:border-rose-200',
    badge: 'bg-rose-500/10 text-rose-400 light:text-rose-700 border-rose-500/20',
  },
  success: {
    iconBg: 'from-emerald-600 to-teal-600',
    iconColor: 'text-emerald-400 light:text-emerald-600',
    borderColor: 'border-emerald-500/20 light:border-emerald-200',
    badge: 'bg-emerald-500/10 text-emerald-400 light:text-emerald-700 border-emerald-500/20',
  },
  warning: {
    iconBg: 'from-amber-600 to-orange-600',
    iconColor: 'text-amber-400 light:text-amber-600',
    borderColor: 'border-amber-500/20 light:border-amber-200',
    badge: 'bg-amber-500/10 text-amber-400 light:text-amber-700 border-amber-500/20',
  },
}

export default function StatCard({ item }) {
  const Icon = ICON_MAP[item.type] || Shield
  const themeColors = COLOR_MAP[item.type] || COLOR_MAP.primary
  const isUp = item.trend === 'up'

  return (
    <div
      className={`p-5 rounded-2xl bg-[#111E32] light:bg-white border ${themeColors.borderColor} shadow-lg shadow-black/15 light:shadow-slate-200/50 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#287FE9]/40`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
          {item.title}
        </span>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${themeColors.iconBg} p-0.5 shadow-md`}>
          <div className="w-full h-full bg-[#080F1E] light:bg-white rounded-[10px] flex items-center justify-center">
            <Icon className={`w-4 h-4 ${themeColors.iconColor}`} />
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5FF] light:text-[#172033]">
          {item.value}
        </h3>
        <div
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${themeColors.badge}`}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{item.change}</span>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-[#9EACC2] light:text-[#64748B]">
        {item.description}
      </p>
    </div>
  )
}
