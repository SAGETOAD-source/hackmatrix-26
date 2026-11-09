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
    <nav className="sticky top-0 z-50 transition-colors duration-200 bg-[#101C22]/90 light:bg-white/90 backdrop-blur-md border-b border-[#24454C] light:border-[#C2E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#167D83] to-[#18343A] p-0.5 shadow-md shadow-[#167D83]/25 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-[10px] bg-[#101C22] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#55B9AD]" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-base tracking-tight text-[#F5F7F6] light:text-[#101C22]">
                ThreatLens<span className="text-[#55B9AD]">.io</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#18343A] light:bg-[#D8EFE9] text-[#A4B8B5] light:text-[#4B6B67] border border-[#24454C] light:border-[#B9DFD6]">
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
                      ? 'text-[#F5F7F6] bg-[#167D83] font-semibold shadow-xs shadow-[#167D83]/25'
                      : 'text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22] hover:bg-[#18343A] light:hover:bg-[#E0F2ED]'
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
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#18343A] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#55B9AD] animate-pulse"></span>
              <span>Engines Operational</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-lg text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22] bg-[#18343A] light:bg-white hover:bg-[#1E4047] light:hover:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] transition-all cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#55B9AD]" />
              ) : (
                <Moon className="w-4 h-4 text-[#167D83]" />
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
              className="p-1.5 rounded-lg text-[#A4B8B5] light:text-[#4B6B67] bg-[#18343A] light:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA]"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#55B9AD]" /> : <Moon className="w-4 h-4 text-[#167D83]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-1.5 rounded-lg text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] bg-[#18343A] light:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#24454C] light:border-[#C2E2DA] bg-[#18343A] light:bg-white px-4 pt-3 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-[#F5F7F6] bg-[#167D83] font-semibold'
                    : 'text-[#A4B8B5] light:text-[#4B6B67] hover:bg-[#1E4047] light:hover:bg-[#E0F2ED]'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-[#24454C] light:border-[#C2E2DA]">
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
