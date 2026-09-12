import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const GOALS = [
  { id: "work", icon: "💼", label: "Career & Work", sub: "Projects, tasks, deep work" },
  { id: "fitness", icon: "⚡", label: "Health & Fitness", sub: "Workouts, sleep, nutrition" },
  { id: "learning", icon: "🧠", label: "Learning & Skills", sub: "Courses, books, practice" },
  { id: "creative", icon: "✦", label: "Creative Pursuits", sub: "Art, writing, music" },
  { id: "mindset", icon: "◈", label: "Mindset & Habits", sub: "Routines, journaling, calm" },
];

const PACE = [
  { id: "gentle", label: "Gentle", sub: "1–2 quests/day", xp: "+50% XP bonus", icon: "🌱" },
  { id: "steady", label: "Steady", sub: "3–5 quests/day", xp: "Standard rates", icon: "⚔️" },
  { id: "intense", label: "Intense", sub: "6+ quests/day", xp: "+20% XP bonus", icon: "🔥" },
];

interface Props {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPace, setSelectedPace] = useState<string>("steady");
  const [name, setName] = useState("");

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const steps = [
    // Step 0: Name
    <motion.div
      key="s0"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 1.05 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
      className="flex flex-col items-center text-center max-w-md mx-auto w-full relative z-10"
    >
      <div className="relative mb-8 group">
         <div className="absolute inset-0 bg-[#00f0ff] opacity-20 blur-2xl rounded-full animate-pulse pointer-events-none" />
         <div className="w-24 h-24 hex-clip flex items-center justify-center text-4xl relative z-10"
          style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(10,10,15,0.9))", border: "2px solid rgba(0,240,255,0.5)", boxShadow: "inset 0 0 20px rgba(0,240,255,0.2)" }}>
          <span className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">⚔</span>
         </div>
      </div>
      <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani']">
        System Initialization
      </div>
      <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00f0ff] mb-4" style={{ fontFamily: "Rajdhani, sans-serif" }}>
        Soulforge
      </h1>
      <p className="text-xs md:text-sm mb-10 max-w-sm mx-auto font-['Inter'] uppercase tracking-widest" style={{ color: "rgba(232,232,240,0.6)" }}>
        Your life is the adventure. Every task is a quest. Every day shapes the hero you're becoming.
      </p>
      <div className="w-full space-y-4 relative group">
        <label className="block text-left text-[10px] font-black mb-1.5 uppercase tracking-[0.2em] text-[#00f0ff] font-['Rajdhani'] flex items-center gap-2">
           <span className="w-2 h-2 bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
           Enter Designation
        </label>
        <div className="relative">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="AWAITING INPUT..."
            className="w-full px-6 py-4 bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] text-white text-lg font-black uppercase tracking-widest outline-none transition-all focus:border-[#00f0ff] focus:bg-[rgba(0,240,255,0.05)] placeholder-[rgba(255,255,255,0.1)] font-['Rajdhani']"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
          />
           <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[rgba(255,255,255,0.2)] group-focus-within:border-[#00f0ff] transition-colors pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[rgba(255,255,255,0.2)] group-focus-within:border-[#00f0ff] transition-colors pointer-events-none" />
        </div>
      </div>
    </motion.div>,

    // Step 1: Goals
    <motion.div
      key="s1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
      className="max-w-lg mx-auto w-full relative z-10"
    >
      <div className="text-center mb-8">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 font-['Rajdhani']">
          Skill Tree Selection
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
          Choose Paths
        </h2>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter']">
          Select up to 3 domains. Initial stats and quests will be calibrated accordingly.
        </p>
      </div>
      
      <div className="grid gap-3 preserve-3d">
        {GOALS.map((g, i) => {
          const selected = selectedGoals.includes(g.id);
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
              onClick={() => toggleGoal(g.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all relative overflow-hidden group"
              style={{
                background: selected ? "rgba(139,92,246,0.15)" : "rgba(15,15,22,0.8)",
                border: `1px solid ${selected ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.05)"}`,
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              {selected && <div className="absolute top-0 left-0 w-1 h-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]" />}
              
              <div className="w-12 h-12 hex-clip flex items-center justify-center text-2xl flex-shrink-0 transition-colors"
                style={{ 
                  background: selected ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${selected ? "rgba(139,92,246,0.4)" : "transparent"}`
                }}>
                <span className={selected ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : ""}>{g.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-black text-sm md:text-base uppercase tracking-wider transition-colors" style={{ color: selected ? "#fff" : "rgba(232,232,240,0.8)", fontFamily: "Rajdhani, sans-serif" }}>{g.label}</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 font-['Inter']" style={{ color: selected ? "rgba(139,92,246,0.8)" : "rgba(232,232,240,0.4)" }}>{g.sub}</p>
              </div>
              
              <div className="w-6 h-6 border flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: selected ? "#8b5cf6" : "transparent",
                  borderColor: selected ? "#8b5cf6" : "rgba(255,255,255,0.2)",
                  transform: selected ? "rotate(45deg)" : "rotate(0deg)"
                }}>
                {selected && <span className="text-white text-xs" style={{ transform: "rotate(-45deg)" }}>✓</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>,

    // Step 2: Pace
    <motion.div
      key="s2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
      className="max-w-md mx-auto w-full relative z-10"
    >
      <div className="text-center mb-8">
         <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#10e07f] mb-2 font-['Rajdhani']">
          Difficulty Setting
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
          Forge Pace
        </h2>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter']">
          Select daily engagement frequency. Low levels have generous XP curves.
        </p>
      </div>

      <div className="space-y-4">
        {PACE.map((p, i) => {
          const selected = selectedPace === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              onClick={() => setSelectedPace(p.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all relative overflow-hidden group"
              style={{
                background: selected ? "rgba(16,224,127,0.15)" : "rgba(15,15,22,0.8)",
                border: `1px solid ${selected ? "rgba(16,224,127,0.5)" : "rgba(255,255,255,0.05)"}`,
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              {selected && <div className="absolute top-0 left-0 w-1 h-full bg-[#10e07f] shadow-[0_0_10px_#10e07f]" />}
              
              <div className="text-2xl w-8 text-center" style={{ filter: selected ? "drop-shadow(0 0 8px rgba(16,224,127,0.8))" : "grayscale(100%) opacity(50%)" }}>
                {p.icon}
              </div>

              <div className="flex-1">
                <p className="font-black text-sm md:text-base uppercase tracking-wider transition-colors" style={{ color: selected ? "#fff" : "rgba(232,232,240,0.8)", fontFamily: "Rajdhani, sans-serif" }}>{p.label}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5 font-['Inter']" style={{ color: "rgba(232,232,240,0.4)" }}>{p.sub}</p>
              </div>
              
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-colors"
                style={{ 
                  background: selected ? "rgba(16,224,127,0.2)" : "rgba(255,255,255,0.05)", 
                  color: selected ? "#10e07f" : "rgba(232,232,240,0.5)",
                  border: `1px solid ${selected ? "rgba(16,224,127,0.3)" : "transparent"}`,
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
                }}>
                {p.xp}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-[rgba(16,224,127,0.05)] border border-[rgba(16,224,127,0.2)] flex items-start gap-3"
        style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
      >
        <span className="text-[#10e07f] text-lg animate-pulse">✦</span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#10e07f] font-['Rajdhani'] mb-1">Beginner Bonus Active</p>
          <p className="text-[10px] font-['Inter'] uppercase tracking-wider leading-relaxed" style={{ color: "rgba(232,232,240,0.6)" }}>
            First 5 levels grant 2× XP multiplier. Establish protocol. Challenge algorithms will adjust dynamically.
          </p>
        </div>
      </motion.div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-transparent selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      
      {/* Dynamic Background Elements based on step */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center transition-colors duration-1000"
        style={{
          background: step === 0 ? "radial-gradient(circle at center, rgba(0,240,255,0.05) 0%, transparent 60%)" :
                      step === 1 ? "radial-gradient(circle at center, rgba(139,92,246,0.05) 0%, transparent 60%)" :
                                   "radial-gradient(circle at center, rgba(16,224,127,0.05) 0%, transparent 60%)"
        }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA0MGg0MFYweiIvPjwvZz48L3N2Zz4=')] opacity-20" />
      </div>

      {/* Progress HUD */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 w-full max-w-sm px-6">
        {[0, 1, 2].map((i) => {
          const color = i === 0 ? "#00f0ff" : i === 1 ? "#8b5cf6" : "#10e07f";
          const isActive = i === step;
          const isPast = i < step;
          
          return (
            <div key={i} className="flex-1 flex flex-col gap-2">
              <div className="h-1 bg-[rgba(255,255,255,0.1)] w-full overflow-hidden relative">
                 <motion.div 
                    initial={false}
                    animate={{ width: isPast || isActive ? "100%" : "0%" }}
                    className="absolute top-0 left-0 h-full"
                    style={{ background: isPast ? "rgba(255,255,255,0.5)" : color, boxShadow: isActive ? `0 0 10px ${color}` : "none" }}
                    transition={{ duration: 0.5 }}
                 />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: isActive ? color : isPast ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", fontFamily: "Rajdhani, sans-serif" }}>
                  Ph 0{i + 1}
                </span>
                {isPast && <span className="text-[8px] text-white">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      <div className="flex w-full max-w-md gap-4 mt-12 relative z-20">
        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep((s) => s - 1)}
            className="w-16 h-14 flex items-center justify-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
          >
            <span className="text-xl">←</span>
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (step < 2) setStep((s) => s + 1);
            else onComplete();
          }}
          disabled={step === 0 && !name.trim()}
          className="flex-1 py-4 text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden"
          style={{
            background: step === 0 ? "rgba(0,240,255,0.15)" : step === 1 ? "rgba(139,92,246,0.15)" : "rgba(16,224,127,0.15)",
            border: `1px solid ${step === 0 ? "rgba(0,240,255,0.4)" : step === 1 ? "rgba(139,92,246,0.4)" : "rgba(16,224,127,0.4)"}`,
            color: step === 0 ? "#00f0ff" : step === 1 ? "#c084fc" : "#10e07f",
            fontFamily: "Rajdhani, sans-serif",
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
          }}
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <div className="flex items-center justify-center gap-3 relative z-10">
            {step < 2 ? "Initiate Next Phase" : "Boot Sequence"}
            <span className="text-lg leading-none">→</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
