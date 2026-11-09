import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  FileText,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
  Shield,
  Terminal,
  X
} from 'lucide-react'
import { isApiMode, getApiBaseUrl } from '../../services/api'

export default function Sidebar({
  collapsed = false,
  setCollapsed = () => {},
  mobileOpen: propMobileOpen,
  setMobileOpen: propSetMobileOpen
}) {
  const location = useLocation()
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const isControlledMobile = propMobileOpen !== undefined
  const mobileOpen = isControlledMobile ? propMobileOpen : internalMobileOpen
  const setMobileOpen = isControlledMobile ? propSetMobileOpen : setInternalMobileOpen

  const [apiActive, setApiActive] = useState(() => isApiMode())

  useEffect(() => {
    const handleMode = () => setApiActive(isApiMode())
    window.addEventListener('phishguard:mode-changed', handleMode)
    return () => window.removeEventListener('phishguard:mode-changed', handleMode)
  }, [])

  // Listen to open/close mobile nav events
  useEffect(() => {
    const handleOpen = () => setMobileOpen(true)
    const handleClose = () => setMobileOpen(false)
    const handleToggle = () => setMobileOpen((prev) => !prev)

    window.addEventListener('phishguard:open-mobile-nav', handleOpen)
    window.addEventListener('phishguard:close-mobile-nav', handleClose)
    window.addEventListener('phishguard:toggle-mobile-nav', handleToggle)
    return () => {
      window.removeEventListener('phishguard:open-mobile-nav', handleOpen)
      window.removeEventListener('phishguard:close-mobile-nav', handleClose)
      window.removeEventListener('phishguard:toggle-mobile-nav', handleToggle)
    }
  }, [setMobileOpen])

  // Automatically close mobile navigation drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  // Prevent background scrolling ONLY while the mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, setMobileOpen])

  const operationLinks = [
    { name: 'SOC Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'URL Threat Scanner', path: '/scanner', icon: Search },
    { name: 'Inspection Report', path: '/results', icon: FileText },
  ]

  const analysisLinks = [
    { name: 'Security & TLS Audit', path: '/security-analysis', icon: ShieldCheck, alias: '/security' },
    { name: 'Audit Scan History', path: '/history', icon: History },
  ]

  const isLinkActive = (item) => {
    if (location.pathname === item.path) return true
    if (item.alias && location.pathname === item.alias) return true
    return false
  }

  return (
    <>
      {/* Mobile Backdrop Overlay - ONLY rendered when mobile drawer is explicitly OPEN */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200"
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-200 ease-in-out border-r bg-[#0B0A14] light:bg-white border-[#2A2650] light:border-[#E2DEFA] flex flex-col justify-between ${
          mobileOpen
            ? 'w-72 max-w-[85vw] translate-x-0 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        } ${
          collapsed
            ? 'md:w-18'
            : 'md:w-60'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#2A2650] light:border-[#E2DEFA]">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-2.5 overflow-hidden group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#14122A] p-0.5 shadow-md shadow-[#7C5CFF]/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-[6px] bg-[#0B0A14] flex items-center justify-center group-hover:bg-[#14122A] transition-colors">
                  <Shield className="w-4 h-4 text-[#A78BFF]" />
                </div>
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-xs tracking-tight text-[#F2F0FF] light:text-[#1E1B4B] whitespace-nowrap">
                    PhishGuard<span className="text-[#C6FF3D] light:text-[#5E8F00]">.UV</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                    Sentinel SOC Console
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Sidebar"
              className="hidden md:flex p-1.5 rounded-lg text-[#A29FC9] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] hover:bg-[#1C1936] light:hover:bg-[#F2EDFF] transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close Navigation Drawer"
              className="flex md:hidden p-1.5 rounded-lg text-[#A29FC9] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] hover:bg-[#1C1936] light:hover:bg-[#F2EDFF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-[#A78BFF]" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="p-2.5 space-y-4">
            {/* Section 1: Operations */}
            <div>
              {(!collapsed || mobileOpen) && (
                <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#A29FC9] light:text-[#6E6893]">
                  Operations
                </p>
              )}
              <div className="space-y-1">
                {operationLinks.map((item) => {
                  const Icon = item.icon
                  const active = isLinkActive(item)

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed && !mobileOpen ? item.name : undefined}
                      className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[#7C5CFF]/15 light:bg-[#7C5CFF]/10 text-[#F2F0FF] light:text-[#5E3BEE] border border-[#7C5CFF]/40 light:border-[#7C5CFF]/30 font-semibold shadow-xs shadow-[#7C5CFF]/20'
                          : 'text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] hover:bg-[#14122A] light:hover:bg-[#F7F5FF]'
                      } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C6FF3D] light:text-[#5E8F00]' : 'text-[#A29FC9] light:text-[#6E6893]'}`} />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Section 2: Deep Analysis */}
            <div>
              {(!collapsed || mobileOpen) && (
                <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#A29FC9] light:text-[#6E6893]">
                  Intelligence & Audit
                </p>
              )}
              <div className="space-y-1">
                {analysisLinks.map((item) => {
                  const Icon = item.icon
                  const active = isLinkActive(item)

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed && !mobileOpen ? item.name : undefined}
                      className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[#7C5CFF]/15 light:bg-[#7C5CFF]/10 text-[#F2F0FF] light:text-[#5E3BEE] border border-[#7C5CFF]/40 light:border-[#7C5CFF]/30 font-semibold shadow-xs shadow-[#7C5CFF]/20'
                          : 'text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B] hover:bg-[#14122A] light:hover:bg-[#F7F5FF]'
                      } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C6FF3D] light:text-[#5E8F00]' : 'text-[#A29FC9] light:text-[#6E6893]'}`} />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mode Status & Quick Palette Hint */}
        <div className="p-3 border-t border-[#2A2650] light:border-[#E2DEFA] bg-[#14122A]/50 light:bg-[#F7F5FF] space-y-2">
          {(!collapsed || mobileOpen) ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#A29FC9] light:text-[#6E6893]">Sentinel Core:</span>
                <span className="text-[#34E0A1] font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34E0A1] animate-pulse"></span>
                  <span>ACTIVE</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                <span>Pipeline Mode:</span>
                <span className={`px-1.5 py-0.5 rounded border font-bold ${
                  apiActive
                    ? 'bg-[#34E0A1]/10 border-[#34E0A1]/30 text-[#34E0A1]'
                    : 'bg-[#FFB020]/10 border-[#FFB020]/30 text-[#FFB020]'
                }`}>
                  {apiActive ? 'LIVE API' : 'DEMO MODE'}
                </span>
              </div>

              {/* Quick shortcut indicator */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  window.dispatchEvent(new CustomEvent('phishguard:open-command-palette'))
                }}
                className="w-full mt-2 flex items-center justify-between px-2 py-1.5 rounded-md bg-[#0B0A14] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] text-[10px] font-mono text-[#A29FC9] light:text-[#6E6893] hover:border-[#7C5CFF]/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center space-x-1.5">
                  <Terminal className="w-3 h-3 text-[#A78BFF]" />
                  <span>Command Bar</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1C1936] light:bg-[#EDE9FE] border border-[#2A2650] light:border-[#D4CDFA] text-[9px]">Ctrl+K</kbd>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2" title={apiActive ? `API Mode: ${getApiBaseUrl()}` : 'Demonstration Mode'}>
              <span className={`w-2 h-2 rounded-full ${apiActive ? 'bg-[#34E0A1] animate-pulse' : 'bg-[#FFB020]'}`}></span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('phishguard:open-command-palette'))}
                title="Open Command Palette (Ctrl+K)"
                className="p-1 rounded text-[#A29FC9] hover:text-[#F2F0FF] hover:bg-[#1C1936] transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#A78BFF]" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
