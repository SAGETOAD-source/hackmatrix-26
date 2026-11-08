import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Loader2, Terminal, Sparkles } from 'lucide-react'
import Button from '../ui/Button'

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
    { label: 'Legitimate Repo', url: 'https://github.com/torvalds/linux' },
    { label: 'IRS Tax Lure', url: 'http://irs.gov.claim-tax-refund.top/form.php' },
  ]

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-sm mb-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C5CFF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#A78BFF]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-heading font-bold text-sm tracking-wide text-[#F2F0FF] light:text-[#1E1B4B]">
                Rapid URL Ingestion & Triage
              </h3>
            </div>
            <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-1">
              Submit target domain or link for immediate multi-pillar ML and transport security inspection
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A29FC9] group-focus-within:text-[#A78BFF] transition-colors" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste suspicious target URL or IP (e.g. http://paypal-verify-alert.xyz)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-[#F2F0FF] light:text-[#1E1B4B] placeholder-[#A29FC9]/60 focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={isScanning || !url.trim()}
            variant="primary"
            size="md"
            className="w-full sm:w-auto shrink-0"
            icon={isScanning ? Loader2 : ArrowRight}
          >
            {isScanning ? 'Triaging...' : 'Execute Triage'}
          </Button>
        </form>

        {/* Sample presets */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#A29FC9] light:text-[#6E6893] font-mono text-[11px] mr-1">
            Test Vectors:
          </span>
          {sampleTargets.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(item.url)}
              className="px-2.5 py-1 rounded-lg bg-[#0B0A14] light:bg-[#F2EDFF] hover:bg-[#1C1936] light:hover:bg-[#E9E4FE] text-[#A29FC9] hover:text-[#F2F0FF] light:text-[#5E3BEE] text-[11px] font-mono border border-[#2A2650] light:border-[#D4CDFA] transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
