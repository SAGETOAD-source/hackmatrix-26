import { ShieldCheck, ShieldX, Check, X } from 'lucide-react'

const GRADE_COLORS = {
  'A+': { bg: 'bg-emerald-500/10 light:bg-emerald-50', text: 'text-emerald-400 light:text-emerald-700', border: 'border-emerald-500/30' },
  A:    { bg: 'bg-emerald-500/10 light:bg-emerald-50', text: 'text-emerald-400 light:text-emerald-700', border: 'border-emerald-500/30' },
  B:    { bg: 'bg-amber-500/10 light:bg-amber-50',     text: 'text-amber-400 light:text-amber-700', border: 'border-amber-500/30' },
  C:    { bg: 'bg-orange-500/10 light:bg-orange-50',   text: 'text-orange-400 light:text-orange-700', border: 'border-orange-500/30' },
  F:    { bg: 'bg-rose-500/10 light:bg-rose-50',       text: 'text-rose-400 light:text-rose-700', border: 'border-rose-500/30' },
}

function InfoItem({ label, value }) {
  return (
    <div className="space-y-0.5">
      <span className="block text-[10px] font-mono uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
        {label}
      </span>
      <span className="block text-xs font-mono text-[#F1F5FF] light:text-[#172033] font-medium break-all">
        {value || '—'}
      </span>
    </div>
  )
}

function BooleanIndicator({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      {value ? (
        <Check size={14} className="text-emerald-400 light:text-emerald-600 shrink-0" />
      ) : (
        <X size={14} className="text-rose-400 light:text-rose-600 shrink-0" />
      )}
      <span className="text-[#F1F5FF] light:text-[#172033]">{label}</span>
    </div>
  )
}

export default function CertificateCard({ sslStatus = {} }) {
  const {
    hasSSL,
    protocol,
    issuer,
    validFrom,
    validTo,
    keySize,
    signatureAlgorithm,
    sanMatch,
    ctLogged,
    grade,
  } = sslStatus

  if (!hasSSL) {
    return (
      <div className="cyber-card p-5 border-l-4 border-l-rose-500">
        <div className="flex items-start gap-3">
          <ShieldX size={20} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-[#F1F5FF] light:text-[#172033]">
              Missing Transport Encryption (No SSL/TLS)
            </h3>
            <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-1 leading-relaxed">
              Target host does not terminate valid TLS encryption. Cleartext HTTP credentials and session tokens are exposed to transit interception.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const gradeStyle = GRADE_COLORS[grade] || GRADE_COLORS.F

  return (
    <div className="cyber-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#24344B] light:border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#287FE9]" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
              Cryptographic Certificate Audit
            </h3>
            <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
              Active Protocol: {protocol || 'TLS 1.3'}
            </span>
          </div>
        </div>

        {/* Grade badge */}
        {grade && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-mono uppercase text-[#9EACC2] light:text-[#64748B]">Grade:</span>
            <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
              {grade}
            </span>
          </div>
        )}
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-4">
        <InfoItem label="Issuer Authority" value={issuer} />
        <InfoItem label="Issued Timestamp" value={validFrom} />
        <InfoItem label="Expiration Timestamp" value={validTo} />
        <InfoItem label="Key Length & Cipher" value={keySize ? `${keySize} bits` : 'RSA 2048 bits'} />
        <InfoItem label="Signature Hash Algorithm" value={signatureAlgorithm || 'SHA256withRSA'} />
      </div>

      {/* Verification flags */}
      <div className="pt-3 border-t border-[#24344B]/60 light:border-[#E2E8F0] flex flex-wrap items-center gap-4">
        <BooleanIndicator label="SAN Matching Valid" value={sanMatch} />
        <BooleanIndicator label="Certificate Transparency Logged" value={ctLogged} />
        <BooleanIndicator label="Chain Root Trusted" value={hasSSL} />
      </div>
    </div>
  )
}
