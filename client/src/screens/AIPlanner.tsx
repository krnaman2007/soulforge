import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

interface GeneratedTask {
  title: string;
  xp: number;
  coins: number;
  diff: "Easy" | "Medium" | "Hard";
  day: number;
}

function generateTasks(goal: string): GeneratedTask[] {
  const examples: Record<string, GeneratedTask[]> = {
    default: [
      { title: "Research and outline your approach", xp: 80, coins: 32, diff: "Easy", day: 1 },
      { title: "Complete foundation milestone", xp: 120, coins: 48, diff: "Medium", day: 1 },
      { title: "Build on momentum — intermediate step", xp: 150, coins: 60, diff: "Medium", day: 2 },
      { title: "Challenge session — push limits", xp: 180, coins: 72, diff: "Hard", day: 3 },
      { title: "Review and consolidate progress", xp: 90, coins: 36, diff: "Easy", day: 3 },
      { title: "Final push — deliver the result", xp: 200, coins: 80, diff: "Hard", day: 5 },
    ],
  };
  if (goal.toLowerCase().includes("run") || goal.toLowerCase().includes("fitness")) {
    return [
      { title: "Day 1: 20-min easy run — establish baseline", xp: 80, coins: 32, diff: "Easy", day: 1 },
      { title: "Day 2: Dynamic stretching + mobility work", xp: 60, coins: 24, diff: "Easy", day: 2 },
      { title: "Day 3: 30-min interval run (1:2 ratio)", xp: 120, coins: 48, diff: "Medium", day: 3 },
      { title: "Day 5: Long slow distance — 45 minutes", xp: 150, coins: 60, diff: "Medium", day: 5 },
      { title: "Day 7: Full 5K run attempt", xp: 200, coins: 80, diff: "Hard", day: 7 },
    ];
  }
  if (goal.toLowerCase().includes("learn") || goal.toLowerCase().includes("course") || goal.toLowerCase().includes("study")) {
    return [
      { title: "Map the full learning path — outline 5 milestones", xp: 70, coins: 28, diff: "Easy", day: 1 },
      { title: "Complete first module + take notes", xp: 100, coins: 40, diff: "Easy", day: 1 },
      { title: "Build a small practice project", xp: 150, coins: 60, diff: "Medium", day: 3 },
      { title: "Spaced repetition review session", xp: 80, coins: 32, diff: "Easy", day: 4 },
      { title: "Teach-back exercise — explain what you learned", xp: 120, coins: 48, diff: "Medium", day: 5 },
      { title: "Apply in a real project or portfolio piece", xp: 220, coins: 88, diff: "Hard", day: 7 },
    ];
  }
  return examples.default;
}

const DIFF_COLORS: Record<string, string> = {
  Easy: "#10e07f", // Emerald
  Medium: "#00f0ff", // Cyan
  Hard: "#ec4899", // Ember
};

// Holographic Particle
function HoloParticle({ delay, color = "#8b5cf6" }: { delay: number; color?: string }) {
  const x = Math.random() * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0, 0.8, 0], y: [0, -60, -100], x: [(Math.random() - 0.5) * 40] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: 0,
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 10px ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

export default function AIPlanner() {
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState<GeneratedTask[] | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleGenerate = () => {
    if (!goal.trim()) return;
    setGenerating(true);
    setTasks(null);
    setTimeout(() => {
      setTasks(generateTasks(goal));
      setGenerating(false);
    }, 2400);
  };

  const totalXP = tasks?.reduce((s, t) => s + t.xp, 0) ?? 0;
  const totalCoins = tasks?.reduce((s, t) => s + t.coins, 0) ?? 0;

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-4xl mx-auto selection:bg-[#8b5cf6] selection:text-[#0a0a12]">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        </div>

      <div className="mb-12">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-3 flex items-center gap-4">
          <span className="w-8 h-px bg-[#8b5cf6]" />
          Neural Link Active
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e8e8f0] to-[#8b5cf6]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
          AI Overseer
        </h1>
        <p className="text-sm md:text-base mt-4 font-['Inter'] text-[rgba(232,232,240,0.6)] leading-relaxed max-w-2xl">
          Submit your objective to the neural network. The AI will forge a gamified quest line with optimized progression curves and XP rewards.
        </p>
      </div>

      {/* Input Panel */}
      <motion.div 
        className="relative p-6 bg-[rgba(20,20,30,0.4)] backdrop-blur-xl border border-[rgba(139,92,246,0.3)] mb-10 group transition-all duration-500 hover:border-[#8b5cf6]"
        style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-transparent pointer-events-none" />
        
        {/* Animated Corner Brackets */}
        <svg className="absolute top-2 left-2 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24"><path d="M8 4H4v4" strokeWidth="2"/></svg>
        <svg className="absolute bottom-2 right-2 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24"><path d="M16 20h4v-4" strokeWidth="2"/></svg>

        <label className="block text-[10px] md:text-xs font-bold mb-4 uppercase tracking-[0.2em]" style={{ color: "#8b5cf6", fontFamily: "Rajdhani, sans-serif" }}>
          Target Objective Parameter
        </label>
        
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="e.g. Run a 5K without stopping, Master TypeScript, Launch a SaaS..."
          className="w-full resize-none bg-[rgba(10,10,15,0.6)] p-4 text-sm md:text-base outline-none transition-all text-[#e8e8f0] font-['Inter'] focus:bg-[rgba(15,15,20,0.8)] focus:ring-1 focus:ring-[#8b5cf6]"
          style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}
        />
        
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={!goal.trim() || generating}
            className="group relative flex items-center justify-center px-8 py-3 font-black uppercase tracking-[0.2em] text-xs md:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Rajdhani, sans-serif" }}
          >
            <div className="absolute inset-0 bg-transparent border border-[#8b5cf6] opacity-80 group-hover:bg-[rgba(139,92,246,0.1)] transition-colors duration-300" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }} />
            <div className="absolute inset-[-1px] bg-gradient-to-r from-[#8b5cf6] via-[#c084fc] to-[#8b5cf6] z-[-1] opacity-40 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }} />
            <span className="relative z-10 text-[#8b5cf6] group-hover:text-white transition-all duration-300">
              {generating ? "PROCESSING..." : "GENERATE QUEST PLAN"}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Generating state */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-10 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#8b5cf6] animate-pulse rounded-full glow-violet" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6] font-['Rajdhani']">
                Compiling Node Map...
              </p>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 skeleton" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))", animationDelay: `${i * 0.15}s` }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated tasks */}
      <AnimatePresence>
        {tasks && !generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {!accepted && (
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-[rgba(139,92,246,0.3)] gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#8b5cf6] text-xl">◈</span>
                  <p className="text-sm md:text-base font-black uppercase tracking-wider text-white font-['Rajdhani']">
                    Quest Matrix Formulated <span className="text-[rgba(232,232,240,0.4)] ml-2 text-xs">[{tasks.length} Nodes]</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-['Rajdhani'] font-bold tracking-widest">
                  <span className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">XP YIELD: +{totalXP}</span>
                  <span className="text-[#ec4899]">LOOT: ◈ {totalCoins}</span>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20, rotateX: 20 }}
                  animate={{ opacity: 1, x: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="group preserve-3d"
                >
                  <div 
                    className="relative p-4 md:p-6 bg-[rgba(20,20,30,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] hover:border-[rgba(139,92,246,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)] flex flex-col md:flex-row md:items-center gap-4"
                    style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(139,92,246,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-['Rajdhani'] font-black text-lg md:text-xl flex-shrink-0"
                      style={{ 
                        background: "linear-gradient(135deg, rgba(139,92,246,0.2), transparent)", 
                        color: "#c084fc", 
                        border: "1px solid rgba(139,92,246,0.4)",
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                      }}>
                      {i + 1}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm md:text-base font-bold text-white mb-2">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-['Rajdhani'] uppercase font-bold tracking-wider">
                        <div className="flex items-center gap-1" style={{ color: DIFF_COLORS[task.diff] }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: DIFF_COLORS[task.diff], boxShadow: `0 0 5px ${DIFF_COLORS[task.diff]}` }} />
                          {task.diff}
                        </div>
                        <span className="text-[rgba(232,232,240,0.3)]">/</span>
                        <span className="text-[rgba(232,232,240,0.6)]">Day {task.day}</span>
                        <span className="text-[rgba(232,232,240,0.3)]">/</span>
                        <span className="text-[#8b5cf6] border border-[#8b5cf6] px-2 py-0.5" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>
                          AI-GENERATED
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-left md:text-right flex md:flex-col gap-4 md:gap-1 mt-4 md:mt-0 font-['Rajdhani'] font-black text-sm tracking-wider">
                      <p className="text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">+{task.xp} XP</p>
                      <p className="text-[#ec4899]">◈ {task.coins}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!accepted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tasks.length * 0.1 + 0.2 }}
                className="flex flex-col md:flex-row gap-4 mt-8"
              >
                <button
                  onClick={() => { setTasks(null); setGoal(""); }}
                  className="flex-1 px-8 py-3 font-black uppercase tracking-[0.2em] text-xs md:text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[rgba(232,232,240,0.5)] hover:text-white hover:border-[rgba(255,255,255,0.3)] transition-all duration-300 font-['Rajdhani']"
                  style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                >
                  Discard Map
                </button>
                <button
                  onClick={() => setAccepted(true)}
                  className="group relative flex-1 flex items-center justify-center px-8 py-3 font-black uppercase tracking-[0.2em] text-xs md:text-sm cursor-pointer font-['Rajdhani']"
                >
                  <div className="absolute inset-0 bg-transparent border border-[#10e07f] opacity-80 group-hover:bg-[rgba(16,224,127,0.1)] transition-colors duration-300" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }} />
                  <div className="absolute inset-[-1px] bg-gradient-to-r from-[#10e07f] via-[#34d399] to-[#10e07f] z-[-1] opacity-40 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }} />
                  <span className="relative z-10 text-[#10e07f] group-hover:text-white transition-all duration-300 drop-shadow-[0_0_5px_rgba(16,224,127,0.5)]">
                    CONFIRM MATRIX
                  </span>
                </button>
              </motion.div>
            )}

            {accepted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 bg-[rgba(16,224,127,0.05)] border border-[rgba(16,224,127,0.2)] text-center relative overflow-hidden"
                style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(16,224,127,0.1)] to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
                <h3 className="text-[#10e07f] text-lg font-black uppercase tracking-widest font-['Rajdhani'] mb-2 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-[#10e07f] rounded-full glow-emerald" />
                  Quest Line Initialized
                </h3>
                <p className="text-sm font-['Inter'] text-[rgba(232,232,240,0.6)]">
                  The matrix is live. Check your Quest Log to begin. Potential Yield: {totalXP} XP.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
