import { ShieldCheck, ShieldX, Check, X } from 'lucide-react';

const GRADE_COLORS = {
  'A+': { bg: 'bg-emerald-500/15 light:bg-emerald-100', text: 'text-emerald-400 light:text-emerald-600' },
  A:    { bg: 'bg-emerald-500/15 light:bg-emerald-100', text: 'text-emerald-400 light:text-emerald-600' },
  B:    { bg: 'bg-amber-500/15 light:bg-amber-100',     text: 'text-amber-400 light:text-amber-600' },
  C:    { bg: 'bg-orange-500/15 light:bg-orange-100',    text: 'text-orange-400 light:text-orange-600' },
  F:    { bg: 'bg-rose-500/15 light:bg-rose-100',        text: 'text-rose-400 light:text-rose-600' },
};

function InfoItem({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-[#9EACC2] light:text-[#64748B] uppercase tracking-wider">
        {label}
      </span>
      <span className="block text-sm text-[#F1F5FF] light:text-[#172033] font-medium">
        {value || '—'}
      </span>
    </div>
  );
}

function BooleanIndicator({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <Check size={16} className="text-emerald-400 light:text-emerald-600" />
      ) : (
        <X size={16} className="text-rose-400 light:text-rose-600" />
      )}
      <span className="text-sm text-[#F1F5FF] light:text-[#172033] font-medium">{label}</span>
    </div>
  );
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
  } = sslStatus;

  // No SSL state
  if (!hasSSL) {
    return (
      <div
        className="
          rounded-2xl p-6
          bg-[#111E32] light:bg-white
          border border-[#1C2D4A] light:border-[#E2E8F0]
          shadow-lg shadow-black/10 light:shadow-slate-200/50
        "
      >
        <div className="flex items-center gap-3">
          <ShieldX size={24} className="text-rose-400 light:text-rose-500" />
          <div>
            <h3 className="font-semibold text-[#F1F5FF] light:text-[#172033]">No SSL Certificate</h3>
            <p className="text-sm text-[#9EACC2] light:text-[#64748B] mt-0.5">
              This site does not have an SSL/TLS certificate configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const gradeStyle = GRADE_COLORS[grade] || GRADE_COLORS.F;

  return (
    <div
      className="
        rounded-2xl p-6
        bg-[#111E32] light:bg-white
        border border-[#1C2D4A] light:border-[#E2E8F0]
        shadow-lg shadow-black/10 light:shadow-slate-200/50
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-emerald-400 light:text-emerald-600" />
          <h3 className="font-bold text-[#F1F5FF] light:text-[#172033] text-base">
            SSL/TLS Certificate
          </h3>
        </div>

        {/* Grade badge */}
        {grade && (
          <span
            className={`
              inline-flex items-center justify-center rounded-lg px-3 py-1
              text-lg font-bold ${gradeStyle.bg} ${gradeStyle.text}
            `}
          >
            {grade}
          </span>
        )}
      </div>

      {/* Grid of info items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <InfoItem label="Issuer" value={issuer} />
        <InfoItem label="Protocol" value={protocol} />
        <InfoItem label="Valid From" value={validFrom} />
        <InfoItem label="Valid To" value={validTo} />
        <InfoItem label="Key Size" value={keySize ? `${keySize} bits` : undefined} />
        <InfoItem label="Signature" value={signatureAlgorithm} />
      </div>

      {/* Boolean indicators */}
      <div className="flex flex-wrap gap-6 pt-4 border-t border-[#1C2D4A] light:border-[#E2E8F0]">
        <BooleanIndicator label="SAN matches hostname" value={sanMatch} />
        <BooleanIndicator label="Logged in CT logs" value={ctLogged} />
      </div>
    </div>
  );
}
