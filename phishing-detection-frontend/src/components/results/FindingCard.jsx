const SEVERITY_CONFIG = {
  CRITICAL: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-500/15 light:bg-rose-100',
    text: 'text-rose-400 light:text-rose-600',
    label: 'Critical',
  },
  HIGH: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-500/15 light:bg-orange-100',
    text: 'text-orange-400 light:text-orange-600',
    label: 'High',
  },
  MEDIUM: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/15 light:bg-amber-100',
    text: 'text-amber-400 light:text-amber-600',
    label: 'Medium',
  },
  LOW: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/15 light:bg-blue-100',
    text: 'text-blue-400 light:text-blue-600',
    label: 'Low',
  },
  INFO: {
    border: 'border-l-[#9EACC2]',
    bg: 'bg-slate-500/15 light:bg-slate-100',
    text: 'text-[#9EACC2] light:text-[#64748B]',
    label: 'Info',
  },
};

export default function FindingCard({ title, severity = 'INFO', description, icon: Icon }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;

  return (
    <div
      className={`
        relative flex gap-3.5 rounded-xl border-l-4 ${config.border}
        bg-[#111E32] light:bg-white
        p-4 border border-[#1C2D4A] light:border-[#E2E8F0]
        shadow-sm shadow-black/10 light:shadow-slate-200/50
      `}
    >
      {/* Optional icon */}
      {Icon && (
        <div className={`mt-0.5 shrink-0 ${config.text}`}>
          <Icon size={20} />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-[#F1F5FF] light:text-[#172033] text-sm leading-snug">
            {title}
          </h4>

          {/* Severity badge */}
          <span
            className={`
              shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold
              ${config.bg} ${config.text}
            `}
          >
            {config.label}
          </span>
        </div>

        {description && (
          <p className="mt-1.5 text-sm text-[#9EACC2] light:text-[#64748B] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
