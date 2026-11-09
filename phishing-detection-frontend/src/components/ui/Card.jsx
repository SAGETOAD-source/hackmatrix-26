import { motion } from 'framer-motion'

export default function Card({
  children,
  variant = 'default', // 'default' | 'elevated' | 'glass' | 'interactive'
  glow = false,
  className = '',
  onClick,
  ...props
}) {
  const base = 'rounded-2xl border transition-all duration-200 card-highlight relative overflow-hidden'

  const variants = {
    default: 'bg-[var(--bg-surface)] border-[var(--border-subtle)]',
    elevated: 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-lg',
    glass: 'uv-glass border-[var(--border-subtle)]',
    interactive:
      'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--brand-glow)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(22,125,131,0.25)] cursor-pointer',
  }

  const glowStyle = glow ? 'uv-glow border-[var(--brand-primary)]/40' : ''

  if (variant === 'interactive' || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        className={`${base} ${variants[variant]} ${glowStyle} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`${base} ${variants[variant]} ${glowStyle} ${className}`} {...props}>
      {children}
    </div>
  )
}

