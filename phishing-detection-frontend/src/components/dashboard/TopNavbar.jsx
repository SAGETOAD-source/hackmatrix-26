import { useState, useEffect } from 'react'
import { Search, Sun, Moon, User, Menu, Radio } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import AnalystAuthModal from '../common/AnalystAuthModal'
import { getStoredUser, isAuthenticated } from '../../services/authService'
import { isApiMode } from '../../services/api'

export default function TopNavbar({ onSearch, searchQuery = '', collapsed, setCollapsed }) {
  const { toggleTheme, isDark } = useTheme()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [user, setUser] = useState(() => getStoredUser())
  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [apiActive, setApiActive] = useState(() => isApiMode())

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser())
      setAuthed(isAuthenticated())
    }

    const handleModeChange = () => {
      setApiActive(isApiMode())
    }

    window.addEventListener('phishguard:auth-changed', handleAuthChange)
    window.addEventListener('phishguard:mode-changed', handleModeChange)
    return () => {
      window.removeEventListener('phishguard:auth-changed', handleAuthChange)
      window.removeEventListener('phishguard:mode-changed', handleModeChange)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 h-16 transition-colors duration-200 border-b bg-[#080F1E]/95 light:bg-white/95 backdrop-blur-md border-[#24344B] light:border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6">
        {/* Mobile Sidebar Toggle & Search Bar */}
        <div className="flex items-center flex-1 max-w-md">
          {setCollapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden mr-2 p-1.5 rounded-md text-[#9EACC2] hover:text-[#F1F5FF] bg-[#111E32] light:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9EACC2]" />
            <input
              type="text"
              placeholder="Search scans, domains, IOC hashes, or IPs..."
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md text-xs bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9] transition-colors"
            />
          </div>
        </div>

        {/* Right Tools and Profile */}
        <div className="flex items-center space-x-2.5 ml-4">
          {/* Active Engine Mode Pill */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            title="Click to configure backend API connection or switch modes"
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono cursor-pointer transition-colors ${
              apiActive
                ? 'bg-[#0D1728] light:bg-slate-50 border-[#24344B] light:border-[#E2E8F0] text-emerald-400 light:text-emerald-700 hover:border-emerald-500/50'
                : 'bg-[#0D1728] light:bg-slate-50 border-[#24344B] light:border-[#E2E8F0] text-amber-400 light:text-amber-700 hover:border-amber-500/50'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Engine: {apiActive ? 'Live API' : 'Demo Mode'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-md text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] bg-[#111E32] light:bg-white hover:bg-[#15253F] light:hover:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0] transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#2563EB]" />
            )}
          </button>

          {/* Analyst Profile Chip */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center space-x-2 pl-2 border-l border-[#24344B] light:border-[#E2E8F0] cursor-pointer text-left hover:opacity-90 transition-opacity"
          >
            <div className={`w-7 h-7 rounded-md border flex items-center justify-center ${
              authed
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-[#111E32] light:bg-slate-100 border-[#24344B] light:border-[#E2E8F0] text-[#287FE9]'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033] leading-none">
                {authed && user ? (user.name || 'Analyst') : 'Analyst Session'}
              </span>
              <span className="text-[10px] font-mono text-[#9EACC2] light:text-[#64748B] mt-0.5">
                {authed ? 'Connected' : 'Click to Sign In'}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Analyst Auth Modal */}
      <AnalystAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}
