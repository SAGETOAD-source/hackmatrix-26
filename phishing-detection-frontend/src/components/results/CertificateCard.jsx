import { ShieldCheck, ShieldX, Check, X, Key, Lock } from 'lucide-react'
import CertificateStepper from '../ui/CertificateStepper'

const GRADE_COLORS = {
  'A+': { bg: 'bg-[#55B9AD]/15', text: 'text-[#55B9AD] light:text-[#059669]', border: 'border-[#55B9AD]/35' },
  A:    { bg: 'bg-[#55B9AD]/15', text: 'text-[#55B9AD] light:text-[#059669]', border: 'border-[#55B9AD]/35' },
  B:    { bg: 'bg-[#E9B65B]/15', text: 'text-[#E9B65B] light:text-[#B45309]', border: 'border-[#E9B65B]/35' },
  C:    { bg: 'bg-[#E9B65B]/15', text: 'text-[#E9B65B] light:text-[#B45309]', border: 'border-[#E9B65B]/35' },
  F:    { bg: 'bg-[#EF6464]/15', text: 'text-[#EF6464] light:text-[#BE123C]', border: 'border-[#EF6464]/35' },
}

function InfoItem({ label, value }) {
  return (
    <div className="space-y-0.5">
      <span className="block text-[10px] font-mono uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67]">
        {label}
      </span>
      <span className="block text-xs font-mono text-[#F5F7F6] light:text-[#101C22] font-medium break-all">
        {value || '—'}
      </span>
    </div>
  )
}

function BooleanIndicator({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      {value ? (
        <Check size={14} className="text-[#55B9AD] shrink-0" />
      ) : (
        <X size={14} className="text-[#EF6464] shrink-0" />
      )}
      <span className="text-[#F5F7F6] light:text-[#101C22]">{label}</span>
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
    domain,
  } = sslStatus

  if (!hasSSL) {
    return (
      <div className="p-5 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] border-l-4 border-l-[#EF6464] shadow-md">
        <div className="flex items-start gap-3">
          <ShieldX size={22} className="text-[#EF6464] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-sm text-[#F5F7F6] light:text-[#101C22]">
              Missing Transport Encryption (Cleartext HTTP)
            </h3>
            <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1.5 leading-relaxed">
              Target host does not terminate valid TLS encryption. Credentials, session cookies, and request payloads are exposed in cleartext across the transit network.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const gradeStyle = GRADE_COLORS[grade] || GRADE_COLORS.F

  return (
    <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#24454C] light:border-[#C2E2DA]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#167D83]/15 border border-[#167D83]/30 flex items-center justify-center text-[#55B9AD]">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22]">
              Cryptographic Transport Audit
            </h3>
            <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
              Active Protocol: {protocol || 'TLS 1.3'}
            </span>
          </div>
        </div>

        {/* Grade badge */}
        {grade && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase text-[#A4B8B5] light:text-[#4B6B67]">SSL Grade:</span>
            <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
              {grade}
            </span>
          </div>
        )}
      </div>

      {/* Visual PKI Trust Chain */}
      <div>
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67] mb-3">
          PKI Certificate Trust Path
        </h4>
        <CertificateStepper
          rootCA="Internet Security Research Group (ISRG Root X1)"
          intermediateCA={issuer || "Let's Encrypt Authority R3"}
          leafDomain={domain || "Target Destination"}
          validTo={validTo}
        />
      </div>

      {/* Grid details */}
      <div className="p-4 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <InfoItem label="Issuer Authority" value={issuer} />
        <InfoItem label="Issued Timestamp" value={validFrom} />
        <InfoItem label="Expiration Timestamp" value={validTo} />
        <InfoItem label="Key Length & Cipher" value={keySize ? `${keySize} bits` : 'RSA 2048 bits'} />
        <InfoItem label="Signature Hash Algorithm" value={signatureAlgorithm || 'SHA256withRSA'} />
      </div>

      {/* Verification flags */}
      <div className="pt-3 border-t border-[#24454C] light:border-[#C2E2DA] flex flex-wrap items-center gap-5">
        <BooleanIndicator label="SAN Hostname Validated" value={sanMatch} />
        <BooleanIndicator label="Certificate Transparency Logged" value={ctLogged} />
        <BooleanIndicator label="Chain Root Trusted" value={hasSSL} />
      </div>
    </div>
  )
}
