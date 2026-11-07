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
      <span className="block text-xs font-medium text-slate-500 light:text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="block text-sm text-white light:text-gray-900 font-medium">
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
      <span className="text-sm text-slate-300 light:text-slate-700">{label}</span>
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
          rounded-xl p-6
          bg-white/5 light:bg-white
          border border-white/10 light:border-gray-200
          light:shadow-sm
        "
      >
        <div className="flex items-center gap-3">
          <ShieldX size={24} className="text-rose-400 light:text-rose-500" />
          <div>
            <h3 className="font-semibold text-white light:text-gray-900">No SSL Certificate</h3>
            <p className="text-sm text-slate-400 light:text-slate-500 mt-0.5">
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
        rounded-xl p-6
        bg-white/5 light:bg-white
        border border-white/10 light:border-gray-200
        light:shadow-sm
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-emerald-400 light:text-emerald-600" />
          <h3 className="font-semibold text-white light:text-gray-900 text-base">
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

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <InfoItem label="Protocol" value={protocol} />
        <InfoItem label="Issuer" value={issuer} />
        <InfoItem label="Valid From" value={validFrom} />
        <InfoItem label="Valid To" value={validTo} />
        <InfoItem label="Key Size" value={keySize ? `${keySize} bit` : null} />
        <InfoItem label="Signature" value={signatureAlgorithm} />
      </div>

      {/* Boolean indicators */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/10 light:border-gray-200">
        <BooleanIndicator label="SAN Match" value={sanMatch} />
        <BooleanIndicator label="CT Logged" value={ctLogged} />
      </div>
    </div>
  );
}
