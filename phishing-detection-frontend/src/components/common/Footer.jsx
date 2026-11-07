import { Shield, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SIMULATION_DISCLAIMER } from '../../data/mockData'

export default function Footer() {
  return (
    <footer className="border-t bg-[#070b16] light:bg-slate-50 border-[#1e293b] light:border-slate-200 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white light:text-slate-900 tracking-tight">
                ThreatSentinel<span className="text-blue-400">.ai</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
              Intelligent multi-pillar cybersecurity engine analyzing URLs, domain reputation, TLS certificates, and HTTP headers in real-time.
            </p>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 light:text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Threat Defense Engine Active (v2.4)</span>
            </div>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 light:text-slate-600">
              <li>
                <Link to="/scanner" className="hover:text-blue-400 light:hover:text-blue-600 transition-colors">
                  AI-Powered URL Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 light:hover:text-blue-600 transition-colors">
                  SOC Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-blue-400 light:hover:text-blue-600 transition-colors">
                  Explainable Risk Scores
                </Link>
              </li>
              <li>
                <Link to="/security-analysis" className="hover:text-blue-400 light:hover:text-blue-600 transition-colors">
                  Passive HTTP & TLS Audit
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-blue-400 light:hover:text-blue-600 transition-colors">
                  Audit Logs & History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-3">
              Threat Feeds & Standards
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 light:text-slate-600">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>PhishTank Verified Feeds</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>URLhaus Malware Indicators</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Certificate Transparency (crt.sh)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Safe Browsing v4</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>RFC 1918 / 4193 SSRF Hardened</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Defensive Transparency */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-3">
              Defensive Transparency
            </h4>
            <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed mb-3">
              Combines 18 extracted lexical characteristics, random forest inference, and cryptographic verification to yield transparent, explainable verdicts.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-[11px] text-slate-400 light:text-slate-600">
              <span className="font-semibold text-slate-300 light:text-slate-800 block mb-0.5">Note:</span>
              {SIMULATION_DISCLAIMER}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 light:text-slate-500 gap-3">
          <p>© 2026 ThreatSentinel.ai Platform. Enterprise Cybersecurity Architecture.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Model</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">SSRF Guard</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
