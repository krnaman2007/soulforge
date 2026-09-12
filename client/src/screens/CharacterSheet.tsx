import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/slices/authSlice";
import api from "../api/axiosConfig";
import XPBar from "../components/XPBar";

const BADGE_TIER: Record<string, { color: string; bg: string; border: string }> = {
  bronze: { color: "#cd7f32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.25)" },
  silver: { color: "#e2e8f0", bg: "rgba(226,232,240,0.08)", border: "rgba(226,232,240,0.18)" },
  cyan: { color: "#00f0ff", bg: "rgba(0,240,255,0.12)", border: "rgba(0,240,255,0.25)" },
  legendary: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
};

function StatBar({ attr, index }: { attr: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, rotateX: 10 }}
      animate={{ opacity: 1, x: 0, rotateX: 0 }}
      transition={{ delay: index * 0.1, type: "spring" }}
      className="group preserve-3d"
    >
      <div 
        className="relative p-4 md:p-5 bg-[rgba(20,20,30,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] transition-all duration-300 hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden"
        style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div>
            <p className="text-sm md:text-base font-bold leading-none uppercase tracking-widest text-white group-hover:text-[#00f0ff] transition-colors font-['Rajdhani']">{attr.name}</p>
            <p className="text-[10px] md:text-xs mt-1 text-[rgba(232,232,240,0.4)] group-hover:text-[rgba(232,232,240,0.6)] transition-colors">{attr.desc}</p>
          </div>
          <span className="text-xl md:text-2xl font-black stat-num drop-shadow-[0_0_8px_currentColor]" style={{ color: attr.color, fontFamily: "Rajdhani, sans-serif" }}>
            {attr.value}
          </span>
        </div>

        <div className="relative h-2 w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)]" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>
          {/* Animated background track pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_100%)] bg-[length:4px_4px]" />
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(attr.value / attr.max) * 100}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.3 + index * 0.1 }}
            className="absolute top-0 left-0 h-full"
            style={{ 
              background: `linear-gradient(90deg, ${attr.color}40, ${attr.color})`, 
              boxShadow: `0 0 10px ${attr.color}`,
              clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)"
            }}
          >
            {/* Shimmer effect inside progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.5)] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Simple rank tier calculation based on XP
const getRankTier = (xp: number) => {
  if (xp >= 120000) return { rank: "Grand Master", tier: 8 };
  if (xp >= 60000) return { rank: "Master", tier: 7 };
  if (xp >= 30000) return { rank: "Expert", tier: 6 };
  if (xp >= 15000) return { rank: "Specialist", tier: 5 };
  if (xp >= 6000) return { rank: "Adept", tier: 4 };
  if (xp >= 2000) return { rank: "Journeyman", tier: 3 };
  if (xp >= 1000) return { rank: "Apprentice", tier: 2 };
  return { rank: "Novice", tier: 1 };
};
const getRankMaxXp = (tier: number) => {
  const thresholds = [0, 1000, 2000, 6000, 15000, 30000, 60000, 120000, 999999];
  return thresholds[tier] || 1000;
};

export default function CharacterSheet() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, character } = useSelector((state: RootState) => state.auth);

  const [titles, setTitles] = useState<{id: string; itemId?: string; name: string; unlocked: boolean; equipped: boolean; desc: string}[]>([
    { id: "t1", name: "The Architect", unlocked: true, equipped: true, desc: "Awarded for planning 5+ projects" },
    { id: "t2", name: "Iron Will", unlocked: true, equipped: false, desc: "Completed a 14-day streak" },
    { id: "t3", name: "Deep Diver", unlocked: false, equipped: false, desc: "Reach Mastery 90 to unlock" },
    { id: "t4", name: "Night Owl", unlocked: false, equipped: false, desc: "Complete 10 quests after 10pm" },
  ]);

  const [badges, setBadges] = useState([
    { name: "First Flame", desc: "3-day streak", icon: "🔥", tier: "bronze", earned: true },
    { name: "Steady Burn", desc: "7-day streak", icon: "🔥", tier: "silver", earned: true },
    { name: "Iron Streak", desc: "14-day streak", icon: "🏅", tier: "cyan", earned: true },
    { name: "Forge Fire", desc: "30-day streak", icon: "🏆", tier: "cyan", earned: false },
    { name: "Eternal Flame", desc: "60-day streak", icon: "✦", tier: "legendary", earned: false },
    { name: "Ascendant", desc: "100-day streak", icon: "◈", tier: "legendary", earned: false },
  ]);

  useEffect(() => {
    fetchInventoryAndAchievements();
  }, []);

  const fetchInventoryAndAchievements = async () => {
    try {
      const [invRes, achRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/achievements/me")
      ]);

      if (invRes.data?.success) {
        const inventoryItems = invRes.data.data.items;
        const apiTitles = inventoryItems
          .filter((item: any) => item.type === "TITLE")
          .map((item: any) => ({
            id: item.inventoryId,
            itemId: item.itemId,
            name: item.name,
            desc: item.description,
            unlocked: true,
            equipped: item.equipped
          }));
        
        if (apiTitles.length > 0) {
          // Merge with default static titles that aren't unlocked
          const mergedTitles = [
            ...apiTitles,
            ...titles.filter(t => !t.unlocked)
          ];
          setTitles(mergedTitles);
        }
      }

      if (achRes.data?.success) {
         // Optionally update badges based on unlocked achievements
         // Currently keeping static fallback to preserve premium visual demo
      }
    } catch (error) {
      console.error("Failed to load inventory/achievements", error);
    }
  };

  const handleEquipTitle = async (inventoryId: string, itemId: string, currentEquipped: boolean) => {
    if (currentEquipped) return; // Already equipped
    try {
      const res = await api.post(`/inventory/${itemId}/equip`);
      if (res.data.success) {
        dispatch(fetchCurrentUser());
        setTitles(titles.map(t => ({
          ...t,
          equipped: t.id === inventoryId
        })));
      }
    } catch (error) {
      console.error("Failed to equip item", error);
    }
  };

  const xp = character?.xp || 0;
  const { rank, tier } = getRankTier(xp);
  const maxXp = getRankMaxXp(tier);
  const equippedTitle = titles.find(t => t.equipped)?.name || "Initiate";

  const charAttributes = [
    { name: "Focus", value: character?.intellect || 10, max: 100, color: "#8b5cf6", desc: "Deep work & sustained attention" },
    { name: "Vitality", value: character?.health || 10, max: 100, color: "#10e07f", desc: "Physical health & energy" },
    { name: "Mastery", value: (character as any)?.learning || 10, max: 100, color: "#00f0ff", desc: "Skill depth & expertise" },
    { name: "Discipline", value: character?.discipline || 10, max: 100, color: "#ec4899", desc: "Consistency & habit adherence" },
    { name: "Creativity", value: character?.creativity || 10, max: 100, color: "#60a5fa", desc: "Novel thinking & expression" },
    { name: "Resilience", value: (character as any)?.emotional || 10, max: 100, color: "#f472b6", desc: "Bounce-back & adaptability" },
  ];

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-6xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 w-[200%] h-[50vh] bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(75deg)] opacity-20 origin-top" style={{ perspective: '1000px' }} />
      </div>

      <div className="mb-10 text-center">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 flex justify-center items-center gap-4">
          <span className="w-8 h-px bg-[#00f0ff]" />
          Player Identity
          <span className="w-8 h-px bg-[#00f0ff]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00f0ff]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
          Character Sheet
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: IDENTITY & BADGES */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Identity Holographic Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-6 md:p-8 bg-[rgba(10,10,15,0.6)] backdrop-blur-xl border border-[rgba(0,240,255,0.3)] shadow-[0_0_40px_rgba(0,240,255,0.05)]"
            style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}
          >
            {/* Animated Grid Background */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Hex Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 hex-clip flex items-center justify-center text-5xl transition-transform duration-500 group-hover:rotate-[360deg]"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,20,30,0.8), rgba(10,10,15,0.9))",
                    border: "2px solid rgba(0,240,255,0.5)",
                    boxShadow: "0 0 20px rgba(0,240,255,0.3) inset",
                  }}>
                  ⚔️
                </div>
                <div className="absolute -bottom-3 -right-3 w-10 h-10 flex items-center justify-center text-sm font-black font-['Rajdhani'] z-20"
                  style={{
                    background: "linear-gradient(135deg, #00f0ff, #ec4899)",
                    color: "#0a0a0f",
                    clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                    boxShadow: "0 0 15px rgba(0,240,255,0.6)",
                  }}>
                  {character?.level || 1}
                </div>
              </div>

              {/* Character Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black uppercase tracking-wide text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{user?.name || "Aiden"}</h2>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 self-center sm:self-auto"
                    style={{
                      background: "rgba(96,165,250,0.1)",
                      border: "1px solid rgba(96,165,250,0.4)",
                      clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                      boxShadow: "0 0 10px rgba(96,165,250,0.2) inset",
                    }}>
                    <span className="text-[#60a5fa] text-[10px] animate-pulse">◉</span>
                    <span className="text-xs font-black uppercase tracking-widest text-[#60a5fa] font-['Rajdhani']">{rank}</span>
                  </div>
                </div>
                
                <div className="inline-block px-3 py-1 mb-4"
                  style={{ 
                    background: "rgba(0,240,255,0.15)", 
                    borderLeft: "2px solid #00f0ff",
                  }}>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] font-['Rajdhani']">{equippedTitle}</span>
                </div>
                
                <p className="text-[10px] uppercase tracking-[0.2em] mb-4 text-[#8b5cf6] font-bold">Tier {tier} // {xp.toLocaleString()} XP Total</p>
                
                <XPBar current={xp} max={maxXp} level={character?.level || 1} />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] relative z-10">
              {[
                { label: "Coins", value: character?.coins || 0, color: "#00f0ff" },
                { label: "Best Streak", value: `${character?.longestStreak || 0}d`, color: "#ec4899" },
                { label: "Rank Tier", value: `${tier} / 9`, color: "#60a5fa" },
              ].map((s) => (
                <div key={s.label} className="p-3 text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
                  style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}>
                  <p className="font-black text-xl md:text-2xl stat-num drop-shadow-[0_0_5px_currentColor]" style={{ color: s.color, fontFamily: "Rajdhani, sans-serif" }}>{s.value}</p>
                  <p className="text-[9px] uppercase font-bold tracking-widest mt-1 text-[rgba(232,232,240,0.4)]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Streak Shield */}
            <div className="mt-6 p-4 flex items-center gap-4 relative z-10"
              style={{ 
                background: "linear-gradient(90deg, rgba(16,224,127,0.1), rgba(16,224,127,0.02))", 
                borderLeft: "3px solid #10e07f",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)"
              }}>
              <div className="w-10 h-10 flex items-center justify-center text-xl bg-[rgba(16,224,127,0.2)] rounded-full text-[#10e07f] shadow-[0_0_15px_rgba(16,224,127,0.4)]">
                🛡
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-[#10e07f] font-['Rajdhani'] drop-shadow-[0_0_5px_rgba(16,224,127,0.5)]">Streak Shield — Active</p>
                <p className="text-[10px] md:text-xs text-[rgba(232,232,240,0.5)] mt-1 font-['Inter']">1 shield available. Protects your streak from a missed day.</p>
              </div>
            </div>
          </motion.div>

          {/* Titles Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">Titles & Achievements</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>
            
            <div className="grid gap-3">
              {titles.map((t, i) => (
                <motion.div 
                  key={t.id || t.name} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className="group relative cursor-pointer"
                  onClick={() => t.unlocked && t.itemId && handleEquipTitle(t.id, t.itemId, t.equipped)}
                >
                  <div className={`p-4 flex items-center gap-4 transition-all duration-300 border ${t.unlocked ? (t.equipped ? 'bg-[rgba(0,240,255,0.05)] border-[rgba(0,240,255,0.3)] shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)]') : 'bg-[rgba(0,0,0,0.2)] border-[rgba(255,255,255,0.02)] opacity-50'}`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}>
                    
                    <div className="w-10 h-10 flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: t.equipped ? "rgba(0,240,255,0.15)" : t.unlocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${t.equipped ? "rgba(0,240,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                        clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                        boxShadow: t.equipped ? "0 0 10px rgba(0,240,255,0.3) inset" : "none"
                      }}>
                      {t.unlocked ? "👑" : "🔒"}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm md:text-base font-bold uppercase tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif", color: t.unlocked ? (t.equipped ? "#00f0ff" : "#e8e8f0") : "rgba(232,232,240,0.3)" }}>
                        {t.name}
                      </p>
                      <p className="text-[10px] md:text-xs font-['Inter']" style={{ color: "rgba(232,232,240,0.4)" }}>{t.desc}</p>
                    </div>
                    
                    {t.equipped && (
                      <span className="text-[9px] md:text-[10px] px-3 py-1 font-black tracking-[0.2em] uppercase"
                        style={{ background: "rgba(0,240,255,0.15)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)", fontFamily: "Rajdhani, sans-serif", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                        EQUIPPED
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: ATTRIBUTES & STREAK BADGES */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          
          {/* Attributes Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-[#00f0ff] font-['Rajdhani'] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">Core Attributes</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(0,240,255,0.2)] to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charAttributes.map((attr, i) => <StatBar key={attr.name} attr={attr} index={i} />)}
            </div>
          </motion.div>

          {/* Streak Badges Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">Streak Badges</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge, i) => {
                const bt = BADGE_TIER[badge.tier];
                return (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="group relative preserve-3d"
                  >
                    <div className="flex flex-col items-center gap-3 p-4 md:p-5 text-center transition-all duration-300 relative"
                      style={{
                        background: badge.earned ? bt.bg : "rgba(20,20,30,0.4)",
                        border: `1px solid ${badge.earned ? bt.border : "rgba(255,255,255,0.05)"}`,
                        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                        filter: badge.earned ? `drop-shadow(0 0 15px ${bt.color}20)` : "grayscale(1)",
                        opacity: badge.earned ? 1 : 0.4,
                      }}
                    >
                      {/* Inner Glow */}
                      {badge.earned && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40 pointer-events-none" />}
                      {badge.earned && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white opacity-20 blur-sm" />}

                      <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[10deg] relative z-10"
                        style={{
                          background: badge.earned ? `linear-gradient(135deg, ${bt.color}33, transparent)` : "transparent",
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          border: badge.earned ? `1px solid ${bt.color}80` : "1px solid rgba(255,255,255,0.1)",
                        }}>
                        {badge.earned ? badge.icon : "🔒"}
                      </div>
                      
                      <div className="relative z-10">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider mb-1" style={{ color: badge.earned ? bt.color : "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif" }}>
                          {badge.name}
                        </p>
                        <p className="text-[9px] md:text-[10px] font-['Inter']" style={{ color: badge.earned ? "rgba(232,232,240,0.7)" : "rgba(232,232,240,0.3)" }}>{badge.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
