import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PenaltyModalProps {
  xpLost: number;
  taskTitle: string;
  debuffName?: string;
  debuffDuration?: string;
  onClose: () => void;
}

export default function PenaltyModal({ xpLost, taskTitle, debuffName, debuffDuration, onClose }: PenaltyModalProps) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Trigger shake on mount
    setShake(true);
    const t1 = setTimeout(() => setShake(false), 400);
    const t2 = setTimeout(onClose, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`fixed inset-0 z-50 flex items-center justify-center ${shake ? "screen-shake" : ""}`}
        style={{ background: "rgba(30,0,0,0.8)", backdropFilter: "blur(8px)" }}
      >
        {/* Red flash pulse */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(220,38,38,0.25)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "rgba(20, 5, 5, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(220,38,38,0.4)",
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            padding: "2rem",
            maxWidth: 380,
            width: "90%",
            position: "relative",
            boxShadow: "0 0 40px rgba(220,38,38,0.2)",
          }}
        >
          {/* Red corner accent */}
          <div style={{
            position: "absolute",
            top: 0, right: 0,
            width: 60, height: 60,
            background: "linear-gradient(225deg, rgba(220,38,38,0.3), transparent)",
            pointerEvents: "none",
          }} />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(220,38,38,0.7)", fontFamily: "Rajdhani, sans-serif" }}>
              Quest Deadline Missed
            </p>
            <h2 className="text-2xl font-bold mb-1 text-glow-danger" style={{ fontFamily: "Rajdhani, sans-serif", color: "#dc2626" }}>
              Task Overdue
            </h2>
            <p className="text-sm mb-5" style={{ color: "rgba(232,232,240,0.5)" }}>
              &ldquo;{taskTitle}&rdquo;
            </p>
          </motion.div>

          {/* XP loss */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }}
            className="text-center py-4 mb-4"
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            <p className="stat-num text-5xl font-bold text-glow-danger" style={{ color: "#dc2626" }}>
              −{xpLost} XP
            </p>
          </motion.div>

          {/* Debuff applied */}
          {debuffName && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3 mb-5"
              style={{
                background: "rgba(217,119,6,0.1)",
                border: "1px solid rgba(217,119,6,0.25)",
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
              }}
            >
              <span style={{ fontSize: 18, color: "#d97706" }}>⚠</span>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: "Rajdhani, sans-serif", color: "#d97706" }}>
                  Debuff: {debuffName}
                </p>
                <p className="text-xs" style={{ color: "rgba(232,232,240,0.45)" }}>
                  {debuffDuration} — reduced XP gain on this category
                </p>
              </div>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm mb-5"
            style={{ color: "rgba(232,232,240,0.5)" }}
          >
            Everyone misses sometimes. The forge remembers your total journey, not one stumble. Reset and forge harder.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-2.5 text-sm font-bold"
            style={{
              background: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "#dc2626",
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.1em",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            FORGE ON
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
