import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  className?: string;
}

export default function XPBar({ current, max, level, className = "" }: XPBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[rgba(232,232,240,0.5)]">Level {level}</span>
        <span className="font-semibold" style={{ color: "#f6ad37" }}>
          {current.toLocaleString()} / {max.toLocaleString()} XP
        </span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayed}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, #f6ad37, #ff6b35)",
            boxShadow: "0 0 8px rgba(246,173,55,0.6)",
          }}
        />
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        />
      </div>
    </div>
  );
}
