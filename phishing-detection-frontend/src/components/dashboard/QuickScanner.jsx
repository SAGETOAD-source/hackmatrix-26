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
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#111a33] to-[#0a0f1d] light:from-white light:via-blue-50/40 light:to-white border border-blue-500/20 light:border-blue-200 shadow-xl shadow-blue-900/10 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 light:text-blue-700 border border-blue-500/30 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Instant Threat Radar</span>
          </div>
          <h3 className="text-lg font-bold text-white light:text-slate-900">
            Rapid URL & Brand Impersonation Scanner
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
            Ingest any suspicious URL or domain to evaluate 18 lexical heuristics, SSL certificate status, and threat feed matches.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter target URL to analyze (e.g., https://example-secure-login.xyz/auth)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-slate-900/90 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={isScanning || !url.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
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
        <span className="text-slate-400 light:text-slate-500 font-medium text-[11px]">
          Quick Presets:
        </span>
        {sampleTargets.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setUrl(item.url)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 light:bg-slate-100 hover:bg-slate-800 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-[11px] border border-slate-700/60 light:border-slate-300 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
