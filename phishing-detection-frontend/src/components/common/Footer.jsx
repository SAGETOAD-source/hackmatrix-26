import { Shield, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t bg-[#080F1E] light:bg-[#F5F7FC] border-[#24344B] light:border-[#E2E8F0] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Status */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-md bg-[#111E32] light:bg-white border border-[#24344B] light:border-[#E2E8F0] flex items-center justify-center text-[#287FE9]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-[#F1F5FF] light:text-[#172033] tracking-tight">
                PhishGuard<span className="text-[#287FE9]">.SOC</span>
              </span>
            </div>
            <p className="text-xs text-[#9EACC2] light:text-[#64748B] leading-relaxed">
              Multi-pillar cybersecurity intelligence platform combining machine learning URL inspection, transport cryptography, and threat feed correlation.
            </p>
            <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-[#0D1728] light:bg-emerald-50 border border-[#24344B] light:border-emerald-200 text-[11px] font-mono text-emerald-400 light:text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>All Systems Operational (v2.4)</span>
            </div>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-[#9EACC2] light:text-[#64748B]">
              <li>
                <Link to="/scanner" className="hover:text-[#287FE9] transition-colors">
                  URL Threat Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#287FE9] transition-colors">
                  SOC Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/security-analysis" className="hover:text-[#287FE9] transition-colors">
                  SSL/TLS & HTTP Header Audit
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#287FE9] transition-colors">
                  Security Scan History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033] mb-3">
              Telemetry Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[#9EACC2] light:text-[#64748B]">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#287FE9]" />
                <span>18 Lexical & Entropy Features</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#287FE9]" />
                <span>RFC 1918 Private Range Guard</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#287FE9]" />
                <span>Certificate Transparency Audit</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#287FE9]" />
                <span>HSTS & CSP Compliance Scoring</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Defensive Transparency Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033] mb-3">
              Operational Transparency
            </h4>
            <div className="p-3 rounded-lg bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[11px] text-[#9EACC2] light:text-[#64748B] leading-relaxed">
              <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block mb-1">
                Competition Demonstration Mode
              </span>
              Sample detection vectors and telemetry values illustrate enterprise SOC workflows and heuristic scoring. No malicious probes are executed against live network destinations.
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-[#24344B] light:border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9EACC2] light:text-[#64748B]">
          <div>
            &copy; {new Date().getFullYear()} PhishGuard SOC. Designed for high-assurance cybersecurity defense.
          </div>
          <div className="flex items-center space-x-4">
            <span>RFC 1918 / RFC 4193 SSRF Protected</span>
            <span>&bull;</span>
            <span>Deterministic Heuristics</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
