import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

export default function QuickScanner() {
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const navigate = useNavigate()

  const handleScan = (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      navigate(`/scanner?url=${encodeURIComponent(url.trim())}`)
    }, 600)
  }

  const sampleTargets = [
    { label: 'PayPal Lure Sample', url: 'http://paypal.com.account-verification-notice.xyz/login.html' },
    { label: 'Raw IP Host Sample', url: 'http://185.220.101.4:8080/apple/id/verification' },
    { label: 'Legitimate Domain Sample', url: 'https://github.com/torvalds/linux' },
  ]

  return (
    <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl shadow-black/20 light:shadow-slate-200/50 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Instant Threat Radar</span>
          </div>
          <h3 className="text-lg font-bold text-[#F1F5FF] light:text-[#172033]">
            Rapid URL & Brand Impersonation Scanner
          </h3>
          <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
            Ingest any suspicious URL or domain to evaluate 18 lexical heuristics, SSL certificate status, and threat feed matches.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter target URL to analyze (e.g., https://example-secure-login.xyz/auth)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9] focus:ring-1 focus:ring-[#287FE9] shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={isScanning || !url.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#287FE9] via-[#1E6FD6] to-[#287FE9] hover:from-[#378DF0] hover:to-[#256FD0] shadow-lg shadow-[#287FE9]/25 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Vectors...</span>
            </>
          ) : (
            <>
              <span>Execute Deep Scan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sample presets */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#9EACC2] light:text-[#64748B] font-medium text-[11px]">
          Quick Presets:
        </span>
        {sampleTargets.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setUrl(item.url)}
            className="px-2.5 py-1 rounded-lg bg-[#0B1528] light:bg-[#F5F7FC] hover:bg-[#15253F] light:hover:bg-slate-200 text-[#9EACC2] light:text-[#172033] text-[11px] border border-[#1C2D4A] light:border-[#E2E8F0] transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
