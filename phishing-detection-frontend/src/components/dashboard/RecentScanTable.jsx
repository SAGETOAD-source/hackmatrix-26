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
    <div className="rounded-2xl bg-[#0f172a]/90 light:bg-white border border-[#1e293b] light:border-slate-200 shadow-lg shadow-black/5 overflow-hidden">
      {/* Header and Filter Tabs */}
      <div className="p-5 border-b border-slate-800/80 light:border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400 light:text-blue-600" />
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Recent Scans & Risk Assessments
            </h3>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
            Real-time feed of ingested target domains and ML prediction telemetry
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900/90 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs">
          {[
            { id: 'ALL', label: 'All Scans' },
            { id: 'PHISHING', label: 'Phishing' },
            { id: 'SUSPICIOUS', label: 'Suspicious' },
            { id: 'SAFE', label: 'Verified Safe' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 light:text-slate-700">
          <thead className="bg-slate-900/60 light:bg-slate-50 uppercase tracking-wider text-[11px] text-slate-400 light:text-slate-500 border-b border-slate-800 light:border-slate-200 font-semibold">
            <tr>
              <th className="px-5 py-3">Target Domain & URL</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Risk Score</th>
              <th className="px-4 py-3">Primary Indicators</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 light:divide-slate-100">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan) => {
                const badge = BADGE_CONFIG[scan.riskLevel] || BADGE_CONFIG.LOW
                const BadgeIcon = badge.icon

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-slate-800/30 light:hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Domain & URL */}
                    <td className="px-5 py-3.5 max-w-xs sm:max-w-md">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white light:text-slate-900 truncate">
                          {scan.domain}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 light:text-slate-500 truncate block mt-0.5 font-mono">
                        {scan.url}
                      </span>
                    </td>

                    {/* Classification Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              scan.riskScore >= 70
                                ? 'bg-rose-500'
                                : scan.riskScore >= 30
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${scan.riskScore}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-white light:text-slate-900">
                          {scan.riskScore}/100
                        </span>
                      </div>
                    </td>

                    {/* Indicators */}
                    <td className="px-4 py-3.5">
                      {(() => {
                        const rawIndicators = scan.indicators || scan.findings || []
                        const list = rawIndicators.map((item) => (typeof item === 'string' ? item : item.title || item))

                        return (
                          <div className="flex flex-wrap gap-1">
                            {list.slice(0, 2).map((ind, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-800/80 light:bg-slate-100 text-[10px] text-slate-300 light:text-slate-700 border border-slate-700/60 light:border-slate-200"
                              >
                                {ind}
                              </span>
                            ))}
                            {list.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-800 light:bg-slate-100 text-[10px] text-slate-400">
                                +{list.length - 2}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 light:text-slate-500 text-[11px]">
                      {scan.timestamp}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/results?url=${encodeURIComponent(scan.url)}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-400 light:text-blue-600 hover:text-white light:hover:text-white hover:bg-blue-600 light:hover:bg-blue-600 border border-blue-500/30 transition-all duration-150"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 light:text-slate-500">
                  No matching scan records found for query "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simulated notice footer */}
      <div className="p-3 bg-slate-900/40 light:bg-slate-50 border-t border-slate-800/80 light:border-slate-100 flex items-center justify-between text-[11px] text-slate-500 light:text-slate-500">
        <span>Showing {filteredScans.length} active records</span>
        <span className="italic">{SIMULATION_DISCLAIMER}</span>
      </div>
    </div>
  )
}
