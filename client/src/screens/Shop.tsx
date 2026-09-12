import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Category = "all" | "avatars" | "skins" | "frames" | "effects" | "titles";
type Rarity = "common" | "rare" | "epic" | "legendary";

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  cost: number;
  category: Category;
  pinned?: boolean;
  rarity: Rarity;
  owned?: boolean;
  rankRequired?: string;
  rankTier?: number;
}

const RARITY = {
  common: { label: "Common", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" },
  rare: { label: "Rare", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" },
  epic: { label: "Epic", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
  legendary: { label: "Legendary", color: "#f6ad37", bg: "rgba(246,173,55,0.12)", border: "rgba(246,173,55,0.28)" },
};

const ITEMS: ShopItem[] = [
  { id: "streak-recovery", name: "Streak Recovery", desc: "Restore a broken streak. One-time use.", icon: "🛡", cost: 200, category: "all", pinned: true, rarity: "rare", owned: false },
  { id: "a1", name: "Void Knight", desc: "A warrior forged in dark matter", icon: "🗡", cost: 450, category: "avatars", rarity: "rare", owned: false },
  { id: "a2", name: "Solar Sage", desc: "Wisdom radiating gold energy", icon: "☀", cost: 550, category: "avatars", rarity: "epic", owned: true },
  { id: "a3", name: "Ember Drake", desc: "The apex predator of fire", icon: "🔥", cost: 900, category: "avatars", rarity: "legendary", owned: false, rankRequired: "Expert", rankTier: 6 },
  { id: "f1", name: "Gold Halo", desc: "Molten gold profile frame", icon: "◎", cost: 300, category: "frames", rarity: "rare", owned: false },
  { id: "f2", name: "Cosmic Ring", desc: "Deep space rotating frame", icon: "◉", cost: 400, category: "frames", rarity: "epic", owned: true },
  { id: "f3", name: "Prismatic Crown", desc: "Enlightened-exclusive legendary frame", icon: "♛", cost: 2000, category: "frames", rarity: "legendary", owned: false, rankRequired: "Enlightened", rankTier: 9 },
  { id: "e1", name: "Ember Trail", desc: "Floating ember particles on your card", icon: "✦", cost: 600, category: "effects", rarity: "epic", owned: false },
  { id: "e2", name: "Starfield Aura", desc: "Miniature starfield background", icon: "★", cost: 700, category: "effects", rarity: "epic", owned: false },
  { id: "t1", name: "The Obsidian", desc: "Rare dark-prestige title", icon: "◈", cost: 800, category: "titles", rarity: "rare", owned: false },
  { id: "t2", name: "Forgemaster", desc: "Master tier unlock only", icon: "⚒", cost: 1000, category: "titles", rarity: "legendary", owned: false, rankRequired: "Master", rankTier: 7 },
  { id: "s1", name: "Void UI Theme", desc: "Deep violet interface skin", icon: "◐", cost: 350, category: "skins", rarity: "common", owned: false },
  { id: "s2", name: "Solar Theme", desc: "Gold-on-dark interface skin", icon: "◑", cost: 350, category: "skins", rarity: "rare", owned: false },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "avatars", label: "Avatars" },
  { id: "skins", label: "Skins" },
  { id: "frames", label: "Frames" },
  { id: "effects", label: "Effects" },
  { id: "titles", label: "Titles" },
];

const USER_RANK_TIER = 3; // Journeyman

function ShopSlot({ item, coins, onBuy }: { item: ShopItem; coins: number; onBuy: (id: string, cost: number) => void }) {
  const [hover, setHover] = useState(false);
  const r = RARITY[item.rarity];
  const rankLocked = item.rankTier !== undefined && USER_RANK_TIER < item.rankTier;
  const canAfford = coins >= item.cost && !rankLocked && !item.owned;

  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={!rankLocked ? { y: -4, scale: 1.03 } : undefined}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className="relative flex flex-col"
    >
      {/* Rarity badge */}
      <div className="absolute -top-2 left-3 z-10 text-xs px-2 py-0.5 font-semibold"
        style={{
          background: r.bg,
          color: r.color,
          border: `1px solid ${r.border}`,
          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
          fontFamily: "Rajdhani, sans-serif",
          letterSpacing: "0.06em",
        }}>
        {item.pinned ? "⭐ PINNED" : r.label.toUpperCase()}
      </div>

      <div className="pt-3 p-4 h-full flex flex-col"
        style={{
          background: hover && !rankLocked ? "rgba(255,255,255,0.07)" : rankLocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${hover && !rankLocked ? r.border : rankLocked ? "rgba(255,255,255,0.04)" : r.border.replace("0.2", "0.1")}`,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          backdropFilter: "blur(16px)",
          boxShadow: hover && !rankLocked ? `0 8px 30px ${r.color}20` : item.pinned ? `0 0 20px rgba(16,224,127,0.1)` : "none",
          transition: "all 0.2s",
          filter: rankLocked ? "grayscale(0.5)" : "none",
          opacity: rankLocked ? 0.55 : 1,
        }}
      >
        {/* Icon — hexagonal slot */}
        <div className="w-12 h-12 hex-clip mx-auto mb-3 flex items-center justify-center text-2xl"
          style={{
            background: rankLocked ? "rgba(255,255,255,0.04)" : r.bg,
            boxShadow: hover && !rankLocked ? `0 0 20px ${r.color}30` : "none",
          }}>
          {rankLocked ? "🔒" : item.icon}
        </div>

        <h3 className="font-bold text-sm text-center mb-0.5" style={{ fontFamily: "Rajdhani, sans-serif", color: item.owned ? r.color : rankLocked ? "rgba(232,232,240,0.3)" : "#e8e8f0" }}>
          {item.name}
          {item.owned && <span className="ml-1 text-xs" style={{ color: r.color }}>✓</span>}
        </h3>
        <p className="text-xs text-center flex-1 mb-3" style={{ color: "rgba(232,232,240,0.38)", lineHeight: 1.4 }}>{item.desc}</p>

        {/* Rank-locked label */}
        {rankLocked && (
          <p className="text-xs text-center mb-2 font-semibold"
            style={{ color: "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif" }}>
            Unlocks at {item.rankRequired}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold stat-num flex items-center gap-1" style={{ color: rankLocked ? "rgba(232,232,240,0.25)" : "#f6ad37" }}>
            <span style={{ fontSize: 10, opacity: 0.6 }}>◈</span>
            {item.cost.toLocaleString()}
          </span>
          {item.owned ? (
            <span className="text-xs px-2 py-1" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}`, clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
              Owned
            </span>
          ) : (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => canAfford && onBuy(item.id, item.cost)}
              disabled={!canAfford}
              className="text-xs px-3 py-1 font-semibold disabled:opacity-30 transition-all"
              style={{
                background: canAfford ? r.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${canAfford ? r.border : "rgba(255,255,255,0.06)"}`,
                color: canAfford ? r.color : "rgba(232,232,240,0.25)",
                clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                fontFamily: "Rajdhani, sans-serif",
              }}
            >
              {rankLocked ? "Locked" : canAfford ? "Buy" : "◈ needed"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const [tab, setTab] = useState<Category>("all");
  const [coins, setCoins] = useState(1240);
  const [toast, setToast] = useState<string | null>(null);

  const handleBuy = (id: string, cost: number) => {
    setCoins((c) => c - cost);
    setToast("Item purchased!");
    setTimeout(() => setToast(null), 2500);
  };

  const visible = (tab === "all" ? ITEMS : ITEMS.filter((i) => i.category === tab))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #10e07f, #059669)",
              color: "#0d0d14",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.06em",
            }}>
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>Forge Shop</h1>
          <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>
            Spend coins on cosmetics. Rank-locked items unlock as you progress.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2"
          style={{ background: "rgba(246,173,55,0.1)", border: "1px solid rgba(246,173,55,0.22)", clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
          <span style={{ color: "#f6ad37", fontSize: 13 }}>◈</span>
          <span className="font-bold text-sm stat-num" style={{ color: "#f6ad37" }}>{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Rarity legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(RARITY).map(([key, r]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2" style={{ background: r.color, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
            <span style={{ color: r.color }}>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setTab(c.id)}
            className="px-3 py-1.5 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: tab === c.id ? "rgba(246,173,55,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === c.id ? "rgba(246,173,55,0.28)" : "rgba(255,255,255,0.07)"}`,
              color: tab === c.id ? "#f6ad37" : "rgba(232,232,240,0.5)",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.04em",
            }}>
            {c.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-2">
        {visible.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <ShopSlot item={item} coins={coins} onBuy={handleBuy} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
