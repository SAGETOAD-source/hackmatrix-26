import { motion } from 'framer-motion'

const RISK_COLORS = {
  LOW: '#22C55E',
  SUSPICIOUS: '#F59E0B',
  HIGH: '#EA580C',
  CRITICAL: '#EF4444',
}

export default function RiskGauge({ score = 0, size = 190, riskLevel = 'LOW' }) {
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  // 270 degrees arc (leave gap at bottom)
  const maxAngle = 270
  const startAngle = 135 // start from bottom-left
  const circumference = 2 * Math.PI * radius
  const arcLength = (maxAngle / 360) * circumference
  const filledLength = (score / 100) * arcLength

  const color = RISK_COLORS[riskLevel] || RISK_COLORS.LOW

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-[#24344B] light:text-[#E2E8F0]"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
        />

        {/* Foreground arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - filledLength }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="font-extrabold font-mono text-[#F1F5FF] light:text-[#172033] leading-none"
          style={{ fontSize: size * 0.24 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span
          className="text-[#9EACC2] light:text-[#64748B] font-mono text-[11px] mt-1"
        >
          SCORE / 100
        </span>
        <span
          className="mt-1 font-bold text-xs tracking-wider uppercase px-2 py-0.5 rounded"
          style={{
            color,
            backgroundColor: `${color}15`,
            border: `1px solid ${color}35`,
          }}
        >
          {riskLevel}
        </span>
      </div>
    </div>
  )
}
