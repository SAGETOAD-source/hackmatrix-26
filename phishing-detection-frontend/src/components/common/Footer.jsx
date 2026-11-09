import { Shield, CheckCircle2, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t bg-[#101C22] light:bg-[#E0F2ED] border-[#24454C] light:border-[#C2E2DA] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Status */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#167D83] to-[#18343A] p-0.5 shadow-xs flex items-center justify-center">
                <div className="w-full h-full rounded-[6px] bg-[#101C22] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#55B9AD]" />
                </div>
              </div>
              <span className="font-heading font-bold text-sm text-[#F5F7F6] light:text-[#101C22] tracking-tight">
                ThreatLens<span className="text-[#55B9AD]">.io</span>
              </span>
            </div>
            <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">
              Autonomous cybersecurity platform combining machine learning URL inference, transport cryptography, and continuous threat telemetry.
            </p>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#18343A] light:bg-[#D1EBE5] border border-[#24454C] light:border-[#B9DFD6] text-[11px] font-mono text-[#55B9AD] light:text-[#059669]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#55B9AD] animate-pulse"></span>
              <span>All Systems Operational (v2.4)</span>
            </div>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A4B8B5] light:text-[#4B6B67]">
              <li>
                <Link to="/scanner" className="hover:text-[#55B9AD] light:hover:text-[#167D83] transition-colors">
                  URL Threat Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#55B9AD] light:hover:text-[#167D83] transition-colors">
                  SOC Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/security-analysis" className="hover:text-[#55B9AD] light:hover:text-[#167D83] transition-colors">
                  SSL/TLS & HTTP Header Audit
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#55B9AD] light:hover:text-[#167D83] transition-colors">
                  Security Scan History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22] mb-3">
              Telemetry Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A4B8B5] light:text-[#4B6B67]">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D83]" />
                <span>18 Lexical & Entropy Features</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D83]" />
                <span>RFC 1918 Private Range Guard</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D83]" />
                <span>Certificate Transparency Audit</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D83]" />
                <span>HSTS & CSP Compliance Scoring</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Defensive Transparency Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22] mb-3">
              Sentinel Architecture
            </h4>
            <div className="p-3 rounded-lg bg-[#18343A] light:bg-[#FFFFFF] border border-[#24454C] light:border-[#C2E2DA] text-[11px] text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">
              <span className="font-semibold text-[#F5F7F6] light:text-[#101C22] block mb-1">
                Zero-Fabrication Assurance
              </span>
              Telemetry values and heuristic scores are computed deterministically from genuine network probes and our Random Forest classifier.
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-[#24454C] light:border-[#C2E2DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A4B8B5] light:text-[#4B6B67]">
          <div>
            &copy; {new Date().getFullYear()} ThreatLens SOC. Built for high-assurance cybersecurity inspection.
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>RFC 1918 / RFC 4193 SSRF Protected</span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('phishguard:open-command-palette'))}
              className="inline-flex items-center space-x-1 text-[#55B9AD] hover:underline cursor-pointer"
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
