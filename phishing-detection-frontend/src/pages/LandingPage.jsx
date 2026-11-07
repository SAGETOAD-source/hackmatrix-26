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

export default function LandingPage() {
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
      color: 'from-blue-600 to-cyan-500',
      badge: 'Machine Learning',
      points: ['18 Lexical & Structural Features', 'Shannon Entropy Analysis', 'Subdomain Stacking Defense'],
    },
    {
      icon: Lock,
      title: 'SSL/TLS Certificate Analysis',
      description:
        'Socket-level TLS inspection validating certificate chains, expiration horizons, SAN matching, weak cryptographic algorithms, and Certificate Transparency logs.',
      color: 'from-indigo-600 to-violet-500',
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
    <div className="min-h-screen flex flex-col bg-[#0a0f1d] light:bg-[#f8fafc] text-slate-100 light:text-slate-900 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -top-24 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 light:text-blue-700 text-xs font-semibold mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Machine Learning Phishing Defense</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span className="text-[11px] opacity-80">v2.4 Active</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white light:text-slate-900 max-w-4xl mx-auto leading-[1.15]"
          >
            Stay One Step Ahead of{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 light:from-blue-600 light:via-indigo-600 light:to-cyan-600 bg-clip-text text-transparent">
              Cyber Threats
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 light:text-slate-600 max-w-2xl mx-auto leading-relaxed"
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
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 light:bg-white border border-slate-700/80 light:border-slate-300 shadow-2xl shadow-blue-900/20 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Paste URL to inspect (e.g. http://paypal.com.verify-user.xyz)..."
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="w-full py-2.5 text-sm sm:text-base bg-transparent text-white light:text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick test badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 light:text-slate-500">
              <span className="text-[11px]">Try samples:</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://paypal.com.account-verification-notice.xyz/login.html')}
                className="hover:text-blue-400 light:hover:text-blue-600 underline cursor-pointer"
              >
                PayPal Phishing Lure
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setHeroUrl('http://185.220.101.4:8080/apple/id/verification')}
                className="hover:text-blue-400 light:hover:text-blue-600 underline cursor-pointer"
              >
                Bare IP Lure
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setHeroUrl('https://github.com/torvalds/linux')}
                className="hover:text-blue-400 light:hover:text-blue-600 underline cursor-pointer"
              >
                Verified Clean URL
              </button>
            </div>
          </motion.div>

          {/* Trust points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-400 light:text-slate-600">
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
      <section className="py-12 border-y border-[#1e293b] light:border-slate-200 bg-[#070b16] light:bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {platformStats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 light:from-blue-600 light:via-indigo-600 light:to-cyan-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-white light:text-slate-800 mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
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
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 light:text-blue-700 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Defense Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
              Four Intelligence Pillars Working in Unison
            </h2>
            <p className="mt-3 text-slate-400 light:text-slate-600 text-sm sm:text-base">
              Rather than relying on single blacklists, our engine correlates machine learning predictions with live cryptographic and HTTP audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-[#0f172a]/90 light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl shadow-black/5 hover:border-blue-500/40 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} p-0.5 shadow-lg`}
                    >
                      <div className="w-full h-full bg-[#0a0f1d] light:bg-white rounded-[14px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white light:text-blue-600 transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 border border-slate-700 light:border-slate-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white light:text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 light:text-slate-600 leading-relaxed mb-6">
                    {feat.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-800 light:border-slate-100 pt-4">
                    {feat.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2 text-xs text-slate-300 light:text-slate-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400 light:text-blue-600" />
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
      <section id="how-it-works" className="py-20 bg-[#070b16] light:bg-slate-50 border-y border-[#1e293b] light:border-slate-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 light:text-indigo-700 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Inspection Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
              How ThreatSentinel Evaluates Risk
            </h2>
            <p className="mt-3 text-slate-400 light:text-slate-600 text-sm">
              From submission to mitigation advice in under 200 milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => {
              const Icon = st.icon
              return (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-[#0a0f1d] light:bg-white border border-[#1e293b] light:border-slate-200 shadow-lg relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-blue-400/30 light:text-blue-600/30">
                        {st.step}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 light:text-blue-700 border border-blue-500/20">
                        {st.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 light:bg-blue-50 border border-blue-500/30 flex items-center justify-center text-blue-400 light:text-blue-600 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-lg font-bold text-white light:text-slate-900 mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
                      {st.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 light:border-slate-100 flex items-center text-xs text-blue-400 light:text-blue-600 font-semibold">
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
          <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-[#0a0f1d] light:from-blue-600 light:via-indigo-600 light:to-blue-700 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl"></div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 light:bg-white/20 text-blue-300 light:text-white text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise SOC Ready</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
              Ready to Inspect Suspicious URLs in Real-Time?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-blue-100 light:text-blue-50 max-w-xl mx-auto leading-relaxed">
              Experience the power of our custom-trained ML models, passive security header audits, and collaborative threat feeds without complex setup.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/scanner"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-blue-900 hover:bg-slate-100 shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Launch URL Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-blue-600/40 light:bg-blue-800/40 hover:bg-blue-600/60 text-white border border-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
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
