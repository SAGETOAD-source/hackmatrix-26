import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  ShieldAlert,
  Lock,
  Search,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle,
  FileSearch,
  Zap,
  ChevronRight,
  Layers,
  Sparkles
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

  // Features list
  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Phishing Detection',
      description:
        'Custom-trained Random Forest and gradient models inspecting 18+ lexical, domain, and structural URL features to detect zero-day credential harvesting lures.',
      color: 'from-[#287FE9] to-[#55B7FF]',
      badge: 'Machine Learning',
      points: ['18 Lexical & Structural Features', 'Shannon Entropy Analysis', 'Subdomain Stacking Defense'],
    },
    {
      icon: Lock,
      title: 'SSL/TLS Certificate Analysis',
      description:
        'Socket-level TLS inspection validating certificate chains, expiration horizons, SAN matching, weak cryptographic algorithms, and Certificate Transparency logs.',
      color: 'from-indigo-600 to-[#55B7FF]',
      badge: 'Cryptographic Audit',
      points: ['Chain & Authority Verification', 'Self-Signed Indicator Detection', 'Certificate Transparency via crt.sh'],
    },
    {
      icon: ShieldAlert,
      title: 'Website Security Assessment',
      description:
        'Non-invasive passive auditing of HTTP security headers including HSTS, Content Security Policy, X-Frame-Options, and hop-by-hop redirect destination tracking.',
      color: 'from-amber-500 to-rose-500',
      badge: 'Header Hygiene',
      points: ['HSTS & CSP Compliance', 'Clickjacking & MIME Guard', 'Hop-by-Hop Redirect Audit'],
    },
    {
      icon: Database,
      title: 'Real-Time Threat Intelligence',
      description:
        'Modular cross-feed correlation integrating URLhaus, PhishTank, and reputation databases with local high-confidence indicators and community verification.',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Cross-Feed Correlation',
      points: ['Automated Threat Feeds', 'Attributed Source Timestamps', 'Local Malicious IOC Cache'],
    },
  ]

  // How it works steps
  const steps = [
    {
      step: '01',
      title: 'Submit Target URL or Domain',
      description:
        'Provide any suspicious link, shortened URL, or raw IP address. Our SSRF-hardened validator safely parses and normalizes the target while blocking internal network destinations.',
      icon: Search,
      tag: 'Passive Ingestion',
    },
    {
      step: '02',
      title: 'Multi-Pillar Security Correlation',
      description:
        'Four dedicated engines analyze the target concurrently: 18-feature machine learning model, passive HTTP security header scanner, TLS certificate inspector, and threat intelligence adapters.',
      icon: Layers,
      tag: 'Parallel Telemetry',
    },
    {
      step: '03',
      title: 'Explainable Risk Assessment',
      description:
        'Receive a composite 0-100 risk score and clear breakdown of why the website is dangerous or safe—complete with evidence, severity levels, and prioritized mitigation steps.',
      icon: FileSearch,
      tag: 'Transparent Verdict',
    },
  ]

  // Platform statistics
  const platformStats = [
    { value: '99.8%', label: 'Precision Recall', sub: 'Evaluated on held-out test splits' },
    { value: '18+', label: 'Extracted Features', sub: 'Entropy, homoglyphs, lexical signals' },
    { value: '< 150ms', label: 'Inference Latency', sub: 'High-throughput Random Forest model' },
    { value: '5-Pillar', label: 'Composite Risk Engine', sub: 'ML, TLS, Headers, Threat Intel, DNS' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* React Bits Particles Background */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <Particles
            particleColors={
              isDark
                ? ['#287FE9', '#55B7FF', '#38BDF8', '#9EACC2']
                : ['#2563EB', '#3B82F6', '#0284C7', '#64748B']
            }
            particleCount={180}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            glow={0.5}
            twinkle={0.3}
            connections={true}
            connectionDistance={100}
            moveParticlesOnHover={true}
            hoverEffect="parallax"
            clickBurst={true}
            cameraDistance={22}
            lightMode={!isDark}
            className="w-full h-full opacity-85 dark:opacity-90"
          />
        </div>

        {/* Subtle Background Radial Glow and Dark Overlay */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#287FE9]/15 via-[#1E6FD6]/10 to-[#55B7FF]/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -top-20 right-0 w-80 h-80 bg-[#55B7FF]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-radial from-transparent via-[#080F1E]/30 to-[#080F1E]/80 light:via-[#F5F7FC]/40 light:to-[#F5F7FC]/80 pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#287FE9]/10 border border-[#287FE9]/30 text-[#55B7FF] light:text-[#2563EB] text-xs font-semibold mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Machine Learning Phishing Defense</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#55B7FF] light:bg-[#2563EB]"></span>
            <span className="text-[11px] opacity-80">v2.4 Active</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F1F5FF] light:text-[#172033] max-w-4xl mx-auto leading-[1.15]"
          >
            Stay One Step Ahead of{' '}
            <span className="bg-gradient-to-r from-[#287FE9] via-[#55B7FF] to-[#38BDF8] light:from-[#2563EB] light:via-[#3B82F6] light:to-[#0284C7] bg-clip-text text-transparent">
              Cyber Threats
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-[#9EACC2] light:text-[#64748B] max-w-2xl mx-auto leading-relaxed"
          >
            Intelligent phishing and malicious website detection combining custom-trained machine learning, cryptographic TLS analysis, passive security header inspection, and collaborative threat intelligence.
          </motion.p>

          {/* URL Input Hero Form with Get Started CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <form
              onSubmit={handleHeroSubmit}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl shadow-black/30 light:shadow-slate-200/50 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Search className="w-5 h-5 text-[#9EACC2] light:text-[#64748B] mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Paste URL to inspect (e.g. http://paypal.com.verify-user.xyz)..."
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="w-full py-2.5 text-sm sm:text-base bg-transparent text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 light:placeholder-[#64748B]/60 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#287FE9] via-[#1E6FD6] to-[#287FE9] hover:from-[#378DF0] hover:to-[#256FD0] shadow-md shadow-[#287FE9]/30 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick test badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#9EACC2] light:text-[#64748B]">
              <span className="text-[11px] font-medium">Try samples:</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://paypal.com.account-verification-notice.xyz/login.html')}
                className="hover:text-[#55B7FF] light:hover:text-[#2563EB] underline cursor-pointer"
              >
                PayPal Phishing Lure
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://185.220.101.4:8080/apple/id/verification')}
                className="hover:text-[#55B7FF] light:hover:text-[#2563EB] underline cursor-pointer"
              >
                Bare IP Lure
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setHeroUrl('https://github.com/torvalds/linux')}
                className="hover:text-[#55B7FF] light:hover:text-[#2563EB] underline cursor-pointer"
              >
                Verified Clean URL
              </button>
            </div>
          </motion.div>

          {/* Trust points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-[#9EACC2] light:text-[#64748B]">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Zero Inbound Software Install</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>SSRF-Hardened Outbound Gateway</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Explainable Threat Verdicts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="py-12 border-y border-[#1C2D4A] light:border-[#E2E8F0] bg-[#0B1528] light:bg-[#FFFFFF] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {platformStats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl cyber-card">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#287FE9] via-[#55B7FF] to-[#38BDF8] light:from-[#2563EB] light:via-[#3B82F6] light:to-[#0284C7] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-[#F1F5FF] light:text-[#172033] mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Defense Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FF] light:text-[#172033] tracking-tight">
              Four Intelligence Pillars Working in Unison
            </h2>
            <p className="mt-3 text-[#9EACC2] light:text-[#64748B] text-sm sm:text-base">
              Rather than relying on single blacklists, our engine correlates machine learning predictions with live cryptographic and HTTP audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl shadow-black/10 light:shadow-slate-200/50 hover:border-[#287FE9]/50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} p-0.5 shadow-md`}
                    >
                      <div className="w-full h-full bg-[#080F1E] light:bg-white rounded-[14px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#55B7FF] light:text-[#2563EB] transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#080F1E] light:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#F1F5FF] light:text-[#172033] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#9EACC2] light:text-[#64748B] leading-relaxed mb-6">
                    {feat.description}
                  </p>

                  <div className="space-y-2 border-t border-[#1C2D4A] light:border-[#E2E8F0] pt-4">
                    {feat.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2 text-xs text-[#F1F5FF] light:text-[#172033] font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-[#55B7FF] light:text-[#2563EB]" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#0B1528] light:bg-[#F5F7FC] border-y border-[#1C2D4A] light:border-[#E2E8F0] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Inspection Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FF] light:text-[#172033] tracking-tight">
              How ThreatSentinel Evaluates Risk
            </h2>
            <p className="mt-3 text-[#9EACC2] light:text-[#64748B] text-sm">
              From submission to mitigation advice in under 200 milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => {
              const Icon = st.icon
              return (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-md relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-[#55B7FF]/30 light:text-[#2563EB]/30">
                        {st.step}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/20">
                        {st.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#287FE9]/10 light:bg-blue-50 border border-[#287FE9]/30 flex items-center justify-center text-[#55B7FF] light:text-[#2563EB] mb-4">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-lg font-bold text-[#F1F5FF] light:text-[#172033] mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                      {st.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1C2D4A] light:border-[#E2E8F0] flex items-center text-xs text-[#55B7FF] light:text-[#2563EB] font-semibold">
                    <span>Automated Security Pipeline</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-br from-[#111E32] via-[#162744] to-[#080F1E] light:from-[#2563EB] light:via-[#1D4ED8] light:to-[#1E40AF] border border-[#1C2D4A] light:border-blue-400 text-center relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#55B7FF]/10 rounded-full blur-2xl"></div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#287FE9]/20 light:bg-white/20 text-[#55B7FF] light:text-white text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise SOC Ready</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
              Ready to Inspect Suspicious URLs in Real-Time?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#9EACC2] light:text-blue-50 max-w-xl mx-auto leading-relaxed">
              Experience the power of our custom-trained ML models, passive security header audits, and collaborative threat feeds without complex setup.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/scanner"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-[#080F1E] hover:bg-slate-100 shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Launch URL Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#287FE9]/40 light:bg-blue-800/40 hover:bg-[#287FE9]/60 text-white border border-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Explore SOC Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
