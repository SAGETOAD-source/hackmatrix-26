import { Check, AlertTriangle, X } from 'lucide-react'

const SEVERITY_CONFIG = {
  PASS: {
    icon: Check,
    iconColor: 'text-emerald-400 light:text-emerald-600',
    bg: 'bg-emerald-500/10 light:bg-emerald-50',
    text: 'text-emerald-400 light:text-emerald-700',
    border: 'border-emerald-500/25',
    label: 'Pass',
  },
  WARN: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400 light:text-amber-600',
    bg: 'bg-amber-500/10 light:bg-amber-50',
    text: 'text-amber-400 light:text-amber-700',
    border: 'border-amber-500/25',
    label: 'Warning',
  },
  FAIL: {
    icon: X,
    iconColor: 'text-rose-400 light:text-rose-600',
    bg: 'bg-rose-500/10 light:bg-rose-50',
    text: 'text-rose-400 light:text-rose-700',
    border: 'border-rose-500/25',
    label: 'Missing',
  },
}

export default function HeaderAuditRow({ name, present, value, severity = 'PASS' }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.PASS
  const StatusIcon = config.icon

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] rounded-md">
      <div className="flex items-center space-x-2.5 min-w-0">
        <StatusIcon size={14} className={`${config.iconColor} shrink-0`} />
        <span className="font-mono text-xs font-semibold text-[#F1F5FF] light:text-[#172033] shrink-0">
          {name}
        </span>
        <span className="text-xs font-mono text-[#9EACC2] light:text-[#64748B] truncate max-w-xs md:max-w-md hidden sm:inline" title={value}>
          {present ? value || 'Configured' : 'Header omitted from response'}
        </span>
      </div>

      <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    </div>
  )
}
