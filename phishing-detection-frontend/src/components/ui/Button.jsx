import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  as: Component,
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
  const baseStyles = 'btn inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-sans',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-sans',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-sans font-semibold',
  }

  const variantStyles = {
    primary:
      'btn-primary bg-[#167D83] text-[#F5F7F6] hover:bg-[#1a8e95] hover:shadow-sm active:brightness-95 font-semibold',
    secondary:
      'btn-secondary bg-[#18343A] text-[#F5F7F6] border border-[#24454C] hover:border-[#55B9AD]/40 hover:bg-[#1E4047]',
    outline:
      'btn-outline bg-transparent text-[#F5F7F6] border border-[#24454C] hover:border-[#167D83] hover:bg-[#167D83]/10',
    ghost:
      'btn-ghost bg-transparent text-[#A4B8B5] hover:text-[#F5F7F6] hover:bg-[#18343A]',
    danger:
      'btn-danger bg-[#EF6464] text-white hover:bg-[#dc5050] shadow-sm',
  }

  const isDisabled = disabled || loading

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </>
  )

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  if (Component) {
    return (
      <Component
        className={combinedClasses}
        onClick={isDisabled ? (e) => e.preventDefault() : onClick}
        aria-disabled={isDisabled}
        {...props}
      >
        {content}
      </Component>
    )
  }

  return (
    <motion.button
      type={type}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={combinedClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {content}
    </motion.button>
  )
}

