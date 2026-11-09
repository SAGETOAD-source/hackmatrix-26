import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Palette,
  Terminal,
  ArrowRight,
  Check,
  AlertTriangle,
  Lock,
  Search,
  Eye,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Tabs from '../components/ui/Tabs'
import RiskGauge from '../components/results/RiskGauge'
import CertificateStepper from '../components/ui/CertificateStepper'
import BrandImpersonationDiff from '../components/ui/BrandImpersonationDiff'
import { useTheme } from '../context/ThemeContext'

export default function StyleguidePage() {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('tokens')
  const [sampleInput, setSampleInput] = useState('')
  const [gaugeScore, setGaugeScore] = useState(88)

  const navTabs = [
    { id: 'tokens', label: 'Color Tokens & Contrast' },
    { id: 'typography', label: 'Typography Specimen' },
    { id: 'primitives', label: 'Interactive UI Primitives' },
    { id: 'security-components', label: 'Cybersecurity Components' },
  ]

  const darkTokens = [
    { token: '--bg-base', hex: '#101C22', name: 'Void Ink', role: 'Default dark canvas background' },
    { token: '--bg-surface', hex: '#18343A', name: 'Deep Ultraviolet Surface', role: 'Card & sidebar surface' },
    { token: '--bg-elevated', hex: '#1E4047', name: 'Elevated Surface', role: 'Dropdowns, modal elevated layers' },
    { token: '--border-subtle', hex: '#24454C', name: 'Subtle Violet Border', role: 'Dividers & container borders' },
    { token: '--text-primary', hex: '#F5F7F6', name: 'Ice Violet Light', role: 'Primary high-contrast headings & text' },
    { token: '--text-muted', hex: '#A4B8B5', name: 'Lavender Muted', role: 'Subtitles, captions & secondary text' },
    { token: '--brand-primary', hex: '#167D83', name: 'Ultraviolet Core', role: 'Core brand identity & focus rings' },
    { token: '--brand-glow', hex: '#55B9AD', name: 'UV Light Beam', role: 'Ambient backdrops & active glows' },
    { token: '--brand-accent', hex: '#55B9AD', name: 'Acid Lime Highlight', role: 'Primary CTAs & high-impact accents' },
  ]

  const verdictTokens = [
    { verdict: 'safe', hex: '#55B9AD', name: 'Verifiable Safe', meaning: 'Legitimate destinations, passed security audits, trusted certificates' },
    { verdict: 'suspicious', hex: '#E9B65B', name: 'Heuristic Warning', meaning: 'High-entropy names, unverified certificates, missing OWASP headers' },
    { verdict: 'malicious', hex: '#EF6464', name: 'Confirmed Phishing', meaning: 'Critical threat feed hits, punycode spoofing, credential lures' },
    { verdict: 'unknown', hex: '#8B88B0', name: 'Pending Telemetry', meaning: 'Evaluating socket probes, unmapped IOC vectors' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#101C22] light:bg-[#E0F2ED] text-[#F5F7F6] light:text-[#101C22] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24454C] light:border-[#C2E2DA]">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] text-xs font-mono text-[#A4B8B5] light:text-[#4B6B67] mb-2">
              <Palette className="w-3.5 h-3.5 text-[#55B9AD] light:text-[#11786D]" />
              <span>PHISHGUARD DESIGN SYSTEM</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F7F6] light:text-[#101C22]">
              Component & Token Specifications
            </h1>
            <p className="text-xs sm:text-sm text-[#A4B8B5] light:text-[#4B6B67] mt-1 max-w-2xl">
              Strict design tokens, WCAG AA verified typography, isolated verdict palettes, and cybersecurity component specimens.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="md"
              icon={isDark ? Sun : Moon}
            >
              Toggle Mode ({isDark ? 'Dark' : 'Light'})
            </Button>
            <Button
              as={Link}
              to="/scanner"
              variant="primary"
              size="md"
              icon={Terminal}
            >
              Live Scanner
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          tabs={navTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab 1: Tokens & Contrast */}
        {activeTab === 'tokens' && (
          <div className="space-y-8">
            {/* Dark & Surface Tokens */}
            <div>
              <h3 className="font-heading font-bold text-lg text-[#F5F7F6] light:text-[#101C22] mb-1">
                Core Surface & Brand Palette
              </h3>
              <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mb-4">
                Calm, intelligent guardian aesthetic revealing threats under ultraviolet illumination.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {darkTokens.map((t) => (
                  <div
                    key={t.token}
                    className="p-4 rounded-xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg border border-white/10 shadow-xs" style={{ backgroundColor: t.hex }}></div>
                      <span className="text-xs font-mono font-bold text-[#F5F7F6] light:text-[#101C22]">{t.hex}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#F5F7F6] light:text-[#101C22]">{t.name}</div>
                      <div className="text-[10px] font-mono text-[#55B9AD] light:text-[#167D83]">{t.token}</div>
                      <div className="text-[11px] text-[#A4B8B5] light:text-[#4B6B67] mt-1">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict Colors Specification Banner */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-md space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#EF6464] font-bold">
                  GOVERNANCE MANDATE
                </span>
                <h3 className="font-heading font-bold text-base text-[#F5F7F6] light:text-[#101C22] mt-0.5">
                  Strict Reservation of Verdict Colors
                </h3>
                <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
                  The four verdict tokens below are strictly reserved for communicating threat risk meaning. They are never used for decorative elements, generic badges, or illustrative accents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {verdictTokens.map((v) => (
                  <div
                    key={v.verdict}
                    className="p-4 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge verdict={v.verdict} size="sm">
                        {v.verdict.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-[#F5F7F6] light:text-[#101C22]">{v.hex}</span>
                    </div>
                    <div className="font-semibold text-xs text-[#F5F7F6] light:text-[#101C22]">{v.name}</div>
                    <p className="text-[11px] text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">{v.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Typography */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#55B9AD] font-bold">
                  HEADINGS FONT
                </span>
                <h3 className="font-heading text-2xl font-bold text-[#F5F7F6] light:text-[#101C22] mt-1">
                  Space Grotesk (500, 600, 700)
                </h3>
                <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
                  Architectural, precise geometric sans-serif for page titles, card headers, and verdict banners.
                </p>
              </div>

              <div className="space-y-3 font-heading border-t border-[#24454C] light:border-[#C2E2DA] pt-4">
                <div className="text-4xl font-extrabold text-[#F5F7F6] light:text-[#101C22]">
                  Autonomous Sentinel SOC Console (4xl / 700)
                </div>
                <div className="text-2xl font-bold text-[#F5F7F6] light:text-[#101C22]">
                  Multi-Pillar Transport Cryptography Audit (2xl / 700)
                </div>
                <div className="text-lg font-semibold text-[#F5F7F6] light:text-[#101C22]">
                  Real-time Homoglyph & Shannon Character Entropy (lg / 600)
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#55B9AD] font-bold">
                  BODY FONT
                </span>
                <h3 className="text-2xl font-semibold text-[#F5F7F6] light:text-[#101C22] mt-1">
                  Inter (400, 500, 600)
                </h3>
                <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
                  Engineered for maximum legibility in high-density data matrices and operational descriptions.
                </p>
              </div>

              <div className="space-y-2 border-t border-[#24454C] light:border-[#C2E2DA] pt-4 text-xs sm:text-sm text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">
                <p>
                  Target URLs are checked against private non-routable IPv4/IPv6 address blocks prior to socket-level handshake simulation. All heuristic evaluations operate passively without executing untrusted browser scripts.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#55B9AD] font-bold">
                  EVIDENCE & TELEMETRY FONT
                </span>
                <h3 className="font-mono text-2xl font-bold text-[#F5F7F6] light:text-[#101C22] mt-1">
                  JetBrains Mono (400, 500, 700)
                </h3>
                <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
                  Clear character discrimination (0 vs O, 1 vs l) for domains, URLs, hashes, and cipher algorithms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] font-mono text-xs space-y-1.5 text-[#F5F7F6] light:text-[#101C22]">
                <div>&gt; target: https://paypal.com.verify-account-notice.xyz/login</div>
                <div>&gt; sha256: 8f4e2b01c37d8a9f4e2b01c37d8a9f4e2b01c37d8a9f4e2b01c37d8a9f4e2b01</div>
                <div>&gt; cipher: TLS_AES_256_GCM_SHA384 (KeyExchange: X25519)</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive UI Primitives */}
        {activeTab === 'primitives' && (
          <div className="space-y-8">
            {/* Buttons */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#55B9AD]">
                Button Component Hierarchy
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md" icon={ArrowRight}>
                  Primary Action (Acid Lime)
                </Button>
                <Button variant="secondary" size="md" icon={Shield}>
                  Secondary Action (UV)
                </Button>
                <Button variant="outline" size="md" icon={RefreshCw}>
                  Outline Action
                </Button>
                <Button variant="ghost" size="md">
                  Ghost Action
                </Button>
                <Button variant="primary" size="sm">
                  Small Button
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#55B9AD]">
                Verdict Badges (WCAG AA Contrast)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge verdict="safe" size="md">Safe / Legitimate</Badge>
                <Badge verdict="suspicious" size="md">Suspicious Anomaly</Badge>
                <Badge verdict="malicious" size="md">Phishing Confirmed</Badge>
                <Badge verdict="unknown" size="md">Pending Assessment</Badge>
              </div>
            </div>

            {/* Inputs */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#55B9AD]">
                Input Field with UV Focus Ring
              </h3>
              <div className="max-w-md">
                <Input
                  label="Target Domain or URL"
                  hint="Includes clear trigger and monospace typography"
                  placeholder="https://example.com"
                  mono
                  icon={Search}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Cybersecurity Components */}
        {activeTab === 'security-components' && (
          <div className="space-y-8">
            {/* Risk Gauge Slider Showcase */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#24454C] light:border-[#C2E2DA]">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#F5F7F6] light:text-[#101C22]">
                    Dynamic RiskGauge Component
                  </h3>
                  <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67]">
                    Interactive dual-arc SVG stroke with outer glow shifting across safe, suspicious, and malicious thresholds.
                  </p>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-[#A4B8B5]">Simulate Score:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gaugeScore}
                    onChange={(e) => setGaugeScore(Number(e.target.value))}
                    className="accent-[#167D83]"
                  />
                  <span className="font-bold text-[#F5F7F6] light:text-[#101C22] w-8 text-right">{gaugeScore}</span>
                </div>
              </div>

              <div className="flex items-center justify-center p-6 bg-[#101C22] light:bg-[#E0F2ED] rounded-2xl border border-[#24454C] light:border-[#C2E2DA]">
                <RiskGauge
                  score={gaugeScore}
                  size={180}
                />
              </div>
            </div>

            {/* Certificate Stepper */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base text-[#F5F7F6] light:text-[#101C22]">
                PKI Certificate Stepper Chain
              </h3>
              <CertificateStepper
                rootCA="ISRG Root X1 Authority"
                intermediateCA="R3 Let's Encrypt Intermediate CA"
                leafDomain="phishguard.sentinel.internal"
                validTo="2027-04-12"
              />
            </div>

            {/* Brand Impersonation Diff */}
            <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base text-[#F5F7F6] light:text-[#101C22]">
                Brand Impersonation Visual Diff
              </h3>
              <BrandImpersonationDiff
                targetUrl="http://paypa1-account-security-update.com/login"
                canonicalDomain="paypal.com"
                similarityScore={92}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

