import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Shield, Terminal } from 'lucide-react'
import { RECENT_SCANS } from '../../data/mockData'
import { getScanHistory } from '../../utils/scanStorage'
import { fetchHistory } from '../../services/historyService'
import Badge from '../ui/Badge'

function getVerdict(riskLevel) {
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH' || riskLevel === 'MALICIOUS') return 'malicious'
  if (riskLevel === 'SUSPICIOUS') return 'suspicious'
  if (riskLevel === 'LOW' || riskLevel === 'SAFE') return 'safe'
  return 'unknown'
}

function getScoreColor(score) {
  if (score >= 70) return 'text-[#EF6464]'
  if (score >= 40) return 'text-[#E9B65B]'
  return 'text-[#55B9AD]'
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
      (filter === 'PHISHING' && (scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'HIGH' || scan.riskLevel === 'MALICIOUS')) ||
      (filter === 'SUSPICIOUS' && scan.riskLevel === 'SUSPICIOUS') ||
      (filter === 'SAFE' && (scan.riskLevel === 'LOW' || scan.riskLevel === 'SAFE'))

    const matchesSearch =
      !searchQuery ||
      scan.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.prediction.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm overflow-hidden">
      {/* Header and Filter Tabs */}
      <div className="p-5 border-b border-[#24454C] light:border-[#C2E2DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#167D83]/15 border border-[#167D83]/30 flex items-center justify-center text-[#55B9AD]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-bold text-sm tracking-wide text-[#F5F7F6] light:text-[#101C22]">
              Ingested Target Audit Feed
            </h3>
          </div>
          <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
            Chronological inspection records with composite risk scores and model verdicts
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-[#101C22] light:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] text-xs font-mono">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PHISHING', label: 'Phishing' },
            { id: 'SUSPICIOUS', label: 'Suspicious' },
            { id: 'SAFE', label: 'Legitimate' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#167D83] text-[#F5F7F6] shadow-xs'
                  : 'text-[#A4B8B5] light:text-[#4B6B67] hover:text-[#F5F7F6] light:hover:text-[#101C22]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#F5F7F6] light:text-[#101C22]">
          <thead className="bg-[#101C22]/70 light:bg-[#E0F2ED] uppercase tracking-wider text-[10px] font-mono text-[#A4B8B5] light:text-[#4B6B67] border-b border-[#24454C] light:border-[#C2E2DA] font-semibold">
            <tr>
              <th className="py-3 px-5">Target Resource</th>
              <th className="py-3 px-5">Risk Score</th>
              <th className="py-3 px-5">Classification</th>
              <th className="py-3 px-5 hidden md:table-cell">Timestamp</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#24454C]/60 light:divide-[#C2E2DA] font-mono text-xs">
            {filteredScans.length > 0 ? (
              filteredScans.slice(0, 8).map((scan) => {
                const verdict = getVerdict(scan.riskLevel)
                const scoreColor = getScoreColor(scan.riskScore)

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[#1E4047]/50 light:hover:bg-[#E0F2ED] transition-colors"
                  >
                    <td className="py-3.5 px-5 max-w-xs md:max-w-sm">
                      <div className="font-semibold text-xs text-[#F5F7F6] light:text-[#101C22] truncate">
                        {scan.domain}
                      </div>
                      <div className="text-[11px] text-[#A4B8B5] light:text-[#4B6B67] truncate" title={scan.url}>
                        {scan.url}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold text-sm font-mono ${scoreColor}`}>
                          {scan.riskScore}
                        </span>
                        <span className="text-[10px] text-[#A4B8B5] light:text-[#4B6B67]">/100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Badge verdict={verdict} size="sm">
                        {scan.prediction || scan.riskLevel}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-[11px] text-[#A4B8B5] light:text-[#4B6B67] whitespace-nowrap hidden md:table-cell">
                      {scan.timestamp || 'Just now'}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/results?url=${encodeURIComponent(scan.url)}`}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#101C22] light:bg-white hover:bg-[#1E4047] light:hover:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] text-[11px] font-medium text-[#55B9AD] light:text-[#167D83] transition-all"
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
                <td colSpan="5" className="py-10 text-center text-xs text-[#A4B8B5] light:text-[#4B6B67]">
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
