import { forwardRef } from 'react'
import { X } from 'lucide-react'

const Input = forwardRef(function Input(
  {
    type = 'text',
    value,
    onChange,
    onClear,
    placeholder,
    icon: Icon,
    isMono = false,
    error,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}

      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/60 text-sm py-2.5 transition-all duration-200 outline-none
          ${Icon ? 'pl-10' : 'pl-3.5'}
          ${onClear && value ? 'pr-9' : 'pr-3.5'}
          ${isMono ? 'font-mono' : 'font-sans'}
          focus:border-[var(--brand-glow)] focus:ring-1 focus:ring-[var(--brand-glow)]/30
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[var(--verdict-malicious)] focus:border-[var(--verdict-malicious)]' : ''}
          ${className}`}
        {...props}
      />

      {onClear && value && !disabled && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-full hover:bg-[var(--border-subtle)]/50 transition-colors"
          aria-label="Clear input"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {error && (
        <p className="mt-1 text-xs text-[var(--verdict-malicious)] font-medium font-sans">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input

