import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/slices/authSlice";
import api from "../api/axiosConfig";
import GlassCard from "../components/GlassCard";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  xpReward: number;
  coinReward: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  status: string;
  progress: number; // 0.0 to 1.0 from backend, need to format as %
  totalTasks: number;
  completedTasks: number;
  bonusXP: number;
  bonusCoins: number;
  tasks: Task[];
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
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
  DEFAULT: "#60a5fa"
};

const CATEGORY_ICONS: Record<string, string> = {
  PHYSICAL: "⚡",
  INTELLECT: "⚛",
  STRENGTH: "💪",
  DISCIPLINE: "🛡",
  HEALTH: "❤",
  CREATIVITY: "🎨",
  SOCIAL: "🤝",
  LEADERSHIP: "👑",
  FINANCE: "💎",
  CAREER: "🚀",
  EMOTIONAL: "🧘",
  LEARNING: "📚",
  PERSONAL_GROWTH: "🌱",
  DEFAULT: "◈"
};

function ProgressRing({ pct, color, size = 60 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} stroke="rgba(255,255,255,0.05)" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4}
          stroke={color}
          strokeLinecap="square"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
          style={{ strokeDasharray: circ, filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      {/* Decorative center dots for gaming feel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-1 h-1 rounded-full bg-white opacity-20" />
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack, onTaskComplete }: { project: Project; onBack: () => void; onTaskComplete: (taskId: string, xp: number, coins: number) => void }) {
  const tasks = project.tasks || [];
  const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
  const color = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.DEFAULT;
  const icon = CATEGORY_ICONS[project.category] || CATEGORY_ICONS.DEFAULT;
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);

  const handleTaskClick = async (task: Task) => {
    if (task.status === "COMPLETED" || verifyingTask) return;
    setVerifyingTask(task.id);
    try {
      await api.post(`/tasks/${task.id}/complete`);
      onTaskComplete(task.id, task.xpReward, task.coinReward);
    } catch (err) {
      console.error("Failed to complete project task", err);
    } finally {
      setVerifyingTask(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-[#00f0ff] transition-all hover:text-white group font-['Rajdhani']">
        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Return to Archive
      </button>

      <div className="relative p-6 md:p-8 bg-[rgba(15,15,22,0.7)] border border-[rgba(255,255,255,0.05)] overflow-hidden group" style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
         {/* Holographic background elements */}
         <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none blur-3xl" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20" />
         
         <div className="absolute top-0 left-0 w-2 h-full" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 relative z-10 pl-4">
          <div className="w-20 h-20 md:w-24 md:h-24 hex-clip flex items-center justify-center text-4xl flex-shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${color}20, rgba(10,10,15,0.8))`, 
              border: `1px solid ${color}50`,
              boxShadow: `inset 0 0 20px ${color}20` 
            }}>
            <span style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}>{icon}</span>
          </div>
          
          <div className="flex-1">
             <div className="text-[10px] uppercase font-bold tracking-[0.3em] mb-1 font-['Rajdhani']" style={{ color: color }}>
               Active Campaign • {project.category}
             </div>
            <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{project.name}</h2>
            <p className="text-[10px] md:text-xs uppercase tracking-widest mb-6 font-['Inter']" style={{ color: "rgba(232,232,240,0.5)" }}>{project.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
              <div className="flex items-center gap-3">
                <ProgressRing pct={pct} color={color} size={48} />
                <div className="flex flex-col">
                  <span className="font-black text-lg leading-none" style={{ color: color, fontFamily: "Rajdhani, sans-serif" }}>{pct}%</span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(232,232,240,0.4)" }}>Completion</span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10 hidden md:block" />

              <div className="flex gap-2">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: "rgba(0,240,255,0.1)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                   <span className="text-xs">✦</span> {project.bonusXP} XP BONUS
                </span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: "rgba(0,240,255,0.1)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                   <span className="text-xs">◈</span> {project.bonusCoins} BONUS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-8">
         <div className="flex items-center gap-3 mb-4">
            <span className="text-[#00f0ff] animate-pulse">◈</span>
            <h3 className="text-lg font-black uppercase tracking-widest font-['Rajdhani'] text-white">Campaign Objectives</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
         </div>

        {tasks.map((task, i) => {
          const isDone = task.status === "COMPLETED";
          const isVerifying = verifyingTask === task.id;
          return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="group"
          >
            <div 
                 onClick={() => handleTaskClick(task)}
                 className="p-4 flex items-center gap-4 bg-[rgba(15,15,22,0.6)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(20,20,30,0.8)] hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer relative overflow-hidden" 
                 style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
               
               {/* Hover effect glow */}
               {(!isDone && !isVerifying) && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.02)] to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] pointer-events-none" />
               )}

              <div className="w-6 h-6 border flex items-center justify-center flex-shrink-0 transition-all z-10"
                style={{
                  background: isDone ? color : "transparent",
                  borderColor: isDone ? color : isVerifying ? "#8b5cf6" : "rgba(255,255,255,0.2)",
                  transform: isDone ? "rotate(45deg)" : "rotate(0deg)",
                  boxShadow: isDone ? `0 0 10px ${color}80` : isVerifying ? "0 0 10px #8b5cf6" : "none"
                }}>
                {isDone && <span className="text-black text-xs font-black" style={{ transform: "rotate(-45deg)" }}>✓</span>}
                {isVerifying && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border border-[#8b5cf6] border-t-transparent rounded-full" />}
              </div>
              
              <div className="flex-1 z-10">
                 <p className="text-sm font-bold uppercase tracking-wider transition-colors" style={{
                   color: isDone ? "rgba(232,232,240,0.3)" : "#e8e8f0",
                   textDecoration: isDone ? "line-through" : "none",
                   fontFamily: "Rajdhani, sans-serif"
                 }}>
                   {task.title}
                 </p>
                 {task.description && (
                    <p className="text-[9px] uppercase tracking-widest text-[rgba(232,232,240,0.4)] mt-0.5 font-['Inter'] line-clamp-1">{task.description}</p>
                 )}
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest z-10 flex flex-col items-end" style={{ color: isDone ? "rgba(0,240,255,0.3)" : "#00f0ff" }}>
                 <span>+{task.xpReward} XP</span>
              </span>
            </div>
          </motion.div>
        )})}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/quests?type=PROJECT');
      if (response.data.success) {
        setProjects(response.data.data.quests || []);
      } else {
        setError("Failed to load campaigns.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load campaigns.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleTaskComplete = (taskId: string, xp: number, coins: number) => {
    // Optimistically update the project and task completion status
    setProjects(prev => prev.map(p => {
      if (p.id !== selectedId) return p;
      return {
        ...p,
        completedTasks: p.completedTasks + 1,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: "COMPLETED" } : t)
      };
    }));
    // Dispatch to update global XP/Coins
    dispatch(fetchCurrentUser());
  };

  const selectedProject = projects.find(p => p.id === selectedId);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen bg-transparent">
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <ProjectDetail key="detail" project={selectedProject} onBack={() => setSelectedId(null)} onTaskComplete={handleTaskComplete} />
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8 border-b border-[rgba(255,255,255,0.05)] pb-6 flex justify-between items-end">
              <div>
                 <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 font-['Rajdhani']">
                    Campaign Archives
                 </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>Projects</h1>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter']">Long-term campaigns yielding significant attribute bonuses upon completion.</p>
              </div>
            </div>
            
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="h-48 bg-[rgba(255,255,255,0.02)] animate-pulse border border-[rgba(255,255,255,0.05)]" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }} />
                 ))}
               </div>
            ) : error ? (
               <div className="text-center p-12 bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.2)]" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
                 <p className="text-[#ef4444] font-['Rajdhani'] font-bold text-lg uppercase tracking-widest">{error}</p>
                 <button onClick={fetchProjects} className="mt-4 px-4 py-2 text-xs text-white bg-[#ef4444] hover:bg-red-600 font-bold uppercase tracking-widest transition-colors" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>Retry</button>
               </div>
            ) : projects.length === 0 ? (
               <div className="text-center p-16 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,22,0.5)]" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
                 <span className="text-4xl text-[rgba(255,255,255,0.1)] mb-4">◈</span>
                 <p className="text-[rgba(232,232,240,0.5)] font-['Rajdhani'] font-bold text-lg uppercase tracking-widest">No Active Campaigns</p>
                 <p className="text-[10px] text-[rgba(232,232,240,0.3)] mt-2 uppercase tracking-widest">Utilize the AI Planner to construct new projects.</p>
               </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {projects.map((p, i) => {
                const pct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
                const color = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.DEFAULT;
                const icon = CATEGORY_ICONS[p.category] || CATEGORY_ICONS.DEFAULT;
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div 
                      className="group cursor-pointer bg-[rgba(15,15,22,0.6)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all duration-300 relative overflow-hidden" 
                      onClick={() => setSelectedId(p.id)}
                      style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
                    >
                      {/* Hover Effects */}
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none blur-3xl" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      {/* Left accent border */}
                      <div className="absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />

                      <div className="p-6 md:p-8 relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 hex-clip flex items-center justify-center text-2xl"
                            style={{ background: `${color}20`, border: `1px solid ${color}40`, boxShadow: `inset 0 0 10px ${color}20` }}>
                            <span style={{ filter: `drop-shadow(0 0 5px ${color})` }}>{icon}</span>
                          </div>
                          <div className="relative">
                            <ProgressRing pct={pct} color={color} size={54} />
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-black" style={{ color: color, fontFamily: "Rajdhani, sans-serif" }}>{pct}%</span>
                             </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                           <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider mb-2 text-white group-hover:text-[#00f0ff] transition-colors" style={{ fontFamily: "Rajdhani, sans-serif" }}>{p.name}</h3>
                           <p className="text-[10px] md:text-xs uppercase tracking-widest leading-relaxed mb-6 font-['Inter'] line-clamp-2" style={{ color: "rgba(232,232,240,0.5)" }}>{p.description}</p>
                        </div>
                        
                        <div className="flex flex-col gap-4 mt-auto">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                                <span className="text-[#00f0ff] text-xs">✦</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00f0ff]">{p.bonusXP} XP Bonus</span>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-[rgba(232,232,240,0.4)]">
                               {p.completedTasks} / {p.totalTasks} OBJS
                             </span>
                           </div>

                           <div className="h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] w-full">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${pct}%` }}
                               transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.3 + i * 0.1 }}
                               className="h-full rounded-full relative"
                               style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
                             >
                                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                             </motion.div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
