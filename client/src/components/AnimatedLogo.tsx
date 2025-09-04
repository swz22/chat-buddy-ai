import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  isActive?: boolean;
}

export default function AnimatedLogo({ size = 'medium', animate = true, isActive = false }: AnimatedLogoProps) {
  const [particlePositions, setParticlePositions] = useState<Array<{ x: number; y: number }>>([]);
  
  const dimensions = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 64, height: 64 }
  };

  const { width, height } = dimensions[size];
  const scale = width / 64;

  useEffect(() => {
    const positions = [];
    for (let i = 0; i < 6; i++) {
      positions.push({
        x: Math.random() * 64,
        y: Math.random() * 64
      });
    }
    setParticlePositions(positions);
  }, []);

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
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop 
              offset="0%" 
              stopColor="#3B82F6"
              animate={animate ? { stopColor: ['#3B82F6', '#8B5CF6', '#3B82F6'] } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop 
              offset="50%" 
              stopColor="#8B5CF6"
              animate={animate ? { stopColor: ['#8B5CF6', '#EC4899', '#8B5CF6'] } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop 
              offset="100%" 
              stopColor="#EC4899"
              animate={animate ? { stopColor: ['#EC4899', '#3B82F6', '#EC4899'] } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="neuralGlow">
            <feGaussianBlur stdDeviation="1" result="smallBlur"/>
            <feMerge>
              <feMergeNode in="smallBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer orbital rings */}
        <motion.ellipse
          cx="32"
          cy="32"
          rx="28"
          ry="12"
          stroke="url(#logoGradient)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
          initial={{ rotate: 0 }}
          animate={animate ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.ellipse
          cx="32"
          cy="32"
          rx="28"
          ry="12"
          stroke="url(#logoGradient)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
          initial={{ rotate: 60 }}
          animate={animate ? { rotate: 420 } : {}}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.ellipse
          cx="32"
          cy="32"
          rx="28"
          ry="12"
          stroke="url(#logoGradient)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
          initial={{ rotate: -60 }}
          animate={animate ? { rotate: -420 } : {}}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Neural network connections */}
        {animate && [
          { from: { x: 32, y: 14 }, to: { x: 20, y: 32 } },
          { from: { x: 32, y: 14 }, to: { x: 44, y: 32 } },
          { from: { x: 20, y: 32 }, to: { x: 32, y: 50 } },
          { from: { x: 44, y: 32 }, to: { x: 32, y: 50 } },
          { from: { x: 20, y: 32 }, to: { x: 44, y: 32 } },
        ].map((connection, index) => (
          <motion.line
            key={`connection-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="url(#logoGradient)"
            strokeWidth="0.5"
            opacity="0"
            animate={{
              opacity: [0, 0.6, 0],
              pathLength: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: index * 0.3,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        ))}

        {/* Central hexagon core */}
        <motion.path
          d="M32 14 L46 22 L46 42 L32 50 L18 42 L18 22 Z"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={animate ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        <motion.path
          d="M32 14 L46 22 L46 42 L32 50 L18 42 L18 22 Z"
          fill="url(#logoGradient)"
          opacity="0.1"
          initial={{ scale: 0 }}
          animate={animate ? { scale: [0, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Neural nodes */}
        {[
          { cx: 32, cy: 14, delay: 0 },
          { cx: 46, cy: 22, delay: 0.1 },
          { cx: 46, cy: 42, delay: 0.2 },
          { cx: 32, cy: 50, delay: 0.3 },
          { cx: 18, cy: 42, delay: 0.4 },
          { cx: 18, cy: 22, delay: 0.5 },
        ].map((node, index) => (
          <g key={`node-${index}`}>
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="3"
              fill="url(#logoGradient)"
              filter="url(#neuralGlow)"
              initial={{ scale: 0 }}
              animate={animate ? { scale: [0, 1.2, 1] } : { scale: 1 }}
              transition={{
                duration: 0.5,
                delay: node.delay,
                ease: "backOut"
              }}
            />
            {isActive && (
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r="3"
                fill="none"
                stroke="url(#logoGradient)"
                strokeWidth="0.5"
                initial={{ scale: 1, opacity: 1 }}
                animate={{
                  scale: [1, 2, 2],
                  opacity: [1, 0, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: node.delay,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            )}
          </g>
        ))}

        {/* Center neural core */}
        <motion.circle
          cx="32"
          cy="32"
          r="5"
          fill="url(#logoGradient)"
          filter="url(#glow)"
          initial={{ scale: 0 }}
          animate={animate ? { scale: [0, 1.2, 1] } : { scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.6,
            ease: "backOut"
          }}
        />
        
        {/* Floating particles */}
        {animate && particlePositions.map((pos, index) => (
          <motion.circle
            key={`particle-${index}`}
            cx={pos.x}
            cy={pos.y}
            r="0.5"
            fill="url(#logoGradient)"
            opacity="0.6"
            animate={{
              cx: [pos.x, pos.x + (Math.random() - 0.5) * 20, pos.x],
              cy: [pos.y, pos.y + (Math.random() - 0.5) * 20, pos.y],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}

        {/* Activity pulse when active */}
        {isActive && (
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="1"
            opacity="0"
            animate={{
              r: [20, 35],
              opacity: [0.8, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
        )}
      </svg>
    </div>
  );
}