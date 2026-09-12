import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchRecentActivities, fetchActivityStats } from "../store/slices/activitySlice";
import { fetchDailyChallenge } from "../store/slices/challengeSlice";
import { fetchCurrentUser } from "../store/slices/authSlice";
import { getTotalXP, getLevelProgress } from "../utils/rpg";
import { RANKS } from "./ProgressionPath";
import XPBar from "../components/XPBar";
import LevelUpModal from "../components/LevelUpModal";
import PenaltyModal from "../components/PenaltyModal";
import RankUpModal from "../components/RankUpModal";



const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30, rotateX: 10 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
};

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, character } = useSelector((state: RootState) => state.auth);
  const { recent, stats } = useSelector((state: RootState) => state.activity);
  const { dailyChallenge } = useSelector((state: RootState) => state.challenges);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPenalty, setShowPenalty] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  
  // Use real character data or fallback
  const streak = character?.currentStreak || 0;
  const coins = character?.coins || 0;
  const level = character?.level || 1;
  const currentXp = character?.xp || 0;
  const levelProgress = getLevelProgress(level, currentXp);
  
  const CURRENT_XP = getTotalXP(level, currentXp);
  const CURRENT_RANK = RANKS.find((r) => CURRENT_XP >= r.xpMin && (CURRENT_XP < r.xpMax || r.xpMax === Infinity)) || RANKS[0];
  
  // Placeholder debuff logic
  const [debuffActive] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchRecentActivities(4));
    dispatch(fetchActivityStats('today'));
    dispatch(fetchDailyChallenge());
  }, [dispatch]);

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
                {level}
              </div>
            </div>

            <div className="text-center mb-6 relative z-10">
              <h3 className="font-black text-2xl uppercase tracking-wide text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{user?.name || "Player"}</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2"
                style={{
                  background: `${CURRENT_RANK.color}1a`,
                  border: `1px solid ${CURRENT_RANK.color}66`,
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                }}>
                <span className="text-[10px] animate-pulse" style={{ color: CURRENT_RANK.color }}>{CURRENT_RANK.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest font-['Rajdhani']" style={{ color: CURRENT_RANK.color }}>Level {level}</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] mt-3 font-bold" style={{ color: CURRENT_RANK.color }}>
                {CURRENT_RANK.name} // TIER {CURRENT_RANK.tier}
              </p>
            </div>

            <div className="mb-6 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[rgba(232,232,240,0.5)]">Lifetime Progress</span>
              </div>
              <XPBar current={CURRENT_XP} max={getTotalXP(level + 1, 0)} level={level} className="w-full" />
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
              {[
                { label: "Strength", value: character?.strength || 10, color: "#8b5cf6" },
                { label: "Intellect", value: character?.intellect || 10, color: "#10e07f" },
                { label: "Discipline", value: character?.discipline || 10, color: "#00f0ff" },
                { label: "Health", value: character?.health || 10, color: "#ec4899" },
              ].map((s, i) => (
                <div key={s.label} className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] transition-colors hover:border-[rgba(255,255,255,0.1)]" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[rgba(232,232,240,0.5)] font-['Rajdhani']">{s.label}</span>
                    <span className="text-sm font-black stat-num drop-shadow-[0_0_5px_currentColor]" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)]" style={{ clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, s.value * 2)}%` }}
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10e07f] font-['Rajdhani']">Activities:</span>
                  <span className="text-sm font-black text-white stat-num">{stats?.totalActivities || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Today's XP", value: stats?.totalXP || 0, color: "#00f0ff", icon: "✦" },
                  { label: "Loot Gained", value: `+${stats?.totalCoins || 0}`, color: "#00f0ff", icon: "◈" },
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
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff] hover:text-white transition-colors flex items-center gap-1 font-['Rajdhani']">
                  View Database <span className="text-sm">→</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {recent.length > 0 ? recent.map((r, i) => (
                  <QuestItem key={r.id || i} activity={r} index={i} />
                )) : (
                  <div className="py-4 text-center border border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,22,0.6)]" style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                    <p className="text-[rgba(232,232,240,0.4)] uppercase tracking-widest text-[10px] md:text-xs font-['Rajdhani']">No recent activity detected.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />


    </div>
  );
}

function QuestItem({ quest, activity, index }: { quest?: any; activity?: any; index: number }) {
  const isActivity = !!activity;
  const title = isActivity ? (activity.task?.title || activity.description) : quest.title;
  const xp = isActivity ? activity.xp : quest.xp;
  const coins = isActivity ? activity.coins : quest.coins;
  const isDone = isActivity ? true : quest.done;
  const isOverdue = isActivity ? false : quest.overdue;

  const [done, setDone] = useState(isDone);
  const [verifying, setVerifying] = useState(false);

  const handleCheck = () => {
    if (done || isOverdue || isActivity) return;
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
        background: isOverdue
          ? "rgba(220,38,38,0.05)"
          : done ? "rgba(16,224,127,0.03)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isOverdue ? "rgba(220,38,38,0.3)" : done ? "rgba(16,224,127,0.15)" : "rgba(255,255,255,0.05)"}`,
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      }}
    >
      <button
        onClick={handleCheck}
        className="w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer relative"
        style={{
          background: done ? "#10e07f" : "rgba(0,0,0,0.5)",
          border: `1px solid ${done ? "#10e07f" : isOverdue ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.3)"}`,
          clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
          boxShadow: done ? "0 0 10px rgba(16,224,127,0.5)" : "none"
        }}
      >
        {!done && !isOverdue && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />}
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
            color: isOverdue ? "#dc2626" : done ? "rgba(232,232,240,0.4)" : "white",
            textDecoration: done ? "line-through" : "none",
            fontFamily: "Inter, sans-serif"
          }}>
            {title}
          </p>
        </div>
      )}

      {!verifying && (
        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          {isOverdue ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#dc2626] font-['Rajdhani']">Failed</span>
          ) : done ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 bg-[rgba(16,224,127,0.1)] border border-[rgba(16,224,127,0.3)] text-[#10e07f] font-['Rajdhani']">Cleared</span>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-right">
              <span className="text-xs font-black uppercase tracking-widest text-[#00f0ff] font-['Rajdhani'] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">+{xp} XP</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#ec4899] font-['Rajdhani']">◈ {coins}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
