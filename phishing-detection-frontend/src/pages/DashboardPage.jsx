import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Terminal } from 'lucide-react'
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
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex">
      {/* Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
          collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'
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
          <div className="p-3 rounded-md bg-[#0D1728] light:bg-blue-50 border border-[#24344B] light:border-blue-200 flex items-center justify-between text-xs text-[#9EACC2] light:text-blue-900">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-[#287FE9] shrink-0" />
              <span>
                <strong className="text-[#F1F5FF] light:text-blue-950 font-semibold font-mono">SOC DEMO ENVIRONMENT:</strong>{' '}
                Telemetry reflects simulated enterprise security metrics and synthetic attack test vectors for competition evaluation.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111E32] light:bg-blue-100 text-[#55B7FF] light:text-blue-800 border border-[#24344B] light:border-blue-200 whitespace-nowrap">
              Tier 3 Demo
            </span>
          </div>

          {/* Page Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#287FE9]">
                  OPERATIONAL INTELLIGENCE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] mt-0.5">
                Security Operations Center (SOC) Console
              </h1>
              <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
                Aggregated URL ingestion telemetry, feature extraction distributions, and triage queues.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <Link
                to="/scanner"
                className="cyber-btn-primary text-xs space-x-1.5 py-2 px-3.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>New URL Inspection</span>
              </Link>
            </div>
          </div>

          {/* Quick Scanner Embed */}
          <QuickScanner />

          {/* Stat Cards Grid (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS_DATA.map((card) => (
              <StatCard key={card.id} item={card} />
            ))}
          </div>

          {/* Charts Row: Scan Activity & Threat Vectors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
