import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

type View = "global" | "friends";

const GLOBAL = [
  { rank: 1, name: "Zara Chen", rankTitle: "Grand Master", tier: 8, level: 42, xp: 128400, streak: 87, change: 0, avatar: "🦅", you: false, guild: "Apex" },
  { rank: 2, name: "Marcus Webb", rankTitle: "Grand Master", tier: 8, level: 39, xp: 118200, streak: 61, change: 2, avatar: "⚡", you: false, guild: "Storm" },
  { rank: 3, name: "Priya Nair", rankTitle: "Master", tier: 7, level: 37, xp: 109600, streak: 44, change: -1, avatar: "🌙", you: false, guild: "Night Owls" },
  { rank: 4, name: "Devon Asher", rankTitle: "Expert", tier: 6, level: 35, xp: 98100, streak: 33, change: 1, avatar: "🔥", you: false, guild: "Inferno" },
  { rank: 5, name: "Sofia Reyes", rankTitle: "Specialist", tier: 5, level: 33, xp: 87300, streak: 29, change: -2, avatar: "🚀", you: false, guild: "Cosmos" },
  { rank: 6, name: "Kira Stone", rankTitle: "Adept", tier: 4, level: 31, xp: 76400, streak: 18, change: 3, avatar: "🌟", you: false, guild: "Lumina" },
  { rank: 7, name: "James Park", rankTitle: "Adept", tier: 4, level: 28, xp: 64200, streak: 22, change: 0, avatar: "💎", you: false, guild: "Crystal" },
  { rank: 8, name: "Aiden", rankTitle: "Journeyman", tier: 3, level: 7, xp: 3420, streak: 7, change: 0, avatar: "⚔️", you: true, guild: "None" },
];

const FRIENDS = [
  { rank: 1, name: "Alex Torres", rankTitle: "Journeyman", tier: 3, level: 22, xp: 48200, streak: 15, change: 0, avatar: "☄", you: false, guild: "Shadow" },
  { rank: 2, name: "Jamie Liu", rankTitle: "Apprentice", tier: 2, level: 18, xp: 34600, streak: 9, change: 1, avatar: "🛠", you: false, guild: "Iron Hands" },
  { rank: 3, name: "Aiden", rankTitle: "Journeyman", tier: 3, level: 7, xp: 3420, streak: 7, change: 1, avatar: "⚔️", you: true, guild: "None" },
  { rank: 4, name: "Sam Rivera", rankTitle: "Novice", tier: 1, level: 5, xp: 1840, streak: 3, change: -1, avatar: "🗺", you: false, guild: "None" },
];

// Tier → color map
const TIER_COLORS: Record<number, string> = {
  1: "#9ca3af", 2: "#9ca3af", 3: "#60a5fa", 4: "#60a5fa",
  5: "#e2e8f0", 6: "#cd7f32", 7: "#00f0ff", 8: "#00f0ff", 9: "#8b5cf6",
};

// Top 3 podium medals
const PODIUM_CONFIG = [
  { bg: "rgba(0,240,255,0.15)", border: "rgba(0,240,255,0.4)", color: "#00f0ff", glow: "rgba(0,240,255,0.2)", label: "I", scale: 1.1, zIndex: 30 },
  { bg: "rgba(226,232,240,0.1)", border: "rgba(226,232,240,0.3)", color: "#e2e8f0", glow: "rgba(226,232,240,0.15)", label: "II", scale: 0.95, zIndex: 20 },
  { bg: "rgba(205,127,50,0.1)", border: "rgba(205,127,50,0.3)", color: "#cd7f32", glow: "rgba(205,127,50,0.15)", label: "III", scale: 0.85, zIndex: 10 },
];

function Podium({ entries }: { entries: typeof GLOBAL }) {
  const top3 = entries.slice(0, 3);
  // Order: 2nd, 1st, 3rd
  const ordered = [top3[1], top3[0], top3[2]];
  const heights = ["h-32", "h-48", "h-24"];
  const configs = [PODIUM_CONFIG[1], PODIUM_CONFIG[0], PODIUM_CONFIG[2]];

  return (
    <div className="flex items-end justify-center gap-1 md:gap-4 pb-8 pt-12 relative preserve-3d">
      {/* Platform Base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-1 bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.5)] to-transparent opacity-50" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-8 bg-gradient-to-t from-[rgba(0,240,255,0.1)] to-transparent blur-md" />

      {ordered.map((entry, i) => {
        if (!entry) return null;
        const cfg = configs[i];
        const tc = TIER_COLORS[entry.tier] || "#9ca3af";
        
        return (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === 1 ? 0.3 : i === 0 ? 0.4 : 0.5, type: "spring", stiffness: 150, damping: 15 }}
            className="flex flex-col items-center relative"
            style={{ zIndex: cfg.zIndex }}
          >
            {/* Player Info */}
            <div className="flex flex-col items-center mb-4 transition-transform duration-500 hover:-translate-y-2" style={{ transform: `scale(${cfg.scale})` }}>
              <div className="relative mb-3 group">
                 {i === 1 && <div className="absolute -inset-4 bg-[#00f0ff] opacity-20 blur-xl rounded-full animate-pulse pointer-events-none" />}
                <div className="w-16 h-16 hex-clip flex items-center justify-center text-3xl relative z-10"
                  style={{ background: "rgba(10,10,15,0.9)", border: `2px solid ${cfg.color}`, boxShadow: `inset 0 0 20px ${cfg.glow}` }}>
                  {entry.avatar}
                </div>
                {entry.you && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#00f0ff] text-[#0a0a12] text-[9px] font-black uppercase tracking-widest z-20 border border-[#0a0a12]"
                    style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>
                    You
                  </div>
                )}
              </div>
              
              <div className="text-center w-24 md:w-32">
                <p className="text-xs md:text-sm font-black uppercase tracking-wider truncate text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  {entry.name}
                </p>
                <p className="text-[9px] uppercase tracking-widest mt-1 truncate font-['Inter']" style={{ color: tc }}>
                  {entry.rankTitle}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1 text-[10px]">
                   <span className="text-[#00f0ff] font-bold stat-num">{entry.xp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            {/* Pillar */}
            <div className={`w-24 md:w-32 ${heights[i]} relative group`}
              style={{
                clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 10px 100%)",
              }}>
              <div className="absolute inset-0"
                style={{
                  background: cfg.bg,
                  borderTop: `2px solid ${cfg.color}`,
                  borderLeft: `1px solid ${cfg.border}`,
                  borderRight: `1px solid ${cfg.border}`,
                  boxShadow: `inset 0 20px 50px -20px ${cfg.glow}, 0 -10px 30px -10px ${cfg.glow}`
                }}
              />
              
              {/* Internal Holographic Lines */}
              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:100%_10px]" />
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl md:text-4xl font-black italic opacity-50"
                style={{ color: cfg.color, fontFamily: "Rajdhani, sans-serif", textShadow: `0 0 20px ${cfg.color}` }}>
                {cfg.label}
              </div>
              
              {/* Ground Reflection */}
              <div className="absolute -bottom-10 left-0 w-full h-10 bg-gradient-to-b from-[rgba(255,255,255,0.1)] to-transparent blur-sm opacity-50 transform scale-y-[-1]" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function LeaderRow({ entry, index }: { entry: typeof GLOBAL[0]; index: number }) {
  const tc = TIER_COLORS[entry.tier] || "#9ca3af";
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 md:px-6 py-3 md:py-4 transition-all duration-300 relative group overflow-hidden"
        style={{
          background: entry.you ? "rgba(0,240,255,0.1)" : "rgba(15,15,22,0.6)",
          border: `1px solid ${entry.you ? "rgba(0,240,255,0.3)" : "rgba(255,255,255,0.05)"}`,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}>
        
        {/* Hover Effect */}
        {!entry.you && (
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
        {entry.you && (
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI0NiwgMTczLCA1NSwgMC4xKSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDBoNDBWMHoiLz48L2c+PC9zdmc+')] opacity-20 pointer-events-none" />
        )}

        <div className="flex items-center gap-4 w-full sm:w-auto relative z-10">
          {/* Rank # */}
          <div className="w-8 md:w-10 text-center flex-shrink-0">
            <span className="text-sm md:text-base font-black italic stat-num" 
              style={{ color: isTop3 ? tc : "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif", textShadow: isTop3 ? `0 0 10px ${tc}80` : 'none' }}>
              #{entry.rank}
            </span>
          </div>

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 hex-clip flex items-center justify-center text-xl md:text-2xl flex-shrink-0 relative z-10"
              style={{ 
                background: entry.you ? "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(10,10,15,0.9))" : "rgba(255,255,255,0.05)",
                border: `1px solid ${entry.you ? "rgba(0,240,255,0.5)" : "rgba(255,255,255,0.1)"}`
              }}>
              {entry.avatar}
            </div>
            {entry.you && <div className="absolute -inset-1 bg-[#00f0ff] opacity-20 blur-sm rounded-full pointer-events-none" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-black uppercase tracking-wide truncate text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                {entry.name}
              </span>
              {entry.you && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#00f0ff] text-[#0a0a12] border border-[rgba(255,255,255,0.2)]"
                  style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>
                  You
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-widest mt-0.5 truncate font-['Inter']" style={{ color: tc, opacity: 0.9 }}>
              Lv {entry.level} <span className="mx-1 opacity-50">•</span> {entry.rankTitle} <span className="mx-1 opacity-50">•</span> <span className="text-[rgba(232,232,240,0.5)]">{entry.guild}</span>
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 text-xs flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.05)] relative z-10">
          <div className="text-left sm:text-right">
             <p className="text-[9px] uppercase tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani'] mb-0.5">Total XP</p>
            <p className="font-black stat-num text-sm md:text-base" style={{ color: "#00f0ff", filter: "drop-shadow(0 0 5px rgba(0,240,255,0.3))" }}>
              {entry.xp.toLocaleString()}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[9px] uppercase tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani'] mb-0.5">Streak</p>
            <p className="flex items-center gap-1 justify-start sm:justify-end">
              <span className="flame-pulse inline-block text-xs md:text-sm">🔥</span>
              <span className="font-black stat-num text-sm md:text-base" style={{ color: "#ec4899", filter: "drop-shadow(0 0 5px rgba(236,72,153,0.3))" }}>{entry.streak}</span>
            </p>
          </div>
          <div className="w-12 text-right">
             <p className="text-[9px] uppercase tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani'] mb-0.5">Trend</p>
            {entry.change === 0 ? (
              <span className="text-[rgba(232,232,240,0.3)] font-bold">—</span>
            ) : (
              <span className="text-xs md:text-sm font-black flex items-center justify-end gap-0.5" 
                style={{ color: entry.change > 0 ? "#10e07f" : "#dc2626", fontFamily: "Rajdhani, sans-serif" }}>
                {entry.change > 0 ? "▲" : "▼"}{Math.abs(entry.change)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [view, setView] = useState<View>("global");
  const [globalData, setGlobalData] = useState<any[]>([]);
  const [friendsData, setFriendsData] = useState<any[]>([]);
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const [globalRes, friendsRes] = await Promise.all([
        api.get("/leaderboard/global"),
        api.get("/leaderboard/friends")
      ]);

      if (globalRes.data?.success) {
        setGlobalData(formatData(globalRes.data.data));
      }
      if (friendsRes.data?.success) {
        setFriendsData(formatData(friendsRes.data.data));
      }
    } catch (err) {
      console.error("Failed to fetch leaderboards", err);
    }
  };

  const getRankTier = (xp: number) => {
    if (xp >= 120000) return { title: "Grand Master", tier: 8 };
    if (xp >= 60000) return { title: "Master", tier: 7 };
    if (xp >= 30000) return { title: "Expert", tier: 6 };
    if (xp >= 15000) return { title: "Specialist", tier: 5 };
    if (xp >= 6000) return { title: "Adept", tier: 4 };
    if (xp >= 2000) return { title: "Journeyman", tier: 3 };
    if (xp >= 1000) return { title: "Apprentice", tier: 2 };
    return { title: "Novice", tier: 1 };
  };

  const formatData = (items: any[]) => {
    return items.map((item, index) => {
      const xpVal = item.xp || item.weeklyXP || 0;
      const { title, tier } = getRankTier(xpVal);
      // Try to parse an emoji from avatarId if it looks like one, else default to sword
      const emojiMatch = item.user?.avatarId ? item.user.avatarId.match(/[\p{Emoji}]/u) : null;
      const avatar = emojiMatch ? emojiMatch[0] : "⚔️";

      return {
        rank: item.rank || index + 1,
        name: item.user?.username || "Unknown",
        rankTitle: title,
        tier: tier,
        level: item.user?.level || 1,
        xp: xpVal,
        streak: item.currentStreak || 0,
        change: 0,
        avatar: avatar,
        you: item.user?.id === user?.id,
        guild: "None"
      };
    });
  };

  const currentData = view === "global" ? (globalData.length > 0 ? globalData : GLOBAL) : (friendsData.length > 0 ? friendsData : FRIENDS);
  const youEntry = currentData.find((e) => e.you);
  const remaining = currentData.slice(3);

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-5xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Background Environment */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        <div className="absolute top-0 w-full h-[40vh] bg-gradient-to-b from-[rgba(0,240,255,0.05)] to-transparent" />
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 flex justify-center md:justify-start items-center gap-4">
             <span className="w-8 h-px bg-[#00f0ff]" />
             Competitive Season 4
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00f0ff]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Global Rankings
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] mt-3 font-['Inter']">
            Rankings reset weekly. Ascend tiers by accumulating XP and maintaining streaks.
          </p>
        </div>
        
        {/* Toggle */}
        <div className="flex p-1 gap-1 self-center md:self-end w-full md:w-auto bg-[rgba(15,15,22,0.8)] border border-[rgba(255,255,255,0.1)] backdrop-blur-md relative z-20"
          style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
          {(["global", "friends"] as View[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="flex-1 md:w-32 py-2.5 text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden group"
              style={{
                background: view === v ? "rgba(0,240,255,0.15)" : "transparent",
                color: view === v ? "#00f0ff" : "rgba(232,232,240,0.5)",
                fontFamily: "Rajdhani, sans-serif",
                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              }}>
              {view === v && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.2)] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {youEntry && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-[rgba(0,240,255,0.05)] border border-[rgba(0,240,255,0.2)] flex items-center justify-between"
          style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
        >
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#00f0ff] rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]" />
             <span className="text-xs font-bold uppercase tracking-widest text-[rgba(232,232,240,0.7)] font-['Rajdhani']">Current Position</span>
          </div>
          <div className="text-right flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#00f0ff] font-['Rajdhani']">Rank</span>
            <span className="font-black text-2xl stat-num text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">#{youEntry.rank}</span>
          </div>
        </motion.div>
      )}

      {/* Podium Area */}
      <div className="mb-16 relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-[rgba(0,240,255,0.2)] to-transparent pointer-events-none" />
        <Podium entries={currentData} />
      </div>

      <div className="flex items-center gap-4 mb-6 opacity-70">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(255,255,255,0.2)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">Contenders</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(255,255,255,0.2)]" />
      </div>

      {/* Remaining rows (4+) */}
      <div className="space-y-3">
        {remaining.map((entry, i) => (
          <LeaderRow key={entry.name + view} entry={entry} index={i} />
        ))}
      </div>
      
      {remaining.length === 0 && (
         <div className="text-center p-12 border border-dashed border-[rgba(255,255,255,0.1)] opacity-50">
           <p className="text-xs uppercase tracking-widest font-bold font-['Rajdhani']">No more contenders in this bracket.</p>
         </div>
      )}
    </div>
  );
}
