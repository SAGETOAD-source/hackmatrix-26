import { Check, AlertTriangle, X } from 'lucide-react';

const SEVERITY_CONFIG = {
  PASS: {
    icon: Check,
    iconColor: 'text-emerald-400 light:text-emerald-600',
    bg: 'bg-emerald-500/15 light:bg-emerald-100',
    text: 'text-emerald-400 light:text-emerald-600',
    label: 'Pass',
  },
  WARN: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400 light:text-amber-600',
    bg: 'bg-amber-500/15 light:bg-amber-100',
    text: 'text-amber-400 light:text-amber-600',
    label: 'Warn',
  },
  FAIL: {
    icon: X,
    iconColor: 'text-rose-400 light:text-rose-600',
    bg: 'bg-rose-500/15 light:bg-rose-100',
    text: 'text-rose-400 light:text-rose-600',
    label: 'Fail',
  },
};

export default function HeaderAuditRow({ name, present, value, severity = 'PASS' }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.PASS;
  const StatusIcon = config.icon;

  return (
    <div
      className="
        flex items-center gap-3 rounded-xl px-4 py-3
        bg-[#111E32] light:bg-white
        border border-[#1C2D4A] light:border-[#E2E8F0]
        shadow-xs
      "
    >
      {/* Status icon */}
      <div className={`shrink-0 ${config.iconColor}`}>
        <StatusIcon size={18} />
      </div>

      {/* Header name */}
      <span className="shrink-0 font-semibold text-sm text-[#F1F5FF] light:text-[#172033] min-w-[140px]">
        {name}
      </span>

      {/* Value */}
      <span
        className="
          flex-1 truncate font-mono text-xs
          text-[#9EACC2] light:text-[#64748B]
        "
        title={value}
      >
        {present ? value || '—' : 'Not present'}
      </span>

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
  );
}
