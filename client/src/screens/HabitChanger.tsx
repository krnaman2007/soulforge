import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HabitTask {
  title: string;
  xp: number;
  day: number;
  type: "replace" | "cue" | "reward" | "track";
}

const TYPE_LABELS: Record<string, string> = {
  replace: "Replacement",
  cue: "Cue Hack",
  reward: "Reward Design",
  track: "Tracking",
};
const TYPE_COLORS: Record<string, string> = {
  replace: "#a78bfa",
  cue: "#00f0ff",
  reward: "#10e07f",
  track: "#ec4899",
};

function generateHabitPlan(habit: string): HabitTask[] {
  if (habit.toLowerCase().includes("phone") || habit.toLowerCase().includes("scroll")) {
    return [
      { title: "Audit: track screen time for 24h without judgment", xp: 50, day: 1, type: "track" },
      { title: "Remove social apps from home screen — friction hack", xp: 80, day: 1, type: "cue" },
      { title: "Replace first 10 min of phone use with journaling", xp: 100, day: 2, type: "replace" },
      { title: "Set a 'phone-free zone' in your bedroom", xp: 90, day: 3, type: "cue" },
      { title: "Design a non-phone reward for hitting 7 days", xp: 60, day: 4, type: "reward" },
      { title: "Log daily screen time for 7 days straight", xp: 120, day: 7, type: "track" },
    ];
  }
  return [
    { title: "Awareness check — journal current habit pattern", xp: 50, day: 1, type: "track" },
    { title: "Identify the cue that triggers the habit", xp: 70, day: 1, type: "cue" },
    { title: "Design a healthier replacement behavior", xp: 100, day: 2, type: "replace" },
    { title: "Implement the replacement for 3 consecutive days", xp: 130, day: 3, type: "replace" },
    { title: "Create a reward to reinforce the new loop", xp: 80, day: 5, type: "reward" },
    { title: "7-day habit review — score your consistency", xp: 120, day: 7, type: "track" },
  ];
}

function VioletParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: [0, 0.8, 0], y: [0, -100, -200] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
      style={{
        position: "absolute",
        left: `${Math.random() * 100}%`,
        bottom: 0,
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "#8b5cf6",
        boxShadow: "0 0 10px #8b5cf6, 0 0 20px #8b5cf6",
        pointerEvents: "none",
      }}
    />
  );
}

export default function HabitChanger() {
  const [habit, setHabit] = useState("");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<HabitTask[] | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleGenerate = () => {
    if (!habit.trim()) return;
    setGenerating(true);
    setPlan(null);
    setAccepted(false);
    setTimeout(() => {
      setPlan(generateHabitPlan(habit));
      setGenerating(false);
    }, 2200);
  };

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-4xl mx-auto selection:bg-[#8b5cf6] selection:text-[#0a0a12]">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 w-[200%] h-[50vh] bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(75deg)] opacity-20 origin-top" style={{ perspective: '1000px' }} />
      </div>

      <div className="mb-10 text-center">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 flex justify-center items-center gap-4">
          <span className="w-8 h-px bg-[#8b5cf6]" />
          Behavioral Modification
          <span className="w-8 h-px bg-[#8b5cf6]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-[#8b5cf6]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
          Habit Synthesizer
        </h1>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] mt-4 max-w-lg mx-auto font-['Inter']">
          Input a behavior sequence to modify. The AI will synthesize a targeted quest chain using behavioral psychology algorithms.
        </p>
      </div>

      <div className="flex flex-col gap-8 preserve-3d">
        
        {/* Input panel — violet AI atmosphere */}
        <div className="relative p-6 md:p-8 bg-[rgba(10,10,15,0.8)] backdrop-blur-xl border border-[rgba(139,92,246,0.3)] shadow-[0_0_40px_rgba(139,92,246,0.05)] transition-all duration-300 focus-within:border-[#8b5cf6] focus-within:shadow-[0_0_40px_rgba(139,92,246,0.15)] group"
          style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
          
          {/* Animated Grid Background & Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 15 }, (_, i) => <VioletParticle key={i} delay={i * 0.2} />)}
          </div>
          
          <div className="relative z-10 flex flex-col gap-4">
            <label className="flex items-center gap-3 text-xs md:text-sm font-black uppercase tracking-widest text-white font-['Rajdhani']">
              <span className="w-2 h-2 bg-[#8b5cf6] animate-pulse" /> Target Behavior
            </label>
            <textarea
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              rows={3}
              placeholder="e.g. Stop scrolling my phone first thing in the morning, Build a daily reading habit..."
              className="w-full resize-none p-4 text-sm md:text-base outline-none bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#8b5cf6] transition-colors font-['Inter'] placeholder-[rgba(255,255,255,0.2)]"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
            />
            
            <div className="flex justify-end mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={!habit.trim() || generating}
                className="px-8 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 font-['Rajdhani'] flex items-center gap-3 relative overflow-hidden group/btn"
                style={{
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#c084fc",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)"
                }}
              >
                {/* Button Shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                
                <span className="text-lg">{generating ? "↻" : "✦"}</span>
                {generating ? "Synthesizing Sequence..." : "Initialize Synthesis"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Loading sequences */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 justify-center">
                <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#8b5cf6]" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b5cf6] font-['Rajdhani'] animate-pulse">
                  Analyzing Neural Pathways
                </p>
                <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#8b5cf6]" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] relative overflow-hidden"
                    style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.1)] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest chain output */}
        <AnimatePresence>
          {plan && !generating && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="flex items-center gap-4 justify-center md:justify-start px-2">
                <h2 className="text-lg font-black uppercase tracking-widest text-white font-['Rajdhani'] flex items-center gap-3">
                  <span className="text-[#8b5cf6]">◈</span> Synthesized Quest Chain
                </h2>
                <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-transparent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] px-2 py-1 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)]">
                  {plan.length} Phases
                </span>
              </div>

              <div className="grid gap-3 relative before:absolute before:left-[21px] md:before:left-[29px] before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-[rgba(139,92,246,0.5)] before:to-transparent">
                {plan.map((task, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                    className="relative pl-12 md:pl-16"
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-[13px] md:left-[21px] top-1/2 -translate-y-1/2 w-4 h-4 bg-transparent border-2 rounded-full z-10"
                      style={{ borderColor: TYPE_COLORS[task.type], boxShadow: `0 0 10px ${TYPE_COLORS[task.type]}40` }} />
                    
                    <div className="p-4 md:p-5 bg-[rgba(20,20,30,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all group"
                      style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border"
                              style={{ 
                                background: `${TYPE_COLORS[task.type]}15`, 
                                color: TYPE_COLORS[task.type],
                                borderColor: `${TYPE_COLORS[task.type]}40`,
                                fontFamily: "Rajdhani, sans-serif"
                              }}>
                              {TYPE_LABELS[task.type]}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgba(232,232,240,0.4)]">Day {task.day}</span>
                          </div>
                          <p className="text-sm md:text-base font-bold text-white font-['Inter']">{task.title}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0 sm:self-start bg-[rgba(0,0,0,0.3)] px-3 py-1.5 border border-[rgba(255,255,255,0.05)]"
                          style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" }}>
                          <span className="text-[#00f0ff] text-lg leading-none">✦</span>
                          <span className="text-sm font-black stat-num text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.3)]">+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                {!accepted ? (
                  <>
                    <button
                      onClick={() => { setPlan(null); setHabit(""); }}
                      className="flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[rgba(232,232,240,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white font-['Rajdhani']"
                      style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                    >
                      Abort & Reroll
                    </button>
                    <button
                      onClick={() => setAccepted(true)}
                      className="flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all bg-[rgba(16,224,127,0.1)] border border-[rgba(16,224,127,0.3)] text-[#10e07f] hover:bg-[rgba(16,224,127,0.2)] hover:border-[#10e07f] font-['Rajdhani'] relative overflow-hidden group/accept"
                      style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                    >
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent group-hover/accept:animate-[shimmer_1s_infinite]" />
                      Accept Sequence
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-6 text-center bg-[rgba(16,224,127,0.05)] border border-[rgba(16,224,127,0.2)] relative overflow-hidden"
                    style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
                  >
                    <span className="text-[#10e07f] text-3xl mb-2 block drop-shadow-[0_0_10px_currentColor]">✓</span>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#10e07f] font-['Rajdhani'] drop-shadow-[0_0_5px_currentColor]">Sequence Locked</p>
                    <p className="text-[10px] text-[rgba(232,232,240,0.6)] font-['Inter'] mt-2 uppercase tracking-widest">
                      Quests appended to active roster.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
