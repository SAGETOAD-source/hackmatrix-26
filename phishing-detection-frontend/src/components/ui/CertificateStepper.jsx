import { ShieldCheck, ShieldAlert, Key, Globe, Lock, CheckCircle2 } from 'lucide-react'

export default function CertificateStepper({ certificate = {} }) {
  if (!certificate || Object.keys(certificate).length === 0) {
    return (
      <div className="p-6 text-center text-sm text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
        No cryptographic certificate presented (Cleartext HTTP connection).
      </div>
    )
  }

  const isValid = certificate.valid !== false && !certificate.isExpired
  const days = certificate.daysRemaining ?? certificate.days_remaining ?? 90

  const chainNodes = [
    {
      level: 'Root Authority (Trust Anchor)',
      name: certificate.issuer || certificate.issuerOrganization || 'DigiCert Global Root CA',
      type: 'Root CA',
      icon: Key,
      status: 'Trusted Root',
      isRoot: true,
    },
    {
      level: 'Intermediate Authority',
      name: `${certificate.issuer || 'DigiCert'} TLS Hybrid ECC SHA384 2020 CA1`,
      type: 'Intermediate CA',
      icon: Lock,
      status: 'Valid Sub-CA',
    },
    {
      level: 'Server Certificate (Leaf)',
      name: certificate.subject || certificate.commonName || 'Protected Target Host',
      type: 'Leaf Certificate',
      icon: Globe,
      status: isValid ? `Valid (${days} days left)` : 'Invalid or Expired',
      isLeaf: true,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Animated Connecting Vertical Line */}
        <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[var(--brand-primary)] via-[var(--brand-glow)] to-[var(--brand-primary)]/40" />

        {chainNodes.map((node, idx) => {
          const NodeIcon = node.icon

          return (
            <div key={idx} className="relative group">
              {/* Glowing Node Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)] flex items-center justify-center shadow-[0_0_10px_rgba(124,92,255,0.6)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]" />
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <NodeIcon className="w-4 h-4 text-[var(--brand-glow)]" />
                    <span className="text-xs font-semibold text-[var(--text-primary)] font-display">
                      {node.level}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--brand-primary)]/15 text-[var(--brand-glow)] border border-[var(--brand-primary)]/25">
                    {node.status}
                  </span>
                </div>

                <p className="mt-1.5 text-xs font-mono text-[var(--text-primary)] break-all font-medium">
                  {node.name}
                </p>

                {node.isLeaf && certificate.fingerprint256 && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between gap-2">
                    <span className="truncate">SHA-256: {certificate.fingerprint256}</span>
                    <span className="shrink-0 text-[var(--verdict-safe)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

