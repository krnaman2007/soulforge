import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/slices/authSlice";
import api from "../api/axiosConfig";
import XPBar from "../components/XPBar";
import LevelUpModal from "../components/LevelUpModal";
import PenaltyModal from "../components/PenaltyModal";
import RankUpModal from "../components/RankUpModal";

interface Task {
  id: string;
  title: string;
  status: string;
  xpReward: number;
  coinReward: number;
  dueDate: string | null;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30, rotateX: 10 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
};

export default function Dashboard() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPenalty, setShowPenalty] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const [debuffActive] = useState(false);

  const { user, character } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const fetchDashboardTasks = async () => {
      try {
        const res = await api.get('/tasks');
        if (res.data.success) {
          const allTasks: Task[] = res.data.data.tasks || [];
          // Simple logic: grab pending tasks for today + some recently completed
          const pending = allTasks.filter(t => t.status === "PENDING").slice(0, 3);
          const done = allTasks.filter(t => t.status === "COMPLETED").slice(0, 1);
          setRecentTasks([...pending, ...done]);
          setStats({
            completed: allTasks.filter(t => t.status === "COMPLETED").length,
            total: allTasks.length
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard tasks", err);
      }
    };
    fetchDashboardTasks();
  }, []);

  const handleTaskCheck = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/complete`);
      setRecentTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "COMPLETED" } : t));
      dispatch(fetchCurrentUser());
    } catch (err) {
      console.error(err);
    }
  };

  const streak = character?.currentStreak || 0;
  const coins = character?.coins || 0;
  const level = character?.level || 1;
  const xp = character?.xp || 0;
  const name = user?.username || user?.name || "Adventurer";

  // Map backend stats to UI
  const STATS = [
    { label: "Focus", value: character?.intellect || 10, color: "#8b5cf6" },
    { label: "Vitality", value: character?.health || 10, color: "#10e07f" },
    { label: "Mastery", value: character?.creativity || 10, color: "#00f0ff" },
    { label: "Discipline", value: character?.discipline || 10, color: "#ec4899" },
  ];

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Background Environment */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        <div className="absolute w-[100vw] h-[100vw] bg-transparent z-0" />
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz4KPC9zdmc+')] z-2 pointer-events-none" />
      </div>

      {showLevelUp && <LevelUpModal level={level + 1} onClose={() => setShowLevelUp(false)} />}
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
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-px bg-[#00f0ff]" />
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] font-['Rajdhani']">System Online</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00f0ff]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Command Center
          </h1>
        </motion.div>
        
        <motion.div variants={fadeUp} className="flex items-center gap-4">
          {/* Credits Resource */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[rgba(0,240,255,0.05)] border border-[rgba(0,240,255,0.2)] backdrop-blur-sm group"
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
            <span className="text-[#00f0ff] text-lg group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_currentColor]">◈</span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani'] leading-none">Wealth</span>
              <span className="text-lg font-black stat-num text-[#00f0ff] leading-none mt-1">{coins.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Streak Resource */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[rgba(236,72,153,0.05)] border border-[rgba(236,72,153,0.2)] backdrop-blur-sm group"
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
            <span className="text-[#ec4899] text-lg flame-pulse drop-shadow-[0_0_5px_currentColor]">🔥</span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani'] leading-none">Streak</span>
              <span className="text-lg font-black stat-num text-[#ec4899] leading-none mt-1">{streak}d</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Character panel (Left) */}
        <motion.div variants={fadeUp} className="lg:col-span-4 preserve-3d">
          <div className="relative h-full flex flex-col p-6 md:p-8 bg-[rgba(15,15,22,0.6)] backdrop-blur-xl border border-[rgba(0,240,255,0.2)] transition-all duration-500 hover:border-[rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] group"
            style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
            
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,240,255,0.05)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Hexagonal avatar */}
            <div className="relative mb-6 self-center">
              <div className="w-24 h-24 hex-clip flex items-center justify-center text-5xl transition-transform duration-500 group-hover:rotate-[360deg] z-10 relative"
                style={{
                  background: "linear-gradient(135deg, rgba(20,20,30,0.8), rgba(10,10,15,0.9))",
                  border: "2px solid rgba(0,240,255,0.5)",
                  boxShadow: "0 0 20px rgba(0,240,255,0.3) inset",
                }}>
                ⚔️
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-[#00f0ff] opacity-20 blur-xl animate-pulse" />
              
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center text-sm font-black font-['Rajdhani'] text-[#0d0d14] z-20"
                style={{ 
                  background: "linear-gradient(135deg, #00f0ff, #ec4899)", 
                  clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                  boxShadow: "0 0 15px rgba(0,240,255,0.5)"
                }}>
                {level}
              </div>
            </div>

            <div className="text-center mb-6 relative z-10">
              <h3 className="font-black text-2xl uppercase tracking-wide text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{name}</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2"
                style={{
                  background: "rgba(96,165,250,0.1)",
                  border: "1px solid rgba(96,165,250,0.4)",
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                }}>
                <span className="text-[#60a5fa] text-[10px] animate-pulse">◉</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#60a5fa] font-['Rajdhani']">Journeyman</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] mt-3 text-[#8b5cf6] font-bold">The Architect // Tier II</p>
            </div>

            <div className="mb-6 relative z-10">
              <XPBar current={xp} max={level * 1000} level={level} className="w-full" />
            </div>

            {/* Debuff indicator */}
            {debuffActive && (
              <div className="mb-6 w-full flex items-center gap-3 p-3 relative z-10"
                style={{
                  background: "rgba(220,38,38,0.05)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  borderLeft: "3px solid #dc2626",
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}>
                <span className="text-[#dc2626] text-xl drop-shadow-[0_0_5px_currentColor]">⚠</span>
                <div className="text-left flex-1">
                  <p className="text-xs font-black uppercase tracking-wider text-[#dc2626] font-['Rajdhani']">Fatigue Penalty</p>
                  <p className="text-[10px] text-[rgba(232,232,240,0.5)] font-['Inter'] mt-0.5">−15% XP gain · 18h remaining</p>
                </div>
              </div>
            )}

            {/* Stat mini bars */}
            <div className="grid grid-cols-2 gap-3 w-full mt-auto relative z-10">
              {STATS.map((s, i) => (
                <div key={s.label} className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] transition-colors hover:border-[rgba(255,255,255,0.1)]" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[rgba(232,232,240,0.5)] font-['Rajdhani']">{s.label}</span>
                    <span className="text-sm font-black stat-num drop-shadow-[0_0_5px_currentColor]" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)]" style={{ clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((s.value / 100) * 100, 100)}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.5 + i * 0.1 }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}66, ${s.color})`, boxShadow: `0 0 5px ${s.color}`, clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Today's Progress */}
          <motion.div variants={fadeUp} className="preserve-3d">
            <div className="p-6 md:p-8 bg-[rgba(20,20,30,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-colors duration-500"
              style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.05)] gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#10e07f] rounded-full glow-emerald animate-pulse" />
                  <h2 className="font-black text-lg md:text-xl uppercase tracking-widest text-white font-['Rajdhani']">Today's Progress</h2>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(16,224,127,0.1)] border border-[rgba(16,224,127,0.3)] self-start sm:self-auto"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" }}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10e07f] font-['Rajdhani']">Quests:</span>
                  <span className="text-sm font-black text-white stat-num">{stats.completed} <span className="text-[#10e07f]">/ {stats.total}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Level Progress", value: `${Math.round((xp / (level * 1000)) * 100)}%`, color: "#00f0ff", icon: "✦" },
                  { label: "Available Quests", value: stats.total - stats.completed, color: "#00f0ff", icon: "◈" },
                  { label: "Active Streak", value: `${streak}d`, color: "#ec4899", icon: "🔥" },
                ].map((s, i) => (
                  <motion.div 
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                    className="p-5 bg-[rgba(10,10,15,0.6)] border border-[rgba(255,255,255,0.03)] relative overflow-hidden group hover:border-[rgba(255,255,255,0.1)] transition-colors"
                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity text-2xl" style={{ color: s.color }}>{s.icon}</div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 text-[rgba(232,232,240,0.5)] font-['Rajdhani']">{s.label}</p>
                    <p className="text-3xl font-black stat-num drop-shadow-[0_0_10px_currentColor]" style={{ color: s.color, fontFamily: "Rajdhani, sans-serif" }}>{s.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Active quests */}
          <motion.div variants={fadeUp} className="preserve-3d flex-1">
            <div className="h-full flex flex-col p-6 md:p-8 bg-[rgba(20,20,30,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)]"
              style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-lg md:text-xl uppercase tracking-widest text-white font-['Rajdhani']">Quest Matrix</h2>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentTasks.length === 0 ? (
                   <div className="text-center p-8 border border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,22,0.5)]" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
                     <p className="text-[rgba(232,232,240,0.5)] font-['Rajdhani'] font-bold uppercase tracking-widest">No Recent Activity</p>
                   </div>
                ) : (
                  recentTasks.map((q, i) => (
                    <QuestItem key={q.id} quest={q} index={i} onCheck={() => handleTaskCheck(q.id)} />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function QuestItem({ quest, index, onCheck }: { quest: Task; index: number; onCheck: () => void }) {
  const [done, setDone] = useState(quest.status === "COMPLETED");
  const [verifying, setVerifying] = useState(false);
  const overdue = quest.dueDate ? new Date(quest.dueDate) < new Date() && !done : false;

  const handleCheck = () => {
    if (done || overdue || verifying) return;
    setVerifying(true);
    onCheck(); // Parent will handle api call
  };

  // Sync state if parent changes
  useEffect(() => {
    setDone(quest.status === "COMPLETED");
    if (quest.status === "COMPLETED") setVerifying(false);
  }, [quest.status]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring" }}
      className="group relative flex items-center gap-4 p-4 transition-all duration-300"
      style={{
        background: overdue
          ? "rgba(220,38,38,0.05)"
          : done ? "rgba(16,224,127,0.03)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${overdue ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.15)" : "rgba(255,255,255,0.05)"}`,
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      }}
    >
      <button
        onClick={handleCheck}
        className="w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer relative"
        style={{
          background: done ? "#10e07f" : "rgba(0,0,0,0.5)",
          border: `1px solid ${done ? "#10e07f" : overdue ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.3)"}`,
          clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
          boxShadow: done ? "0 0 10px rgba(16,224,127,0.5)" : "none"
        }}
      >
        {!done && !overdue && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />}
        {done && (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
            width="12" height="10" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0d0d14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </button>

      {verifying ? (
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-3 bg-[linear-gradient(90deg,transparent_0%,transparent_50%,rgba(139,92,246,0.3)_50%,rgba(139,92,246,0.3)_100%)] bg-[length:10px_10px] animate-[shimmer_1s_infinite_linear] border border-[rgba(139,92,246,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6] font-['Rajdhani'] animate-pulse">Verifying Sync...</span>
        </div>
      ) : (
        <div className="flex-1">
          <p className="text-sm md:text-base font-bold transition-colors line-clamp-1" style={{
            color: overdue ? "#dc2626" : done ? "rgba(232,232,240,0.4)" : "white",
            textDecoration: done ? "line-through" : "none",
            fontFamily: "Inter, sans-serif"
          }}>
            {quest.title}
          </p>
        </div>
      )}

      {!verifying && (
        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          {overdue ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#dc2626] font-['Rajdhani']">Failed</span>
          ) : done ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 bg-[rgba(16,224,127,0.1)] border border-[rgba(16,224,127,0.3)] text-[#10e07f] font-['Rajdhani']">Cleared</span>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-right">
              <span className="text-xs font-black uppercase tracking-widest text-[#00f0ff] font-['Rajdhani'] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">+{quest.xpReward} XP</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#ec4899] font-['Rajdhani']">◈ {quest.coinReward}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
