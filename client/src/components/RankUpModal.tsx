import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface RankUpModalProps {
  fromRank: string;
  toRank: string;
  toColor: string;
  toIcon: string;
  onClose: () => void;
}

// Slow cinematic reveal — distinct from the fast level-up burst
export default function RankUpModal({ fromRank, toRank, toColor, toIcon, onClose }: RankUpModalProps) {
  const isPrismatic = toColor === "prismatic";

  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(5,5,15,0.92)", backdropFilter: "blur(16px)" }}
      >
        {/* Slow radial bloom */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 3, ease: "easeOut", delay: 0.3 }}
          style={{
            position: "absolute",
            width: 200, height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${isPrismatic ? "rgba(139,92,246,0.5)" : `${toColor}60`} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Slow rising particle streaks */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60, x: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: -200, x: (Math.random() - 0.5) * 160 }}
            transition={{ duration: 2.5, delay: 0.8 + i * 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "40%",
              left: `${30 + Math.random() * 40}%`,
              width: 2,
              height: 30,
              borderRadius: 4,
              background: isPrismatic
                ? `hsl(${(i * 30) % 360}, 80%, 70%)`
                : `linear-gradient(180deg, ${toColor}, transparent)`,
              boxShadow: `0 0 8px ${isPrismatic ? "rgba(139,92,246,0.5)" : `${toColor}88`}`,
              pointerEvents: "none",
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative text-center"
          style={{ maxWidth: 360, padding: "0 1.5rem" }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "rgba(232,232,240,0.4)", fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.25em" }}
          >
            Rank Advancement
          </motion.p>

          {/* Icon morph — old rank fades, new rises */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.5, x: -20 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="text-4xl"
              style={{ color: "rgba(232,232,240,0.3)", filter: "drop-shadow(0 0 4px rgba(232,232,240,0.2))" }}
            >
              ◇
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 15, delay: 1.2 }}
              className={`text-6xl ${isPrismatic ? "prismatic-text" : ""}`}
              style={isPrismatic ? undefined : {
                color: toColor,
                filter: `drop-shadow(0 0 16px ${toColor}) drop-shadow(0 0 32px ${toColor}66)`,
              }}
            >
              {toIcon}
            </motion.div>
          </div>

          {/* From → To */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4 text-sm"
            style={{ color: "rgba(232,232,240,0.45)", fontFamily: "Rajdhani, sans-serif" }}
          >
            <span>{fromRank}</span>
            <span style={{ color: "rgba(232,232,240,0.2)" }}>→</span>
            <span style={isPrismatic ? {} : { color: toColor, fontWeight: 700 }}
              className={isPrismatic ? "prismatic-text font-bold" : ""}>
              {toRank}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 1.6 }}
            className={`text-5xl font-bold mb-4 ${isPrismatic ? "prismatic-text" : ""}`}
            style={
              isPrismatic
                ? { fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.08em" }
                : {
                    fontFamily: "Rajdhani, sans-serif",
                    letterSpacing: "0.08em",
                    color: toColor,
                    textShadow: `0 0 24px ${toColor}88, 0 0 48px ${toColor}44`,
                  }
            }
          >
            {toRank}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.7 }}
            className="text-sm mb-6"
            style={{ color: "rgba(232,232,240,0.5)" }}
          >
            A rarer milestone. A harder path. The forge recognizes your dedication.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="px-10 py-2.5 text-sm font-bold"
            style={{
              background: isPrismatic
                ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(246,173,55,0.15))"
                : `linear-gradient(135deg, ${toColor}30, ${toColor}18)`,
              border: `1px solid ${isPrismatic ? "rgba(139,92,246,0.4)" : `${toColor}50`}`,
              color: isPrismatic ? "#a78bfa" : toColor,
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.12em",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            CLAIM YOUR RANK
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
