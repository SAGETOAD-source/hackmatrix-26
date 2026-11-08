import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

const ICON_MAP = {
  primary: Shield,
  danger: ShieldAlert,
  success: CheckCircle,
  warning: AlertTriangle,
}

const BADGE_MAP = {
  primary: 'bg-[#7C5CFF]/15 text-[#A78BFF] light:text-[#5E3BEE] border-[#7C5CFF]/30',
  danger: 'bg-[#FF4D6D]/15 text-[#FF4D6D] light:text-[#BE123C] border-[#FF4D6D]/30',
  success: 'bg-[#34E0A1]/15 text-[#34E0A1] light:text-[#059669] border-[#34E0A1]/30',
  warning: 'bg-[#FFB020]/15 text-[#FFB020] light:text-[#B45309] border-[#FFB020]/30',
}

const ICON_COLOR = {
  primary: 'text-[#A78BFF]',
  danger: 'text-[#FF4D6D]',
  success: 'text-[#34E0A1]',
  warning: 'text-[#FFB020]',
}

export default function StatCard({ item }) {
  const Icon = ICON_MAP[item.type] || Shield
  const badgeStyle = BADGE_MAP[item.type] || BADGE_MAP.primary
  const iconColor = ICON_COLOR[item.type] || ICON_COLOR.primary
  const isUp = item.trend === 'up'

  return (
    <div className="p-5 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-[#7C5CFF]/40 hover:shadow-md hover:shadow-[#7C5CFF]/5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A29FC9] light:text-[#6E6893]">
            {item.title}
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] flex items-center justify-center">
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F2F0FF] light:text-[#1E1B4B]">
            {item.value}
          </h3>
          <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${badgeStyle}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{item.change}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#A29FC9] light:text-[#6E6893] pt-3 border-t border-[#2A2650]/60 light:border-[#E2DEFA]">
        {item.description}
      </p>
    </div>
  )
}
