import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react'

export default function Badge({
  children,
  variant = 'neutral', // 'safe' | 'suspicious' | 'malicious' | 'unknown' | 'uv' | 'accent' | 'neutral'
  size = 'md',        // 'sm' | 'md'
  showIcon = true,
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1 font-mono tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-mono tracking-tight font-medium',
  }

  const variantStyles = {
    // STRICT VERDICT COLORS (Reserved exclusively for risk meaning)
    safe:
      'bg-[var(--verdict-safe)]/12 text-[var(--verdict-safe)] border border-[var(--verdict-safe)]/30',
    suspicious:
      'bg-[var(--verdict-suspicious)]/12 text-[var(--verdict-suspicious)] border border-[var(--verdict-suspicious)]/30',
    malicious:
      'bg-[var(--verdict-malicious)]/15 text-[var(--verdict-malicious)] border border-[var(--verdict-malicious)]/40 font-semibold',
    unknown:
      'bg-[var(--verdict-unknown)]/15 text-[var(--verdict-unknown)] border border-[var(--verdict-unknown)]/30',

    // BRAND & NEUTRAL PILLS
    uv:
      'bg-[var(--brand-primary)]/15 text-[var(--brand-glow)] border border-[var(--brand-primary)]/30',
    accent:
      'bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] border border-[var(--brand-accent)]/30',
    neutral:
      'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
  }

  const icons = {
    safe: ShieldCheck,
    suspicious: AlertTriangle,
    malicious: ShieldAlert,
    unknown: HelpCircle,
  }

  const IconComponent = showIcon ? icons[variant] : null

  return (
    <span
      className={`inline-flex items-center uppercase select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  )
}

