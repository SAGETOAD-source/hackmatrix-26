import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Terminal,
  Check,
  Server,
  ArrowUpRight,
  Shield,
  Zap,
  Lock,
  Cpu
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Particles from '../components/backgrounds/Particles'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import BrandImpersonationDiff from '../components/ui/BrandImpersonationDiff'

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
      verdictText: 'PHISHING (Score 94)',
      verdict: 'malicious'
    },
    {
      threat: 'Punycode Homoglyph Impersonation',
      sample: 'xn--googl-pra.com/auth/oauth',
      indicator: 'Cyrillic character substitution (U+0430)',
      engine: 'IDN Unicode Normalizer',
      verdictText: 'PHISHING (Score 96)',
      verdict: 'malicious'
    },
    {
      threat: 'Direct Raw IP Egress Link',
      sample: 'http://185.220.101.4:8080/apple/id',
      indicator: 'Bare IPv4 destination + non-standard port 8080',
      engine: 'SSRF & Boundary Inspector',
      verdictText: 'SUSPICIOUS (Score 78)',
      verdict: 'suspicious'
    },
    {
      threat: 'Verified Enterprise Destination',
      sample: 'https://github.com/torvalds/linux',
      indicator: 'EV Certificate + HSTS preload + zero lure tokens',
      engine: 'Cryptographic & Header Audit',
      verdictText: 'LEGITIMATE (Score 4)',
      verdict: 'safe'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0A14] light:bg-[#F7F5FF] text-[#F2F0FF] light:text-[#1E1B4B] transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28 border-b border-[#2A2650] light:border-[#E2DEFA]">
        {/* React Bits Particles Background with Ultraviolet palette */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <Particles
            particleColors={
              isDark
                ? ['#7C5CFF', '#A78BFF', '#C6FF3D', '#34E0A1']
                : ['#5E3BEE', '#7C5CFF', '#059669', '#6E6893']
            }
            particleCount={130}
            particleSpread={12}
            speed={0.07}
            particleBaseSize={85}
            glow={0.4}
            twinkle={0.25}
            connections={true}
            connectionDistance={100}
            moveParticlesOnHover={true}
            hoverEffect="parallax"
            clickBurst={true}
            cameraDistance={24}
            lightMode={!isDark}
            className="w-full h-full opacity-60 dark:opacity-75"
          />
        </div>

        {/* Ambient Dark UV Glow Overlay */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#7C5CFF]/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Engineering Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#D4CDFA] text-xs font-mono text-[#A29FC9] light:text-[#6E6893] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#34E0A1] animate-pulse"></span>
            <span className="font-semibold text-[#F2F0FF] light:text-[#1E1B4B]">PHISHGUARD SENTINEL INTELLIGENCE v2.4</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F2F0FF] light:text-[#1E1B4B] max-w-4xl mx-auto leading-tight">
            Reveal Hidden Threats <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFF] via-[#7C5CFF] to-[#C6FF3D] light:to-[#5E8F00]">
              Under Ultraviolet Telemetry
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-[#A29FC9] light:text-[#6E6893] max-w-2xl mx-auto leading-relaxed">
            Autonomous multi-pillar cybersecurity engine evaluating URL lexical entropy, transport cryptography, passive HTTP security header hygiene, and collaborative threat intelligence feeds.
          </p>

          {/* Interactive URL Inspection Bar */}
          <div className="mt-9 max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSubmit}
              className="p-2 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-xl shadow-[#7C5CFF]/10 flex flex-col sm:flex-row items-center gap-2 transition-all hover:border-[#7C5CFF]/50"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Terminal className="w-4 h-4 text-[#A78BFF] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Paste URL or domain to audit (e.g. paypal-verify-account.xyz)..."
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="w-full py-2.5 text-xs sm:text-sm font-mono bg-transparent text-[#F2F0FF] light:text-[#1E1B4B] placeholder-[#A29FC9]/60 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto shrink-0 shadow-md"
                icon={ArrowRight}
              >
                Inspect Target
              </Button>
            </form>

            {/* Quick Sample Vectors */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#A29FC9] light:text-[#6E6893]">
              <span className="text-[11px]">Inspect Samples:</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://paypal.com.account-verification-notice.xyz/login.html')}
                className="hover:text-[#C6FF3D] light:hover:text-[#5E8F00] underline cursor-pointer"
              >
                PayPal Phish
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://185.220.101.4:8080/apple/id/verification')}
                className="hover:text-[#C6FF3D] light:hover:text-[#5E8F00] underline cursor-pointer"
              >
                Bare IP Host
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setHeroUrl('https://github.com/torvalds/linux')}
                className="hover:text-[#C6FF3D] light:hover:text-[#5E8F00] underline cursor-pointer"
              >
                Legitimate Domain
              </button>
            </div>
          </div>

          {/* Architecture Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-[#2A2650]/60 light:border-[#E2DEFA] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[#A78BFF] block font-semibold">Engine 01</span>
              <span className="text-xs font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block mt-0.5">18 Lexical Signals</span>
              <span className="text-[11px] text-[#A29FC9] light:text-[#6E6893] block mt-0.5">Entropy, tokens, length</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[#A78BFF] block font-semibold">Engine 02</span>
              <span className="text-xs font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block mt-0.5">TLS Cryptography</span>
              <span className="text-[11px] text-[#A29FC9] light:text-[#6E6893] block mt-0.5">SAN matching, CT logs</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[#A78BFF] block font-semibold">Engine 03</span>
              <span className="text-xs font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block mt-0.5">Header Hygiene</span>
              <span className="text-[11px] text-[#A29FC9] light:text-[#6E6893] block mt-0.5">HSTS, CSP, X-Frame</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[#A78BFF] block font-semibold">Engine 04</span>
              <span className="text-xs font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block mt-0.5">Threat Feeds</span>
              <span className="text-[11px] text-[#A29FC9] light:text-[#6E6893] block mt-0.5">PhishTank & URLhaus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Impersonation Spotlight Diff Showcase */}
      <section className="py-12 bg-[#14122A]/40 light:bg-[#F2EDFF]/40 border-b border-[#2A2650] light:border-[#E2DEFA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A78BFF]">
              REAL-TIME HOMOGLYPH & SPOOF DECOMPILER
            </span>
            <h3 className="font-heading font-bold text-lg text-[#F2F0FF] light:text-[#1E1B4B] mt-1">
              Visual Token Dissection of Brand Spoofs
            </h3>
          </div>

          <BrandImpersonationDiff
            targetUrl="http://paypal.com.verify-security-alert.xyz/auth/login"
            canonicalDomain="paypal.com"
            similarityScore={94}
          />
        </div>
      </section>

      {/* Real-World Threat Classification Matrix */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A78BFF]">
              DETECTION PLAYBOOK
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#F2F0FF] light:text-[#1E1B4B] mt-0.5">
              Multi-Pillar Attack Vector Interception
            </h2>
            <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-0.5">
              How diverse phishing methodologies are parsed, scored, and isolated by our defensive engines
            </p>
          </div>
          <Link
            to="/scanner"
            className="text-xs font-mono font-semibold text-[#A78BFF] light:text-[#7C5CFF] hover:underline flex items-center space-x-1"
          >
            <span>Launch Interactive Scanner</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0B0A14]/70 light:bg-[#F7F5FF] text-[10px] uppercase text-[#A29FC9] light:text-[#6E6893] border-b border-[#2A2650] light:border-[#E2DEFA]">
                <tr>
                  <th className="py-3 px-5">Threat Methodology</th>
                  <th className="py-3 px-5">Sample Lure Vector</th>
                  <th className="py-3 px-5">Primary Anomaly Signal</th>
                  <th className="py-3 px-5">Interception Engine</th>
                  <th className="py-3 px-5 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2650]/60 light:divide-[#E2DEFA]">
                {vectorMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1C1936]/40 light:hover:bg-[#F7F5FF] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#F2F0FF] light:text-[#1E1B4B] whitespace-nowrap">
                      {row.threat}
                    </td>
                    <td className="py-3.5 px-5 text-[#A29FC9] light:text-[#6E6893] truncate max-w-xs">
                      {row.sample}
                    </td>
                    <td className="py-3.5 px-5 text-[#A29FC9] light:text-[#6E6893]">
                      {row.indicator}
                    </td>
                    <td className="py-3.5 px-5 text-[#F2F0FF] light:text-[#1E1B4B]">
                      {row.engine}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Badge verdict={row.verdict} size="sm">
                        {row.verdictText}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Heuristic Explainability & Live Terminal Preview */}
      <section className="py-16 bg-[#14122A]/60 light:bg-[#F2EDFF]/40 border-y border-[#2A2650] light:border-[#E2DEFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A78BFF]">
                HEURISTIC EXPLAINABILITY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F0FF] light:text-[#1E1B4B] mt-1">
                Zero Black-Box Scoring. Every Verdict Backed by Evidence.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
                Rather than returning an opaque prediction, PhishGuard provides actionable telemetry across 18 lexical features, certificate transparency validation, and passive security header hygiene.
              </p>

              <div className="mt-6 space-y-3.5 text-xs font-mono">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-md bg-[#34E0A1]/15 border border-[#34E0A1]/30 flex items-center justify-center text-[#34E0A1] shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block">Shannon Character Entropy Calculation</span>
                    <span className="text-[#A29FC9] light:text-[#6E6893]">Detects algorithmically generated domains (DGA) and randomized credential harvesting slugs.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-md bg-[#34E0A1]/15 border border-[#34E0A1]/30 flex items-center justify-center text-[#34E0A1] shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block">Cryptographic SAN & CT Log Auditing</span>
                    <span className="text-[#A29FC9] light:text-[#6E6893]">Validates Subject Alternative Names and monitors Certificate Transparency public append logs.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-md bg-[#34E0A1]/15 border border-[#34E0A1]/30 flex items-center justify-center text-[#34E0A1] shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block">Passive HTTP Header Compliance</span>
                    <span className="text-[#A29FC9] light:text-[#6E6893]">Non-invasive verification of Strict-Transport-Security, CSP, X-Frame-Options, and hop redirects.</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-[#2A2650]/60 light:border-[#E2DEFA]">
                <Button
                  as={Link}
                  to="/security-analysis"
                  variant="secondary"
                  size="sm"
                  icon={Server}
                >
                  Explore Deep Security Studio
                </Button>
              </div>
            </div>

            {/* Interactive Terminal Telemetry Widget */}
            <div className="p-5 rounded-2xl bg-[#0B0A14] light:bg-[#FFFFFF] border border-[#2A2650] light:border-[#E2DEFA] shadow-xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#2A2650] light:border-[#E2DEFA]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFB020]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34E0A1]"></span>
                  <span className="text-[11px] text-[#A29FC9] light:text-[#6E6893] ml-2">sentinel_triage.py &bull; live evaluation</span>
                </div>
                <Badge verdict="malicious" size="sm">
                  CRITICAL_RISK (94/100)
                </Badge>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed text-[#A29FC9] light:text-[#6E6893]">
                <p><span className="text-[#7C5CFF]">&gt;</span> target: <span className="text-[#F2F0FF] light:text-[#1E1B4B]">http://paypal.com.verify-user.xyz/login</span></p>
                <p><span className="text-[#7C5CFF]">&gt;</span> lexical.url_length: <span className="text-[#FFB020]">42 chars</span> (flagged)</p>
                <p><span className="text-[#7C5CFF]">&gt;</span> lexical.domain_entropy: <span className="text-[#FF4D6D] font-bold">4.72 bits</span> (randomized token variance)</p>
                <p><span className="text-[#7C5CFF]">&gt;</span> lexical.subdomain_count: <span className="text-[#FF4D6D] font-bold">3 subdomains</span> (brand spoof stacking)</p>
                <p><span className="text-[#7C5CFF]">&gt;</span> transport.ssl_status: <span className="text-[#FF4D6D] font-bold">INSECURE_HTTP (No TLS)</span></p>
                <p><span className="text-[#7C5CFF]">&gt;</span> headers.strict_transport_security: <span className="text-[#FF4D6D]">MISSING</span></p>
                <p><span className="text-[#7C5CFF]">&gt;</span> threat_intel.urlhaus_match: <span className="text-[#FF4D6D] font-bold">MATCH (IOC #49281)</span></p>
                <div className="pt-3 mt-3 border-t border-[#2A2650]/60 light:border-[#E2DEFA] flex items-center justify-between text-xs">
                  <span className="text-[#F2F0FF] light:text-[#1E1B4B] font-bold">Verdict: PHISHING CONFIRMED</span>
                  <span className="text-[#34E0A1] font-semibold">Confidence: 99.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F0FF] light:text-[#1E1B4B]">
          Audit Any URL or Ingest Threat Telemetry Today
        </h2>
        <p className="mt-2.5 text-xs sm:text-sm text-[#A29FC9] light:text-[#6E6893] max-w-lg mx-auto leading-relaxed">
          Engineered for cybersecurity incident responders, threat analysts, and compliance audits. Zero software setup required.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            as={Link}
            to="/scanner"
            variant="primary"
            size="md"
            icon={Terminal}
          >
            Launch URL Threat Scanner
          </Button>
          <Button
            as={Link}
            to="/dashboard"
            variant="secondary"
            size="md"
          >
            Open SOC Dashboard
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
