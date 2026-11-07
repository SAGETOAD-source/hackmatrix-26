const SEVERITY_CONFIG = {
  CRITICAL: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-500/15 light:bg-rose-100',
    text: 'text-rose-400 light:text-rose-600',
    label: 'Critical',
  },
  HIGH: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/15 light:bg-red-100',
    text: 'text-red-400 light:text-red-600',
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
    border: 'border-l-slate-400',
    bg: 'bg-slate-500/15 light:bg-slate-100',
    text: 'text-slate-400 light:text-slate-500',
    label: 'Info',
  },
};

export default function FindingCard({ title, severity = 'INFO', description, icon: Icon }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;

  return (
    <div
      className={`
        relative flex gap-3 rounded-lg border-l-4 ${config.border}
        bg-white/5 light:bg-white
        p-4
        light:shadow-sm light:border light:border-gray-200
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
          <h4 className="font-semibold text-white light:text-gray-900 text-sm leading-snug">
            {title}
          </h4>

          {/* Severity badge */}
          <span
            className={`
              shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium
              ${config.bg} ${config.text}
            `}
          >
            {config.label}
          </span>
        </div>

        {description && (
          <p className="mt-1.5 text-sm text-slate-400 light:text-slate-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
