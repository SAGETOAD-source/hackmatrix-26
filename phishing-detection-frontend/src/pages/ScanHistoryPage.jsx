import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  Trash2,
  Search,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  X,
  Plus,
  RefreshCw
} from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import {
  fetchHistory,
  removeHistoryItem,
  clearAllHistory,
  exportHistoryCSV,
} from '../services/historyService'
import { getScanHistory } from '../utils/scanStorage'

const RISK_BADGES = {
  CRITICAL: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    icon: ShieldAlert,
    label: 'Critical Risk',
  },
  HIGH: {
    bg: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    icon: ShieldAlert,
    label: 'High Risk',
  },
  SUSPICIOUS: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    icon: ShieldCheck,
    label: 'Suspicious',
  },
  LOW: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    icon: CheckCircle,
    label: 'Legitimate',
  },
}

export default function ScanHistoryPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [scans, setScans] = useState(() => getScanHistory())
  const [isLoading, setIsLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [predictionFilter, setPredictionFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [copiedId, setCopiedId] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)

  // Load history from service
  const loadHistory = async () => {
    setIsLoading(true)
    setHistoryError(null)
    try {
      const data = await fetchHistory()
      setScans(data)
    } catch (err) {
      setHistoryError(err.message || 'Failed to retrieve scan history from server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchHistory()
      .then((data) => {
        if (isMounted && data) setScans(data)
      })
      .catch((err) => {
        if (isMounted) setHistoryError(err.message || 'Failed to retrieve scan history from server.')
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Handle URL Copy
  const handleCopyUrl = (id, url) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      })
    }
  }

  // Handle Deleting Individual Scan
  const handleDeleteItem = async (id) => {
    try {
      const res = await removeHistoryItem(id)
      if (res && res.updatedList) {
        setScans(res.updatedList)
        if (!res.backendSupported) {
          setHistoryError(res.message)
          setTimeout(() => setHistoryError(null), 4000)
        }
      } else if (Array.isArray(res)) {
        setScans(res)
      }
    } catch (err) {
      setHistoryError(err.message || 'Failed to remove scan record.')
    }
  }

  // Handle Clear All
  const handleConfirmClear = async () => {
    try {
      const res = await clearAllHistory()
      setScans([])
      setShowClearModal(false)
      if (res && !res.backendSupported) {
        setHistoryError(res.message)
        setTimeout(() => setHistoryError(null), 4000)
      }
    } catch (err) {
      setHistoryError(err.message || 'Failed to clear scan history.')
    }
  }

  // Filter & Sort Logic
  const filteredScans = scans
    .filter((scan) => {
      const matchesSearch =
        !search ||
        scan.url.toLowerCase().includes(search.toLowerCase()) ||
        scan.domain.toLowerCase().includes(search.toLowerCase())

      const matchesRisk =
        riskFilter === 'ALL' ||
        (riskFilter === 'CRITICAL' && scan.riskLevel === 'CRITICAL') ||
        (riskFilter === 'HIGH' && scan.riskLevel === 'HIGH') ||
        (riskFilter === 'SUSPICIOUS' && scan.riskLevel === 'SUSPICIOUS') ||
        (riskFilter === 'LOW' && scan.riskLevel === 'LOW')

      const matchesPrediction =
        predictionFilter === 'ALL' ||
        scan.prediction.toLowerCase() === predictionFilter.toLowerCase()

      return matchesSearch && matchesRisk && matchesPrediction
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
      if (sortBy === 'HIGHEST_SCORE') {
        return b.riskScore - a.riskScore
      }
      if (sortBy === 'LOWEST_SCORE') {
        return a.riskScore - b.riskScore
      }
      return 0
    })

  // Export Filtered Records to CSV
  const handleExportCSV = () => {
    if (filteredScans.length === 0) return
    exportHistoryCSV(filteredScans)
  }

  return (
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} onSearch={(val) => setSearch(val)} searchQuery={search} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#287FE9]">
                  AUDIT LOGS
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] mt-0.5">
                Security Scan History & Archive
              </h1>
              <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
                Historical record of audited targets, lexical feature scores, and classification telemetry.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadHistory}
                disabled={isLoading}
                title="Reload history"
                className="px-2.5 py-1.5 rounded-md text-xs font-mono bg-[#111E32] light:bg-white hover:bg-[#15253F] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#24344B] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={filteredScans.length === 0}
                className="px-3 py-1.5 rounded-md text-xs font-mono bg-[#111E32] light:bg-white hover:bg-[#15253F] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#24344B] light:border-[#E2E8F0] flex items-center space-x-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                disabled={scans.length === 0}
                className="px-3 py-1.5 rounded-md text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <Link
                to="/scanner"
                className="cyber-btn-primary px-3 py-1.5 text-xs font-semibold inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </Link>
            </div>
          </div>

          {/* History Error Banner */}
          {historyError && (
            <div className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3 font-mono">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{historyError}</span>
              </div>
              <button
                type="button"
                onClick={loadHistory}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Filter, Search & Sort Toolbar */}
          <div className="cyber-card p-3 sm:p-4 space-y-3 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9EACC2]" />
                <input
                  type="text"
                  placeholder="Filter by domain or URL string..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md text-xs bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9]"
                />
              </div>

              {/* Risk Level Filter */}
              <div className="md:col-span-3">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] focus:outline-none focus:border-[#287FE9]"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                  <option value="LOW">Legitimate / Safe</option>
                </select>
              </div>

              {/* Prediction Filter */}
              <div className="md:col-span-2">
                <select
                  value={predictionFilter}
                  onChange={(e) => setPredictionFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] focus:outline-none focus:border-[#287FE9]"
                >
                  <option value="ALL">All Verdicts</option>
                  <option value="PHISHING">Phishing</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                  <option value="SAFE">Safe</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] focus:outline-none focus:border-[#287FE9]"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="HIGHEST_SCORE">Highest Risk</option>
                  <option value="LOWEST_SCORE">Lowest Risk</option>
                </select>
              </div>
            </div>

            {/* Active filter count indicator */}
            <div className="flex items-center justify-between text-[11px] text-[#9EACC2] light:text-[#64748B] pt-1 border-t border-[#24344B]/60 light:border-[#E2E8F0]">
              <span>Showing {filteredScans.length} of {scans.length} historical audit records</span>
              {(search || riskFilter !== 'ALL' || predictionFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setRiskFilter('ALL')
                    setPredictionFilter('ALL')
                  }}
                  className="text-[#287FE9] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="cyber-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0D1728] light:bg-slate-50 text-[10px] uppercase text-[#9EACC2] light:text-[#64748B] border-b border-[#24344B] light:border-[#E2E8F0]">
                  <tr>
                    <th className="py-2.5 px-4">Target Resource</th>
                    <th className="py-2.5 px-4">Score</th>
                    <th className="py-2.5 px-4">Classification</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24344B]/60 light:divide-[#E2E8F0]">
                  {filteredScans.length > 0 ? (
                    filteredScans.map((scan) => {
                      const badge = RISK_BADGES[scan.riskLevel] || RISK_BADGES.LOW
                      const BadgeIcon = badge.icon

                      return (
                        <tr
                          key={scan.id}
                          className="hover:bg-[#15253F]/40 light:hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 max-w-xs md:max-w-sm">
                            <div className="font-semibold text-xs text-[#F1F5FF] light:text-[#172033] truncate">
                              {scan.domain}
                            </div>
                            <div className="text-[11px] text-[#9EACC2] light:text-[#64748B] truncate flex items-center space-x-1.5 mt-0.5">
                              <span className="truncate" title={scan.url}>{scan.url}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(scan.id, scan.url)}
                                title="Copy URL"
                                className="text-[#9EACC2] hover:text-[#F1F5FF] p-0.5 shrink-0"
                              >
                                {copiedId === scan.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-xs text-[#F1F5FF] light:text-[#172033]">
                              {scan.riskScore}
                            </span>
                            <span className="text-[10px] text-[#9EACC2]">/100</span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg}`}>
                              <BadgeIcon className="w-3 h-3 shrink-0" />
                              <span>{badge.label}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[11px] text-[#9EACC2] light:text-[#64748B] whitespace-nowrap">
                            {scan.timestamp || 'Just now'}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            <Link
                              to={`/results?url=${encodeURIComponent(scan.url)}`}
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#0D1728] light:bg-slate-100 hover:bg-[#15253F] light:hover:bg-slate-200 border border-[#24344B] light:border-[#E2E8F0] text-[11px] text-[#287FE9]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(scan.id)}
                              title="Delete record"
                              className="p-1 rounded text-[#9EACC2] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-xs text-[#9EACC2] light:text-[#64748B]">
                        No matching scan records found in the archive.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clear Confirmation Modal */}
          {showClearModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="cyber-card p-5 max-w-sm w-full space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                      Confirm Log Clear
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearModal(false)}
                    className="text-[#9EACC2] hover:text-[#F1F5FF]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                  Are you sure you want to clear all {scans.length} historical audit telemetry records? This action cannot be reversed.
                </p>

                <div className="pt-2 flex items-center justify-end space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowClearModal(false)}
                    className="cyber-btn-secondary py-1.5 px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="p-2 text-center text-[11px] font-mono text-[#9EACC2] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
