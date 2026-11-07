import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Live Scanner', path: '/scanner' },
    { name: 'SOC Dashboard', path: '/dashboard' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    if (path.startsWith('/#')) return false
    return location.pathname === path
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 bg-[#080F1E]/90 light:bg-white/95 border-[#1C2D4A] light:border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#287FE9] via-[#1E6FD6] to-[#55B7FF] p-0.5 shadow-md shadow-[#287FE9]/20 group-hover:shadow-[#287FE9]/40 transition-all duration-300">
              <div className="w-full h-full bg-[#080F1E] light:bg-white rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#55B7FF] light:text-[#2563EB] transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-[#F1F5FF] light:text-[#172033]">
                ThreatSentinel<span className="text-[#55B7FF] light:text-[#2563EB] font-extrabold">.ai</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#9EACC2] light:text-[#64748B] -mt-1">
                Zero-Trust Detection
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <a
                  key={link.name}
                  href={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-[#55B7FF] light:text-[#2563EB] bg-[#287FE9]/10 light:bg-blue-50 border border-[#287FE9]/30 light:border-blue-200 font-semibold shadow-xs'
                      : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#111E32] light:hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </a>
              )
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
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

            {/* Launch Dashboard Button */}
            <Link
              to="/dashboard"
              className="cyber-btn-primary text-sm font-semibold inline-flex items-center space-x-1.5"
            >
              <span>SOC Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-[#9EACC2] light:text-[#64748B] bg-[#111E32] light:bg-slate-100 border border-[#1C2D4A] light:border-[#E2E8F0]"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2563EB]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 rounded-lg text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] bg-[#111E32] light:bg-slate-100 border border-[#1C2D4A] light:border-[#E2E8F0] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1C2D4A] light:border-[#E2E8F0] bg-[#080F1E] light:bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <a
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-[#55B7FF] light:text-[#2563EB] bg-[#287FE9]/10 light:bg-blue-50 font-semibold'
                    : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#111E32] light:hover:bg-slate-100'
                }`}
              >
                {link.name}
              </a>
            )
          })}
          <div className="pt-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="cyber-btn-primary w-full text-center text-sm font-semibold py-2.5"
            >
              <span>Launch SOC Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
