const SEVERITY_CONFIG = {
  CRITICAL: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-500/10 light:bg-rose-50',
    text: 'text-rose-400 light:text-rose-700',
    badgeBorder: 'border-rose-500/30',
    label: 'Critical',
  },
  HIGH: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-500/10 light:bg-orange-50',
    text: 'text-orange-400 light:text-orange-700',
    badgeBorder: 'border-orange-500/30',
    label: 'High Risk',
  },
  MEDIUM: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/10 light:bg-amber-50',
    text: 'text-amber-400 light:text-amber-700',
    badgeBorder: 'border-amber-500/30',
    label: 'Medium',
  },
  LOW: {
    border: 'border-l-[#287FE9]',
    bg: 'bg-[#287FE9]/10 light:bg-blue-50',
    text: 'text-[#55B7FF] light:text-[#2563EB]',
    badgeBorder: 'border-[#287FE9]/30',
    label: 'Low Risk',
  },
  INFO: {
    border: 'border-l-[#9EACC2]',
    bg: 'bg-slate-500/10 light:bg-slate-100',
    text: 'text-[#9EACC2] light:text-[#64748B]',
    badgeBorder: 'border-slate-500/30',
    label: 'Informational',
  },
}

export default function FindingCard({ title, severity = 'INFO', description, icon: Icon }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO

  return (
    <div className={`cyber-card p-3.5 border-l-4 ${config.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5 min-w-0">
          {Icon && (
            <div className={`mt-0.5 shrink-0 ${config.text}`}>
              <Icon size={16} />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-[#F1F5FF] light:text-[#172033] leading-snug">
              {title}
            </h4>
            {description && (
              <p className="mt-1 text-xs text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Severity badge */}
        <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${config.bg} ${config.text} ${config.badgeBorder}`}>
          {config.label}
        </span>
      </div>
    </div>
  )
}
