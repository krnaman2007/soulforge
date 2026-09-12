import { motion } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";
import XPBar from "../components/XPBar";
import LevelUpModal from "../components/LevelUpModal";
import PenaltyModal from "../components/PenaltyModal";
import RankUpModal from "../components/RankUpModal";

const STATS = [
  { label: "Focus", value: 72, color: "#8b5cf6" },
  { label: "Vitality", value: 58, color: "#10e07f" },
  { label: "Mastery", value: 85, color: "#f6ad37" },
  { label: "Discipline", value: 61, color: "#ff6b35" },
];

const RECENT_QUESTS = [
  { title: "Complete project architecture doc", xp: 120, coins: 45, done: true, overdue: false },
  { title: "30-minute morning run", xp: 80, coins: 30, done: true, overdue: false },
  { title: "Read 20 pages of Deep Work", xp: 60, coins: 25, done: false, overdue: false },
  { title: "Weekly progress review", xp: 90, coins: 35, done: false, overdue: true, minutesLeft: 0 },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
};

export default function Dashboard() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPenalty, setShowPenalty] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const [streak] = useState(7);
  const [coins] = useState(1240);
  const [debuffActive] = useState(true);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {showLevelUp && <LevelUpModal level={8} onClose={() => setShowLevelUp(false)} />}
      {showPenalty && (
        <PenaltyModal
          xpLost={45}
          taskTitle="Weekly progress review"
          debuffName="Fatigue"
          debuffDuration="24 hours"
          onClose={() => setShowPenalty(false)}
        />
      )}
      {showRankUp && (
        <RankUpModal
          fromRank="Novice"
          toRank="Journeyman"
          toColor="#60a5fa"
          toIcon="◉"
          onClose={() => setShowRankUp(false)}
        />
      )}

      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex items-start justify-between">
        <motion.div variants={fadeUp}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(232,232,240,0.35)", fontFamily: "Rajdhani, sans-serif" }}>Welcome back</p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Aiden&nbsp;<span style={{ color: "#f6ad37" }}>the Architect</span>
          </h1>
        </motion.div>
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5"
            style={{ background: "rgba(246,173,55,0.1)", border: "1px solid rgba(246,173,55,0.2)", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
            <span style={{ color: "#f6ad37", fontSize: 13 }}>◈</span>
            <span className="text-sm font-semibold stat-num" style={{ color: "#f6ad37" }}>{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5"
            style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
            <span className="flame-pulse inline-block" style={{ fontSize: 13 }}>🔥</span>
            <span className="text-sm font-semibold stat-num" style={{ color: "#ff6b35" }}>{streak}d</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Character card */}
        <motion.div variants={fadeUp} className="lg:col-span-1">
          <GlassCard className="p-6 flex flex-col items-center text-center" glow="gold">
            {/* Hexagonal avatar */}
            <div className="relative mb-4">
              <div className="w-20 h-20 hex-clip overflow-hidden flex items-center justify-center text-4xl"
                style={{
                  background: "linear-gradient(135deg, #1a1a3e, #0d0d20)",
                  outline: "3px solid rgba(246,173,55,0.5)",
                  outlineOffset: 2,
                  filter: "drop-shadow(0 0 16px rgba(246,173,55,0.3))",
                }}>
                ⚔️
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center text-xs font-bold rank-glow"
                style={{ background: "linear-gradient(135deg, #f6ad37, #ff6b35)", color: "#0d0d14", clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}>
                7
              </div>
            </div>

            <h3 className="font-bold text-base mb-0.5" style={{ fontFamily: "Rajdhani, sans-serif" }}>Aiden</h3>

            {/* Rank tag */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs px-2 py-0.5"
                style={{
                  background: "rgba(96,165,250,0.12)",
                  border: "1px solid rgba(96,165,250,0.25)",
                  color: "#60a5fa",
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                }}>
                ◉ Journeyman
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: "#8b5cf6" }}>The Architect — Tier II</p>

            <XPBar current={3420} max={5000} level={7} className="w-full" />

            {/* Debuff indicator */}
            {debuffActive && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 w-full flex items-center gap-2 px-3 py-2"
                style={{
                  background: "rgba(217,119,6,0.1)",
                  border: "1px solid rgba(217,119,6,0.25)",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                }}>
                <span style={{ color: "#d97706", fontSize: 12 }}>⚠</span>
                <div className="text-left">
                  <p className="text-xs font-semibold" style={{ color: "#d97706" }}>Fatigue debuff</p>
                  <p className="text-xs" style={{ color: "rgba(232,232,240,0.4)", fontSize: 10 }}>−15% XP gain · 18h remaining</p>
                </div>
              </motion.div>
            )}

            {/* Stat mini bars */}
            <div className="grid grid-cols-2 gap-2 w-full mt-3">
              {STATS.map((s) => (
                <div key={s.label} className="p-2" style={{ background: "rgba(255,255,255,0.04)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "rgba(232,232,240,0.5)" }}>{s.label}</span>
                    <span className="text-xs font-semibold stat-num" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <div className="h-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.3 }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, boxShadow: `0 0 4px ${s.color}66` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Demo modal buttons */}
            <div className="w-full mt-4 grid grid-cols-3 gap-1.5">
              <button onClick={() => setShowLevelUp(true)} className="py-1.5 text-xs font-semibold"
                style={{ background: "rgba(246,173,55,0.1)", border: "1px solid rgba(246,173,55,0.2)", color: "#f6ad37", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                Level Up
              </button>
              <button onClick={() => setShowRankUp(true)} className="py-1.5 text-xs font-semibold"
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                Rank Up
              </button>
              <button onClick={() => setShowPenalty(true)} className="py-1.5 text-xs font-semibold"
                style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                Penalty
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div variants={fadeUp}>
            <GlassCard className="p-5" glow="violet">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif", color: "rgba(232,232,240,0.6)" }}>Today&apos;s Progress</h2>
                <span className="text-xs px-2.5 py-1"
                  style={{ background: "rgba(16,224,127,0.1)", color: "#10e07f", border: "1px solid rgba(16,224,127,0.2)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                  2 / 4 quests
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "XP Earned", value: "200", color: "#f6ad37" },
                  { label: "Coins", value: "+75", color: "#f6ad37" },
                  { label: "Streak", value: "7d", color: "#ff6b35" },
                ].map((s) => (
                  <div key={s.label} className="p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.04)", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
                    <p className="text-xl font-bold stat-num" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.4)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Active quests */}
          <motion.div variants={fadeUp}>
            <GlassCard className="p-5" glow="none">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif", color: "rgba(232,232,240,0.6)" }}>Active Quests</h2>
                <button className="text-xs" style={{ color: "#f6ad37" }}>View all →</button>
              </div>
              <div className="space-y-2">
                {RECENT_QUESTS.map((q, i) => (
                  <QuestItem key={i} quest={q} index={i} />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>

      <div className="energy-line" />

      {/* AI insight */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard className="p-5" glow="violet">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.2)", clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}>
              ✦
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#8b5cf6", fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.06em" }}>Soulforge AI · Insight</p>
              <p className="text-sm" style={{ color: "rgba(232,232,240,0.7)" }}>
                You&apos;ve completed 85% of Learning quests this week. Consider adding a{" "}
                <strong style={{ color: "#e8e8f0" }}>Mastery Challenge</strong> quest — you&apos;re ready for harder difficulty and better XP rates.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function QuestItem({ quest, index }: { quest: typeof RECENT_QUESTS[0]; index: number }) {
  const [done, setDone] = useState(quest.done);
  const [verifying, setVerifying] = useState(false);

  const handleCheck = () => {
    if (done || quest.overdue) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setDone(true); }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-3 py-2.5 transition-all"
      style={{
        background: quest.overdue
          ? "rgba(220,38,38,0.07)"
          : done ? "rgba(16,224,127,0.04)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${quest.overdue ? "rgba(220,38,38,0.25)" : done ? "rgba(16,224,127,0.12)" : "rgba(255,255,255,0.06)"}`,
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        boxShadow: quest.overdue ? "0 0 12px rgba(220,38,38,0.1)" : "none",
      }}
    >
      <button
        onClick={handleCheck}
        className="w-5 h-5 flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: done ? "#10e07f" : "transparent",
          border: `1.5px solid ${done ? "#10e07f" : quest.overdue ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.2)"}`,
          clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
        }}
      >
        {done && (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
            width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0d0d14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </button>

      {verifying ? <div className="flex-1 h-4 skeleton" /> : (
        <p className="flex-1 text-sm" style={{
          color: quest.overdue ? "rgba(220,38,38,0.85)" : done ? "rgba(232,232,240,0.35)" : "#e8e8f0",
          textDecoration: done ? "line-through" : "none",
        }}>
          {quest.title}
        </p>
      )}

      {quest.overdue && (
        <span className="text-xs font-semibold flex-shrink-0"
          style={{ color: "#dc2626", fontFamily: "Rajdhani, sans-serif" }}>OVERDUE</span>
      )}
      {verifying && (
        <span className="text-xs px-2 py-0.5 flex-shrink-0"
          style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}>
          Verifying...
        </span>
      )}
      <div className="flex items-center gap-2 text-xs flex-shrink-0">
        <span style={{ color: "#f6ad37" }}>+{quest.xp}</span>
        <span style={{ color: "rgba(246,173,55,0.5)" }}>◈{quest.coins}</span>
      </div>
    </motion.div>
  );
}
