import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  Trash2,
  Search,
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
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import {
  fetchHistory,
  removeHistoryItem,
  clearAllHistory,
  exportHistoryCSV,
} from '../services/historyService'
import { getScanHistory } from '../utils/scanStorage'

function getVerdictType(riskLevel) {
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
        (riskFilter === 'CRITICAL' && (scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'HIGH')) ||
        (riskFilter === 'HIGH' && scan.riskLevel === 'HIGH') ||
        (riskFilter === 'SUSPICIOUS' && scan.riskLevel === 'SUSPICIOUS') ||
        (riskFilter === 'LOW' && (scan.riskLevel === 'LOW' || scan.riskLevel === 'SAFE'))

      const matchesPrediction =
        predictionFilter === 'ALL' ||
        scan.prediction?.toLowerCase() === predictionFilter.toLowerCase()

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
    <div className="min-h-screen bg-[#101C22] light:bg-[#E0F2ED] text-[#F5F7F6] light:text-[#101C22] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} onSearch={(val) => setSearch(val)} searchQuery={search} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#55B9AD]">
                  AUDIT LOG ARCHIVE
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7F6] light:text-[#101C22] mt-0.5">
                Security Scan History & Archive
              </h1>
              <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
                Historical record of audited targets, lexical feature scores, and classification telemetry.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={loadHistory}
                disabled={isLoading}
                variant="outline"
                size="sm"
                icon={RefreshCw}
              >
                Refresh
              </Button>

              <Button
                onClick={handleExportCSV}
                disabled={filteredScans.length === 0}
                variant="outline"
                size="sm"
                icon={Download}
              >
                Export CSV
              </Button>

              <Button
                onClick={() => setShowClearModal(true)}
                disabled={scans.length === 0}
                variant="outline"
                size="sm"
                icon={Trash2}
                className="text-[#EF6464] hover:bg-[#EF6464]/10 hover:border-[#EF6464]/40"
              >
                Clear Archive
              </Button>

              <Button
                as={Link}
                to="/scanner"
                variant="primary"
                size="sm"
                icon={Plus}
              >
                New Scan
              </Button>
            </div>
          </div>

          {/* History Error Banner */}
          {historyError && (
            <div className="p-4 rounded-xl bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center justify-between gap-3 font-mono">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{historyError}</span>
              </div>
              <button
                type="button"
                onClick={loadHistory}
                className="px-2.5 py-1 rounded bg-[#EF6464] hover:bg-[#EF6464]/90 text-white font-semibold text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Filter, Search & Sort Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-3 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-5 relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A4B8B5] group-focus-within:text-[#55B9AD] transition-colors" />
                <input
                  type="text"
                  placeholder="Filter by domain or URL string..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[#F5F7F6] light:text-[#101C22] placeholder-[#A4B8B5]/60 focus:outline-none focus:border-[#167D83]"
                />
              </div>

              {/* Risk Level Filter */}
              <div className="md:col-span-3">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[#F5F7F6] light:text-[#101C22] focus:outline-none focus:border-[#167D83]"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical Phishing</option>
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
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[#F5F7F6] light:text-[#101C22] focus:outline-none focus:border-[#167D83]"
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
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[#F5F7F6] light:text-[#101C22] focus:outline-none focus:border-[#167D83]"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="HIGHEST_SCORE">Highest Risk</option>
                  <option value="LOWEST_SCORE">Lowest Risk</option>
                </select>
              </div>
            </div>

            {/* Active filter count indicator */}
            <div className="flex items-center justify-between text-[11px] text-[#A4B8B5] light:text-[#4B6B67] pt-2 border-t border-[#24454C]/60 light:border-[#C2E2DA]">
              <span>Showing {filteredScans.length} of {scans.length} historical audit records</span>
              {(search || riskFilter !== 'ALL' || predictionFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setRiskFilter('ALL')
                    setPredictionFilter('ALL')
                  }}
                  className="text-[#55B9AD] light:text-[#167D83] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#101C22]/70 light:bg-[#E0F2ED] text-[10px] uppercase text-[#A4B8B5] light:text-[#4B6B67] border-b border-[#24454C] light:border-[#C2E2DA]">
                  <tr>
                    <th className="py-3 px-5">Target Resource</th>
                    <th className="py-3 px-5">Score</th>
                    <th className="py-3 px-5">Classification</th>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24454C]/60 light:divide-[#C2E2DA]">
                  {filteredScans.length > 0 ? (
                    filteredScans.map((scan) => {
                      const verdict = getVerdictType(scan.riskLevel)
                      const scoreColor = getScoreColor(scan.riskScore)

                      return (
                        <tr
                          key={scan.id}
                          className="hover:bg-[#1E4047]/40 light:hover:bg-[#E0F2ED] transition-colors"
                        >
                          <td className="py-3.5 px-5 max-w-xs md:max-w-sm">
                            <div className="font-semibold text-xs text-[#F5F7F6] light:text-[#101C22] truncate">
                              {scan.domain}
                            </div>
                            <div className="text-[11px] text-[#A4B8B5] light:text-[#4B6B67] truncate flex items-center space-x-1.5 mt-0.5">
                              <span className="truncate" title={scan.url}>{scan.url}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(scan.id, scan.url)}
                                title="Copy URL"
                                className="text-[#A4B8B5] hover:text-[#F5F7F6] p-0.5 shrink-0 cursor-pointer"
                              >
                                {copiedId === scan.id ? (
                                  <Check className="w-3 h-3 text-[#55B9AD]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className={`font-bold text-sm ${scoreColor}`}>
                              {scan.riskScore}
                            </span>
                            <span className="text-[10px] text-[#A4B8B5] light:text-[#4B6B67]">/100</span>
                          </td>

                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <Badge verdict={verdict} size="sm">
                              {scan.prediction || scan.riskLevel}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-5 text-[11px] text-[#A4B8B5] light:text-[#4B6B67] whitespace-nowrap">
                            {scan.timestamp || 'Just now'}
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap space-x-2">
                            <Link
                              to={`/results?url=${encodeURIComponent(scan.url)}`}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#101C22] light:bg-white hover:bg-[#1E4047] light:hover:bg-[#D8EFE9] border border-[#24454C] light:border-[#C2E2DA] text-[11px] text-[#55B9AD] light:text-[#167D83] transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(scan.id)}
                              title="Delete record"
                              className="p-1 rounded-lg text-[#A4B8B5] hover:text-[#EF6464] hover:bg-[#EF6464]/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-xs text-[#A4B8B5] light:text-[#4B6B67]">
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
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] max-w-sm w-full space-y-4 font-mono shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#EF6464]">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22]">
                      Confirm Log Clear
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearModal(false)}
                    className="text-[#A4B8B5] hover:text-[#F5F7F6]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">
                  Are you sure you want to clear all {scans.length} historical audit telemetry records? This action cannot be reversed.
                </p>

                <div className="pt-2 flex items-center justify-end space-x-2 text-xs">
                  <Button
                    onClick={() => setShowClearModal(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-3 py-1.5 rounded-lg bg-[#EF6464] hover:bg-[#EF6464]/90 text-white font-semibold text-xs cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="p-2 text-center text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
