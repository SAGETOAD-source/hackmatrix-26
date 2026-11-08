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
  if (score >= 70) return 'text-[#FF4D6D]'
  if (score >= 40) return 'text-[#FFB020]'
  return 'text-[#34E0A1]'
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
    <div className="rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-sm overflow-hidden">
      {/* Header and Filter Tabs */}
      <div className="p-5 border-b border-[#2A2650] light:border-[#E2DEFA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#A78BFF]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-bold text-sm tracking-wide text-[#F2F0FF] light:text-[#1E1B4B]">
              Ingested Target Audit Feed
            </h3>
          </div>
          <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-1">
            Chronological inspection records with composite risk scores and model verdicts
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-[#0B0A14] light:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono">
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
                  ? 'bg-[#7C5CFF] text-[#F2F0FF] shadow-xs'
                  : 'text-[#A29FC9] light:text-[#6E6893] hover:text-[#F2F0FF] light:hover:text-[#1E1B4B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#F2F0FF] light:text-[#1E1B4B]">
          <thead className="bg-[#0B0A14]/70 light:bg-[#F7F5FF] uppercase tracking-wider text-[10px] font-mono text-[#A29FC9] light:text-[#6E6893] border-b border-[#2A2650] light:border-[#E2DEFA] font-semibold">
            <tr>
              <th className="py-3 px-5">Target Resource</th>
              <th className="py-3 px-5">Risk Score</th>
              <th className="py-3 px-5">Classification</th>
              <th className="py-3 px-5 hidden md:table-cell">Timestamp</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2650]/60 light:divide-[#E2DEFA] font-mono text-xs">
            {filteredScans.length > 0 ? (
              filteredScans.slice(0, 8).map((scan) => {
                const verdict = getVerdict(scan.riskLevel)
                const scoreColor = getScoreColor(scan.riskScore)

                return (
                  <tr
                    key={scan.id}
                    className="hover:bg-[#1C1936]/50 light:hover:bg-[#F7F5FF] transition-colors"
                  >
                    <td className="py-3.5 px-5 max-w-xs md:max-w-sm">
                      <div className="font-semibold text-xs text-[#F2F0FF] light:text-[#1E1B4B] truncate">
                        {scan.domain}
                      </div>
                      <div className="text-[11px] text-[#A29FC9] light:text-[#6E6893] truncate" title={scan.url}>
                        {scan.url}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold text-sm font-mono ${scoreColor}`}>
                          {scan.riskScore}
                        </span>
                        <span className="text-[10px] text-[#A29FC9] light:text-[#6E6893]">/100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Badge verdict={verdict} size="sm">
                        {scan.prediction || scan.riskLevel}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-[11px] text-[#A29FC9] light:text-[#6E6893] whitespace-nowrap hidden md:table-cell">
                      {scan.timestamp || 'Just now'}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/results?url=${encodeURIComponent(scan.url)}`}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0B0A14] light:bg-white hover:bg-[#1C1936] light:hover:bg-[#F2EDFF] border border-[#2A2650] light:border-[#E2DEFA] text-[11px] font-medium text-[#A78BFF] light:text-[#7C5CFF] transition-all"
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
                <td colSpan="5" className="py-10 text-center text-xs text-[#A29FC9] light:text-[#6E6893]">
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
