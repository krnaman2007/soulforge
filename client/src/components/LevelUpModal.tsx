import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

function Particle({ x, color }: { x: number; color: string }) {
  const duration = 0.8 + Math.random() * 0.8;
  const xDrift = (Math.random() - 0.5) * 120;
  return (
    <motion.div
      initial={{ y: 0, x: 0, scale: 1, opacity: 1 }}
      animate={{ y: -160, x: xDrift, scale: 0, opacity: 0 }}
      transition={{ duration, ease: "easeOut", delay: Math.random() * 0.3 }}
      style={{
        position: "absolute",
        bottom: "30%",
        left: `${x}%`,
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: 10 + Math.random() * 80,
    color: ["#f6ad37", "#ff6b35", "#a78bfa", "#34d399"][i % 4],
  }));

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(10,10,18,0.85)", backdropFilter: "blur(8px)" }}
      >
        {/* Radial gold burst */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(246,173,55,0.4) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Particles */}
        {particles.map((p, i) => (
          <Particle key={i} x={p.x} color={p.color} />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="relative text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium mb-2"
            style={{ color: "#f6ad37", letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            Congratulations
          </motion.p>
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #f6ad37 0%, #ff6b35 50%, #f6ad37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              lineHeight: 1,
              marginBottom: "0.25em",
            }}
          >
            LEVEL UP
          </motion.h1>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f6ad37, #ff6b35)",
              boxShadow: "0 0 40px rgba(246,173,55,0.5)",
              margin: "0 auto",
              fontFamily: "Sora, sans-serif",
              fontSize: "2rem",
              fontWeight: 800,
              color: "#0a0a12",
            }}
          >
            {level}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm"
            style={{ color: "rgba(232,232,240,0.6)" }}
          >
            Next level requires more XP — keep forging.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="mt-6 px-8 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #f6ad37, #ff6b35)",
              color: "#0a0a12",
              fontFamily: "Sora, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
