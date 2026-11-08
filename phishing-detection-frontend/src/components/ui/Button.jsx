import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-sans',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-sans',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-sans font-semibold',
  }

  const variantStyles = {
    primary:
      'bg-[var(--brand-accent)] text-[var(--brand-accent-text)] hover:shadow-[0_0_20px_-3px_rgba(198,255,61,0.5)] active:brightness-95 font-semibold',
    secondary:
      'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:shadow-[0_0_15px_-3px_rgba(124,92,255,0.3)] hover:text-white',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10',
    ghost:
      'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
    danger:
      'bg-[var(--verdict-malicious)] text-white hover:brightness-110 shadow-[0_0_15px_-3px_rgba(255,77,109,0.4)]',
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </motion.button>
  )
}

