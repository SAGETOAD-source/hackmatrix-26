import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, CheckCircle, AlertTriangle, Eye, Shield } from 'lucide-react'
import { RECENT_SCANS } from '../../data/mockData'
import { getScanHistory } from '../../utils/scanStorage'
import { fetchHistory } from '../../services/historyService'

const BADGE_CONFIG = {
  CRITICAL: {
    label: 'Critical Phishing',
    bg: 'bg-rose-500/10 text-rose-400 light:text-rose-700 border-rose-500/30',
    icon: ShieldAlert,
  },
  HIGH: {
    label: 'High Risk',
    bg: 'bg-orange-500/10 text-orange-400 light:text-orange-700 border-orange-500/30',
    icon: ShieldAlert,
  },
  SUSPICIOUS: {
    label: 'Suspicious',
    bg: 'bg-amber-500/10 text-amber-400 light:text-amber-700 border-amber-500/30',
    icon: AlertTriangle,
  },
  LOW: {
    label: 'Legitimate',
    bg: 'bg-emerald-500/10 text-emerald-400 light:text-emerald-700 border-emerald-500/30',
    icon: CheckCircle,
  },
}

export default function RecentScanTable({ searchQuery = '' }) {
  const [filter, setFilter] = useState('ALL')
  const [scans, setScans] = useState(() => {
    const stored = getScanHistory()
    return stored && stored.length > 0 ? stored : RECENT_SCANS
  })

  useEffect(() => {
    let isMounted = true
    fetchHistory().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setScans(data)
      }
    }).catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

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
    <div className="cyber-card overflow-hidden">
      {/* Header and Filter Tabs */}
      <div className="p-4 sm:p-5 border-b border-[#24344B] light:border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#287FE9]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
              Ingested Target Audit Feed
            </h3>
          </div>
          <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
            Chronological inspection records with composite risk scores and model verdicts
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 p-0.5 rounded-md bg-[#0D1728] light:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PHISHING', label: 'Phishing' },
            { id: 'SUSPICIOUS', label: 'Suspicious' },
            { id: 'SAFE', label: 'Legitimate' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#287FE9] text-white'
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
          <thead className="bg-[#0D1728] light:bg-slate-50 uppercase tracking-wider text-[10px] font-mono text-[#9EACC2] light:text-[#64748B] border-b border-[#24344B] light:border-[#E2E8F0] font-semibold">
            <tr>
              <th className="py-2.5 px-4">Target Resource</th>
              <th className="py-2.5 px-4">Risk Score</th>
              <th className="py-2.5 px-4">Classification</th>
              <th className="py-2.5 px-4 hidden md:table-cell">Timestamp</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#24344B]/60 light:divide-[#E2E8F0] font-mono text-xs">
            {filteredScans.length > 0 ? (
              filteredScans.slice(0, 7).map((scan) => {
                const badge = BADGE_CONFIG[scan.riskLevel] || BADGE_CONFIG.LOW
                const BadgeIcon = badge.icon

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[#15253F]/60 light:hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 max-w-xs md:max-w-sm">
                      <div className="font-semibold text-xs text-[#F1F5FF] light:text-[#172033] truncate">
                        {scan.domain}
                      </div>
                      <div className="text-[11px] text-[#9EACC2] light:text-[#64748B] truncate" title={scan.url}>
                        {scan.url}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs font-mono text-[#F1F5FF] light:text-[#172033]">
                          {scan.riskScore}
                        </span>
                        <span className="text-[10px] text-[#9EACC2] light:text-[#64748B]">/100</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3 shrink-0" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#9EACC2] light:text-[#64748B] whitespace-nowrap hidden md:table-cell">
                      {scan.timestamp || 'Just now'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/results?url=${encodeURIComponent(scan.url)}`}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#0D1728] light:bg-slate-100 hover:bg-[#15253F] light:hover:bg-slate-200 border border-[#24344B] light:border-[#E2E8F0] text-[11px] font-medium text-[#287FE9] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Audit</span>
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-xs text-[#9EACC2] light:text-[#64748B]">
                  No matching telemetry records found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
