import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "cyan" | "violet" | "magenta" | "emerald" | "none";
  onClick?: () => void;
}

const glowMap = {
  cyan: "hover:shadow-[0_8px_40px_rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.25)]",
  violet: "hover:shadow-[0_8px_40px_rgba(167,139,250,0.15)] hover:border-[rgba(167,139,250,0.25)]",
  magenta: "hover:shadow-[0_8px_40px_rgba(236,72,153,0.15)] hover:border-[rgba(236,72,153,0.25)]",
  emerald: "hover:shadow-[0_8px_40px_rgba(52,211,153,0.15)] hover:border-[rgba(52,211,153,0.25)]",
  none: "",
};

export default function GlassCard({ children, className = "", hover = true, glow = "cyan", onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className={`glass transition-all duration-200 ${hover ? glowMap[glow] : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
