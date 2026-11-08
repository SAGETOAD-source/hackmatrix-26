import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react'
import Badge from '../ui/Badge'

const SEVERITY_CONFIG = {
  CRITICAL: {
    verdict: 'malicious',
    label: 'Critical Risk',
    border: 'border-l-[#FF4D6D]',
    icon: AlertCircle,
    color: '#FF4D6D'
  },
  HIGH: {
    verdict: 'malicious',
    label: 'High Risk',
    border: 'border-l-[#FF4D6D]',
    icon: AlertCircle,
    color: '#FF4D6D'
  },
  MEDIUM: {
    verdict: 'suspicious',
    label: 'Medium Risk',
    border: 'border-l-[#FFB020]',
    icon: AlertTriangle,
    color: '#FFB020'
  },
  LOW: {
    verdict: 'safe',
    label: 'Low Risk',
    border: 'border-l-[#34E0A1]',
    icon: ShieldCheck,
    color: '#34E0A1'
  },
  INFO: {
    verdict: 'unknown',
    label: 'Informational',
    border: 'border-l-[#8B88B0]',
    icon: Info,
    color: '#8B88B0'
  },
}

export default function FindingCard({ title, severity = 'INFO', description, details, icon: CustomIcon }) {
  const [expanded, setExpanded] = useState(false)
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO
  const IconComponent = CustomIcon || config.icon

  return (
    <div className={`p-4 rounded-xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] border-l-4 ${config.border} shadow-sm transition-all hover:border-[#7C5CFF]/30`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="mt-0.5 shrink-0" style={{ color: config.color }}>
            <IconComponent size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-[#F2F0FF] light:text-[#1E1B4B] leading-snug">
              {title}
            </h4>
            {description && (
              <p className="mt-1 text-xs text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
                {description}
              </p>
            )}

            {details && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#A78BFF] light:text-[#7C5CFF] hover:underline cursor-pointer"
                >
                  <span>{expanded ? 'Hide telemetry evidence' : 'View telemetry evidence'}</span>
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {expanded && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893] whitespace-pre-wrap break-all">
                    {typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Verdict Badge */}
        <div className="shrink-0">
          <Badge verdict={config.verdict} size="sm">
            {config.label}
          </Badge>
        </div>
      </div>
    </div>
  )
}
