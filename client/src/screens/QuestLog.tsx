import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/slices/authSlice";
import api from "../api/axiosConfig";
import GlassCard from "../components/GlassCard";

type Tab = "daily" | "projects" | "ai";

interface Task {
  id: string;
  title: string;
  primaryAttribute: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  xpReward: number;
  coinReward: number;
  projectId: string | null;
  aiAnalyzed: boolean;
  dueDate: string | null;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "projects", label: "Projects" },
  { id: "ai", label: "AI-Suggested" },
];

const TAG_COLORS: Record<string, string> = {
  PHYSICAL: "#10e07f",
  INTELLECT: "#00f0ff",
  STRENGTH: "#ef4444",
  DISCIPLINE: "#f59e0b",
  HEALTH: "#10e07f",
  CREATIVITY: "#ec4899",
  SOCIAL: "#8b5cf6",
  LEADERSHIP: "#fbbf24",
  FINANCE: "#10b981",
  CAREER: "#3b82f6",
  EMOTIONAL: "#f43f5e",
  LEARNING: "#00f0ff",
  PERSONAL_GROWTH: "#8b5cf6",
};

// Gem difficulty icons
function DiffGem({ diff }: { diff: string }) {
  const config = {
    EASY: { color: "#10e07f", icon: "◈", glow: "rgba(16,224,127,0.5)" },
    MEDIUM: { color: "#00f0ff", icon: "◈", glow: "rgba(0,240,255,0.5)" },
    HARD: { color: "#ec4899", icon: "◈", glow: "rgba(236,72,153,0.5)" },
    EPIC: { color: "#f59e0b", icon: "◈", glow: "rgba(245,158,11,0.5)" },
  }[diff] || { color: "#00f0ff", icon: "◈", glow: "rgba(0,240,255,0.5)" };
  return (
    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
      style={{ color: config.color, filter: `drop-shadow(0 0 5px ${config.glow})`, fontFamily: "Rajdhani, sans-serif" }}>
      <span>{config.icon}</span> {diff}
    </span>
  );
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const date = new Date(deadline);
  const now = new Date();
  const isOverdue = date < now;
  const timeString = date.toLocaleDateString();

  return (
    <motion.span
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
      style={{ color: isOverdue ? "#ef4444" : "#f59e0b", fontFamily: "Rajdhani, sans-serif" }}>
      <span className="text-xs">⏱</span> {isOverdue ? "OVERDUE" : `DUE: ${timeString}`}
    </motion.span>
  );
}

function QuestCard({ task, index, onComplete }: { task: Task; index: number; onComplete: (id: string) => void }) {
  const [done, setDone] = useState(task.status === "COMPLETED");
  const [verifying, setVerifying] = useState(false);
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  const handleComplete = async () => {
    if (done || verifying) return;
    setVerifying(true);
    try {
      await api.post(`/tasks/${task.id}/complete`);
      setDone(true);
      onComplete(task.id);
    } catch (error) {
      console.error("Failed to complete task", error);
    } finally {
      setVerifying(false);
    }
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
          background: isOverdue && !done
            ? "rgba(220,38,38,0.05)"
            : done ? "rgba(16,224,127,0.05)" : "rgba(15,15,22,0.7)",
          border: `1px solid ${isOverdue && !done ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.3)" : "rgba(255,255,255,0.05)"}`,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          boxShadow: isOverdue && !done ? "inset 0 0 20px rgba(220,38,38,0.1)" : done ? "inset 0 0 20px rgba(16,224,127,0.1)" : "none",
        }}
      >
        {/* Animated background on hover (if not done/overdue) */}
        {!done && (!isOverdue || done) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        )}
        
        {/* Left Accent Bar */}
        <div className="absolute top-0 left-0 w-1.5 h-full transition-colors duration-300" 
             style={{ 
               background: isOverdue && !done ? "#ef4444" : done ? "#10e07f" : "rgba(255,255,255,0.1)",
               boxShadow: isOverdue && !done ? "0 0 10px #ef4444" : done ? "0 0 10px #10e07f" : "none"
             }} />

        {/* Checkbox */}
        <button
          onClick={handleComplete}
          className="mt-1 w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10"
          style={{
            background: done ? "rgba(16,224,127,0.2)" : isOverdue && !done ? "rgba(220,38,38,0.1)" : verifying ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.02)",
            border: `1.5px solid ${done ? "#10e07f" : isOverdue && !done ? "#ef4444" : verifying ? "#8b5cf6" : "rgba(255,255,255,0.2)"}`,
            transform: "rotate(45deg)",
            boxShadow: done ? "0 0 15px rgba(16,224,127,0.5)" : isOverdue && !done ? "0 0 15px rgba(239,68,68,0.3)" : verifying ? "0 0 15px rgba(139,92,246,0.5)" : "none",
            cursor: (done || verifying) ? "default" : "pointer"
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
          {isOverdue && !done && !verifying && (
             <span className="text-[#ef4444] font-black text-xs" style={{ transform: "rotate(-45deg)" }}>!</span>
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
              color: isOverdue && !done ? "rgba(239,68,68,0.8)" : done ? "rgba(232,232,240,0.3)" : "#fff",
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
                  background: `linear-gradient(90deg, ${TAG_COLORS[task.primaryAttribute] || "#8b5cf6"}20, transparent)`,
                  color: TAG_COLORS[task.primaryAttribute] || "#8b5cf6",
                  borderLeft: `2px solid ${TAG_COLORS[task.primaryAttribute] || "#8b5cf6"}`,
                }}>
                {task.primaryAttribute}
              </span>
              
              <DiffGem diff={task.difficulty} />
              
              {task.aiAnalyzed && (
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1.5"
                  style={{ background: "rgba(139,92,246,0.1)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.3)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
                  <span className="text-[10px] drop-shadow-[0_0_5px_#c084fc]">✦</span> AI VERIFIED
                </span>
              )}
              
              {task.dueDate && !done && (
                <div className="ml-auto">
                   <CountdownTimer deadline={task.dueDate} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-1" style={{ color: isOverdue && !done ? "rgba(0,240,255,0.4)" : "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-[10px]">✦</span> +{task.xpReward} XP
          </span>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1" style={{ color: isOverdue && !done ? "rgba(0,240,255,0.4)" : "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-[10px]">◈</span> {task.coinReward}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuestLog() {
  const [tab, setTab] = useState<Tab>("daily");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        setError("Failed to load missions.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load missions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskComplete = (taskId: string) => {
    // Update local state to reflect completion instantly without refetching immediately
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "COMPLETED" } : t));
    // Dispatch to update global XP and Coins in Sidebar/Header
    dispatch(fetchCurrentUser());
  };

  // Filter logic
  const displayedTasks = tasks.filter(t => {
    if (tab === "daily") return !t.projectId && !t.aiAnalyzed;
    if (tab === "projects") return t.projectId !== null;
    if (tab === "ai") return t.aiAnalyzed === true;
    return true;
  });

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

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-[rgba(255,255,255,0.02)] animate-pulse" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))", border: "1px solid rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-12 bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.2)]" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
              <p className="text-[#ef4444] font-['Rajdhani'] font-bold text-lg uppercase tracking-widest">{error}</p>
              <button onClick={fetchTasks} className="mt-4 px-4 py-2 text-xs text-white bg-[#ef4444] hover:bg-red-600 font-bold uppercase tracking-widest transition-colors" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>Retry</button>
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="text-center p-16 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,22,0.5)]" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
              <span className="text-4xl text-[rgba(255,255,255,0.1)] mb-4">◈</span>
              <p className="text-[rgba(232,232,240,0.5)] font-['Rajdhani'] font-bold text-lg uppercase tracking-widest">No Missions Available</p>
              <p className="text-[10px] text-[rgba(232,232,240,0.3)] mt-2 uppercase tracking-widest">All objectives cleared for this protocol.</p>
            </div>
          ) : (
            displayedTasks.map((task, i) => (
              <QuestCard key={task.id} task={task} index={i} onComplete={handleTaskComplete} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
