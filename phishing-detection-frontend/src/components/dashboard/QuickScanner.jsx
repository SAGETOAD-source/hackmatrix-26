import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Loader2, Terminal } from 'lucide-react'

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
    }, 450)
  }

  const sampleTargets = [
    { label: 'PayPal Spoof', url: 'http://paypal.com.account-verification-notice.xyz/login.html' },
    { label: 'Raw IP Host', url: 'http://185.220.101.4:8080/apple/id/verification' },
    { label: 'Legitimate Domain', url: 'https://github.com/torvalds/linux' },
    { label: 'IRS Refund Lure', url: 'http://irs.gov.claim-tax-refund.top/form.php' },
  ]

  return (
    <div className="cyber-card p-4 sm:p-5 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-3.5">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#287FE9]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
              Rapid URL Ingestion & Triage
            </h3>
          </div>
          <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
            Submit suspicious link or IP destination for instant lexical and heuristic multi-pillar triage
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL or domain (e.g. http://paypal-verify-alert.xyz/login)..."
            className="w-full pl-10 pr-3 py-2 rounded-md text-xs font-mono bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9]"
          />
        </div>
        <button
          type="submit"
          disabled={isScanning || !url.trim()}
          className="cyber-btn-primary w-full sm:w-auto text-xs py-2 px-4 whitespace-nowrap"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Triaging...</span>
            </>
          ) : (
            <>
              <span>Execute Triage</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </button>
      </form>

      {/* Sample presets */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[#9EACC2] light:text-[#64748B] font-mono text-[11px] mr-1">
          Simulated Vectors:
        </span>
        {sampleTargets.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setUrl(item.url)}
            className="px-2 py-0.5 rounded bg-[#0D1728] light:bg-slate-100 hover:bg-[#15253F] light:hover:bg-slate-200 text-[#9EACC2] light:text-[#172033] text-[11px] font-mono border border-[#24344B] light:border-[#E2E8F0] transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
