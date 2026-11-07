import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Sun, Moon, Menu, X, ArrowRight, Terminal } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Live Scanner', path: '/scanner' },
    { name: 'Security Analysis', path: '/security-analysis' },
    { name: 'Scan History', path: '/history' },
    { name: 'SOC Console', path: '/dashboard' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || (path === '/security-analysis' && location.pathname === '/security')
  }

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-200 bg-[#080F1E]/95 light:bg-white/95 backdrop-blur-md border-b border-[#24344B] light:border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#111E32] light:bg-[#F0F4FF] border border-[#24344B] light:border-[#D0E0FF] flex items-center justify-center transition-colors group-hover:border-[#287FE9]">
              <Shield className="w-5 h-5 text-[#287FE9] light:text-[#2563EB]" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-[#F1F5FF] light:text-[#172033]">
                PhishGuard<span className="text-[#287FE9]">.SOC</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111E32] light:bg-slate-100 text-[#9EACC2] light:text-[#64748B] border border-[#24344B] light:border-[#E2E8F0]">
                v2.4
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'text-[#F1F5FF] light:text-[#172033] bg-[#111E32] light:bg-slate-100 border border-[#24344B] light:border-[#CBD5E1] font-semibold'
                      : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#0D1728] light:hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Live Operational Status */}
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Engines Operational</span>
            </div>

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

            {/* Launch Scanner Button */}
            <Link
              to="/scanner"
              className="cyber-btn-primary text-xs font-medium space-x-1.5 py-1.5 px-3"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Analyze URL</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-md text-[#9EACC2] light:text-[#64748B] bg-[#111E32] light:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0]"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2563EB]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-1.5 rounded-md text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] bg-[#111E32] light:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#24344B] light:border-[#E2E8F0] bg-[#080F1E] light:bg-white px-4 pt-3 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? 'text-[#287FE9] light:text-[#2563EB] bg-[#111E32] light:bg-blue-50 font-semibold'
                    : 'text-[#9EACC2] light:text-[#64748B] hover:bg-[#111E32] light:hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-[#24344B] light:border-[#E2E8F0]">
            <Link
              to="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="cyber-btn-primary w-full text-xs font-semibold py-2 space-x-2"
            >
              <span>Analyze URL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
