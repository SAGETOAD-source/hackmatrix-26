import { Shield, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SIMULATION_DISCLAIMER } from '../../data/mockData'

export default function Footer() {
  return (
    <footer className="border-t bg-[#080F1E] light:bg-[#F5F7FC] border-[#1C2D4A] light:border-[#E2E8F0] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#287FE9] via-[#1E6FD6] to-[#55B7FF] flex items-center justify-center text-white shadow-md shadow-[#287FE9]/20">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#F1F5FF] light:text-[#172033] tracking-tight">
                ThreatSentinel<span className="text-[#55B7FF] light:text-[#2563EB]">.ai</span>
              </span>
            </div>
            <p className="text-xs text-[#9EACC2] light:text-[#64748B] leading-relaxed">
              Intelligent multi-pillar cybersecurity engine analyzing URLs, domain reputation, TLS certificates, and HTTP headers in real-time.
            </p>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 light:text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Threat Defense Engine Active (v2.4)</span>
            </div>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-[#9EACC2] light:text-[#64748B]">
              <li>
                <Link to="/scanner" className="hover:text-[#55B7FF] light:hover:text-[#2563EB] transition-colors">
                  AI-Powered URL Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#55B7FF] light:hover:text-[#2563EB] transition-colors">
                  SOC Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-[#55B7FF] light:hover:text-[#2563EB] transition-colors">
                  Explainable Risk Scores
                </Link>
              </li>
              <li>
                <Link to="/security-analysis" className="hover:text-[#55B7FF] light:hover:text-[#2563EB] transition-colors">
                  Passive HTTP & TLS Audit
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#55B7FF] light:hover:text-[#2563EB] transition-colors">
                  Audit Logs & History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033] mb-3">
              Threat Feeds & Standards
            </h4>
            <ul className="space-y-2 text-xs text-[#9EACC2] light:text-[#64748B]">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#55B7FF] light:text-[#2563EB]" />
                <span>PhishTank Verified Feeds</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#55B7FF] light:text-[#2563EB]" />
                <span>URLhaus Malware Indicators</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#55B7FF] light:text-[#2563EB]" />
                <span>Certificate Transparency (crt.sh)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#55B7FF] light:text-[#2563EB]" />
                <span>Google Safe Browsing v4</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#55B7FF] light:text-[#2563EB]" />
                <span>RFC 1918 / 4193 SSRF Hardened</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Defensive Transparency */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033] mb-3">
              Defensive Transparency
            </h4>
            <p className="text-xs text-[#9EACC2] light:text-[#64748B] leading-relaxed mb-3">
              Combines 18 extracted lexical characteristics, random forest inference, and cryptographic verification to yield transparent, explainable verdicts.
            </p>
            <div className="p-3 rounded-xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] text-[11px] text-[#9EACC2] light:text-[#64748B] shadow-xs">
              <span className="font-semibold text-[#F1F5FF] light:text-[#172033]">Zero-Exploit Guarantee:</span> Analysis uses passive telemetry only; target hosts are never touched with offensive scripts or payload fuzzing.
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="pt-6 border-t border-[#1C2D4A] light:border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between text-xs text-[#9EACC2] light:text-[#64748B] gap-4">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} ThreatSentinel.ai Platform. Designed for SecOps & Defense Analytics.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#111E32] light:bg-slate-200 text-[#9EACC2] light:text-[#64748B] border border-[#1C2D4A] light:border-[#E2E8F0]">
              {SIMULATION_DISCLAIMER}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
