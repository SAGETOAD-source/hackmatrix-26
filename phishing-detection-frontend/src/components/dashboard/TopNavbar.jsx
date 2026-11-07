import { Search, Sun, Moon, Bell, Radio, User, Menu } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function TopNavbar({ onSearch, searchQuery = '', collapsed, setCollapsed }) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <header
      className={`sticky top-0 z-30 h-16 backdrop-blur-md transition-all duration-300 ease-in-out border-b bg-[#0a0f1d]/90 light:bg-white/90 border-[#1e293b] light:border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8`}
    >
      {/* Mobile Sidebar Hamburger Toggle & Search Input Bar */}
      <div className="flex items-center flex-1 max-w-md">
        {setCollapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden mr-2.5 p-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-slate-800/60 light:bg-slate-100 border border-slate-700/60 light:border-slate-300 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scans, target domains, IP addresses..."
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
          className="p-2 rounded-xl text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 bg-slate-800/60 light:bg-slate-100 hover:bg-slate-700/60 light:hover:bg-slate-200 border border-slate-700/60 light:border-slate-300 transition-all duration-200"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 bg-slate-800/60 light:bg-slate-100 border border-slate-700/60 light:border-slate-300 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
        </button>

        {/* SecOps User Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800 light:border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#0a0f1d] light:bg-white rounded-[10px] flex items-center justify-center">
              <User className="w-4 h-4 text-blue-400 light:text-blue-600" />
            </div>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-white light:text-slate-900 leading-tight">
              SecOps Lead
            </span>
            <span className="text-[10px] text-slate-400 light:text-slate-500">
              Analyst Tier 3
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
