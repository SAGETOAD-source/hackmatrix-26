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
  Radio
} from 'lucide-react'

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'URL Scanner', path: '/scanner', icon: Search },
    { name: 'Scan Results', path: '/results', icon: FileText },
    { name: 'Security Analysis', path: '/security', icon: ShieldCheck },
    { name: 'Scan History', path: '/history', icon: History },
  ]

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
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r bg-[#080F1E] light:bg-white border-[#1C2D4A] light:border-[#E2E8F0] flex flex-col justify-between ${
          collapsed
            ? 'w-20 -translate-x-full md:translate-x-0'
            : 'w-64 translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#1C2D4A] light:border-[#E2E8F0]">
            <Link to="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-[#287FE9] via-[#1E6FD6] to-[#55B7FF] p-0.5 shadow-md shadow-[#287FE9]/20">
                <div className="w-full h-full bg-[#080F1E] light:bg-white rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#55B7FF] light:text-[#2563EB]" />
                </div>
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-[#F1F5FF] light:text-[#172033] whitespace-nowrap">
                    ThreatSentinel<span className="text-[#55B7FF] light:text-[#2563EB]">.ai</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#55B7FF] light:text-[#2563EB] uppercase tracking-wider">
                    SOC Terminal
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle Sidebar"
              className="p-1.5 rounded-lg text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#111E32] light:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-1.5">
            {!collapsed && (
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
                Navigation
              </p>
            )}

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path === '/security' && location.pathname === '/security-analysis')

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#287FE9]/15 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 light:border-blue-200 font-semibold shadow-xs'
                      : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033] hover:bg-[#111E32] light:hover:bg-slate-100'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-5 h-5 min-w-5 ${isActive ? 'text-[#55B7FF] light:text-[#2563EB]' : 'text-[#9EACC2] light:text-[#64748B]'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Status Card */}
        {!collapsed && (
          <div className="p-4 m-3 rounded-2xl bg-[#111E32] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0]">
            <div className="flex items-center space-x-2 mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033]">ML Pipeline Ready</span>
            </div>
            <p className="text-[11px] text-[#9EACC2] light:text-[#64748B] leading-relaxed">
              Random Forest v2.4 model initialized. 18 feature extractors online.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
