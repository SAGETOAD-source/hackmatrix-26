import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

const ICON_MAP = {
  primary: Shield,
  danger: ShieldAlert,
  success: CheckCircle,
  warning: AlertTriangle,
}

const BADGE_MAP = {
  primary: 'bg-[#167D83]/15 text-[#55B9AD] light:text-[#167D83] border-[#167D83]/30',
  danger: 'bg-[#EF6464]/15 text-[#EF6464] light:text-[#BE123C] border-[#EF6464]/30',
  success: 'bg-[#55B9AD]/15 text-[#55B9AD] light:text-[#059669] border-[#55B9AD]/30',
  warning: 'bg-[#E9B65B]/15 text-[#E9B65B] light:text-[#B45309] border-[#E9B65B]/30',
}

const ICON_COLOR = {
  primary: 'text-[#55B9AD]',
  danger: 'text-[#EF6464]',
  success: 'text-[#55B9AD]',
  warning: 'text-[#E9B65B]',
}

export default function StatCard({ item }) {
  const Icon = ICON_MAP[item.type] || Shield
  const badgeStyle = BADGE_MAP[item.type] || BADGE_MAP.primary
  const iconColor = ICON_COLOR[item.type] || ICON_COLOR.primary
  const isUp = item.trend === 'up'

  return (
    <div className="p-5 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-[#167D83]/40 hover:shadow-md hover:shadow-[#167D83]/5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67]">
            {item.title}
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] flex items-center justify-center">
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F5F7F6] light:text-[#101C22]">
            {item.value}
          </h3>
          <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${badgeStyle}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{item.change}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#A4B8B5] light:text-[#4B6B67] pt-3 border-t border-[#24454C]/60 light:border-[#C2E2DA]">
        {item.description}
      </p>
    </div>
  )
}
