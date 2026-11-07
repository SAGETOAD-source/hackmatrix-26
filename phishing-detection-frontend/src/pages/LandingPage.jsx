import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Terminal,
  Check,
  Server,
  ArrowUpRight
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Particles from '../components/backgrounds/Particles'
import { useTheme } from '../context/ThemeContext'

export default function LandingPage() {
  const { isDark } = useTheme()
  const [heroUrl, setHeroUrl] = useState('')
  const navigate = useNavigate()

  const handleHeroSubmit = (e) => {
    e.preventDefault()
    if (!heroUrl.trim()) {
      navigate('/scanner')
      return
    }
    navigate(`/scanner?url=${encodeURIComponent(heroUrl.trim())}`)
  }

  // Realistic attack vectors matrix
  const vectorMatrix = [
    {
      threat: 'Credential Harvesting Lure',
      sample: 'paypal.com.verify-account-notice.xyz/login',
      indicator: 'Multi-subdomain stacking + Shannon entropy spike',
      engine: '18-Feature Lexical Model',
      verdict: 'PHISHING (Score 94)',
      verdictType: 'danger'
    },
    {
      threat: 'Punycode Homoglyph Impersonation',
      sample: 'xn--googl-pra.com/auth/oauth',
      indicator: 'Cyrillic character substitution (U+0430)',
      engine: 'IDN Unicode Normalizer',
      verdict: 'PHISHING (Score 96)',
      verdictType: 'danger'
    },
    {
      threat: 'Direct Raw IP Egress Link',
      sample: 'http://185.220.101.4:8080/apple/id',
      indicator: 'Bare IPv4 destination + non-standard port 8080',
      engine: 'SSRF & Boundary Inspector',
      verdict: 'SUSPICIOUS (Score 78)',
      verdictType: 'warning'
    },
    {
      threat: 'Verified Enterprise Destination',
      sample: 'https://github.com/torvalds/linux',
      indicator: 'EV Certificate + HSTS preload + zero lure tokens',
      engine: 'Cryptographic & Header Audit',
      verdict: 'LEGITIMATE (Score 4)',
      verdictType: 'success'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#24344B] light:border-[#E2E8F0]">
        {/* React Bits Particles Background */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <Particles
            particleColors={
              isDark
                ? ['#287FE9', '#55B7FF', '#38BDF8', '#9EACC2']
                : ['#2563EB', '#3B82F6', '#0284C7', '#64748B']
            }
            particleCount={140}
            particleSpread={10}
            speed={0.08}
            particleBaseSize={80}
            glow={0.4}
            twinkle={0.25}
            connections={true}
            connectionDistance={95}
            moveParticlesOnHover={true}
            hoverEffect="parallax"
            clickBurst={true}
            cameraDistance={24}
            lightMode={!isDark}
            className="w-full h-full opacity-60 dark:opacity-75"
          />
        </div>

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-[#080F1E]/50 light:bg-[#F5F7FC]/60 pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Engineering Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#0D1728] light:bg-white border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono text-[#9EACC2] light:text-[#64748B] mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>PHISHGUARD DEFENSIVE INTELLIGENCE v2.4</span>
          </div>

          {/* Headline (Confident, Restrained, Human-Crafted) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] max-w-3xl mx-auto leading-tight">
            Intelligent Phishing & Malicious Website Detection
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-[#9EACC2] light:text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Multi-pillar cybersecurity platform evaluating URL lexical entropy, transport cryptography, passive HTTP security header hygiene, and collaborative threat intelligence feeds.
          </p>

          {/* Interactive URL Inspection Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSubmit}
              className="p-1.5 rounded-lg cyber-card flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Terminal className="w-4 h-4 text-[#9EACC2] light:text-[#64748B] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Paste URL or domain to audit (e.g. paypal-verify-account.xyz)..."
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="w-full py-2 text-xs sm:text-sm font-mono bg-transparent text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="cyber-btn-primary w-full sm:w-auto text-xs font-semibold py-2.5 px-4 shrink-0 space-x-1.5"
              >
                <span>Analyze Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Sample Vectors */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#9EACC2] light:text-[#64748B]">
              <span className="text-[11px]">Inspect Samples:</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://paypal.com.account-verification-notice.xyz/login.html')}
                className="hover:text-[#287FE9] underline cursor-pointer"
              >
                PayPal Phish
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://185.220.101.4:8080/apple/id/verification')}
                className="hover:text-[#287FE9] underline cursor-pointer"
              >
                Bare IP Host
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setHeroUrl('https://github.com/torvalds/linux')}
                className="hover:text-[#287FE9] underline cursor-pointer"
              >
                Legitimate Domain
              </button>
            </div>
          </div>

          {/* Architecture Trust Highlights */}
          <div className="mt-10 pt-6 border-t border-[#24344B]/60 light:border-[#E2E8F0] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
              <span className="text-[10px] font-mono uppercase text-[#9EACC2] block">Engine 01</span>
              <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033] block mt-0.5">18 Lexical Signals</span>
              <span className="text-[11px] text-[#9EACC2] block mt-0.5">Entropy, tokens, length</span>
            </div>
            <div className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
              <span className="text-[10px] font-mono uppercase text-[#9EACC2] block">Engine 02</span>
              <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033] block mt-0.5">TLS Cryptography</span>
              <span className="text-[11px] text-[#9EACC2] block mt-0.5">SAN matching, CT logs</span>
            </div>
            <div className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
              <span className="text-[10px] font-mono uppercase text-[#9EACC2] block">Engine 03</span>
              <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033] block mt-0.5">Header Hygiene</span>
              <span className="text-[11px] text-[#9EACC2] block mt-0.5">HSTS, CSP, X-Frame</span>
            </div>
            <div className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
              <span className="text-[10px] font-mono uppercase text-[#9EACC2] block">Engine 04</span>
              <span className="text-xs font-semibold text-[#F1F5FF] light:text-[#172033] block mt-0.5">Threat Correlation</span>
              <span className="text-[11px] text-[#9EACC2] block mt-0.5">PhishTank & URLhaus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Threat Classification Matrix */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#287FE9]">
              DETECTION PLAYBOOK
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] mt-0.5">
              Multi-Pillar Attack Vector Interception
            </h2>
            <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
              How different threat methodologies are isolated and scored across our defensive engines
            </p>
          </div>
          <Link
            to="/scanner"
            className="text-xs font-mono font-semibold text-[#287FE9] hover:underline flex items-center space-x-1"
          >
            <span>Launch Interactive Scanner</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0D1728] light:bg-slate-50 text-[10px] uppercase text-[#9EACC2] border-b border-[#24344B] light:border-[#E2E8F0]">
                <tr>
                  <th className="py-2.5 px-4">Threat Methodology</th>
                  <th className="py-2.5 px-4">Sample Lure Vector</th>
                  <th className="py-2.5 px-4">Primary Anomaly Signal</th>
                  <th className="py-2.5 px-4">Interception Engine</th>
                  <th className="py-2.5 px-4 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24344B]/60 light:divide-[#E2E8F0]">
                {vectorMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#15253F]/40 light:hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#F1F5FF] light:text-[#172033] whitespace-nowrap">
                      {row.threat}
                    </td>
                    <td className="py-3 px-4 text-[#9EACC2] light:text-[#64748B] truncate max-w-xs">
                      {row.sample}
                    </td>
                    <td className="py-3 px-4 text-[#9EACC2] light:text-[#64748B]">
                      {row.indicator}
                    </td>
                    <td className="py-3 px-4 text-[#F1F5FF] light:text-[#172033]">
                      {row.engine}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.verdictType === 'danger'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                            : row.verdictType === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        }`}
                      >
                        {row.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Live Feature Inspector & SOC Preview */}
      <section className="py-14 bg-[#0D1728] light:bg-[#F0F4FA] border-y border-[#24344B] light:border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#287FE9]">
                HEURISTIC EXPLAINABILITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] mt-1">
                Zero Black-Box Scoring. Every Verdict Backed by Evidence.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                Rather than returning an opaque prediction, PhishGuard provides actionable telemetry across 18 lexical features, certificate transparency validation, and passive security header hygiene.
              </p>

              <div className="mt-6 space-y-3 text-xs font-mono">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block">Shannon Character Entropy Calculation</span>
                    <span className="text-[#9EACC2] light:text-[#64748B]">Detects algorithmically generated domains (DGA) and randomized credential harvesting slugs.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block">Cryptographic SAN & CT Log Auditing</span>
                    <span className="text-[#9EACC2] light:text-[#64748B]">Validates Subject Alternative Names and monitors Certificate Transparency public append logs.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block">Passive HTTP Header Compliance</span>
                    <span className="text-[#9EACC2] light:text-[#64748B]">Non-invasive verification of Strict-Transport-Security, CSP, X-Frame-Options, and hop redirects.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#24344B]/60 light:border-[#CBD5E1]">
                <Link
                  to="/security-analysis"
                  className="cyber-btn-secondary text-xs space-x-1.5 py-2 px-3.5"
                >
                  <Server className="w-3.5 h-3.5 text-[#287FE9]" />
                  <span>Explore Security Analysis Studio</span>
                </Link>
              </div>
            </div>

            {/* Interactive Terminal Telemetry Widget */}
            <div className="cyber-card p-4 sm:p-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#24344B] light:border-[#E2E8F0]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] text-[#9EACC2] light:text-[#64748B] ml-2">triage_inspector.py &bull; live evaluation</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  CRITICAL_RISK (94/100)
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] leading-relaxed text-[#9EACC2] light:text-[#64748B]">
                <p><span className="text-[#287FE9]">&gt;</span> target: <span className="text-[#F1F5FF] light:text-[#172033]">http://paypal.com.verify-user.xyz/login</span></p>
                <p><span className="text-[#287FE9]">&gt;</span> lexical.url_length: <span className="text-amber-400">42 chars</span> (flagged)</p>
                <p><span className="text-[#287FE9]">&gt;</span> lexical.domain_entropy: <span className="text-rose-400 font-bold">4.72 bits</span> (high randomized variance)</p>
                <p><span className="text-[#287FE9]">&gt;</span> lexical.subdomain_count: <span className="text-rose-400 font-bold">3 subdomains</span> (brand spoof stacking)</p>
                <p><span className="text-[#287FE9]">&gt;</span> transport.ssl_status: <span className="text-rose-400 font-bold">INSECURE_HTTP (No TLS)</span></p>
                <p><span className="text-[#287FE9]">&gt;</span> headers.strict_transport_security: <span className="text-rose-400">MISSING</span></p>
                <p><span className="text-[#287FE9]">&gt;</span> threat_intel.urlhaus_match: <span className="text-rose-400 font-bold">MATCH (IOC #49281)</span></p>
                <div className="pt-2 mt-2 border-t border-[#24344B]/60 light:border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#F1F5FF] light:text-[#172033] font-bold">Verdict: PHISHING CONFIRMED</span>
                  <span className="text-emerald-400 font-semibold">Confidence: 99.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033]">
          Audit Any URL or Ingest Threat Telemetry Today
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#9EACC2] light:text-[#64748B] max-w-lg mx-auto">
          Built for security operations teams, incident responders, and compliance audits. Zero software installation required.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/scanner"
            className="cyber-btn-primary text-xs font-semibold py-2.5 px-5 space-x-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Launch URL Threat Scanner</span>
          </Link>
          <Link
            to="/dashboard"
            className="cyber-btn-secondary text-xs font-medium py-2.5 px-4"
          >
            <span>Open SOC Dashboard</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
