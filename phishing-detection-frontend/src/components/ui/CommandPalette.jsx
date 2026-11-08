import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Shield,
  Activity,
  History,
  Lock,
  Palette,
  Sun,
  Moon,
  X,
  ArrowRight,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const actions = [
    {
      id: 'scan',
      title: 'Analyze New Target URL',
      subtitle: 'Submit target to the Ultraviolet Sentinel scanner',
      icon: Shield,
      action: () => navigate('/scanner'),
      badge: 'Action',
    },
    {
      id: 'dashboard',
      title: 'Open SOC Dashboard',
      subtitle: 'Live threats, telemetry charts, and queue',
      icon: Activity,
      action: () => navigate('/dashboard'),
      badge: 'View',
    },
    {
      id: 'history',
      title: 'Scan Audit History',
      subtitle: 'View, filter and export historical URL inspections',
      icon: History,
      action: () => navigate('/history'),
      badge: 'View',
    },
    {
      id: 'security',
      title: 'Deep Cryptographic & DNS Audit',
      subtitle: 'Inspect certificate transparency, zone records, headers',
      icon: Lock,
      action: () => navigate('/security'),
      badge: 'Audit',
    },
    {
      id: 'styleguide',
      title: 'Design System & Styleguide',
      subtitle: 'Explore Ultraviolet Sentinel tokens and components',
      icon: Palette,
      action: () => navigate('/styleguide'),
      badge: 'Design',
    },
    {
      id: 'theme',
      title: `Switch to ${theme === 'dark' ? 'Light (Warm Pearl)' : 'Dark (Void Ink)'} Theme`,
      subtitle: 'Toggle console visual mode',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
      badge: 'Preference',
    },
  ]

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (item) => {
    item.action()
    onClose()
    setQuery('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--brand-primary)]/40 shadow-[0_0_50px_rgba(124,92,255,0.25)] overflow-hidden z-10 card-highlight"
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] gap-3 bg-[var(--bg-elevated)]">
              <Search className="w-5 h-5 text-[var(--brand-glow)] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search console..."
                autoFocus
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm outline-none font-sans"
              />
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)] font-sans">
                  No matching Sentinel commands found.
                </div>
              ) : (
                filtered.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-elevated)] text-left group transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-glow)] group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors font-display">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] font-sans">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-muted)]">
                          {item.badge}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--brand-accent)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[var(--bg-elevated)]/50 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <span>Sentinel Quick Navigation</span>
              <span>Use ↑↓ to navigate</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

