import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, CheckCircle, AlertTriangle, Eye, Shield } from 'lucide-react'
import { RECENT_SCANS, SIMULATION_DISCLAIMER } from '../../data/mockData'
import { getScanHistory } from '../../utils/scanStorage'

const BADGE_CONFIG = {
  CRITICAL: {
    label: 'Critical Phishing',
    bg: 'bg-rose-500/10 text-rose-400 light:text-rose-700 border-rose-500/25',
    icon: ShieldAlert,
    badgeColor: 'text-rose-400',
  },
  HIGH: {
    label: 'High Risk',
    bg: 'bg-red-500/10 text-red-400 light:text-red-700 border-red-500/25',
    icon: ShieldAlert,
    badgeColor: 'text-red-400',
  },
  SUSPICIOUS: {
    label: 'Suspicious',
    bg: 'bg-amber-500/10 text-amber-400 light:text-amber-700 border-amber-500/25',
    icon: AlertTriangle,
    badgeColor: 'text-amber-400',
  },
  LOW: {
    label: 'Legitimate / Safe',
    bg: 'bg-emerald-500/10 text-emerald-400 light:text-emerald-700 border-emerald-500/25',
    icon: CheckCircle,
    badgeColor: 'text-emerald-400',
  },
}

export default function RecentScanTable({ searchQuery = '' }) {
  const [filter, setFilter] = useState('ALL')
  const [scans] = useState(() => {
    const stored = getScanHistory()
    return stored && stored.length > 0 ? stored : RECENT_SCANS
  })

  const filteredScans = scans.filter((scan) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'PHISHING' && (scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'HIGH')) ||
      (filter === 'SUSPICIOUS' && scan.riskLevel === 'SUSPICIOUS') ||
      (filter === 'SAFE' && scan.riskLevel === 'LOW')

    const matchesSearch =
      !searchQuery ||
      scan.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.prediction.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-lg shadow-black/15 light:shadow-slate-200/50 overflow-hidden">
      {/* Header and Filter Tabs */}
      <div className="p-5 border-b border-[#1C2D4A] light:border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#55B7FF] light:text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#F1F5FF] light:text-[#172033]">
              Recent Scans & Risk Assessments
            </h3>
          </div>
          <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
            Real-time feed of ingested target domains and ML prediction telemetry
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-xs">
          {[
            { id: 'ALL', label: 'All Scans' },
            { id: 'PHISHING', label: 'Phishing' },
            { id: 'SUSPICIOUS', label: 'Suspicious' },
            { id: 'SAFE', label: 'Verified Safe' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#287FE9] text-white shadow-xs'
                  : 'text-[#9EACC2] light:text-[#64748B] hover:text-[#F1F5FF] light:hover:text-[#172033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#F1F5FF] light:text-[#172033]">
          <thead className="bg-[#0B1528] light:bg-[#F8FAFD] uppercase tracking-wider text-[11px] text-[#9EACC2] light:text-[#64748B] border-b border-[#1C2D4A] light:border-[#E2E8F0] font-semibold">
            <tr>
              <th className="py-3 px-5">Target Domain & Scanned URL</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2D4A]/60 light:divide-[#E2E8F0]">
            {filteredScans.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#9EACC2] light:text-[#64748B]">
                  No scans match your query or selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredScans.map((scan) => {
                const badge = BADGE_CONFIG[scan.riskLevel] || BADGE_CONFIG.LOW
                const BadgeIcon = badge.icon

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[#162744] light:hover:bg-[#F8FAFD] transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col max-w-xs sm:max-w-md">
                        <span className="font-semibold text-sm text-[#F1F5FF] light:text-[#172033] truncate">
                          {scan.domain}
                        </span>
                        <span className="text-[11px] text-[#9EACC2] light:text-[#64748B] truncate font-mono">
                          {scan.url}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-[#F1F5FF] light:text-[#172033]">
                          {scan.riskScore}
                        </span>
                        <span className="text-[10px] text-[#9EACC2] light:text-[#64748B]">/ 100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#9EACC2] light:text-[#64748B] font-medium">
                      {scan.confidence}%
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#9EACC2] light:text-[#64748B]">
                      {scan.timestamp}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/results?url=${encodeURIComponent(scan.url)}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#287FE9]/10 hover:bg-[#287FE9]/20 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-[#0B1528] light:bg-[#F8FAFD] border-t border-[#1C2D4A] light:border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9EACC2] light:text-[#64748B] gap-2">
        <p>Showing {filteredScans.length} of {scans.length} active telemetry records</p>
        <span className="text-[10px] text-[#9EACC2] light:text-[#64748B]">
          {SIMULATION_DISCLAIMER}
        </span>
      </div>
    </div>
  )
}
