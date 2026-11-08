import { Shield, CheckCircle2, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t bg-[#0B0A14] light:bg-[#F7F5FF] border-[#2A2650] light:border-[#E2DEFA] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Status */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#14122A] p-0.5 shadow-xs flex items-center justify-center">
                <div className="w-full h-full rounded-[6px] bg-[#0B0A14] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#A78BFF]" />
                </div>
              </div>
              <span className="font-heading font-bold text-sm text-[#F2F0FF] light:text-[#1E1B4B] tracking-tight">
                PhishGuard<span className="text-[#C6FF3D] light:text-[#5E8F00]">.UV</span>
              </span>
            </div>
            <p className="text-xs text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
              Autonomous cybersecurity platform combining machine learning URL inference, transport cryptography, and continuous threat telemetry.
            </p>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#14122A] light:bg-[#EDE9FE] border border-[#2A2650] light:border-[#D4CDFA] text-[11px] font-mono text-[#34E0A1] light:text-[#059669]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34E0A1] animate-pulse"></span>
              <span>All Systems Operational (v2.4)</span>
            </div>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A29FC9] light:text-[#6E6893]">
              <li>
                <Link to="/scanner" className="hover:text-[#A78BFF] light:hover:text-[#7C5CFF] transition-colors">
                  URL Threat Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#A78BFF] light:hover:text-[#7C5CFF] transition-colors">
                  SOC Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/security-analysis" className="hover:text-[#A78BFF] light:hover:text-[#7C5CFF] transition-colors">
                  SSL/TLS & HTTP Header Audit
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#A78BFF] light:hover:text-[#7C5CFF] transition-colors">
                  Security Scan History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B] mb-3">
              Telemetry Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A29FC9] light:text-[#6E6893]">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>18 Lexical & Entropy Features</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>RFC 1918 Private Range Guard</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>Certificate Transparency Audit</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>HSTS & CSP Compliance Scoring</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Defensive Transparency Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B] mb-3">
              Sentinel Architecture
            </h4>
            <div className="p-3 rounded-lg bg-[#14122A] light:bg-[#FFFFFF] border border-[#2A2650] light:border-[#E2DEFA] text-[11px] text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
              <span className="font-semibold text-[#F2F0FF] light:text-[#1E1B4B] block mb-1">
                Zero-Fabrication Assurance
              </span>
              Telemetry values and heuristic scores are computed deterministically from genuine network probes and our Random Forest classifier.
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-[#2A2650] light:border-[#E2DEFA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A29FC9] light:text-[#6E6893]">
          <div>
            &copy; {new Date().getFullYear()} PhishGuard SOC. Built for high-assurance cybersecurity inspection.
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>RFC 1918 / RFC 4193 SSRF Protected</span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('phishguard:open-command-palette'))}
              className="inline-flex items-center space-x-1 text-[#A78BFF] hover:underline cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>⌘K Command Palette</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
