import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";

export const RANKS = [
  { id: "novice", name: "Novice", xpMin: 0, xpMax: 1000, tier: 1, color: "#9ca3af", icon: "◇", desc: "Every forge begins here." },
  { id: "apprentice", name: "Apprentice", xpMin: 1000, xpMax: 2000, tier: 2, color: "#9ca3af", icon: "◈", desc: "Learning the craft." },
  { id: "journeyman", name: "Journeyman", xpMin: 2000, xpMax: 6000, tier: 3, color: "#60a5fa", icon: "◉", desc: "The path is taking shape." },
  { id: "adept", name: "Adept", xpMin: 6000, xpMax: 15000, tier: 4, color: "#60a5fa", icon: "⬡", desc: "Skill sharpens like steel." },
  { id: "specialist", name: "Specialist", xpMin: 15000, xpMax: 30000, tier: 5, color: "#e2e8f0", icon: "◎", desc: "The professional emerges." },
  { id: "expert", name: "Expert", xpMin: 30000, xpMax: 60000, tier: 6, color: "#cd7f32", icon: "▲", desc: "Bronze-tempered resolve." },
  { id: "master", name: "Master", xpMin: 60000, xpMax: 120000, tier: 7, color: "#f6ad37", icon: "★", desc: "Gold burns in the veins." },
  { id: "grandmaster", name: "Grand Master", xpMin: 120000, xpMax: 250000, tier: 8, color: "#f6ad37", icon: "✦", desc: "Few reach this height." },
  { id: "enlightened", name: "Enlightened", xpMin: 250000, xpMax: Infinity, tier: 9, color: "prismatic", icon: "◈", desc: "Beyond rank. Beyond limit." },
];

const CURRENT_XP = 3420;
const CURRENT_RANK = RANKS.find((r, i) => CURRENT_XP >= r.xpMin && (CURRENT_XP < r.xpMax || r.xpMax === Infinity)) || RANKS[1];

const TIER_LABELS: Record<number, string> = {
  1: "Beginner", 2: "Novice", 3: "Intermediate", 4: "Intermediate",
  5: "Professional", 6: "Expert", 7: "Master", 8: "Grand Master", 9: "Enlightened",
};

function rankBg(tier: number) {
  if (tier <= 2) return "rgba(156,163,175,0.08)";
  if (tier <= 4) return "rgba(96,165,250,0.08)";
  if (tier === 5) return "rgba(226,232,240,0.07)";
  if (tier === 6) return "rgba(205,127,50,0.1)";
  if (tier <= 8) return "rgba(246,173,55,0.1)";
  return "rgba(139,92,246,0.08)";
}

function RankRow({ rank, index }: { rank: typeof RANKS[0]; index: number }) {
  const isCurrent = rank.id === CURRENT_RANK.id;
  const isCompleted = CURRENT_XP >= rank.xpMax && rank.xpMax !== Infinity;
  const isFuture = !isCurrent && !isCompleted;
  const isPrismatic = rank.color === "prismatic";

  const pct = isCurrent && rank.xpMax !== Infinity
    ? Math.round(((CURRENT_XP - rank.xpMin) / (rank.xpMax - rank.xpMin)) * 100)
    : isCompleted ? 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 280, damping: 24 }}
      className={`relative ${isCurrent ? "glass-border-anim" : ""}`}
    >
      <div
        className="flex items-center gap-4 px-4 py-3 relative"
        style={{
          background: isCurrent ? rankBg(rank.tier) : isFuture ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
          border: isCurrent ? "none" : `1px solid ${isCompleted ? `${rank.color}20` : "rgba(255,255,255,0.05)"}`,
          opacity: isFuture ? 0.45 : 1,
          clip: isCurrent ? "unset" : undefined,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      >
        {/* Left glow border — active only */}
        {isCurrent && (
          <div className="absolute left-0 inset-y-0 w-0.5 rounded-r"
            style={{ background: `linear-gradient(180deg, ${rank.color}, ${rank.color}44)`, boxShadow: `0 0 8px ${rank.color}` }} />
        )}

        {/* Icon */}
        <div className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
          style={{
            filter: isPrismatic ? undefined : `drop-shadow(0 0 6px ${rank.color}88)`,
            color: isPrismatic ? undefined : rank.color,
          }}>
          {isPrismatic
            ? <span className="prismatic-text text-2xl font-bold">{rank.icon}</span>
            : <span>{rank.icon}</span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={isPrismatic ? "prismatic-text text-base font-bold leading-none" : "text-base font-bold leading-none"}
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: isPrismatic ? undefined : (isFuture ? "rgba(232,232,240,0.4)" : rank.color),
              }}
            >
              {rank.name}
            </span>
            {isCurrent && (
              <span className="text-xs px-2 py-0.5 rounded-sm font-semibold"
                style={{ background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}40` }}>
                Your current level
              </span>
            )}
            {isCompleted && (
              <span className="text-xs" style={{ color: "#10e07f" }}>✓</span>
            )}
          </div>
          <p className="text-xs" style={{ color: "rgba(232,232,240,0.4)" }}>{rank.desc}</p>

          {/* Progress bar (current rank only) */}
          {isCurrent && rank.xpMax !== Infinity && (
            <div className="mt-2 h-1 rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.5 + index * 0.05 }}
                className="h-full"
                style={{ background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`, boxShadow: `0 0 6px ${rank.color}` }}
              />
            </div>
          )}
        </div>

        {/* XP range */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs stat-num" style={{ color: isFuture ? "rgba(232,232,240,0.25)" : rank.color === "prismatic" ? "#f6ad37" : rank.color }}>
            {rank.xpMax === Infinity ? `${(rank.xpMin / 1000).toFixed(0)}K+` : `${(rank.xpMin / 1000).toFixed(0)}K–${(rank.xpMax / 1000).toFixed(0)}K`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.25)" }}>XP</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProgressionPath() {
  const currentIndex = RANKS.findIndex((r) => r.id === CURRENT_RANK.id);

  return (
    <div className="p-6 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>Progression Path</h1>
        <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>
          Each rank unlocks new titles, shop items, and challenges. Reach Enlightened to transcend the system.
        </p>
      </div>

      {/* Current rank callout */}
      <GlassCard className="p-4" glow="gold">
        <div className="flex items-center gap-3">
          <div className="text-2xl" style={{ color: CURRENT_RANK.color, filter: `drop-shadow(0 0 8px ${CURRENT_RANK.color})` }}>
            {CURRENT_RANK.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "rgba(232,232,240,0.4)" }}>Current Rank</p>
            <h2 className="text-xl font-bold text-glow-gold" style={{ fontFamily: "Rajdhani, sans-serif", color: "#f6ad37" }}>
              {CURRENT_RANK.name}
            </h2>
          </div>
          <div className="text-right text-xs">
            <p className="stat-num text-lg" style={{ color: "#f6ad37" }}>{CURRENT_XP.toLocaleString()}</p>
            <p style={{ color: "rgba(232,232,240,0.4)" }}>of {(CURRENT_RANK.xpMax / 1000).toFixed(0)}K XP</p>
          </div>
        </div>
      </GlassCard>

      <div className="energy-line" />

      {/* Rank rows */}
      <div className="space-y-2">
        {RANKS.map((rank, i) => (
          <RankRow key={rank.id} rank={rank} index={i} />
        ))}
      </div>

      {/* Tier legend */}
      <div className="p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(232,232,240,0.3)" }}>Rank Tier Colors</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Beginner/Novice", color: "#9ca3af" },
            { label: "Intermediate", color: "#60a5fa" },
            { label: "Professional", color: "#e2e8f0" },
            { label: "Expert", color: "#cd7f32" },
            { label: "Master", color: "#f6ad37" },
            { label: "Enlightened", color: "prismatic" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5">
              {t.color === "prismatic" ? (
                <div className="w-2.5 h-2.5 rounded-sm prismatic-text flex items-center justify-center text-xs">★</div>
              ) : (
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
              )}
              <span className="text-xs" style={{ color: "rgba(232,232,240,0.4)", fontSize: 10 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
