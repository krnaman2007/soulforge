import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchTasks, completeTask } from "../store/slices/taskSlice";
import { fetchQuests } from "../store/slices/questSlice";
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
  learning: "#00f0ff",
  mindset: "#ec4899",
  skill: "#60a5fa",
};

// Gem difficulty icons
function DiffGem({ diff }: { diff: "Easy" | "Medium" | "Hard" }) {
  const config = {
    Easy: { color: "#10e07f", icon: "◈", glow: "rgba(16,224,127,0.5)" },
    Medium: { color: "#00f0ff", icon: "◈", glow: "rgba(0,240,255,0.5)" },
    Hard: { color: "#ec4899", icon: "◈", glow: "rgba(236,72,153,0.5)" },
  }[diff];
  return (
    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
      style={{ color: config.color, filter: `drop-shadow(0 0 5px ${config.glow})`, fontFamily: "Rajdhani, sans-serif" }}>
      <span>{config.icon}</span> {diff}
    </span>
  );
}

function CountdownTimer({ deadline }: { deadline: string }) {
  return (
    <motion.span
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
      style={{ color: "#ef4444", fontFamily: "Rajdhani, sans-serif" }}>
      <span className="text-xs">⏱</span> {deadline}
    </motion.span>
  );
}

function QuestCard({ task, index, onComplete }: { task: any; index: number; onComplete?: (id: string) => void }) {
  const [done, setDone] = useState(task.done || task.isCompleted);
  const [verifying, setVerifying] = useState(false);

  const isOverdue = task.overdue || false;

  const handleComplete = () => {
    if (done || verifying || isOverdue) return;
    setVerifying(true);
    if (onComplete && task.id) {
      onComplete(task.id);
    }
    setTimeout(() => { setVerifying(false); setDone(true); }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      className="group relative"
    >
      <div
        className="p-5 md:p-6 flex items-start gap-5 transition-all duration-300 relative overflow-hidden"
        style={{
          background: isOverdue
            ? "rgba(220,38,38,0.05)"
            : done ? "rgba(16,224,127,0.05)" : "rgba(15,15,22,0.7)",
          border: `1px solid ${isOverdue ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.3)" : "rgba(255,255,255,0.05)"}`,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          boxShadow: isOverdue ? "inset 0 0 20px rgba(220,38,38,0.1)" : done ? "inset 0 0 20px rgba(16,224,127,0.1)" : "none",
        }}
      >
        {/* Animated background on hover (if not done/overdue) */}
        {!done && !isOverdue && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        )}
        
        {/* Left Accent Bar */}
        <div className="absolute top-0 left-0 w-1.5 h-full transition-colors duration-300" 
             style={{ 
               background: isOverdue ? "#ef4444" : done ? "#10e07f" : "rgba(255,255,255,0.1)",
               boxShadow: isOverdue ? "0 0 10px #ef4444" : done ? "0 0 10px #10e07f" : "none"
             }} />

        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={!!isOverdue}
          className="mt-1 w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10"
          style={{
            background: done ? "rgba(16,224,127,0.2)" : isOverdue ? "rgba(220,38,38,0.1)" : verifying ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.02)",
            border: `1.5px solid ${done ? "#10e07f" : isOverdue ? "#ef4444" : verifying ? "#8b5cf6" : "rgba(255,255,255,0.2)"}`,
            transform: "rotate(45deg)",
            boxShadow: done ? "0 0 15px rgba(16,224,127,0.5)" : isOverdue ? "0 0 15px rgba(239,68,68,0.3)" : verifying ? "0 0 15px rgba(139,92,246,0.5)" : "none",
            cursor: (done || isOverdue || verifying) ? "default" : "pointer"
          }}
        >
          {done && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}
                         className="text-[#10e07f] font-black text-sm" style={{ transform: "rotate(-45deg)" }}>
              ✓
            </motion.span>
          )}
          {verifying && (
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full" />
          )}
          {isOverdue && !done && (
             <span className="text-[#ef4444] font-black text-xs" style={{ transform: "rotate(-45deg)" }}>✕</span>
          )}
        </button>

        <div className="flex-1 min-w-0 pl-2">
          {verifying && (
             <div className="flex flex-col gap-2">
                <div className="h-5 bg-[rgba(139,92,246,0.2)] w-3/4 rounded relative overflow-hidden">
                   <motion.div className="absolute top-0 left-0 h-full bg-[#8b5cf6]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#8b5cf6] font-black font-['Rajdhani']">Verifying Objective Protocol...</span>
             </div>
          )}
          {!verifying && (
            <p className="text-base md:text-lg font-black tracking-wider uppercase transition-colors" style={{
              color: isOverdue ? "rgba(239,68,68,0.8)" : done ? "rgba(232,232,240,0.3)" : "#fff",
              textDecoration: done ? "line-through" : "none",
              fontFamily: "Rajdhani, sans-serif"
            }}>
              {task.title}
            </p>
          )}

          {!verifying && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center"
                style={{
                  background: `linear-gradient(90deg, ${TAG_COLORS[task.tag || 'work']}20, transparent)`,
                  color: TAG_COLORS[task.tag || 'work'] || "#8b5cf6",
                  borderLeft: `2px solid ${TAG_COLORS[task.tag || 'work'] || "#8b5cf6"}`,
                }}>
                {task.tag || (task.metadata?.tags && task.metadata.tags[0]) || 'task'}
              </span>
              
              <DiffGem diff={task.diff || (task.difficulty === 1 ? 'Easy' : task.difficulty === 2 ? 'Medium' : 'Hard')} />
              
              {task.ai && (
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1.5"
                  style={{ background: "rgba(139,92,246,0.1)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.3)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
                  <span className="text-[10px] drop-shadow-[0_0_5px_#c084fc]">✦</span> AI VERIFIED
                </span>
              )}
              
              {isOverdue && task.deadline && (
                <div className="ml-auto">
                   <CountdownTimer deadline={task.deadline} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-1" style={{ color: isOverdue ? "rgba(0,240,255,0.4)" : "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-[10px]">✦</span> +{task.xp || task.rewardXP || 0} XP
          </span>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1" style={{ color: isOverdue ? "rgba(0,240,255,0.4)" : "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-[10px]">◈</span> {task.coins || task.rewardCoins || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuestLog() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { quests: allQuests } = useSelector((state: RootState) => state.quests);
  const activeQuests = allQuests.filter((q) => q.status === "active");

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchQuests());
  }, [dispatch]);

  const [tab, setTab] = useState<Tab>("daily");

  const handleCompleteTask = (id: string) => {
    dispatch(completeTask(id));
  };

  const getTabData = () => {
    if (tab === 'daily') {
      return tasks.length > 0 ? tasks : DAILY;
    }
    if (tab === 'projects') {
      return activeQuests.length > 0 ? activeQuests : PROJECT_TASKS;
    }
    return AI_SUGGESTED;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen bg-transparent">
      <div className="mb-8 border-b border-[rgba(255,255,255,0.05)] pb-6 relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />
         <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani']">
            Mission Control
         </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>Quest Log</h1>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter']">Active missions and objectives. Execute to acquire resources.</p>
      </div>

      {/* Tabs — glowing underline on active */}
      <div className="flex gap-2 mb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-6 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all"
            style={{
              color: tab === t.id ? "#00f0ff" : "rgba(232,232,240,0.4)",
              fontFamily: "Rajdhani, sans-serif",
            }}
          >
            {t.label}
            {t.id === "ai" && (
              <span className="ml-2 text-[9px] px-2 py-0.5"
                style={{ background: "rgba(139,92,246,0.15)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.3)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
                AI
              </span>
            )}
            {/* Glowing underline */}
            {tab === t.id && (
              <motion.div
                layoutId="questTabLine"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5"
                style={{ background: "#00f0ff", boxShadow: "0 0 10px #00f0ff, 0 0 20px #00f0ff" }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {tab === "ai" && (
            <div className="p-4 flex items-start gap-3 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] mb-6"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span className="text-[#c084fc] text-lg mt-0.5 animate-pulse drop-shadow-[0_0_8px_#c084fc]">✦</span>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest text-[#c084fc] font-['Rajdhani'] mb-1">Algorithmic Suggestions</p>
                 <p className="text-[10px] font-['Inter'] uppercase tracking-wider leading-relaxed" style={{ color: "rgba(232,232,240,0.6)" }}>
                   Missions generated by Soulforge AI based on current attributes and progression velocity. Rewards pre-calculated.
                 </p>
              </div>
            </div>
          )}
          {getTabData().map((task: any, i: number) => (
            <QuestCard key={task.id || task.title} task={task} index={i} onComplete={handleCompleteTask} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
