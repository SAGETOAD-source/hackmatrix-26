import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Download,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  History,
  X,
  ExternalLink,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import {
  fetchHistory,
  removeHistoryItem,
  clearAllHistory,
  exportHistoryCSV,
} from '../services/historyService'
import { isApiMode, getApiBaseUrl } from '../services/api'
import { getScanHistory } from '../utils/scanStorage'

const RISK_BADGES = {
  CRITICAL: {
    bg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    icon: ShieldAlert,
    label: 'Critical Risk',
  },
  HIGH: {
    bg: 'bg-red-500/20 text-red-400 border border-red-500/30',
    icon: ShieldAlert,
    label: 'High Risk',
  },
  SUSPICIOUS: {
    bg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    icon: ShieldCheck,
    label: 'Suspicious',
  },
  LOW: {
    bg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle,
    label: 'Legitimate',
  },
}

export default function ScanHistoryPage() {
  const navigate = useNavigate()
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
      const updated = await removeHistoryItem(id)
      setScans(updated)
    } catch (err) {
      setHistoryError(err.message || 'Failed to remove scan record.')
    }
  }

  // Handle Clear All
  const handleConfirmClear = async () => {
    try {
      await clearAllHistory()
      setScans([])
      setShowClearModal(false)
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

  // Summary Metrics
  const totalScans = scans.length
  const phishCount = scans.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length
  const suspiciousCount = scans.filter((s) => s.riskLevel === 'SUSPICIOUS').length
  const safeCount = scans.filter((s) => s.riskLevel === 'LOW').length

  return (
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} onSearch={(val) => setSearch(val)} searchQuery={search} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 text-xs font-semibold mb-2">
                <History className="w-3.5 h-3.5" />
                <span>Audited Telemetry Log</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5FF] light:text-[#172033]">
                Security Scan History
              </h1>
              <p className="text-xs sm:text-sm text-[#9EACC2] light:text-[#64748B] mt-1">
                Audited archive of historical simulated scans, lexical scores, and threat classification records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#111E32] light:bg-slate-200 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-slate-300">
                {isApiMode() ? `API Mode: ${getApiBaseUrl()}` : 'Mock History Mode'}
              </span>

              <button
                type="button"
                onClick={loadHistory}
                disabled={isLoading}
                title="Reload history"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#111E32] light:bg-white hover:bg-[#162744] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={filteredScans.length === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111E32] light:bg-white hover:bg-[#162744] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0] flex items-center space-x-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                disabled={scans.length === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>

              <Link
                to="/scanner"
                className="cyber-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </Link>
            </div>
          </div>

          {/* History Error Banner with Retry */}
          {historyError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{historyError}</span>
              </div>
              <button
                type="button"
                onClick={loadHistory}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0]">
              <span className="text-xs text-[#9EACC2] light:text-[#64748B] block mb-1">Total Scans Audited</span>
              <span className="text-xl sm:text-2xl font-black text-[#F1F5FF] light:text-[#172033]">{totalScans}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0]">
              <span className="text-xs text-[#9EACC2] light:text-[#64748B] block mb-1">Phishing Detected</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400">{phishCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0]">
              <span className="text-xs text-[#9EACC2] light:text-[#64748B] block mb-1">Suspicious Domains</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">{suspiciousCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0]">
              <span className="text-xs text-[#9EACC2] light:text-[#64748B] block mb-1">Verified Legitimate</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{safeCount}</span>
            </div>
          </div>

          {/* Filter, Search & Sort Control Panel */}
          <div className="p-4 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
                <input
                  type="text"
                  placeholder="Filter by URL or domain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9] focus:ring-1 focus:ring-[#287FE9]"
                />
              </div>

              {/* Filter by Risk Level */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#9EACC2] shrink-0" />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                  <option value="LOW">Low / Clean</option>
                </select>
              </div>

              {/* Filter by Prediction */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#9EACC2] shrink-0" />
                <select
                  value={predictionFilter}
                  onChange={(e) => setPredictionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Predictions</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Suspicious">Suspicious</option>
                  <option value="Legitimate">Legitimate</option>
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-[#9EACC2] shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] focus:outline-none cursor-pointer"
                >
                  <option value="NEWEST">Date: Newest First</option>
                  <option value="OLDEST">Date: Oldest First</option>
                  <option value="HIGHEST_SCORE">Risk Score: High to Low</option>
                  <option value="LOWEST_SCORE">Risk Score: Low to High</option>
                </select>
              </div>
            </div>

            {/* Active filters chips */}
            {(search || riskFilter !== 'ALL' || predictionFilter !== 'ALL') && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1C2D4A] light:border-[#E2E8F0]">
                <div className="flex flex-wrap items-center gap-1.5 text-[#9EACC2] light:text-[#64748B]">
                  <span>Filtered by:</span>
                  {search && (
                    <span className="px-2 py-0.5 rounded bg-[#287FE9]/10 text-[#55B7FF] border border-[#287FE9]/20">
                      Query: "{search}"
                    </span>
                  )}
                  {riskFilter !== 'ALL' && (
                    <span className="px-2 py-0.5 rounded bg-[#287FE9]/10 text-[#55B7FF] border border-[#287FE9]/20">
                      Level: {riskFilter}
                    </span>
                  )}
                  {predictionFilter !== 'ALL' && (
                    <span className="px-2 py-0.5 rounded bg-[#287FE9]/10 text-[#55B7FF] border border-[#287FE9]/20">
                      Prediction: {predictionFilter}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setRiskFilter('ALL')
                    setPredictionFilter('ALL')
                  }}
                  className="text-[#55B7FF] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Scan History Table */}
          <div className="rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1528] light:bg-[#F8FAFD] border-b border-[#1C2D4A] light:border-[#E2E8F0] uppercase tracking-wider text-[#9EACC2] light:text-[#64748B] font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Scanned Target URL</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Scan Date & Time</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Risk Score</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Risk Level</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Prediction</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#1C2D4A]/60 light:divide-[#E2E8F0]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 px-4">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Loader2 className="w-6 h-6 text-[#55B7FF] animate-spin" />
                          <span className="text-xs text-[#9EACC2]">Fetching audit records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredScans.length > 0 ? (
                    filteredScans.map((scan) => {
                      const badge = RISK_BADGES[scan.riskLevel] || RISK_BADGES.SUSPICIOUS
                      const BadgeIcon = badge.icon
                      const isCopied = copiedId === scan.id

                      return (
                        <tr
                          key={scan.id}
                          className="hover:bg-[#162744] light:hover:bg-[#F8FAFD] transition-colors"
                        >
                          {/* URL column */}
                          <td className="px-5 py-4 max-w-xs sm:max-w-md">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-[#F1F5FF] light:text-[#172033] font-mono text-xs truncate block max-w-xs sm:max-w-sm" title={scan.url}>
                                {scan.url}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(scan.id, scan.url)}
                                title="Copy URL"
                                className="text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] p-1 rounded cursor-pointer"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[11px] text-[#9EACC2] light:text-[#64748B] font-mono truncate block mt-0.5">
                              {scan.domain}
                            </span>
                          </td>

                          {/* Date and time */}
                          <td className="px-4 py-4 whitespace-nowrap text-[#F1F5FF] light:text-[#172033] font-medium">
                            {scan.formattedDate}
                          </td>

                          {/* Risk score */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-16 h-2 rounded-full bg-[#0B1528] light:bg-slate-200 overflow-hidden">
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
                              <span className="font-bold text-[#F1F5FF] light:text-[#172033] text-xs">
                                {scan.riskScore}
                                <span className="text-[#9EACC2] font-normal">/100</span>
                              </span>
                            </div>
                          </td>

                          {/* Risk level badge */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}
                            >
                              <BadgeIcon className="w-3 h-3" />
                              <span>{scan.riskLevel}</span>
                            </span>
                          </td>

                          {/* Prediction status */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`font-semibold text-xs ${
                                scan.prediction === 'Phishing'
                                  ? 'text-rose-400'
                                  : scan.prediction === 'Suspicious'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {scan.prediction}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/results?url=${encodeURIComponent(scan.url)}`)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#287FE9]/10 hover:bg-[#287FE9] text-[#55B7FF] hover:text-white border border-[#287FE9]/30 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Report</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteItem(scan.id)}
                                title="Delete from history"
                                className="p-1.5 rounded-lg text-[#9EACC2] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 px-4">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-[#0B1528] light:bg-slate-100 text-[#9EACC2] flex items-center justify-center mx-auto border border-[#1C2D4A] light:border-slate-200">
                            <History className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-[#F1F5FF] light:text-[#172033] text-sm">
                            No Scan Records Found
                          </h3>
                          <p className="text-xs text-[#9EACC2] light:text-[#64748B]">
                            {scans.length === 0
                              ? 'Your local scan history is currently empty.'
                              : 'No scan records matched your active query and filter criteria.'}
                          </p>
                          <Link
                            to="/scanner"
                            className="cyber-btn-primary inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold"
                          >
                            <span>Run a New Scan</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-3 bg-[#0B1528] light:bg-[#F8FAFD] border-t border-[#1C2D4A] light:border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9EACC2] light:text-[#64748B]">
              <span>Showing {filteredScans.length} of {scans.length} recorded scans</span>
              <span className="italic">{SIMULATION_DISCLAIMER}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 text-center text-xs text-[#9EACC2] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>

      {/* Clear History Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                      Clear Scan History?
                    </h3>
                    <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
                      This will remove all saved simulated scan records from your browser storage.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-xs text-[#9EACC2] light:text-[#64748B]">
                You currently have <strong>{scans.length} records</strong> stored locally. This action cannot be reversed.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F1F5FF] light:text-[#172033] bg-[#0B1528] light:bg-[#F5F7FC] hover:bg-[#162744] light:hover:bg-slate-200 border border-[#1C2D4A] light:border-[#E2E8F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  Yes, Clear History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
