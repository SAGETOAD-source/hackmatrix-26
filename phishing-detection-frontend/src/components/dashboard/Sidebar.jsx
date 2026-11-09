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

  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true))

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768
      setIsDesktop(desktop)
      if (desktop) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setMobileOpen])

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
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-200 ease-in-out border-r bg-[#18343A] light:bg-white border-[#24454C] light:border-[#C2E2DA] flex flex-col justify-between ${
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
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#24454C] light:border-[#C2E2DA]">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-2.5 overflow-hidden group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#167D83] to-[#18343A] p-0.5 shadow-md shadow-[#167D83]/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-[6px] bg-[#101C22] flex items-center justify-center group-hover:bg-[#18343A] transition-colors">
                  <Shield className="w-4 h-4 text-[#55B9AD]" />
                </div>
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-xs tracking-tight text-[#F5F7F6] light:text-[#101C22] whitespace-nowrap">
                    ThreatLens<span className="text-[#55B9AD]">.io</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
                    Sentinel SOC Console
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle / Mobile Close Button (Mutually exclusive) */}
            {isDesktop ? (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#A4B8B5] hover:text-[#F5F7F6] light:hover:text-[#101C22] hover:bg-[#1E4047] light:hover:bg-[#D8EFE9] transition-colors cursor-pointer"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            ) : mobileOpen ? (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close Navigation Drawer"
                className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#A4B8B5] hover:text-[#F5F7F6] light:hover:text-[#101C22] hover:bg-[#1E4047] light:hover:bg-[#D8EFE9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#55B9AD]" />
              </button>
            ) : null}
          </div>

          {/* Navigation Sections */}
          <div className="p-2.5 space-y-4">
            {/* Section 1: Operations */}
            <div>
              {(!collapsed || mobileOpen) && (
                <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67]">
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
                          ? 'bg-[#167D83] text-[#F5F7F6] font-semibold shadow-xs shadow-[#167D83]/20'
                          : 'text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22] hover:bg-[#1E4047] light:hover:bg-[#E0F2ED]'
                      } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#55B9AD]' : 'text-[#A4B8B5] light:text-[#4B6B67]'}`} />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Section 2: Deep Analysis */}
            <div>
              {(!collapsed || mobileOpen) && (
                <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67]">
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
                          ? 'bg-[#167D83] text-[#F5F7F6] font-semibold shadow-xs shadow-[#167D83]/20'
                          : 'text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22] hover:bg-[#1E4047] light:hover:bg-[#E0F2ED]'
                      } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#55B9AD]' : 'text-[#A4B8B5] light:text-[#4B6B67]'}`} />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mode Status & Quick Palette Hint */}
        <div className="p-3 border-t border-[#24454C] light:border-[#C2E2DA] bg-[#18343A]/50 light:bg-[#E0F2ED] space-y-2">
          {(!collapsed || mobileOpen) ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#A4B8B5] light:text-[#4B6B67]">Sentinel Core:</span>
                <span className="text-[#55B9AD] font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#55B9AD] animate-pulse"></span>
                  <span>ACTIVE</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
                <span>Pipeline Mode:</span>
                <span className={`px-1.5 py-0.5 rounded border font-bold ${
                  apiActive
                    ? 'bg-[#55B9AD]/10 border-[#55B9AD]/30 text-[#55B9AD]'
                    : 'bg-[#E9B65B]/10 border-[#E9B65B]/30 text-[#E9B65B]'
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
                className="w-full mt-2 flex items-center justify-between px-2 py-1.5 rounded-md bg-[#101C22] light:bg-white border border-[#24454C] light:border-[#C2E2DA] text-[10px] font-mono text-[#A4B8B5] light:text-[#4B6B67] hover:border-[#167D83]/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center space-x-1.5">
                  <Terminal className="w-3 h-3 text-[#55B9AD]" />
                  <span>Command Bar</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1E4047] light:bg-[#D1EBE5] border border-[#24454C] light:border-[#B9DFD6] text-[9px]">Ctrl+K</kbd>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2" title={apiActive ? `API Mode: ${getApiBaseUrl()}` : 'Demonstration Mode'}>
              <span className={`w-2 h-2 rounded-full ${apiActive ? 'bg-[#55B9AD] animate-pulse' : 'bg-[#E9B65B]'}`}></span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('phishguard:open-command-palette'))}
                title="Open Command Palette (Ctrl+K)"
                className="p-1 rounded text-[#A4B8B5] hover:text-[#F5F7F6] hover:bg-[#1E4047] transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#55B9AD]" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
