import { Check, AlertTriangle, X } from 'lucide-react'

const SEVERITY_CONFIG = {
  PASS: {
    icon: Check,
    iconColor: 'text-[#34E0A1]',
    bg: 'bg-[#34E0A1]/10 light:bg-[#34E0A1]/15',
    text: 'text-[#34E0A1] light:text-[#059669]',
    border: 'border-[#34E0A1]/30',
    label: 'Pass',
  },
  WARN: {
    icon: AlertTriangle,
    iconColor: 'text-[#FFB020]',
    bg: 'bg-[#FFB020]/10 light:bg-[#FFB020]/15',
    text: 'text-[#FFB020] light:text-[#B45309]',
    border: 'border-[#FFB020]/30',
    label: 'Warning',
  },
  FAIL: {
    icon: X,
    iconColor: 'text-[#FF4D6D]',
    bg: 'bg-[#FF4D6D]/10 light:bg-[#FF4D6D]/15',
    text: 'text-[#FF4D6D] light:text-[#BE123C]',
    border: 'border-[#FF4D6D]/30',
    label: 'Missing',
  },
}

export default function HeaderAuditRow({ name, present, value, severity = 'PASS' }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.PASS
  const StatusIcon = config.icon

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#14122A] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] rounded-xl transition-all hover:border-[#7C5CFF]/30">
      <div className="flex items-center space-x-2.5 min-w-0">
        <StatusIcon size={15} className={`${config.iconColor} shrink-0`} />
        <span className="font-mono text-xs font-semibold text-[#F2F0FF] light:text-[#1E1B4B] shrink-0">
          {name}
        </span>
        <span className="text-xs font-mono text-[#A29FC9] light:text-[#6E6893] truncate max-w-xs md:max-w-md hidden sm:inline" title={value}>
          {present ? value || 'Configured' : 'Header omitted from response'}
        </span>
      </div>

      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    </div>
  )
}
