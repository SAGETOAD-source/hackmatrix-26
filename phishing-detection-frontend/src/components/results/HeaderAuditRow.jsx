import { Check, AlertTriangle, X } from 'lucide-react'

const SEVERITY_CONFIG = {
  PASS: {
    icon: Check,
    iconColor: 'text-[#55B9AD]',
    bg: 'bg-[#55B9AD]/10 light:bg-[#55B9AD]/15',
    text: 'text-[#55B9AD] light:text-[#059669]',
    border: 'border-[#55B9AD]/30',
    label: 'Pass',
  },
  WARN: {
    icon: AlertTriangle,
    iconColor: 'text-[#E9B65B]',
    bg: 'bg-[#E9B65B]/10 light:bg-[#E9B65B]/15',
    text: 'text-[#E9B65B] light:text-[#B45309]',
    border: 'border-[#E9B65B]/30',
    label: 'Warning',
  },
  FAIL: {
    icon: X,
    iconColor: 'text-[#EF6464]',
    bg: 'bg-[#EF6464]/10 light:bg-[#EF6464]/15',
    text: 'text-[#EF6464] light:text-[#BE123C]',
    border: 'border-[#EF6464]/30',
    label: 'Missing',
  },
}

export default function HeaderAuditRow({ name, present, value, severity = 'PASS' }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.PASS
  const StatusIcon = config.icon

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#18343A] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] rounded-xl transition-all hover:border-[#167D83]/30">
      <div className="flex items-center space-x-2.5 min-w-0">
        <StatusIcon size={15} className={`${config.iconColor} shrink-0`} />
        <span className="font-mono text-xs font-semibold text-[#F5F7F6] light:text-[#101C22] shrink-0">
          {name}
        </span>
        <span className="text-xs font-mono text-[#A4B8B5] light:text-[#4B6B67] truncate max-w-xs md:max-w-md hidden sm:inline" title={value}>
          {present ? value || 'Configured' : 'Header omitted from response'}
        </span>
      </div>

      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    </div>
  )
}
