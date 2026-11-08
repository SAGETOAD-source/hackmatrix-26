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
  Shield
} from 'lucide-react'
import { isApiMode, getApiBaseUrl } from '../../services/api'

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const [apiActive, setApiActive] = useState(() => isApiMode())

  useEffect(() => {
    const handleMode = () => setApiActive(isApiMode())
    window.addEventListener('phishguard:mode-changed', handleMode)
    return () => window.removeEventListener('phishguard:mode-changed', handleMode)
  }, [])

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
      {/* Mobile Backdrop Overlay */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-200 ease-in-out border-r bg-[#080F1E] light:bg-white border-[#24344B] light:border-[#E2E8F0] flex flex-col justify-between ${
          collapsed
            ? 'w-18 -translate-x-full md:translate-x-0'
            : 'w-60 translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#24344B] light:border-[#E2E8F0]">
            <Link to="/" className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-md bg-[#111E32] light:bg-blue-50 border border-[#24344B] light:border-blue-200 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#287FE9]" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-tight text-[#F1F5FF] light:text-[#172033] whitespace-nowrap">
                    PhishGuard<span className="text-[#287FE9]">.SOC</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#9EACC2] light:text-[#64748B]">
                    Threat Console
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Sidebar"
              className="p-1.5 rounded-md text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#111E32] light:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="p-2.5 space-y-4">
            {/* Section 1: Operations */}
            <div>
              {!collapsed && (
                <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
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
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#111E32] light:bg-slate-100 text-[#F1F5FF] light:text-[#172033] border border-[#24344B] light:border-[#CBD5E1] font-semibold'
                          : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#0D1728] light:hover:bg-slate-50'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#287FE9]' : 'text-[#9EACC2] light:text-[#64748B]'}`} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Section 2: Deep Analysis */}
            <div>
              {!collapsed && (
                <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
                  Intelligence
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
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#111E32] light:bg-slate-100 text-[#F1F5FF] light:text-[#172033] border border-[#24344B] light:border-[#CBD5E1] font-semibold'
                          : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#0D1728] light:hover:bg-slate-50'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#287FE9]' : 'text-[#9EACC2] light:text-[#64748B]'}`} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mode Status Indicator */}
        <div className="p-3 border-t border-[#24344B] light:border-[#E2E8F0] bg-[#0D1728] light:bg-slate-50">
          {!collapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#9EACC2] light:text-[#64748B]">Engine Node:</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>ONLINE</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9EACC2] light:text-[#64748B]">
                <span>Pipeline Mode:</span>
                <span className={`px-1.5 py-0.5 rounded border font-bold ${
                  apiActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {apiActive ? 'LIVE API' : 'DEMO MODE'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={apiActive ? `API Mode: ${getApiBaseUrl()}` : 'Demonstration Mode'}>
              <span className={`w-2 h-2 rounded-full ${apiActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
