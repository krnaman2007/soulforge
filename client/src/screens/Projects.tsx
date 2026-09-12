import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchQuests, deleteQuest } from "../store/slices/questSlice";
import { completeTask, deleteTask } from "../store/slices/taskSlice";
import GlassCard from "../components/GlassCard";
import TaskCard from "../components/TaskCard";



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

function ProjectDetail({ project, onBack, onCompleteTask, onDelete, onDeleteTask }: { project: any; onBack: () => void; onCompleteTask: (id: string) => void; onDelete: (id: string) => void; onDeleteTask: (id: string) => void; }) {
  const tasks = project.tasks || [];
  const completedTasks = project.status === 'completed' ? (project.totalTasks || project.tasks?.length || 1) : (project.completedTasks || project.progress?.current || 0);
  const totalTasks = project.totalTasks || project.tasks?.length || 1;
  const pct = Math.round((completedTasks / totalTasks) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-[#00f0ff] transition-all hover:text-white group font-['Rajdhani']">
          <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Return to Archive
        </button>

        <button 
          onClick={() => onDelete(project.id)}
          className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-[rgba(239,68,68,0.7)] hover:text-[#ef4444] transition-all group font-['Rajdhani']"
        >
          Abandon Campaign <span className="text-sm group-hover:scale-110 transition-transform">✕</span>
        </button>
      </div>

      {project && (() => {
        const title = project.title || project.name || "Untitled Campaign";
        const color = project.color || "#00f0ff";
        const xpBonus = project.xpBonus !== undefined ? project.xpBonus : (project.bonusXP || 0);
        const coins = project.coins !== undefined ? project.coins : (project.bonusCoins || 0);
        const completedTasks = project.status === 'completed' 
          ? (project.totalTasks || project.tasks || 1) 
          : (typeof project.progress === 'number' ? project.progress : (project.progress?.current || project.completedTasks || project.completed || 0));
        const totalTasks = project.totalTasks || project.tasks || 1;
        const pct = Math.round((completedTasks / totalTasks) * 100);

        return (
          <>
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
                  <span style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}>{project.icon || "🚀"}</span>
                </div>
                
                <div className="flex-1">
                   <div className="text-[10px] uppercase font-bold tracking-[0.3em] mb-1 font-['Rajdhani']" style={{ color: color }}>
                     Active Campaign
                   </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{title}</h2>
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
                         <span className="text-xs">✦</span> {xpBonus} XP
                      </span>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                        style={{ background: "rgba(0,240,255,0.1)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                         <span className="text-xs">◈</span> {coins}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,232,240,0.6)", border: "1px solid rgba(255,255,255,0.1)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                         <span className="text-xs opacity-70">⏱</span> {project.dueDate || "N/A"}
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

              {tasks.length === 0 ? (
                <div className="text-[rgba(232,232,240,0.5)] text-sm italic py-4">No objectives found for this campaign.</div>
              ) : (
                tasks.map((task: any, i: number) => (
                  <TaskCard key={task.id || i} task={task} index={i} onComplete={onCompleteTask} onDelete={onDeleteTask} />
                ))
              )}
            </div>
          </>
        );
      })()}
    </motion.div>
  );
}

export default function Projects() {
  const dispatch = useDispatch<AppDispatch>();
  const { quests, status } = useSelector((state: RootState) => state.quests);

  useEffect(() => {
    dispatch(fetchQuests());
  }, [dispatch]);

  const activeQuests = quests.filter((q) => q.status === "active");
  const availableQuests = quests.filter((q) => q.status !== "active");

  const [activeTab, setActiveTab] = useState<"available" | "active">("available");
  const allProjects: any[] = [...activeQuests, ...availableQuests];

  const [selected, setSelected] = useState<any | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-2 border-b-2 border-[#8b5cf6] rounded-full hex-clip mb-4" 
        />
        <div className="text-[#8b5cf6] font-['Rajdhani'] uppercase tracking-[0.3em] font-bold text-sm animate-pulse">Syncing Campaigns...</div>
      </div>
    );
  }

  const handleCompleteTask = (id: string) => {
    dispatch(completeTask(id)).then(() => dispatch(fetchQuests())); // Refresh to get updated project progress
  };

  const handleDeleteProject = (id: string) => {
    dispatch(deleteQuest(id));
    setSelected(null);
  };

  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask(id)).then(() => dispatch(fetchQuests())); // Refresh to get updated project progress/tasks
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen bg-transparent">
      <AnimatePresence mode="wait">
        {selected ? (
          <ProjectDetail key="detail" project={selected} onBack={() => setSelected(null)} onCompleteTask={handleCompleteTask} onDelete={handleDeleteProject} onDeleteTask={handleDeleteTask} />
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8 border-b border-[rgba(255,255,255,0.05)] pb-6">
               <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 font-['Rajdhani']">
                  Campaign Archives
               </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>Projects</h1>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter']">Long-term campaigns yielding significant attribute bonuses upon completion.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {allProjects.length === 0 ? (
                <div className="col-span-full py-12 text-center border border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,22,0.6)]" style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
                  <p className="text-[rgba(232,232,240,0.4)] uppercase tracking-widest font-['Rajdhani']">No campaigns found in archive.</p>
                </div>
              ) : (
                allProjects.map((p, i) => {
                  const title = p.title || p.name || "Untitled Campaign";
                  const xpBonus = p.xpBonus !== undefined ? p.xpBonus : (p.bonusXP || 0);
                  const coins = p.coins !== undefined ? p.coins : (p.bonusCoins || 0);
                  const completedTasks = p.status === 'completed' 
                    ? (p.totalTasks || p.tasks?.length || 1) 
                    : (typeof p.progress === 'number' ? p.progress : (p.completedTasks || p.progress?.current || 0));
                  const totalTasks = p.totalTasks || p.tasks?.length || 1;
                  const pct = Math.round((completedTasks / totalTasks) * 100);
                  const color = p.color || "#00f0ff";
                  return (
                    <motion.div
                      key={p.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div 
                        className="group cursor-pointer bg-[rgba(15,15,22,0.6)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all duration-300 relative overflow-hidden" 
                        onClick={() => setSelected(p)}
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
                              <span style={{ filter: `drop-shadow(0 0 5px ${color})` }}>{p.icon || '🚀'}</span>
                            </div>
                            <div className="relative">
                              <ProgressRing pct={pct} color={color} size={54} />
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-[10px] font-black" style={{ color: color, fontFamily: "Rajdhani, sans-serif" }}>{pct}%</span>
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                             <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider mb-2 text-white group-hover:text-[#00f0ff] transition-colors" style={{ fontFamily: "Rajdhani, sans-serif" }}>{title}</h3>
                             <p className="text-[10px] md:text-xs uppercase tracking-widest leading-relaxed mb-6 font-['Inter'] line-clamp-2" style={{ color: "rgba(232,232,240,0.5)" }}>{p.description}</p>
                          </div>
                          
                          <div className="flex flex-col gap-4 mt-auto">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-1.5">
                                  <span className="text-[#00f0ff] text-xs">✦</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00f0ff]">{xpBonus} XP Bonus</span>
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-[rgba(232,232,240,0.4)]">
                                 {completedTasks} / {totalTasks} OBJS
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
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
