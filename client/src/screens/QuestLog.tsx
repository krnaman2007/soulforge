import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";

type Tab = "daily" | "projects" | "ai";

interface Quest {
  title: string;
  xp: number;
  coins: number;
  diff: "Easy" | "Medium" | "Hard";
  ai: boolean;
  done: boolean;
  tag: string;
  overdue?: boolean;
  deadline?: string;
}

const DAILY: Quest[] = [
  { title: "Deep work session — 90 minutes", xp: 150, coins: 60, diff: "Hard", ai: true, done: false, tag: "work" },
  { title: "Morning workout — push day", xp: 100, coins: 40, diff: "Medium", ai: false, done: true, tag: "fitness" },
  { title: "Read 30 pages — Atomic Habits", xp: 70, coins: 28, diff: "Easy", ai: true, done: false, tag: "learning" },
  { title: "Journal — 10-minute reflection", xp: 50, coins: 20, diff: "Easy", ai: false, done: false, tag: "mindset" },
  { title: "Review and respond to emails", xp: 60, coins: 24, diff: "Easy", ai: false, done: false, tag: "work", overdue: true, deadline: "Overdue — 2h ago" },
];

const PROJECT_TASKS: Quest[] = [
  { title: "Set up CI/CD pipeline for React app", xp: 180, coins: 72, diff: "Hard", ai: true, done: false, tag: "work" },
  { title: "Write unit tests for auth module", xp: 120, coins: 48, diff: "Medium", ai: true, done: false, tag: "work" },
  { title: "Draft course outline — TypeScript", xp: 90, coins: 36, diff: "Medium", ai: false, done: true, tag: "learning" },
  { title: "Database schema design", xp: 140, coins: 56, diff: "Hard", ai: false, done: false, tag: "work", overdue: true, deadline: "Overdue — 1d 4h ago" },
];

const AI_SUGGESTED: Quest[] = [
  { title: "Practice 20 minutes of speed typing", xp: 55, coins: 22, diff: "Easy", ai: true, done: false, tag: "skill" },
  { title: "Cold shower challenge — week 1", xp: 80, coins: 32, diff: "Medium", ai: true, done: false, tag: "fitness" },
  { title: "Write one LinkedIn post about your learnings", xp: 65, coins: 26, diff: "Easy", ai: true, done: false, tag: "work" },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "projects", label: "Projects" },
  { id: "ai", label: "AI-Suggested" },
];

const TAG_COLORS: Record<string, string> = {
  work: "#8b5cf6",
  fitness: "#10e07f",
  learning: "#f6ad37",
  mindset: "#ff6b35",
  skill: "#60a5fa",
};

// Gem difficulty icons
function DiffGem({ diff }: { diff: "Easy" | "Medium" | "Hard" }) {
  const config = {
    Easy: { color: "#10e07f", icon: "◆", glow: "rgba(16,224,127,0.5)" },
    Medium: { color: "#f6ad37", icon: "◆", glow: "rgba(246,173,55,0.5)" },
    Hard: { color: "#ff6b35", icon: "◆", glow: "rgba(255,107,53,0.5)" },
  }[diff];
  return (
    <span className="text-xs flex items-center gap-1"
      style={{ color: config.color, filter: `drop-shadow(0 0 3px ${config.glow})` }}>
      {config.icon} {diff}
    </span>
  );
}

function CountdownTimer({ deadline }: { deadline: string }) {
  return (
    <motion.span
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="text-xs font-semibold"
      style={{ color: "#dc2626", fontFamily: "Rajdhani, sans-serif" }}>
      {deadline}
    </motion.span>
  );
}

function QuestCard({ task, index }: { task: Quest; index: number }) {
  const [done, setDone] = useState(task.done);
  const [verifying, setVerifying] = useState(false);

  const handleComplete = () => {
    if (done || verifying || task.overdue) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setDone(true); }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 280, damping: 24 }}
    >
      <div
        className="p-4 flex items-start gap-4 transition-all"
        style={{
          background: task.overdue
            ? "rgba(220,38,38,0.07)"
            : done ? "rgba(16,224,127,0.04)" : "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${task.overdue ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.12)" : "rgba(255,255,255,0.08)"}`,
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
          boxShadow: task.overdue ? "0 0 16px rgba(220,38,38,0.1), inset 0 0 0 1px rgba(220,38,38,0.15)" : "none",
        }}
      >
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={!!task.overdue}
          className="mt-0.5 w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: done ? "#10e07f" : "transparent",
            border: `1.5px solid ${done ? "#10e07f" : task.overdue ? "rgba(220,38,38,0.4)" : verifying ? "#8b5cf6" : "rgba(255,255,255,0.2)"}`,
            clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
          }}
        >
          {done && (
            <motion.svg initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1" stroke="#0d0d14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {verifying && <div className="h-4 skeleton mb-2 w-3/4" />}
          {!verifying && (
            <p className="text-sm font-medium leading-snug" style={{
              color: task.overdue ? "rgba(220,38,38,0.85)" : done ? "rgba(232,232,240,0.35)" : "#e8e8f0",
              textDecoration: done ? "line-through" : "none",
            }}>
              {task.title}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5"
              style={{
                background: `${TAG_COLORS[task.tag] || "#8b5cf6"}15`,
                color: TAG_COLORS[task.tag] || "#8b5cf6",
                border: `1px solid ${TAG_COLORS[task.tag] || "#8b5cf6"}28`,
                clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
              }}>
              {task.tag}
            </span>
            <DiffGem diff={task.diff} />
            {task.ai && (
              <span className="text-xs px-2 py-0.5 flex items-center gap-1"
                style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.18)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
                ✦ AI-graded
              </span>
            )}
            {verifying && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs px-2 py-0.5"
                style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
                Verifying...
              </motion.span>
            )}
            {done && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="text-xs px-2 py-0.5"
                style={{ background: "rgba(16,224,127,0.1)", color: "#10e07f", border: "1px solid rgba(16,224,127,0.2)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
                ✓ Complete
              </motion.span>
            )}
            {task.overdue && task.deadline && (
              <CountdownTimer deadline={task.deadline} />
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs">
          <span style={{ color: task.overdue ? "rgba(246,173,55,0.4)" : "#f6ad37" }}>+{task.xp} XP</span>
          <span style={{ color: "rgba(246,173,55,0.5)" }}>◈ {task.coins}</span>
        </div>
      </div>
    </motion.div>
  );
}

const tabData: Record<Tab, Quest[]> = { daily: DAILY, projects: PROJECT_TASKS, ai: AI_SUGGESTED };

export default function QuestLog() {
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>Quest Log</h1>
        <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>Active missions. Complete them to earn XP and coins.</p>
      </div>

      {/* Tabs — glowing underline on active */}
      <div className="flex gap-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-4 py-2.5 text-sm font-medium transition-all"
            style={{
              color: tab === t.id ? "#f6ad37" : "rgba(232,232,240,0.45)",
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            {t.label}
            {t.id === "ai" && (
              <span className="ml-1.5 text-xs px-1 py-0.5"
                style={{ background: "rgba(139,92,246,0.18)", color: "#8b5cf6" }}>AI</span>
            )}
            {/* Glowing underline */}
            {tab === t.id && (
              <motion.div
                layoutId="questTabLine"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, transparent, #f6ad37, transparent)", boxShadow: "0 0 6px rgba(246,173,55,0.6)" }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          {tab === "ai" && (
            <div className="p-3 flex items-center gap-2"
              style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)", clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}>
              <span style={{ color: "#8b5cf6" }}>✦</span>
              <p className="text-xs" style={{ color: "rgba(139,92,246,0.9)" }}>
                AI-suggested based on your goals and pace. Rewards are pre-graded by Soulforge AI.
              </p>
            </div>
          )}
          {tabData[tab].map((task, i) => (
            <QuestCard key={task.title} task={task} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
