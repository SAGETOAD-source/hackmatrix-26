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
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 bg-[#0a0f1d]/90 light:bg-white/90 border-[#1e293b] light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0a0f1d] light:bg-white rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400 light:text-blue-600 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 light:from-slate-900 light:via-slate-800 light:to-slate-600 bg-clip-text text-transparent">
                ThreatSentinel<span className="text-blue-400 font-extrabold">.ai</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-400/80 light:text-blue-600/80 -mt-1">
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
                      ? 'text-blue-400 light:text-blue-600 bg-blue-500/10 light:bg-blue-50 font-semibold'
                      : 'text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-slate-800/50 light:hover:bg-slate-100'
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
              className="p-2 rounded-xl text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 bg-slate-800/60 light:bg-slate-100 hover:bg-slate-700/60 light:hover:bg-slate-200 border border-slate-700/60 light:border-slate-300 transition-all duration-200"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform -rotate-12 hover:rotate-0" />
              )}
            </button>

            {/* Launch Dashboard Button */}
            <Link
              to="/dashboard"
              className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 focus:outline-none"
            >
              <span>SOC Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-300 light:text-slate-600 bg-slate-800/60 light:bg-slate-100"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 bg-slate-800/60 light:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 light:border-slate-200 bg-[#0a0f1d]/95 light:bg-white/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 light:text-slate-700 hover:bg-slate-800/60 light:hover:bg-slate-100"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
            >
              <span>Launch SOC Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
