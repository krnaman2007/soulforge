import { motion } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

type View = "global" | "friends";

const GLOBAL = [
  { rank: 1, name: "Zara Chen", rankTitle: "Grand Master", tier: 8, level: 42, xp: 128400, streak: 87, change: 0, avatar: "🦅", you: false },
  { rank: 2, name: "Marcus Webb", rankTitle: "Grand Master", tier: 8, level: 39, xp: 118200, streak: 61, change: 2, avatar: "⚡", you: false },
  { rank: 3, name: "Priya Nair", rankTitle: "Master", tier: 7, level: 37, xp: 109600, streak: 44, change: -1, avatar: "🌙", you: false },
  { rank: 4, name: "Devon Asher", rankTitle: "Expert", tier: 6, level: 35, xp: 98100, streak: 33, change: 1, avatar: "🔥", you: false },
  { rank: 5, name: "Sofia Reyes", rankTitle: "Specialist", tier: 5, level: 33, xp: 87300, streak: 29, change: -2, avatar: "🚀", you: false },
  { rank: 6, name: "Kira Stone", rankTitle: "Adept", tier: 4, level: 31, xp: 76400, streak: 18, change: 3, avatar: "🌟", you: false },
  { rank: 7, name: "James Park", rankTitle: "Adept", tier: 4, level: 28, xp: 64200, streak: 22, change: 0, avatar: "💎", you: false },
  { rank: 8, name: "Aiden", rankTitle: "Journeyman", tier: 3, level: 7, xp: 3420, streak: 7, change: 0, avatar: "⚔️", you: true },
];

const FRIENDS = [
  { rank: 1, name: "Alex Torres", rankTitle: "Journeyman", tier: 3, level: 22, xp: 48200, streak: 15, change: 0, avatar: "☄", you: false },
  { rank: 2, name: "Jamie Liu", rankTitle: "Apprentice", tier: 2, level: 18, xp: 34600, streak: 9, change: 1, avatar: "🛠", you: false },
  { rank: 3, name: "Aiden", rankTitle: "Journeyman", tier: 3, level: 7, xp: 3420, streak: 7, change: 1, avatar: "⚔️", you: true },
  { rank: 4, name: "Sam Rivera", rankTitle: "Novice", tier: 1, level: 5, xp: 1840, streak: 3, change: -1, avatar: "🗺", you: false },
];

// Tier → color map (matches progression path)
const TIER_COLORS: Record<number, string> = {
  1: "#9ca3af", 2: "#9ca3af", 3: "#60a5fa", 4: "#60a5fa",
  5: "#e2e8f0", 6: "#cd7f32", 7: "#f6ad37", 8: "#f6ad37", 9: "prismatic",
};

// Top 3 podium medals
const PODIUM_CONFIG = [
  { bg: "rgba(246,173,55,0.15)", border: "rgba(246,173,55,0.35)", color: "#f6ad37", glow: "rgba(246,173,55,0.3)", label: "1st" },
  { bg: "rgba(226,232,240,0.1)", border: "rgba(226,232,240,0.25)", color: "#e2e8f0", glow: "rgba(226,232,240,0.15)", label: "2nd" },
  { bg: "rgba(205,127,50,0.1)", border: "rgba(205,127,50,0.25)", color: "#cd7f32", glow: "rgba(205,127,50,0.2)", label: "3rd" },
];

function Podium({ entries }: { entries: typeof GLOBAL }) {
  const top3 = entries.slice(0, 3);
  // Order: 2nd, 1st, 3rd
  const ordered = [top3[1], top3[0], top3[2]];
  const heights = ["h-20", "h-28", "h-14"];
  const configs = [PODIUM_CONFIG[1], PODIUM_CONFIG[0], PODIUM_CONFIG[2]];
  const tiers = [ordered[0]?.tier, ordered[1]?.tier, ordered[2]?.tier];

  return (
    <div className="flex items-end justify-center gap-3 pb-2">
      {ordered.map((entry, i) => {
        if (!entry) return null;
        const cfg = configs[i];
        const tc = TIER_COLORS[entry.tier] || "#9ca3af";
        return (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Avatar */}
            <div className="text-2xl">{entry.avatar}</div>
            <div className="text-center">
              <p className="text-xs font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: entry.you ? "#f6ad37" : "#e8e8f0" }}>{entry.name}</p>
              <p className="text-xs" style={{ color: tc, fontSize: 10 }}>{entry.rankTitle}</p>
            </div>
            {/* Podium block */}
            <div className={`w-20 ${heights[i]} flex items-center justify-center text-lg font-bold`}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                boxShadow: `0 0 16px ${cfg.glow}`,
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                color: cfg.color,
                fontFamily: "Rajdhani, sans-serif",
              }}>
              {cfg.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function LeaderRow({ entry, index }: { entry: typeof GLOBAL[0]; index: number }) {
  const tc = TIER_COLORS[entry.tier] || "#9ca3af";
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 280, damping: 24 }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 transition-all"
        style={{
          background: entry.you ? "rgba(246,173,55,0.07)" : "rgba(255,255,255,0.025)",
          border: `1px solid ${entry.you ? "rgba(246,173,55,0.22)" : "rgba(255,255,255,0.05)"}`,
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          boxShadow: entry.you ? "0 0 14px rgba(246,173,55,0.07)" : "none",
        }}>
        {/* Rank # */}
        <div className="w-7 text-center flex-shrink-0">
          <span className="text-xs font-bold stat-num" style={{ color: isTop3 ? tc : "rgba(232,232,240,0.35)", fontFamily: "Rajdhani, sans-serif" }}>
            #{entry.rank}
          </span>
        </div>

        {/* Avatar hex */}
        <div className="w-8 h-8 hex-clip flex items-center justify-center text-base flex-shrink-0"
          style={{ background: entry.you ? "rgba(246,173,55,0.15)" : "rgba(255,255,255,0.06)" }}>
          {entry.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ fontFamily: "Rajdhani, sans-serif", color: entry.you ? "#f6ad37" : "#e8e8f0" }}>
              {entry.name}
            </span>
            {entry.you && <span className="text-xs px-1.5 py-0.5"
              style={{ background: "rgba(246,173,55,0.15)", color: "#f6ad37", border: "1px solid rgba(246,173,55,0.2)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>You</span>}
          </div>
          <p className="text-xs" style={{ color: tc, opacity: 0.85 }}>
            Lv {entry.level} · {entry.rankTitle}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs flex-shrink-0">
          <div className="text-right">
            <p className="font-semibold stat-num" style={{ color: "#f6ad37" }}>{entry.xp.toLocaleString()}</p>
            <p style={{ color: "rgba(232,232,240,0.3)" }}>XP</p>
          </div>
          <div className="text-right">
            <p className="flex items-center gap-0.5 justify-end">
              <span className="flame-pulse inline-block text-sm">🔥</span>
              <span className="font-semibold stat-num" style={{ color: "#ff6b35" }}>{entry.streak}</span>
            </p>
            <p style={{ color: "rgba(232,232,240,0.3)" }}>streak</p>
          </div>
          <div className="w-8 text-right">
            {entry.change === 0 ? (
              <span style={{ color: "rgba(232,232,240,0.3)", fontSize: 10 }}>—</span>
            ) : (
              <span className="text-xs font-semibold" style={{ color: entry.change > 0 ? "#10e07f" : "#dc2626", fontFamily: "Rajdhani, sans-serif" }}>
                {entry.change > 0 ? "↑" : "↓"}{Math.abs(entry.change)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [view, setView] = useState<View>("global");
  const data = view === "global" ? GLOBAL : FRIENDS;
  const you = data.find((e) => e.you);
  const remaining = data.slice(3);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>Leaderboard</h1>
          <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>Rankings reset weekly. Rank titles shown alongside levels.</p>
        </div>
        {you && (
          <div className="text-right text-xs">
            <p style={{ color: "rgba(232,232,240,0.35)" }}>Your rank</p>
            <p className="font-bold text-xl stat-num" style={{ color: "#f6ad37", fontFamily: "Rajdhani, sans-serif" }}>#{you.rank}</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="flex p-1 gap-1"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
        {(["global", "friends"] as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-2 text-sm font-medium capitalize transition-all"
            style={{
              background: view === v ? "rgba(246,173,55,0.1)" : "transparent",
              border: view === v ? "1px solid rgba(246,173,55,0.18)" : "1px solid transparent",
              color: view === v ? "#f6ad37" : "rgba(232,232,240,0.45)",
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.05em",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            }}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Podium — top 3 */}
      <GlassCard className="p-5 pt-6" hover={false} glow="gold">
        <Podium entries={data} />
      </GlassCard>

      <div className="energy-line" />

      {/* Remaining rows (4+) */}
      <div className="space-y-2">
        {remaining.map((entry, i) => (
          <LeaderRow key={entry.name + view} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}
