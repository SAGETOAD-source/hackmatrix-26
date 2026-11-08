import { motion } from 'framer-motion'

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div
      role="tablist"
      className={`flex items-center space-x-1 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar relative ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap relative cursor-pointer outline-none ${
              isActive
                ? 'text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--brand-primary)]' : 'text-current'}`} />}
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-[var(--brand-primary)]/20 text-[var(--brand-glow)]'
                    : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] shadow-[0_0_12px_rgba(124,92,255,0.8)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

