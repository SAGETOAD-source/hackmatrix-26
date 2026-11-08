import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Sun, Moon, Menu, X, ArrowRight, Terminal } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../ui/Button'

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Threat Scanner', path: '/scanner' },
    { name: 'Deep Audit', path: '/security-analysis' },
    { name: 'Scan History', path: '/history' },
    { name: 'SOC Console', path: '/dashboard' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || (path === '/security-analysis' && location.pathname === '/security')
  }

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-200 bg-[#0B0A14]/90 light:bg-white/90 backdrop-blur-md border-b border-[#2A2650] light:border-[#E2DEFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#14122A] p-0.5 shadow-md shadow-[#7C5CFF]/25 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-[10px] bg-[#0B0A14] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#A78BFF]" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-base tracking-tight text-[#F2F0FF] light:text-[#1E1B4B]">
                PhishGuard<span className="text-[#C6FF3D] light:text-[#5E8F00]">.UV</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#14122A] light:bg-[#F2EDFF] text-[#A29FC9] light:text-[#6E6893] border border-[#2A2650] light:border-[#D4CDFA]">
                SENTINEL
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    active
                      ? 'text-[#F2F0FF] light:text-[#5E3BEE] bg-[#7C5CFF]/15 light:bg-[#7C5CFF]/10 border border-[#7C5CFF]/40 light:border-[#7C5CFF]/30 font-semibold shadow-xs shadow-[#7C5CFF]/20'
                      : 'text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] hover:bg-[#14122A] light:hover:bg-[#F7F5FF]'
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
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#14122A] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34E0A1] animate-pulse"></span>
              <span>Engines Operational</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-lg text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] bg-[#14122A] light:bg-white hover:bg-[#1C1936] light:hover:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA] transition-all cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#C6FF3D]" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C5CFF]" />
              )}
            </button>

            {/* Launch Scanner Button */}
            <Button
              as={Link}
              to="/scanner"
              variant="primary"
              size="sm"
              icon={Terminal}
            >
              Analyze Target
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-lg text-[#A29FC9] light:text-[#6E6893] bg-[#14122A] light:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA]"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#C6FF3D]" /> : <Moon className="w-4 h-4 text-[#7C5CFF]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-1.5 rounded-lg text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] bg-[#14122A] light:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A2650] light:border-[#E2DEFA] bg-[#0B0A14] light:bg-white px-4 pt-3 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-[#C6FF3D] light:text-[#5E3BEE] bg-[#7C5CFF]/15 light:bg-[#7C5CFF]/10 font-semibold'
                    : 'text-[#A29FC9] light:text-[#6E6893] hover:bg-[#14122A] light:hover:bg-[#F7F5FF]'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-[#2A2650] light:border-[#E2DEFA]">
            <Button
              as={Link}
              to="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              variant="primary"
              size="md"
              className="w-full justify-center"
              icon={ArrowRight}
            >
              Analyze Target
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
