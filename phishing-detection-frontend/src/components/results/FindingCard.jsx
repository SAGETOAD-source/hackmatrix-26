import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react'
import Badge from '../ui/Badge'

const SEVERITY_CONFIG = {
  CRITICAL: {
    verdict: 'malicious',
    label: 'Critical Risk',
    border: 'border-l-[#EF6464]',
    icon: AlertCircle,
    color: '#EF6464'
  },
  HIGH: {
    verdict: 'malicious',
    label: 'High Risk',
    border: 'border-l-[#EF6464]',
    icon: AlertCircle,
    color: '#EF6464'
  },
  MEDIUM: {
    verdict: 'suspicious',
    label: 'Medium Risk',
    border: 'border-l-[#E9B65B]',
    icon: AlertTriangle,
    color: '#E9B65B'
  },
  LOW: {
    verdict: 'safe',
    label: 'Low Risk',
    border: 'border-l-[#55B9AD]',
    icon: ShieldCheck,
    color: '#55B9AD'
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
    <div className={`p-4 rounded-xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] border-l-4 ${config.border} shadow-sm transition-all hover:border-[#167D83]/30`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="mt-0.5 shrink-0" style={{ color: config.color }}>
            <IconComponent size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-[#F5F7F6] light:text-[#101C22] leading-snug">
              {title}
            </h4>
            {description && (
              <p className="mt-1 text-xs text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">
                {description}
              </p>
            )}

            {details && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#55B9AD] light:text-[#167D83] hover:underline cursor-pointer"
                >
                  <span>{expanded ? 'Hide telemetry evidence' : 'View telemetry evidence'}</span>
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {expanded && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67] whitespace-pre-wrap break-all">
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
