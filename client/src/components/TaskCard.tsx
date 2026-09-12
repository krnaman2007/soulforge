import { useState } from "react";
import { motion } from "framer-motion";

const TAG_COLORS: Record<string, string> = {
  work: "#8b5cf6",
  fitness: "#10e07f",
  learning: "#00f0ff",
  mindset: "#ec4899",
  skill: "#60a5fa",
};

function DiffGem({ diff }: { diff: string }) {
  const config = {
    Easy: { color: "#10e07f", icon: "◈", glow: "rgba(16,224,127,0.5)" },
    Medium: { color: "#00f0ff", icon: "◈", glow: "rgba(0,240,255,0.5)" },
    Hard: { color: "#ec4899", icon: "◈", glow: "rgba(236,72,153,0.5)" },
  }[diff] || { color: "#00f0ff", icon: "◈", glow: "rgba(0,240,255,0.5)" };
  
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

export default function TaskCard({ task, index, onComplete, onDelete }: { task: any; index: number; onComplete?: (id: string) => void; onDelete?: (id: string) => void; }) {
  const [done, setDone] = useState(task.done || task.isCompleted || task.status === 'completed');
  const [verifying, setVerifying] = useState(false);

  const isOverdue = task.overdue || false;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (done || verifying || isOverdue) return;
    setVerifying(true);
    if (onComplete && task.id) {
      onComplete(task.id);
    }
    setTimeout(() => { setVerifying(false); setDone(true); }, 2000);
  };

  const diffStr = task.diff || (task.difficulty === 'easy' || task.difficulty === 1 ? 'Easy' : task.difficulty === 'hard' || task.difficulty === 3 ? 'Hard' : 'Medium');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      className="group relative"
    >
      <div
        className="p-5 md:p-6 flex items-start gap-5 transition-all duration-300 relative overflow-hidden group/card"
        style={{
          background: isOverdue
            ? "rgba(220,38,38,0.05)"
            : done ? "rgba(16,224,127,0.05)" : "rgba(15,15,22,0.7)",
          border: `1px solid ${isOverdue ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.3)" : "rgba(255,255,255,0.05)"}`,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          boxShadow: isOverdue ? "inset 0 0 20px rgba(220,38,38,0.1)" : done ? "inset 0 0 20px rgba(16,224,127,0.1)" : "none",
        }}
        onClick={(e) => {
           if ((e.target as HTMLElement).tagName !== 'BUTTON') {
              handleComplete(e);
           }
        }}
      >
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity text-[rgba(255,255,255,0.3)] hover:text-[#ef4444] z-20"
            title="Delete Task"
          >
            ✕
          </button>
        )}
        
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
              {task.title || task.name}
            </p>
          )}

          {!verifying && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center"
                style={{
                  background: `linear-gradient(90deg, ${TAG_COLORS[task.tag || task.category || 'work']}20, transparent)`,
                  color: TAG_COLORS[task.tag || task.category || 'work'] || "#8b5cf6",
                  borderLeft: `2px solid ${TAG_COLORS[task.tag || task.category || 'work'] || "#8b5cf6"}`,
                }}>
                {task.tag || task.category || (task.metadata?.tags && task.metadata.tags[0]) || 'task'}
              </span>
              
              <DiffGem diff={diffStr} />
              
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
             <span className="text-[10px]">✦</span> +{task.xpReward !== undefined ? task.xpReward : (task.xp || 0)} XP
          </span>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1" style={{ color: isOverdue ? "rgba(0,240,255,0.4)" : "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-[10px]">◈</span> {task.coinReward !== undefined ? task.coinReward : (task.coins || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
