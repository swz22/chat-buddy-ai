import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
}

export default function AnimatedLogo({ size = 'medium', animate = true }: AnimatedLogoProps) {
  const dimensions = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 64, height: 64 }
  };

  const { width, height } = dimensions[size];

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, rotate: 0 }}
          animate={animate ? {
            pathLength: [0, 1, 1],
            rotate: [0, 0, 360],
          } : {}}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            rotate: { duration: 20, ease: "linear", repeat: Infinity }
          }}
        />

        {/* Inner hexagon */}
        <motion.path
          d="M32 14 L46 22 L46 42 L32 50 L18 42 L18 22 Z"
          fill="url(#logoGradient)"
          opacity="0.9"
          initial={{ scale: 0 }}
          animate={animate ? { scale: [0, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Neural network dots */}
        {[
          { cx: 32, cy: 22 },
          { cx: 24, cy: 32 },
          { cx: 40, cy: 32 },
          { cx: 32, cy: 42 },
        ].map((dot, index) => (
          <motion.circle
            key={index}
            cx={dot.cx}
            cy={dot.cy}
            r="3"
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={animate ? {
              opacity: [0, 1, 0.8],
              scale: [0, 1.2, 1],
            } : { opacity: 0.8, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.5 + index * 0.1,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Connecting lines */}
        {animate && (
          <>
            <motion.line
              x1="32" y1="22"
              x2="24" y2="32"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            />
            <motion.line
              x1="32" y1="22"
              x2="40" y2="32"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            />
            <motion.line
              x1="24" y1="32"
              x2="32" y2="42"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            />
            <motion.line
              x1="40" y1="32"
              x2="32" y2="42"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            />
          </>
        )}
      </svg>

      {/* Pulse effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: 'blur(20px)' }}
        />
      )}
    </div>
  );
}