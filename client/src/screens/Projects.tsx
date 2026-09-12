import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

const PROJECTS = [
  {
    id: 1, title: "Learn React + TypeScript", icon: "⚛", color: "#60a5fa",
    tasks: 12, completed: 9, xpBonus: 800, coins: 320,
    description: "Full stack mastery from hooks to advanced patterns",
    dueDate: "Sep 28",
  },
  {
    id: 2, title: "Morning Fitness Routine", icon: "⚡", color: "#34d399",
    tasks: 20, completed: 14, xpBonus: 600, coins: 240,
    description: "Build the foundation of physical discipline",
    dueDate: "Oct 5",
  },
  {
    id: 3, title: "Launch Side Project", icon: "🚀", color: "#00f0ff",
    tasks: 18, completed: 5, xpBonus: 1200, coins: 500,
    description: "Ship something real to real users",
    dueDate: "Nov 1",
  },
  {
    id: 4, title: "Read 12 Books This Year", icon: "📚", color: "#a78bfa",
    tasks: 24, completed: 7, xpBonus: 900, coins: 360,
    description: "Expand your mental models and knowledge base",
    dueDate: "Dec 31",
  },
];

interface ProjectTask {
  title: string;
  xp: number;
  done: boolean;
}

const PROJECT_TASKS: Record<number, ProjectTask[]> = {
  1: [
    { title: "Complete React hooks deep-dive", xp: 120, done: true },
    { title: "Build custom useLocalStorage hook", xp: 100, done: true },
    { title: "TypeScript generics mastery", xp: 140, done: false },
    { title: "Context API + state management", xp: 110, done: false },
  ],
  2: [
    { title: "Day 1: Foundation mobility", xp: 80, done: true },
    { title: "Day 2: Push protocol", xp: 80, done: true },
    { title: "Day 3: Pull protocol", xp: 80, done: false },
    { title: "Day 4: Active recovery", xp: 60, done: false },
  ],
  3: [
    { title: "Validate idea with 5 users", xp: 200, done: true },
    { title: "Build MVP wireframes", xp: 150, done: false },
    { title: "Set up infrastructure", xp: 180, done: false },
    { title: "Deploy beta version", xp: 250, done: false },
  ],
  4: [
    { title: "Finish Atomic Habits", xp: 120, done: true },
    { title: "Finish Deep Work", xp: 120, done: true },
    { title: "Start The Almanack of Naval", xp: 120, done: false },
    { title: "Write 3 book summaries", xp: 90, done: false },
  ],
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

function ProjectDetail({ project, onBack }: { project: typeof PROJECTS[0]; onBack: () => void }) {
  const tasks = PROJECT_TASKS[project.id] || [];
  const pct = Math.round((project.completed / project.tasks) * 100);

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
         <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none blur-3xl" style={{ background: `radial-gradient(circle, ${project.color}, transparent 70%)` }} />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20" />
         
         <div className="absolute top-0 left-0 w-2 h-full" style={{ background: project.color, boxShadow: `0 0 15px ${project.color}` }} />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 relative z-10 pl-4">
          <div className="w-20 h-20 md:w-24 md:h-24 hex-clip flex items-center justify-center text-4xl flex-shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${project.color}20, rgba(10,10,15,0.8))`, 
              border: `1px solid ${project.color}50`,
              boxShadow: `inset 0 0 20px ${project.color}20` 
            }}>
            <span style={{ filter: `drop-shadow(0 0 8px ${project.color}80)` }}>{project.icon}</span>
          </div>
          
          <div className="flex-1">
             <div className="text-[10px] uppercase font-bold tracking-[0.3em] mb-1 font-['Rajdhani']" style={{ color: project.color }}>
               Active Campaign
             </div>
            <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{project.title}</h2>
            <p className="text-[10px] md:text-xs uppercase tracking-widest mb-6 font-['Inter']" style={{ color: "rgba(232,232,240,0.5)" }}>{project.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
              <div className="flex items-center gap-3">
                <ProgressRing pct={pct} color={project.color} size={48} />
                <div className="flex flex-col">
                  <span className="font-black text-lg leading-none" style={{ color: project.color, fontFamily: "Rajdhani, sans-serif" }}>{pct}%</span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(232,232,240,0.4)" }}>Completion</span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10 hidden md:block" />

              <div className="flex gap-2">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: "rgba(0,240,255,0.1)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                   <span className="text-xs">✦</span> {project.xpBonus} XP
                </span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: "rgba(0,240,255,0.1)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                   <span className="text-xs">◈</span> {project.coins}
                </span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,232,240,0.6)", border: "1px solid rgba(255,255,255,0.1)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                   <span className="text-xs opacity-70">⏱</span> {project.dueDate}
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

        {tasks.map((task, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="group"
          >
            <div className="p-4 flex items-center gap-4 bg-[rgba(15,15,22,0.6)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(20,20,30,0.8)] hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer relative overflow-hidden" 
                 style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
               
               {/* Hover effect glow */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.02)] to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] pointer-events-none" />

              <div className="w-6 h-6 border flex items-center justify-center flex-shrink-0 transition-all z-10"
                style={{
                  background: task.done ? project.color : "transparent",
                  borderColor: task.done ? project.color : "rgba(255,255,255,0.2)",
                  transform: task.done ? "rotate(45deg)" : "rotate(0deg)",
                  boxShadow: task.done ? `0 0 10px ${project.color}80` : "none"
                }}>
                {task.done && <span className="text-black text-xs font-black" style={{ transform: "rotate(-45deg)" }}>✓</span>}
              </div>
              
              <div className="flex-1 z-10">
                 <p className="text-sm font-bold uppercase tracking-wider transition-colors" style={{
                   color: task.done ? "rgba(232,232,240,0.3)" : "#e8e8f0",
                   textDecoration: task.done ? "line-through" : "none",
                   fontFamily: "Rajdhani, sans-serif"
                 }}>
                   {task.title}
                 </p>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest z-10" style={{ color: task.done ? "rgba(0,240,255,0.3)" : "#00f0ff" }}>
                 +{task.xp} XP
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen bg-transparent">
      <AnimatePresence mode="wait">
        {selected ? (
          <ProjectDetail key="detail" project={selected} onBack={() => setSelected(null)} />
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
              {PROJECTS.map((p, i) => {
                const pct = Math.round((p.completed / p.tasks) * 100);
                return (
                  <motion.div
                    key={p.id}
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
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none blur-3xl" style={{ background: `radial-gradient(circle, ${p.color}, transparent 70%)` }} />
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      {/* Left accent border */}
                      <div className="absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />

                      <div className="p-6 md:p-8 relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 hex-clip flex items-center justify-center text-2xl"
                            style={{ background: `${p.color}20`, border: `1px solid ${p.color}40`, boxShadow: `inset 0 0 10px ${p.color}20` }}>
                            <span style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}>{p.icon}</span>
                          </div>
                          <div className="relative">
                            <ProgressRing pct={pct} color={p.color} size={54} />
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-black" style={{ color: p.color, fontFamily: "Rajdhani, sans-serif" }}>{pct}%</span>
                             </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                           <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider mb-2 text-white group-hover:text-[#00f0ff] transition-colors" style={{ fontFamily: "Rajdhani, sans-serif" }}>{p.title}</h3>
                           <p className="text-[10px] md:text-xs uppercase tracking-widest leading-relaxed mb-6 font-['Inter'] line-clamp-2" style={{ color: "rgba(232,232,240,0.5)" }}>{p.description}</p>
                        </div>
                        
                        <div className="flex flex-col gap-4 mt-auto">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                                <span className="text-[#00f0ff] text-xs">✦</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00f0ff]">{p.xpBonus} XP Bonus</span>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-[rgba(232,232,240,0.4)]">
                               {p.completed} / {p.tasks} OBJS
                             </span>
                           </div>

                           <div className="h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] w-full">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${pct}%` }}
                               transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.3 + i * 0.1 }}
                               className="h-full rounded-full relative"
                               style={{ background: p.color, boxShadow: `0 0 8px ${p.color}80` }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
