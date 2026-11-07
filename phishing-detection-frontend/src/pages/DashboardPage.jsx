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
import { STAT_CARDS_DATA } from '../data/mockData'

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#0a0f1d] light:bg-[#f8fafc] text-slate-100 light:text-slate-900 transition-colors duration-200 flex">
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
          <div className="p-3.5 rounded-xl bg-blue-500/10 light:bg-blue-50 border border-blue-500/20 light:border-blue-200 flex items-center justify-between text-xs text-blue-300 light:text-blue-800">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 light:text-blue-600 flex-shrink-0" />
              <span>
                <strong className="font-semibold">Simulated Security Environment:</strong> Telemetry values reflect sample enterprise SOC metrics and synthetic test vectors.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 light:bg-blue-200">
              SOC Mode Demo
            </span>
          </div>

          {/* Page Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white light:text-slate-900">
                Security Operations Center (SOC)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 light:text-slate-500 mt-1">
                Real-time threat monitoring, heuristic feature extraction, and URL verification overview.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/scanner"
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all duration-200"
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
