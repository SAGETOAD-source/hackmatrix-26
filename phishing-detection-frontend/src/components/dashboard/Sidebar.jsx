import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  FileText,
  ShieldCheck,
  History,
  Home,
  ChevronLeft,
  ChevronRight,
  Shield,
  Cpu
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
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r bg-[#0a0f1d] light:bg-white border-[#1e293b] light:border-slate-200 flex flex-col justify-between ${
          collapsed
            ? 'w-20 -translate-x-full md:translate-x-0'
            : 'w-64 translate-x-0'
        }`}
      >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b] light:border-slate-200">
          <Link to="/" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#0a0f1d] light:bg-white rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400 light:text-blue-600" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white light:text-slate-900 whitespace-nowrap">
                  ThreatSentinel<span className="text-blue-400">.ai</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-400 light:text-blue-600 uppercase tracking-wider">
                  SOC Terminal
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5">
          {!collapsed && (
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 light:text-slate-400">
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
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 light:text-blue-600 border border-blue-500/30 light:border-blue-200 font-semibold shadow-sm'
                    : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-slate-800/50 light:hover:bg-slate-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 min-w-5 ${isActive ? 'text-blue-400 light:text-blue-600' : 'text-slate-400 light:text-slate-500'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Module / SOC Status */}
      <div className="p-3 border-t border-[#1e293b] light:border-slate-200 space-y-2">
        <Link
          to="/"
          title={collapsed ? 'Back to Landing' : undefined}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800/40 light:hover:bg-slate-100 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Home className="w-4 h-4 min-w-4 text-slate-400" />
          {!collapsed && <span>Back to Main Site</span>}
        </Link>

        {!collapsed ? (
          <div className="p-3 rounded-xl bg-[#0f172a] light:bg-slate-100 border border-[#1e293b] light:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 light:text-slate-800 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>ML Engine v1.0</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400 light:text-slate-600 leading-tight">
              Random Forest Active • 18 Features • 99.8% Precision
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Engine Operational">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
    </>
  )
}
