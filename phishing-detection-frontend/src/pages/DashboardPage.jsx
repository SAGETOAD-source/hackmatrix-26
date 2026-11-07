import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertCircle } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import StatCard from '../components/dashboard/StatCard'
import ActivityChart from '../components/dashboard/ActivityChart'
import ThreatDistributionChart from '../components/dashboard/ThreatDistributionChart'
import RecentScanTable from '../components/dashboard/RecentScanTable'
import QuickScanner from '../components/dashboard/QuickScanner'
import Aurora from '../components/backgrounds/Aurora'
import { useTheme } from '../context/ThemeContext'
import { STAT_CARDS_DATA } from '../data/mockData'

export default function DashboardPage() {
  const { isDark } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex relative overflow-hidden">
      {/* React Bits Aurora Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <Aurora
          colorStops={
            isDark
              ? ['#080F1E', '#111E32', '#287FE9', '#55B7FF', '#111E32']
              : ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#2563EB']
          }
          amplitude={1}
          blend={0.5}
          height={0.5}
          speed={0.8}
          glow={0.6}
          layers={2}
          mouseInteraction={true}
          lightMode={!isDark}
          opacity={isDark ? 0.6 : 0.35}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-[#080F1E]/60 light:bg-[#F5F7FC]/75 pointer-events-none"></div>
      </div>

      {/* Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'
        }`}
      >
        {/* Top Navbar */}
        <TopNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onSearch={(query) => setSearchQuery(query)}
          searchQuery={searchQuery}
        />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Simulated Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-[#287FE9]/10 light:bg-blue-50 border border-[#287FE9]/25 light:border-blue-200 flex items-center justify-between text-xs text-[#55B7FF] light:text-blue-800">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-[#55B7FF] light:text-[#2563EB] shrink-0" />
              <span>
                <strong className="font-semibold">Simulated Security Environment:</strong> Telemetry values reflect sample enterprise SOC metrics and synthetic test vectors.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#287FE9]/20 light:bg-blue-200 text-[#55B7FF] light:text-blue-900">
              SOC Mode Demo
            </span>
          </div>

          {/* Page Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5FF] light:text-[#172033]">
                Security Operations Center (SOC)
              </h1>
              <p className="text-xs sm:text-sm text-[#9EACC2] light:text-[#64748B] mt-1">
                Real-time threat monitoring, heuristic feature extraction, and URL verification overview.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/scanner"
                className="cyber-btn-primary text-xs sm:text-sm font-semibold space-x-2 py-2"
              >
                <Search className="w-4 h-4" />
                <span>New URL Scan</span>
              </Link>
            </div>
          </div>

          {/* Quick Scanner Embed */}
          <QuickScanner />

          {/* Stat Cards Grid (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STAT_CARDS_DATA.map((card) => (
              <StatCard key={card.id} item={card} />
            ))}
          </div>

          {/* Charts Row: Scan Activity & Threat Vectors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityChart />
            </div>
            <div className="lg:col-span-1">
              <ThreatDistributionChart />
            </div>
          </div>

          {/* Recent Scans Table */}
          <RecentScanTable searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  )
}
