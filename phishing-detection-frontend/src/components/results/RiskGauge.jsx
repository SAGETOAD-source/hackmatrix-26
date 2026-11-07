import { motion } from 'framer-motion';

const RISK_COLORS = {
  LOW: '#10b981',
  SUSPICIOUS: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#f43f5e',
};

export default function RiskGauge({ score = 0, size = 200, riskLevel = 'LOW' }) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // 270 degrees arc (leave gap at bottom)
  const maxAngle = 270;
  const startAngle = 135; // start from bottom-left
  const circumference = 2 * Math.PI * radius;
  const arcLength = (maxAngle / 360) * circumference;
  const filledLength = (score / 100) * arcLength;

  const color = RISK_COLORS[riskLevel] || RISK_COLORS.LOW;

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
          className="text-white/10 light:text-gray-200"
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
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-bold text-white light:text-gray-900"
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span
          className="text-slate-400 light:text-slate-500 font-medium"
          style={{ fontSize: size * 0.09 }}
        >
          /100
        </span>
        <span
          className="mt-1 font-semibold tracking-wider uppercase"
          style={{ fontSize: size * 0.08, color }}
        >
          {riskLevel}
        </span>
      </div>
    </div>
  );
}
