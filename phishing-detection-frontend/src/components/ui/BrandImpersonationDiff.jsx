import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function BrandImpersonationDiff({
  suspiciousUrl = 'http://paypa1-security-verification.com.tk/login',
  legitimateUrl = 'https://www.paypal.com/signin',
  brandName = 'PayPal',
}) {
  // Simple token comparison for visual diffing
  const suspDomain = suspiciousUrl.replace(/^https?:\/\//, '').split('/')[0]
  const legitDomain = legitimateUrl.replace(/^https?:\/\//, '').split('/')[0]

  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] font-sans uppercase tracking-wider font-semibold">
          Brand Impersonation Telemetry
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--verdict-malicious)]/15 text-[var(--verdict-malicious)] border border-[var(--verdict-malicious)]/30">
          Targeted Entity: {brandName}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Suspicious Target */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--verdict-malicious)]/30 space-y-1">
          <div className="flex items-center gap-1.5 text-[var(--verdict-malicious)] font-sans font-medium text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Submitted Target (Deceptive Homoglyph / Spoof)</span>
          </div>
          <div className="text-[var(--text-primary)] break-all pt-1 font-semibold">
            {suspDomain.split('').map((char, i) => {
              const isMismatch =
                !legitDomain.includes(char) ||
                (char === '-' && !legitDomain.includes('-')) ||
                (char === '1' && !legitDomain.includes('1') && legitDomain.includes('l'))
              return (
                <span
                  key={i}
                  className={
                    isMismatch
                      ? 'bg-[var(--verdict-malicious)]/25 text-[var(--verdict-malicious)] px-0.5 rounded font-bold underline decoration-[var(--verdict-malicious)]'
                      : ''
                  }
                >
                  {char}
                </span>
              )
            })}
          </div>
          <p className="text-[10px] font-sans text-[var(--text-muted)] pt-1">
            Suspicious token substitution detected in domain label.
          </p>
        </div>

        {/* Legitimate Reference */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--brand-accent)]/30 space-y-1">
          <div className="flex items-center gap-1.5 text-[var(--brand-accent)] font-sans font-medium text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Official Canonical Infrastructure</span>
          </div>
          <div className="text-[var(--text-primary)] break-all pt-1 font-semibold">
            <span className="border-b-2 border-[var(--brand-accent)] pb-0.5">
              {legitDomain}
            </span>
          </div>
          <p className="text-[10px] font-sans text-[var(--text-muted)] pt-1">
            Registered canonical domain under active EV/OV validation.
          </p>
        </div>
      </div>
    </div>
  )
}

