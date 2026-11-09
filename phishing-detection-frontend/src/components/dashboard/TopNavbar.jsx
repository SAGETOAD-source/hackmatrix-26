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
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true))

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      <header className="sticky top-0 z-30 h-16 transition-colors duration-200 border-b bg-[#101C22]/90 light:bg-white/90 backdrop-blur-md border-[#24454C] light:border-[#C2E2DA] flex items-center justify-between px-3 sm:px-6">
        {/* Mobile Navigation Trigger & Search Bar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 max-w-md">
          {/* Mobile hamburger menu button (Mobile only) */}
          {!isDesktop && (
            <button
              type="button"
              onClick={handleMobileMenuClick}
              aria-label="Open Navigation Menu"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-[#A4B8B5] hover:text-[#F5F7F6] light:text-[#4B6B67] light:hover:text-[#101C22] bg-[#18343A] light:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] hover:bg-[#1E4047] transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4 text-[#55B9AD]" />
            </button>
          )}

          {/* Search Bar */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A4B8B5] group-focus-within:text-[#55B9AD] transition-colors" />
            <input
              type="text"
              placeholder="Search threat telemetry, IOCs, domains..."
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full pl-9 pr-3 sm:pr-4 py-1.5 rounded-lg text-xs bg-[#18343A] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[#F5F7F6] light:text-[#101C22] placeholder-[#A4B8B5]/60 focus:outline-none focus:border-[#167D83] focus:ring-1 focus:ring-[#167D83]/30 transition-all"
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
                ? 'bg-[#18343A] light:bg-[#E0F2ED] border-[#55B9AD]/40 text-[#55B9AD] hover:bg-[#55B9AD]/10'
                : 'bg-[#18343A] light:bg-[#E0F2ED] border-[#E9B65B]/40 text-[#E9B65B] hover:bg-[#E9B65B]/10'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Engine: {apiActive ? 'Live Backend' : 'Simulation'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 sm:p-2 rounded-lg text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22] bg-[#18343A] light:bg-white hover:bg-[#1E4047] light:hover:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] transition-all cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#55B9AD]" />
            ) : (
              <Moon className="w-4 h-4 text-[#167D83]" />
            )}
          </button>

          {/* Analyst Profile Chip */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center space-x-2 pl-2 border-l border-[#24454C] light:border-[#C2E2DA] cursor-pointer text-left hover:opacity-90 transition-opacity"
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors ${
              authed
                ? 'bg-[#55B9AD]/15 border-[#55B9AD]/40 text-[#55B9AD]'
                : 'bg-[#18343A] light:bg-[#D8EFE9] border-[#24454C] light:border-[#C2E2DA] text-[#55B9AD]'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-[#F5F7F6] light:text-[#101C22] leading-none">
                {authed && user ? (user.name || 'Analyst') : 'Sentinel Session'}
              </span>
              <span className="text-[10px] font-mono text-[#A4B8B5] light:text-[#4B6B67] mt-0.5">
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
