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
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { STAT_CARDS_DATA } from '../data/mockData'

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#101C22] light:bg-[#E0F2ED] text-[#F5F7F6] light:text-[#101C22] transition-colors duration-200 flex">
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
          <div className="p-3.5 rounded-xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] flex items-center justify-between text-xs text-[#A4B8B5] light:text-[#4B6B67] shadow-xs">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-[#55B9AD] shrink-0" />
              <span>
                <strong className="text-[#F5F7F6] light:text-[#101C22] font-semibold font-mono">SENTINEL SOC CONSOLE:</strong>{' '}
                Telemetry reflects real-time feature extraction distributions, RFC compliance checks, and triage queues.
              </span>
            </div>
            <Badge verdict="safe" size="sm">
              Operational Tier 3
            </Badge>
          </div>

          {/* Page Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#55B9AD]">
                  OPERATIONAL TELEMETRY
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7F6] light:text-[#101C22] mt-0.5">
                Security Operations Center Console
              </h1>
              <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
                Aggregated URL ingestion telemetry, feature extraction distributions, and active triage queues.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <Button
                as={Link}
                to="/scanner"
                variant="primary"
                size="md"
                icon={Terminal}
              >
                New Target Triage
              </Button>
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
