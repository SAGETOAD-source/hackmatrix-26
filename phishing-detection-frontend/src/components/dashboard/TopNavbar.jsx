import { Search, Sun, Moon, Bell, Radio, User, Menu } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function TopNavbar({ onSearch, searchQuery = '', collapsed, setCollapsed }) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <header
      className={`sticky top-0 z-30 h-16 backdrop-blur-md transition-all duration-300 ease-in-out border-b bg-[#080F1E]/90 light:bg-white/95 border-[#1C2D4A] light:border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6 lg:px-8`}
    >
      {/* Mobile Sidebar Hamburger Toggle & Search Input Bar */}
      <div className="flex items-center flex-1 max-w-md">
        {setCollapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden mr-2.5 p-2 rounded-xl text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] bg-[#111E32] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
          <input
            type="text"
            placeholder="Search scans, target domains, IP addresses..."
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9] focus:ring-1 focus:ring-[#287FE9] transition-all"
          />
        </div>
      </div>

      {/* Right Tools and Profile */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Live Threat Radar Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 light:text-emerald-700 text-xs font-medium">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Threat Radar: Active</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] bg-[#111E32] light:bg-[#F5F7FC] hover:bg-[#15253F] light:hover:bg-slate-200 border border-[#1C2D4A] light:border-[#E2E8F0] transition-all duration-200 cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-[#2563EB] transition-transform -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] bg-[#111E32] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#287FE9] animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#287FE9]"></span>
        </button>

        {/* SecOps User Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-[#1C2D4A] light:border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#287FE9] to-[#55B7FF] p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#080F1E] light:bg-white rounded-[10px] flex items-center justify-center">
              <User className="w-4 h-4 text-[#55B7FF] light:text-[#2563EB]" />
            </div>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033] leading-tight">
              SecOps Lead
            </span>
            <span className="text-[10px] text-[#9EACC2] light:text-[#64748B]">
              Analyst Tier 3
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
