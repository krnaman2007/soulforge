import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/slices/authSlice";
import { fetchMyAchievementsSummary, fetchAllAchievements } from "../store/slices/achievementSlice";
import { fetchActivityStats } from "../store/slices/activitySlice";
import { fetchInventory } from "../store/slices/shopSlice";
import { getLevelProgress } from "../utils/rpg";
import XPBar from "../components/XPBar";

interface AttributeConfig {
  key: string;
  name: string;
  category: "vitality" | "mastery";
  desc: string;
  color: string;
}

const ATTRIBUTES_CONFIG: AttributeConfig[] = [
  // Core Vitality & Mental
  {
    key: "strength",
    name: "Strength",
    category: "vitality",
    desc: "Physical power, endurance & athletic stamina",
    color: "#ec4899",
  },
  {
    key: "intellect",
    name: "Intellect",
    category: "vitality",
    desc: "Analytical rigor, problem solving & mental processing",
    color: "#00f0ff",
  },
  {
    key: "discipline",
    name: "Discipline",
    category: "vitality",
    desc: "Habit execution, willpower & daily follow-through",
    color: "#f59e0b",
  },
  {
    key: "health",
    name: "Health",
    category: "vitality",
    desc: "Biological vitality, rest quality & recovery rate",
    color: "#10b981",
  },
  {
    key: "creativity",
    name: "Creativity",
    category: "vitality",
    desc: "Original synthesis, design thinking & novel expression",
    color: "#a855f7",
  },
  {
    key: "social",
    name: "Social",
    category: "vitality",
    desc: "Charisma, network connectivity & interpersonal empathy",
    color: "#3b82f6",
  },

  // Life & Mastery
  {
    key: "leadership",
    name: "Leadership",
    category: "mastery",
    desc: "Strategic vision, team alignment & execution velocity",
    color: "#eab308",
  },
  {
    key: "finance",
    name: "Finance",
    category: "mastery",
    desc: "Capital efficiency, resource prudence & wealth building",
    color: "#14b8a6",
  },
  {
    key: "career",
    name: "Career",
    category: "mastery",
    desc: "Professional craftsmanship, output velocity & reputation",
    color: "#6366f1",
  },
  {
    key: "emotional",
    name: "Emotional Resilience",
    category: "mastery",
    desc: "Mental composure under pressure & psychological fortitude",
    color: "#06b6d4",
  },
  {
    key: "learning",
    name: "Learning Velocity",
    category: "mastery",
    desc: "Accelerated skill acquisition & conceptual assimilation",
    color: "#8b5cf6",
  },
  {
    key: "personalGrowth",
    name: "Personal Growth",
    category: "mastery",
    desc: "Self-actualization, core purpose & philosophical depth",
    color: "#f43f5e",
  },
];

const BADGE_TIER: Record<string, { color: string; bg: string; border: string }> = {
  bronze: { color: "#cd7f32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.25)" },
  silver: { color: "#e2e8f0", bg: "rgba(226,232,240,0.08)", border: "rgba(226,232,240,0.18)" },
  cyan: { color: "#00f0ff", bg: "rgba(0,240,255,0.12)", border: "rgba(0,240,255,0.25)" },
  legendary: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
};

function formatEquipmentName(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  return raw
    .replace(/^(avatar_|skin_|frame_|effect_|theme_|title_|weapon_|pet_)/, "")
    .replace(/_/g, " ")
    .toUpperCase();
}

function StatBar({ attr, index }: { attr: { name: string; value: number; max: number; color: string; desc: string }; index: number }) {
  const percentage = Math.min(100, Math.max(0, (attr.value / attr.max) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group"
    >
      <div
        className="relative p-4 md:p-5 bg-[rgba(16,16,24,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] transition-all duration-300 hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.12)] overflow-hidden"
        style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: attr.color }} />
              <p className="text-sm md:text-base font-bold uppercase tracking-wider text-white group-hover:text-[#00f0ff] transition-colors font-['Rajdhani']">
                {attr.name}
              </p>
            </div>
            <p className="text-[10px] md:text-xs mt-0.5 text-[rgba(232,232,240,0.4)] group-hover:text-[rgba(232,232,240,0.6)] transition-colors">
              {attr.desc}
            </p>
          </div>
          <div className="text-right">
            <span
              className="text-xl md:text-2xl font-black stat-num drop-shadow-[0_0_8px_currentColor]"
              style={{ color: attr.color, fontFamily: "Rajdhani, sans-serif" }}
            >
              {attr.value}
            </span>
            <span className="text-[10px] text-white/30 ml-1 font-mono">/ {attr.max}</span>
          </div>
        </div>

        <div
          className="relative h-2 w-full bg-[rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.08)] overflow-hidden"
          style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.1 + index * 0.03 }}
            className="absolute top-0 left-0 h-full"
            style={{
              background: `linear-gradient(90deg, ${attr.color}50, ${attr.color})`,
              boxShadow: `0 0 10px ${attr.color}`,
              clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CharacterSheet() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, character } = useSelector((state: RootState) => state.auth);
  const { unlockedAchievements, allAchievements, status } = useSelector((state: RootState) => state.achievements);
  const activityStats = useSelector((state: RootState) => state.activity.stats);
  const inventoryState = useSelector((state: RootState) => state.shop.inventory);

  const [activeTab, setActiveTab] = useState<"all" | "vitality" | "mastery">("all");

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
    dispatch(fetchMyAchievementsSummary());
    dispatch(fetchAllAchievements(undefined));
    dispatch(fetchActivityStats("all"));
    dispatch(fetchInventory(undefined));
  }, [dispatch, user]);

  const level = character?.level || 1;
  const totalXp = character?.xp || 0;
  const progress = getLevelProgress(level, totalXp);

  // Authoritative 12 attributes mapped directly from character
  const attributesList = ATTRIBUTES_CONFIG.map((cfg) => {
    const rawVal = (character as any)?.[cfg.key];
    const val = typeof rawVal === "number" ? rawVal : 0;
    return {
      key: cfg.key,
      name: cfg.name,
      category: cfg.category,
      desc: cfg.desc,
      color: cfg.color,
      value: val,
      max: 100,
    };
  });

  const filteredAttributes =
    activeTab === "all" ? attributesList : attributesList.filter((a) => a.category === activeTab);

  // Equipped cosmetic loadout
  const loadoutData = [
    {
      slot: "AVATAR",
      name: formatEquipmentName(character?.avatarId, "DEFAULT AVATAR"),
      code: character?.avatarId || "avatar_starter",
      icon: (
        <svg className="w-4 h-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      slot: "WEAPON",
      name: formatEquipmentName(character?.weaponId, "STANDARD BLADE"),
      code: character?.weaponId || "unarmed",
      icon: (
        <svg className="w-4 h-4 text-[#ec4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      slot: "SKIN / EXOSUIT",
      name: formatEquipmentName(character?.skinId, "FORGE ARMOR"),
      code: character?.skinId || "default_skin",
      icon: (
        <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      slot: "COMPANION PET",
      name: formatEquipmentName(character?.petId, "NONE ACTIVE"),
      code: character?.petId || "none",
      icon: (
        <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      slot: "HOLO FRAME",
      name: formatEquipmentName(character?.frameId, "HEX BORDER"),
      code: character?.frameId || "standard_frame",
      icon: (
        <svg className="w-4 h-4 text-[#60a5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        </svg>
      ),
    },
    {
      slot: "AURA EFFECT",
      name: formatEquipmentName(character?.effectId, "QUANTUM RESONANCE"),
      code: character?.effectId || "none",
      icon: (
        <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      slot: "NEURAL THEME",
      name: formatEquipmentName(character?.themeId, "CYBER DARK"),
      code: character?.themeId || "theme_classic",
      icon: (
        <svg className="w-4 h-4 text-[#06b6d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      slot: "HONOR TITLE",
      name: formatEquipmentName(character?.titleId, "APPRENTICE"),
      code: character?.titleId || "title_apprentice",
      icon: (
        <svg className="w-4 h-4 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ];

  // Resolve equipped title name
  const equippedTitleName = formatEquipmentName(character?.titleId, "APPRENTICE");

  // Titles mapping
  const allTitles = allAchievements
    .filter((a) => Boolean(a.rewardTitle))
    .map((a) => {
      const isUnlocked = unlockedAchievements.some((ua) => ua.id === a.id);
      const isEquipped =
        character?.titleId === a.id ||
        character?.titleId === a.rewardTitle ||
        character?.titleId === `title_${a.code?.toLowerCase()}` ||
        character?.titleId === a.code;
      return {
        name: a.rewardTitle || a.name,
        unlocked: isUnlocked,
        equipped: isEquipped,
        desc: a.description,
      };
    });

  // Badges mapping
  const allBadges = allAchievements
    .filter((a) => Boolean(a.badge))
    .map((a) => {
      const isUnlocked = unlockedAchievements.some((ua) => ua.id === a.id);
      let tier = "bronze";
      if (a.rewardXP > 2000) tier = "legendary";
      else if (a.rewardXP > 1000) tier = "cyan";
      else if (a.rewardXP > 500) tier = "silver";

      return {
        name: a.name,
        desc: a.description,
        tier,
        earned: isUnlocked,
      };
    });

  const maxStreak = character?.longestStreak || 0;

  const navigateToShop = () => {
    window.dispatchEvent(new CustomEvent("soulforge:navigate", { detail: "shop" }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-t-[#00f0ff] border-b-[#ec4899] border-l-transparent border-r-transparent rounded-full mb-4"
        />
        <div className="text-[#00f0ff] font-['Rajdhani'] uppercase tracking-[0.3em] font-bold text-sm animate-pulse">
          Synchronizing Neural Matrix...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-6xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center overflow-hidden">
        <div
          className="absolute top-0 w-[200%] h-[50vh] bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(75deg)] opacity-30 origin-top"
          style={{ perspective: "1000px" }}
        />
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 flex justify-center items-center gap-4">
          <span className="w-8 h-px bg-[#00f0ff]" />
          Hero Analytics & Equipment Matrix
          <span className="w-8 h-px bg-[#00f0ff]" />
        </div>
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-[#00f0ff]"
          style={{ fontFamily: "Rajdhani, sans-serif" }}
        >
          Character Sheet
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: IDENTITY & LOADOUT */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Identity Holographic Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-6 md:p-8 bg-[rgba(10,10,18,0.75)] backdrop-blur-xl border border-[rgba(0,240,255,0.25)] shadow-[0_0_40px_rgba(0,240,255,0.06)]"
            style={{
              clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Hex Avatar (SVG Zero Emojis) */}
              <div className="relative group flex-shrink-0">
                <div
                  className="w-24 h-24 hex-clip flex items-center justify-center relative transition-transform duration-500 group-hover:rotate-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,20,32,0.9), rgba(10,10,16,0.95))",
                    border: "2px solid rgba(0,240,255,0.4)",
                    boxShadow: "0 0 20px rgba(0,240,255,0.2) inset, 0 0 15px rgba(0,240,255,0.25)",
                  }}
                >
                  <svg className="w-12 h-12 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div
                  className="absolute -bottom-2 -right-2 w-9 h-9 flex items-center justify-center text-xs font-black font-['Rajdhani'] z-20"
                  style={{
                    background: "linear-gradient(135deg, #00f0ff, #ec4899)",
                    color: "#0a0a0f",
                    clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                    boxShadow: "0 0 12px rgba(0,240,255,0.5)",
                  }}
                >
                  L{level}
                </div>
              </div>

              {/* Character Details */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-2">
                  <h2
                    className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white truncate"
                    style={{ fontFamily: "Rajdhani, sans-serif" }}
                  >
                    {user?.username || user?.name || "Player"}
                  </h2>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 self-center sm:self-auto bg-[#60a5fa]/10 border border-[#60a5fa]/30"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    }}
                  >
                    <span className="text-[#60a5fa] text-[8px] animate-pulse">●</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#60a5fa] font-['Rajdhani']">
                      {equippedTitleName}
                    </span>
                  </div>
                </div>

                <div
                  className="inline-block px-3 py-1 mb-4"
                  style={{
                    background: "rgba(0,240,255,0.12)",
                    borderLeft: "2px solid #00f0ff",
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] font-['Rajdhani']">
                    Rank Tier {Math.min(10, Math.floor(level / 10) + 1)} · Novice Specialist
                  </span>
                </div>

                {/* Authoritative Level Progress Bar */}
                <div className="w-full">
                  <XPBar current={progress.currentXP} max={progress.requiredXP} level={level} />
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mt-1">
                    <span>{Math.round(progress.percentage)}% to Level {level + 1}</span>
                    <span>{progress.totalXP.toLocaleString()} Total XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid (Fixed 4-columns layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] relative z-10">
              {[
                { label: "Tasks Done", value: activityStats?.tasksCompleted ?? 0, color: "#00f0ff" },
                { label: "Campaigns", value: activityStats?.questsCompleted ?? 0, color: "#8b5cf6" },
                { label: "Best Streak", value: `${maxStreak}d`, color: "#ec4899" },
                { label: "Soul Coins", value: (character?.coins || 0).toLocaleString(), color: "#f59e0b" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-2.5 text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" }}
                >
                  <p
                    className="font-black text-lg md:text-xl stat-num drop-shadow-[0_0_5px_currentColor]"
                    style={{ color: s.color, fontFamily: "Rajdhani, sans-serif" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5 text-[rgba(232,232,240,0.4)]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Equipped Loadout Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 bg-[rgba(10,10,18,0.75)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] relative"
            style={{
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">
                  Equipped Loadout Matrix
                </h3>
              </div>
              <button
                onClick={navigateToShop}
                className="text-[10px] font-black uppercase tracking-wider text-[#00f0ff] hover:text-white px-2.5 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 transition-all font-['Rajdhani']"
              >
                Open Shop / Inventory
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {loadoutData.map((item) => (
                <div
                  key={item.slot}
                  className="p-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-[#00f0ff]/30 transition-all flex items-center gap-2.5 group"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                  }}
                >
                  <div className="p-1.5 bg-white/5 border border-white/10 rounded flex-shrink-0 group-hover:border-[#00f0ff]/40 transition-colors">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-wider text-white/40 font-['Rajdhani'] leading-none">
                      {item.slot}
                    </p>
                    <p className="text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors truncate font-['Rajdhani'] mt-0.5">
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Titles & Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">
                Honor Titles
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>

            <div className="grid gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {allTitles.length === 0 ? (
                <div className="text-[rgba(232,232,240,0.5)] text-xs italic py-6 text-center border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                  Complete campaigns & milestones to unlock titles.
                </div>
              ) : (
                allTitles.map((t: any, i: number) => (
                  <div
                    key={t.name}
                    className={`p-3.5 flex items-center gap-3.5 transition-all duration-300 border ${
                      t.unlocked
                        ? t.equipped
                          ? "bg-[rgba(0,240,255,0.06)] border-[rgba(0,240,255,0.4)] shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                          : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.18)]"
                        : "bg-[rgba(0,0,0,0.25)] border-[rgba(255,255,255,0.02)] opacity-40"
                    }`}
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                    }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        background: t.equipped
                          ? "rgba(0,240,255,0.15)"
                          : t.unlocked
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.02)",
                        border: `1px solid ${
                          t.equipped ? "rgba(0,240,255,0.4)" : "rgba(255,255,255,0.1)"
                        }`,
                        clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                      }}
                    >
                      {t.unlocked ? (
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold uppercase tracking-wider truncate"
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          color: t.unlocked ? (t.equipped ? "#00f0ff" : "#e8e8f0") : "rgba(232,232,240,0.3)",
                        }}
                      >
                        {t.name}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">{t.desc}</p>
                    </div>

                    {t.equipped && (
                      <span
                        className="text-[9px] px-2.5 py-0.5 font-black tracking-widest uppercase bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 font-['Rajdhani']"
                      >
                        EQUIPPED
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: 12 ATTRIBUTES & STREAK BADGES */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Attributes Panel Header & Filter Tabs */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                <h2 className="text-base font-black uppercase tracking-[0.2em] text-[#00f0ff] font-['Rajdhani'] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                  Attributes Matrix ({attributesList.length})
                </h2>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider font-['Rajdhani'] transition-all ${
                    activeTab === "all"
                      ? "bg-[#00f0ff] text-[#0a0a12] shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  All (12)
                </button>
                <button
                  onClick={() => setActiveTab("vitality")}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider font-['Rajdhani'] transition-all ${
                    activeTab === "vitality"
                      ? "bg-[#00f0ff] text-[#0a0a12] shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Core Vitality (6)
                </button>
                <button
                  onClick={() => setActiveTab("mastery")}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider font-['Rajdhani'] transition-all ${
                    activeTab === "mastery"
                      ? "bg-[#00f0ff] text-[#0a0a12] shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Life & Mastery (6)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAttributes.map((attr, i) => (
                <StatBar key={attr.name} attr={attr} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Streak Badges Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">
                Milestone Badges ({allBadges.filter((b) => b.earned).length}/{allBadges.length})
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {allBadges.length === 0 ? (
                <div className="col-span-full text-[rgba(232,232,240,0.5)] text-xs italic py-6 text-center border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                  Earn milestone badges by keeping streaks and finishing quests.
                </div>
              ) : (
                allBadges.map((badge, i) => {
                  const bt = BADGE_TIER[badge.tier] || BADGE_TIER.bronze;
                  return (
                    <motion.div
                      key={badge.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative"
                    >
                      <div
                        className="flex flex-col items-center gap-2.5 p-4 text-center transition-all duration-300 relative overflow-hidden"
                        style={{
                          background: badge.earned ? bt.bg : "rgba(16,16,24,0.4)",
                          border: `1px solid ${badge.earned ? bt.border : "rgba(255,255,255,0.05)"}`,
                          clipPath:
                            "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                          filter: badge.earned ? `drop-shadow(0 0 10px ${bt.color}25)` : "none",
                          opacity: badge.earned ? 1 : 0.45,
                        }}
                      >
                        {/* Insignia Icon (Pure SVG - Zero Emojis) */}
                        <div
                          className="w-12 h-12 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 relative z-10"
                          style={{
                            background: badge.earned ? `linear-gradient(135deg, ${bt.color}30, transparent)` : "transparent",
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            border: badge.earned ? `1px solid ${bt.color}80` : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {badge.earned ? (
                            <svg
                              className="w-6 h-6"
                              style={{ color: bt.color }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-white/30"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          )}
                        </div>

                        <div className="relative z-10">
                          <p
                            className="text-xs font-black uppercase tracking-wider mb-0.5 truncate"
                            style={{ color: badge.earned ? bt.color : "rgba(232,232,240,0.35)", fontFamily: "Rajdhani, sans-serif" }}
                          >
                            {badge.name}
                          </p>
                          <p className="text-[9px] text-white/40 line-clamp-2 leading-tight">
                            {badge.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
