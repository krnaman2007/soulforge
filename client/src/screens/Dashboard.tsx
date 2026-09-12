import { motion } from "framer-motion";
import { useState } from "react";
import XPBar from "../components/XPBar";
import LevelUpModal from "../components/LevelUpModal";
import PenaltyModal from "../components/PenaltyModal";
import RankUpModal from "../components/RankUpModal";

const STATS = [
  { label: "Focus", value: 72, color: "#8b5cf6" },
  { label: "Vitality", value: 58, color: "#10e07f" },
  { label: "Mastery", value: 85, color: "#00f0ff" },
  { label: "Discipline", value: 61, color: "#ec4899" },
];

const RECENT_QUESTS = [
  { title: "Complete project architecture doc", xp: 120, coins: 45, done: true, overdue: false },
  { title: "30-minute morning run", xp: 80, coins: 30, done: true, overdue: false },
  { title: "Read 20 pages of Deep Work", xp: 60, coins: 25, done: false, overdue: false },
  { title: "Weekly progress review", xp: 90, coins: 35, done: false, overdue: true, minutesLeft: 0 },
];

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
  const [streak] = useState(7);
  const [coins] = useState(1240);
  const [debuffActive] = useState(true);

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Background Environment */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        <div className="absolute w-[100vw] h-[100vw] bg-transparent z-0" />
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz4KPC9zdmc+')] z-2 pointer-events-none" />
      </div>

      {showLevelUp && <LevelUpModal level={8} onClose={() => setShowLevelUp(false)} />}
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
                7
              </div>
            </div>

            <div className="text-center mb-6 relative z-10">
              <h3 className="font-black text-2xl uppercase tracking-wide text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>Aiden</h3>
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
              <XPBar current={3420} max={5000} level={7} className="w-full" />
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
                      animate={{ width: `${s.value}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.5 + i * 0.1 }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}66, ${s.color})`, boxShadow: `0 0 5px ${s.color}`, clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Demo modal buttons */}
            <div className="w-full mt-6 grid grid-cols-3 gap-2 relative z-10">
              <button onClick={() => setShowLevelUp(true)} className="py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:bg-[rgba(0,240,255,0.15)]"
                style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.3)", color: "#00f0ff", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))", fontFamily: "Rajdhani, sans-serif" }}>
                Level Up
              </button>
              <button onClick={() => setShowRankUp(true)} className="py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:bg-[rgba(96,165,250,0.15)]"
                style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))", fontFamily: "Rajdhani, sans-serif" }}>
                Rank Up
              </button>
              <button onClick={() => setShowPenalty(true)} className="py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:bg-[rgba(220,38,38,0.15)]"
                style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))", fontFamily: "Rajdhani, sans-serif" }}>
                Penalty
              </button>
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
                  <span className="text-sm font-black text-white stat-num">2 <span className="text-[#10e07f]">/ 4</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "XP Yield", value: "200", color: "#00f0ff", icon: "✦" },
                  { label: "Loot Gained", value: "+75", color: "#00f0ff", icon: "◈" },
                  { label: "Active Streak", value: "7d", color: "#ec4899", icon: "🔥" },
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
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff] hover:text-white transition-colors flex items-center gap-1 font-['Rajdhani']">
                  View Database <span className="text-sm">→</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {RECENT_QUESTS.map((q, i) => (
                  <QuestItem key={i} quest={q} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />

      {/* AI insight */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="preserve-3d">
        <div className="relative p-6 md:p-8 bg-[rgba(10,10,15,0.8)] backdrop-blur-xl border border-[rgba(139,92,246,0.3)] overflow-hidden group"
          style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
          
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-transparent opacity-50" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="w-12 h-12 flex items-center justify-center text-xl flex-shrink-0 animate-pulse"
              style={{ 
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), transparent)", 
                border: "1px solid rgba(139,92,246,0.5)", 
                color: "#c084fc",
                clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                boxShadow: "0 0 15px rgba(139,92,246,0.3) inset"
              }}>
              ✦
            </div>
            <div className="flex-1">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 text-[#8b5cf6] font-['Rajdhani'] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full" />
                Soulforge AI // Strategic Insight
              </p>
              <p className="text-sm md:text-base font-['Inter'] text-[rgba(232,232,240,0.8)] leading-relaxed">
                You've completed 85% of Learning quests this week. Consider initializing a <strong className="text-white">Mastery Challenge</strong> quest — your parameters indicate readiness for increased difficulty and higher XP yields.
              </p>
            </div>
            <button className="px-6 py-2 bg-[rgba(139,92,246,0.1)] border border-[#8b5cf6] text-[#8b5cf6] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-[#8b5cf6] hover:text-white transition-colors font-['Rajdhani']"
              style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}>
              Generate Challenge
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function QuestItem({ quest, index }: { quest: typeof RECENT_QUESTS[0]; index: number }) {
  const [done, setDone] = useState(quest.done);
  const [verifying, setVerifying] = useState(false);

  const handleCheck = () => {
    if (done || quest.overdue) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setDone(true); }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring" }}
      className="group relative flex items-center gap-4 p-4 transition-all duration-300"
      style={{
        background: quest.overdue
          ? "rgba(220,38,38,0.05)"
          : done ? "rgba(16,224,127,0.03)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${quest.overdue ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.15)" : "rgba(255,255,255,0.05)"}`,
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      }}
    >
      <button
        onClick={handleCheck}
        className="w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer relative"
        style={{
          background: done ? "#10e07f" : "rgba(0,0,0,0.5)",
          border: `1px solid ${done ? "#10e07f" : quest.overdue ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.3)"}`,
          clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
          boxShadow: done ? "0 0 10px rgba(16,224,127,0.5)" : "none"
        }}
      >
        {!done && !quest.overdue && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />}
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
          <p className="text-sm md:text-base font-bold transition-colors" style={{
            color: quest.overdue ? "#dc2626" : done ? "rgba(232,232,240,0.4)" : "white",
            textDecoration: done ? "line-through" : "none",
            fontFamily: "Inter, sans-serif"
          }}>
            {quest.title}
          </p>
        </div>
      )}

      {!verifying && (
        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          {quest.overdue ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#dc2626] font-['Rajdhani']">Failed</span>
          ) : done ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 bg-[rgba(16,224,127,0.1)] border border-[rgba(16,224,127,0.3)] text-[#10e07f] font-['Rajdhani']">Cleared</span>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-right">
              <span className="text-xs font-black uppercase tracking-widest text-[#00f0ff] font-['Rajdhani'] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">+{quest.xp} XP</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#ec4899] font-['Rajdhani']">◈ {quest.coins}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
