import { ShieldCheck, ShieldX, Check, X, Key, Lock } from 'lucide-react'
import CertificateStepper from '../ui/CertificateStepper'

const GRADE_COLORS = {
  'A+': { bg: 'bg-[#34E0A1]/15', text: 'text-[#34E0A1] light:text-[#059669]', border: 'border-[#34E0A1]/35' },
  A:    { bg: 'bg-[#34E0A1]/15', text: 'text-[#34E0A1] light:text-[#059669]', border: 'border-[#34E0A1]/35' },
  B:    { bg: 'bg-[#FFB020]/15', text: 'text-[#FFB020] light:text-[#B45309]', border: 'border-[#FFB020]/35' },
  C:    { bg: 'bg-[#FFB020]/15', text: 'text-[#FFB020] light:text-[#B45309]', border: 'border-[#FFB020]/35' },
  F:    { bg: 'bg-[#FF4D6D]/15', text: 'text-[#FF4D6D] light:text-[#BE123C]', border: 'border-[#FF4D6D]/35' },
}

function InfoItem({ label, value }) {
  return (
    <div className="space-y-0.5">
      <span className="block text-[10px] font-mono uppercase tracking-wider text-[#A29FC9] light:text-[#6E6893]">
        {label}
      </span>
      <span className="block text-xs font-mono text-[#F2F0FF] light:text-[#1E1B4B] font-medium break-all">
        {value || '—'}
      </span>
    </div>
  )
}

function BooleanIndicator({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      {value ? (
        <Check size={14} className="text-[#34E0A1] shrink-0" />
      ) : (
        <X size={14} className="text-[#FF4D6D] shrink-0" />
      )}
      <span className="text-[#F2F0FF] light:text-[#1E1B4B]">{label}</span>
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
      <div className="p-5 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] border-l-4 border-l-[#FF4D6D] shadow-md">
        <div className="flex items-start gap-3">
          <ShieldX size={22} className="text-[#FF4D6D] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-sm text-[#F2F0FF] light:text-[#1E1B4B]">
              Missing Transport Encryption (Cleartext HTTP)
            </h3>
            <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-1.5 leading-relaxed">
              Target host does not terminate valid TLS encryption. Credentials, session cookies, and request payloads are exposed in cleartext across the transit network.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const gradeStyle = GRADE_COLORS[grade] || GRADE_COLORS.F

  return (
    <div className="p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2650] light:border-[#E2DEFA]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#A78BFF]">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B]">
              Cryptographic Transport Audit
            </h3>
            <span className="text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
              Active Protocol: {protocol || 'TLS 1.3'}
            </span>
          </div>
        </div>

        {/* Grade badge */}
        {grade && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase text-[#A29FC9] light:text-[#6E6893]">SSL Grade:</span>
            <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
              {grade}
            </span>
          </div>
        )}
      </div>

      {/* Visual PKI Trust Chain */}
      <div>
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#A29FC9] light:text-[#6E6893] mb-3">
          PKI Certificate Trust Path
        </h4>
        {sslStatus.live ? (
          <div className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono text-[#F2F0FF] light:text-[#1E1B4B] leading-relaxed">
            Certificate for {domain || 'target host'} issued by {issuer || 'unknown issuer'}.
            {typeof sslStatus.daysRemaining === 'number' ? ` ${sslStatus.daysRemaining} days remaining.` : ''}
            {' '}Handshake {sslStatus.authorized ? 'verified against the system trust store.' : 'could NOT be verified against the system trust store.'}
          </div>
        ) : (
          <CertificateStepper
            rootCA="Internet Security Research Group (ISRG Root X1)"
            intermediateCA={issuer || "Let's Encrypt Authority R3"}
            leafDomain={domain || "Target Destination"}
            validTo={validTo}
          />
        )}
      </div>

      {/* Grid details */}
      <div className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <InfoItem label="Issuer Authority" value={issuer} />
        <InfoItem label="Issued Timestamp" value={validFrom} />
        <InfoItem label="Expiration Timestamp" value={validTo} />
        <InfoItem label="Key Length & Cipher" value={keySize ? `${keySize} bits` : sslStatus.live ? 'Not measured' : 'RSA 2048 bits'} />
        <InfoItem label="Signature Hash Algorithm" value={signatureAlgorithm || (sslStatus.live ? 'Not measured' : 'SHA256withRSA')} />
      </div>

      {/* Verification flags */}
      <div className="pt-3 border-t border-[#2A2650] light:border-[#E2DEFA] flex flex-wrap items-center gap-5">
        <BooleanIndicator label="SAN Hostname Validated" value={sanMatch} />
        {ctLogged !== null && ctLogged !== undefined && (
          <BooleanIndicator label="Certificate Transparency Logged" value={ctLogged} />
        )}
        <BooleanIndicator label="Chain Root Trusted" value={sslStatus.live ? sslStatus.authorized : hasSSL} />
      </div>
    </div>
  )
}
