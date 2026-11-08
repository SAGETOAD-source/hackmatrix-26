import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react'

// Strict Verdict Color Tokens (Reserved exclusively for risk meaning)
const VERDICT_CONFIGS = {
  safe: {
    gradientStart: '#34E0A1',
    gradientEnd: '#10B981',
    glow: 'rgba(52, 224, 161, 0.4)',
    label: 'SAFE',
    icon: ShieldCheck,
  },
  suspicious: {
    gradientStart: '#FFB020',
    gradientEnd: '#F59E0B',
    glow: 'rgba(255, 176, 32, 0.4)',
    label: 'SUSPICIOUS',
    icon: AlertTriangle,
  },
  malicious: {
    gradientStart: '#FF4D6D',
    gradientEnd: '#E11D48',
    glow: 'rgba(255, 77, 109, 0.45)',
    label: 'MALICIOUS',
    icon: ShieldAlert,
  },
  unknown: {
    gradientStart: '#8B88B0',
    gradientEnd: '#6B7280',
    glow: 'rgba(139, 136, 176, 0.3)',
    label: 'UNKNOWN',
    icon: HelpCircle,
  },
}

function resolveVerdict(score, riskLevel) {
  const norm = String(riskLevel || '').toLowerCase()
  if (norm.includes('phish') || norm.includes('malicious') || norm.includes('crit') || norm.includes('high') || score >= 60) {
    return 'malicious'
  }
  if (norm.includes('susp') || norm.includes('med') || (score >= 30 && score < 60)) {
    return 'suspicious'
  }
  if (norm.includes('safe') || norm.includes('low') || score < 30) {
    return 'safe'
  }
  return 'unknown'
}

export default function RiskGauge({ score = 0, size = 200, riskLevel = 'LOW' }) {
  const verdictKey = resolveVerdict(score, riskLevel)
  const config = VERDICT_CONFIGS[verdictKey] || VERDICT_CONFIGS.safe
  const VerdictIcon = config.icon

  // Animated Count-Up
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Math.min(100, Math.max(0, Math.round(score)))
    if (start === end) {
      setDisplayScore(end)
      return
    }

    const duration = 800 // ms
    const startTime = performance.now()

    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * ease)
      setDisplayScore(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [score])

  const strokeWidth = size * 0.085
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  // 260 degree arc with bottom gap
  const maxAngle = 260
  const startAngle = 140
  const circumference = 2 * Math.PI * radius
  const arcLength = (maxAngle / 360) * circumference
  const filledLength = (Math.min(100, Math.max(0, score)) / 100) * arcLength

  const gradientId = `verdict-grad-${verdictKey}`

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none p-2">
      {/* Soft outer glow halo */}
      <div
        className="absolute inset-4 rounded-full blur-2xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: config.glow, opacity: 0.35 }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible relative z-10"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.gradientStart} />
            <stop offset="100%" stopColor={config.gradientEnd} />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          className="opacity-40"
        />

        {/* Active Gradient Arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - filledLength }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            filter: `drop-shadow(0 0 8px ${config.gradientStart}66)`,
          }}
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
        <div className="flex items-baseline justify-center gap-0.5">
          <span
            className="font-bold font-display text-[var(--text-primary)] leading-none tracking-tight"
            style={{ fontSize: size * 0.25 }}
          >
            {displayScore}
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)] font-medium">
            /100
          </span>
        </div>

        <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] mt-0.5">
          Unified Risk
        </span>

        {/* Verdict Badge in Center */}
        <div
          className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-300"
          style={{
            color: config.gradientStart,
            backgroundColor: `${config.gradientStart}1A`,
            border: `1px solid ${config.gradientStart}40`,
          }}
        >
          <VerdictIcon className="w-3 h-3" />
          <span>{config.label}</span>
        </div>
      </div>
    </div>
  )
}
