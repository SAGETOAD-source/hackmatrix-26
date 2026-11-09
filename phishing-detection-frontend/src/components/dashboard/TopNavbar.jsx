import { useState, useEffect } from 'react'
import { Search, Sun, Moon, User, Radio, Menu } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import AnalystAuthModal from '../common/AnalystAuthModal'
import { getStoredUser, isAuthenticated } from '../../services/authService'
import { isApiMode } from '../../services/api'

export default function TopNavbar({ onSearch, searchQuery = '', collapsed, setCollapsed, onOpenMobileMenu }) {
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

  const handleMobileMenuClick = () => {
    if (onOpenMobileMenu) {
      onOpenMobileMenu()
    } else {
      window.dispatchEvent(new CustomEvent('phishguard:open-mobile-nav'))
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 transition-colors duration-200 border-b bg-[#0B0A14]/90 light:bg-white/90 backdrop-blur-md border-[#2A2650] light:border-[#E2DEFA] flex items-center justify-between px-3 sm:px-6">
        {/* Mobile Navigation Trigger & Search Bar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 max-w-md">
          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={handleMobileMenuClick}
            aria-label="Open Navigation Menu"
            className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-[#A29FC9] hover:text-[#F2F0FF] light:text-[#6E6893] light:hover:text-[#1E1B4B] bg-[#14122A] light:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA] hover:bg-[#1C1936] transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4 text-[#A78BFF]" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A29FC9] group-focus-within:text-[#A78BFF] transition-colors" />
            <input
              type="text"
              placeholder="Search threat telemetry, IOCs, domains..."
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full pl-9 pr-3 sm:pr-4 py-1.5 rounded-lg text-xs bg-[#14122A] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-[#F2F0FF] light:text-[#1E1B4B] placeholder-[#A29FC9]/60 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30 transition-all"
            />
          </div>
        </div>

        {/* Right Tools and Profile */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 ml-2 sm:ml-4">
          {/* Active Engine Mode Pill */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            title="Configure backend API connection or switch mode"
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-all ${
              apiActive
                ? 'bg-[#14122A] light:bg-[#F7F5FF] border-[#34E0A1]/40 text-[#34E0A1] hover:bg-[#34E0A1]/10'
                : 'bg-[#14122A] light:bg-[#F7F5FF] border-[#FFB020]/40 text-[#FFB020] hover:bg-[#FFB020]/10'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Engine: {apiActive ? 'Live Backend' : 'Simulation'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 sm:p-2 rounded-lg text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] bg-[#14122A] light:bg-white hover:bg-[#1C1936] light:hover:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA] transition-all cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#C6FF3D]" />
            ) : (
              <Moon className="w-4 h-4 text-[#7C5CFF]" />
            )}
          </button>

          {/* Analyst Profile Chip */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center space-x-2 pl-2 border-l border-[#2A2650] light:border-[#E2DEFA] cursor-pointer text-left hover:opacity-90 transition-opacity"
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors ${
              authed
                ? 'bg-[#34E0A1]/15 border-[#34E0A1]/40 text-[#34E0A1]'
                : 'bg-[#14122A] light:bg-[#F2EDFF] border-[#2A2650] light:border-[#E2DEFA] text-[#A78BFF]'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-[#F2F0FF] light:text-[#1E1B4B] leading-none">
                {authed && user ? (user.name || 'Analyst') : 'Sentinel Session'}
              </span>
              <span className="text-[10px] font-mono text-[#A29FC9] light:text-[#6E6893] mt-0.5">
                {authed ? 'Authenticated' : 'Click to Login'}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Analyst Session & Connection Modal */}
      <AnalystAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}
