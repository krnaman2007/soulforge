import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import XPBar from "../components/XPBar";

const ATTRIBUTES = [
  { name: "Focus", value: 72, max: 100, color: "#8b5cf6", desc: "Deep work & sustained attention" },
  { name: "Vitality", value: 58, max: 100, color: "#10e07f", desc: "Physical health & energy" },
  { name: "Mastery", value: 85, max: 100, color: "#f6ad37", desc: "Skill depth & expertise" },
  { name: "Discipline", value: 61, max: 100, color: "#ff6b35", desc: "Consistency & habit adherence" },
  { name: "Creativity", value: 44, max: 100, color: "#60a5fa", desc: "Novel thinking & expression" },
  { name: "Resilience", value: 77, max: 100, color: "#f472b6", desc: "Bounce-back & adaptability" },
];

const TITLES = [
  { name: "The Architect", unlocked: true, equipped: true, desc: "Awarded for planning 5+ projects" },
  { name: "Iron Will", unlocked: true, equipped: false, desc: "Completed a 14-day streak" },
  { name: "Deep Diver", unlocked: false, equipped: false, desc: "Reach Mastery 90 to unlock" },
  { name: "Night Owl", unlocked: false, equipped: false, desc: "Complete 10 quests after 10pm" },
];

// Streak badge collection — tiered medals
const BADGES = [
  { name: "First Flame", desc: "3-day streak", icon: "🔥", tier: "bronze", earned: true },
  { name: "Steady Burn", desc: "7-day streak", icon: "🔥", tier: "silver", earned: true },
  { name: "Iron Streak", desc: "14-day streak", icon: "🏅", tier: "gold", earned: true },
  { name: "Forge Fire", desc: "30-day streak", icon: "🏆", tier: "gold", earned: false },
  { name: "Eternal Flame", desc: "60-day streak", icon: "✦", tier: "legendary", earned: false },
  { name: "Ascendant", desc: "100-day streak", icon: "◈", tier: "legendary", earned: false },
];

const BADGE_TIER: Record<string, { color: string; bg: string; border: string }> = {
  bronze: { color: "#cd7f32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.25)" },
  silver: { color: "#e2e8f0", bg: "rgba(226,232,240,0.08)", border: "rgba(226,232,240,0.18)" },
  gold: { color: "#f6ad37", bg: "rgba(246,173,55,0.12)", border: "rgba(246,173,55,0.25)" },
  legendary: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
};

function StatBar({ attr, index }: { attr: typeof ATTRIBUTES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-3"
      style={{ background: "rgba(255,255,255,0.04)", clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-bold leading-none" style={{ fontFamily: "Rajdhani, sans-serif" }}>{attr.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.38)" }}>{attr.desc}</p>
        </div>
        <span className="text-lg font-bold stat-num" style={{ color: attr.color }}>{attr.value}</span>
      </div>
      <div className="h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(attr.value / attr.max) * 100}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.2 + index * 0.05 }}
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${attr.color}77, ${attr.color})`, boxShadow: `0 0 6px ${attr.color}66` }}
        />
      </div>
    </motion.div>
  );
}

export default function CharacterSheet() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>Character Sheet</h1>

      {/* Identity — rank badge prominent */}
      <GlassCard className="p-6" glow="gold">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Hex avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 hex-clip flex items-center justify-center text-4xl"
              style={{
                background: "linear-gradient(135deg, #1a1a3e, #0d0d20)",
                outline: "3px solid rgba(246,173,55,0.45)",
                outlineOffset: 3,
                filter: "drop-shadow(0 0 20px rgba(246,173,55,0.25))",
              }}>
              ⚔️
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #f6ad37, #ff6b35)",
                color: "#0d0d14",
                clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                boxShadow: "0 0 12px rgba(246,173,55,0.5)",
              }}>
              7
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>Aiden</h2>
              {/* Rank badge — prominent */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rank-glow"
                style={{
                  background: "rgba(96,165,250,0.12)",
                  border: "1px solid rgba(96,165,250,0.3)",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}>
                <span className="text-sm" style={{ color: "#60a5fa" }}>◉</span>
                <span className="text-sm font-bold" style={{ color: "#60a5fa", fontFamily: "Rajdhani, sans-serif" }}>Journeyman</span>
              </div>
              <span className="text-xs px-2 py-0.5"
                style={{ background: "rgba(246,173,55,0.12)", color: "#f6ad37", border: "1px solid rgba(246,173,55,0.2)", clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))" }}>
                The Architect
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#8b5cf6" }}>Tier II · Work & Learning Focused</p>
            <XPBar current={3420} max={5000} level={7} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: "Total Quests", value: "142", color: "#f6ad37" },
            { label: "Best Streak", value: "23d", color: "#ff6b35" },
            { label: "Rank Tier", value: "3 / 9", color: "#60a5fa" },
          ].map((s) => (
            <div key={s.label} className="p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
              <p className="font-bold text-lg stat-num" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.38)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Streak shield */}
        <div className="mt-4 p-3 flex items-center gap-3"
          style={{ background: "rgba(16,224,127,0.05)", border: "1px solid rgba(16,224,127,0.15)", clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}>
          <span style={{ fontSize: 18 }}>🛡</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#10e07f", fontFamily: "Rajdhani, sans-serif" }}>Streak Shield — Active</p>
            <p className="text-xs" style={{ color: "rgba(232,232,240,0.38)" }}>1 shield available. Protects your 7-day streak from a missed day.</p>
          </div>
        </div>
      </GlassCard>

      <div className="energy-line" />

      {/* Attributes */}
      <div>
        <h2 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "rgba(232,232,240,0.35)", fontFamily: "Rajdhani, sans-serif" }}>Attributes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ATTRIBUTES.map((attr, i) => <StatBar key={attr.name} attr={attr} index={i} />)}
        </div>
      </div>

      <div className="energy-line" />

      {/* Streak badge collection grid */}
      <div>
        <h2 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "rgba(232,232,240,0.35)", fontFamily: "Rajdhani, sans-serif" }}>Streak Badges</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BADGES.map((badge, i) => {
            const bt = BADGE_TIER[badge.tier];
            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1.5 p-3 text-center"
                style={{
                  background: badge.earned ? bt.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${badge.earned ? bt.border : "rgba(255,255,255,0.05)"}`,
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  filter: badge.earned ? `drop-shadow(0 0 8px ${bt.color}40)` : "grayscale(1)",
                  opacity: badge.earned ? 1 : 0.4,
                }}
              >
                <span className="text-xl">{badge.earned ? badge.icon : "🔒"}</span>
                <p className="text-xs font-semibold leading-tight" style={{ color: badge.earned ? bt.color : "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif", fontSize: 10 }}>
                  {badge.name}
                </p>
                <p className="text-xs" style={{ color: "rgba(232,232,240,0.3)", fontSize: 9 }}>{badge.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="energy-line" />

      {/* Titles */}
      <div>
        <h2 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "rgba(232,232,240,0.35)", fontFamily: "Rajdhani, sans-serif" }}>Titles</h2>
        <div className="space-y-2">
          {TITLES.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="p-3 flex items-center gap-3" hover={t.unlocked} glow="none">
                <div className="w-8 h-8 flex items-center justify-center text-sm"
                  style={{
                    background: t.equipped ? "rgba(246,173,55,0.12)" : t.unlocked ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${t.equipped ? "rgba(246,173,55,0.25)" : "rgba(255,255,255,0.07)"}`,
                    clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                  }}>
                  {t.unlocked ? "👑" : "🔒"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: t.unlocked ? (t.equipped ? "#f6ad37" : "#e8e8f0") : "rgba(232,232,240,0.28)" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(232,232,240,0.35)" }}>{t.desc}</p>
                </div>
                {t.equipped && (
                  <span className="text-xs px-2 py-0.5 font-semibold"
                    style={{ background: "rgba(246,173,55,0.1)", color: "#f6ad37", border: "1px solid rgba(246,173,55,0.2)", fontFamily: "Rajdhani, sans-serif", clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))" }}>
                    EQUIPPED
                  </span>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
