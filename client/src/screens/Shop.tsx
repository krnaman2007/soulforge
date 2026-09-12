import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchShopCatalog, purchaseItem } from "../store/slices/shopSlice";

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
  common: { label: "Common", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)", glow: "rgba(156,163,175,0.3)" },
  rare: { label: "Rare", color: "#60a5fa", bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.3)", glow: "rgba(96,165,250,0.5)" },
  epic: { label: "Epic", color: "#c084fc", bg: "rgba(192,132,252,0.15)", border: "rgba(192,132,252,0.3)", glow: "rgba(192,132,252,0.6)" },
  legendary: { label: "Legendary", color: "#00f0ff", bg: "rgba(0,240,255,0.15)", border: "rgba(0,240,255,0.4)", glow: "rgba(0,240,255,0.7)" },
};

// Static ITEMS removed in favor of Redux state

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "avatars", label: "Avatars" },
  { id: "skins", label: "Skins" },
  { id: "frames", label: "Frames" },
  { id: "effects", label: "Effects" },
  { id: "titles", label: "Titles" },
];

const USER_RANK_TIER = 3; // Journeyman

function ShopSlot({ item, coins, onBuy }: { item: any; coins: number; onBuy: (id: string, cost: number) => void }) {
  const [hover, setHover] = useState(false);
  const r = RARITY[(item.rarity as Rarity) || 'common'] || RARITY.common;
  const rankLocked = item.rankTier !== undefined && USER_RANK_TIER < item.rankTier;
  const canAfford = coins >= (item.price || item.cost) && !rankLocked && !(item.isOwned || item.owned);

  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={!rankLocked ? { y: -4, scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative flex flex-col h-full group"
    >
      {/* Rarity badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-[9px] md:text-[10px] px-3 py-1 font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5"
        style={{
          background: r.bg,
          color: r.color,
          border: `1px solid ${r.border}`,
          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
          fontFamily: "Rajdhani, sans-serif",
          backdropFilter: "blur(8px)",
          boxShadow: hover && !rankLocked ? `0 0 10px ${r.glow}` : "none",
          transition: "all 0.3s"
        }}>
        {item.pinned ? <span className="animate-pulse">✦ PINNED</span> : r.label}
      </div>

      <div className="pt-6 p-4 md:p-5 h-full flex flex-col relative overflow-hidden transition-all duration-300"
        style={{
          background: rankLocked ? "rgba(10,10,15,0.8)" : hover ? "rgba(20,20,30,0.9)" : "rgba(15,15,22,0.8)",
          border: `1px solid ${hover && !rankLocked ? r.color : rankLocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          boxShadow: hover && !rankLocked ? `inset 0 0 30px ${r.bg}, 0 10px 30px rgba(0,0,0,0.5)` : item.pinned ? `inset 0 0 20px ${r.bg}` : "0 5px 15px rgba(0,0,0,0.3)",
          filter: rankLocked ? "grayscale(100%) opacity(60%)" : "none",
        }}
      >
        {/* Holographic background elements */}
        {!rankLocked && (
           <>
             <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute top-0 right-0 w-32 h-32 blur-3xl pointer-events-none transition-opacity opacity-0 group-hover:opacity-20" style={{ background: r.color }} />
           </>
        )}

        {/* Icon — hexagonal slot */}
        <div className="w-16 h-16 hex-clip mx-auto mb-4 flex items-center justify-center text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: rankLocked ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg, ${r.bg}, rgba(10,10,15,0.8))`,
            border: `1px solid ${rankLocked ? "transparent" : r.border}`,
            boxShadow: hover && !rankLocked ? `0 0 20px ${r.glow}` : "none",
          }}>
          <span style={{ filter: hover && !rankLocked ? `drop-shadow(0 0 10px ${r.color})` : "none" }}>
             {rankLocked ? "🔒" : (item.metadata?.icon || item.icon || "✦")}
          </span>
        </div>

        <h3 className="font-black text-lg md:text-xl text-center mb-1 uppercase tracking-wider relative z-10 transition-colors" style={{ fontFamily: "Rajdhani, sans-serif", color: (item.isOwned || item.owned) ? r.color : rankLocked ? "rgba(232,232,240,0.4)" : "#fff" }}>
          {item.name}
        </h3>
        
        <p className="text-[10px] md:text-xs text-center flex-1 mb-5 relative z-10 font-['Inter'] uppercase tracking-widest leading-relaxed" style={{ color: "rgba(232,232,240,0.5)" }}>
          {item.description || item.desc}
        </p>

        {/* Rank-locked label */}
        {rankLocked && (
          <div className="text-[10px] text-center mb-3 font-black uppercase tracking-widest px-2 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] mx-auto inline-block"
            style={{ color: "#ef4444", fontFamily: "Rajdhani, sans-serif" }}>
            Unlocks at {item.rankRequired}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-auto relative z-10 border-t border-[rgba(255,255,255,0.05)] pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm md:text-base font-black flex items-center gap-1.5 uppercase tracking-widest" style={{ color: rankLocked ? "rgba(232,232,240,0.3)" : "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
              <span className="text-[10px]">◈</span>
              {(item.price || item.cost || 0).toLocaleString()}
            </span>
            {(item.isOwned || item.owned) ? (
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center gap-1" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}`, clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                <span>✓</span> Acquired
              </span>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => canAfford && onBuy(item.id, item.price || item.cost)}
                disabled={!canAfford || rankLocked}
                className="text-[10px] md:text-xs px-4 py-1.5 font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn disabled:cursor-not-allowed"
                style={{
                  background: canAfford ? r.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${canAfford ? r.border : "rgba(255,255,255,0.1)"}`,
                  color: canAfford ? r.color : "rgba(232,232,240,0.3)",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  fontFamily: "Rajdhani, sans-serif",
                }}
              >
                {canAfford && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite]" />}
                <span className="relative z-10">{rankLocked ? "Locked" : canAfford ? "Purchase" : "Insufficient ◈"}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const dispatch = useDispatch<AppDispatch>();
  const { catalog } = useSelector((state: RootState) => state.shop);

  useEffect(() => {
    dispatch(fetchShopCatalog());
  }, [dispatch]);

  const [tab, setTab] = useState<Category>("all");
  const [toast, setToast] = useState<string | null>(null);

  const handleBuy = async (id: string, cost: number) => {
    const result = await dispatch(purchaseItem(id));
    if (purchaseItem.fulfilled.match(result)) {
      setToast("Item Acquired successfully.");
      setTimeout(() => setToast(null), 2500);
    } else {
      setToast("Insufficient funds or error.");
      setTimeout(() => setToast(null), 2500);
    }
  };

  const activeItems = catalog?.items || [];
  const currentCoins = catalog?.coins || 0;

  const visible = (tab === "all" ? activeItems : activeItems.filter((i: any) => i.type === tab || i.category === tab))
    .sort((a: any, b: any) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen bg-transparent relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 text-xs md:text-sm font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(16,224,127,0.3)] flex items-center gap-3 backdrop-blur-md"
            style={{
              background: "rgba(16,224,127,0.15)",
              border: "1px solid rgba(16,224,127,0.4)",
              color: "#10e07f",
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              fontFamily: "Rajdhani, sans-serif",
            }}>
            <span className="text-lg">✓</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[rgba(255,255,255,0.05)] pb-6 relative z-10">
        <div>
           <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani'] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] animate-pulse" />
              Vendor Interface
           </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>The Armory</h1>
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-[rgba(232,232,240,0.5)] font-['Inter'] max-w-md leading-relaxed">
            Exchange currency for cosmetic enhancements. High-tier items require sufficient rank progression.
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-5 py-3 relative overflow-hidden group cursor-default"
          style={{ 
            background: "linear-gradient(135deg, rgba(0,240,255,0.1), rgba(10,10,15,0.8))", 
            border: "1px solid rgba(0,240,255,0.3)", 
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            boxShadow: "inset 0 0 20px rgba(0,240,255,0.1)"
          }}>
          <span style={{ color: "#00f0ff", fontSize: 16 }} className="drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">◈</span>
          <div className="flex flex-col">
             <span className="text-[8px] uppercase tracking-widest text-[rgba(0,240,255,0.7)] font-black leading-none mb-0.5">Available Balance</span>
             <span className="font-black text-xl md:text-2xl stat-num leading-none drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" style={{ color: "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
               {currentCoins.toLocaleString()}
             </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 relative z-10">
         {/* Category tabs */}
         <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto scrollbar-hide hide-scrollbar">
           {CATEGORIES.map((c) => (
             <button key={c.id} onClick={() => setTab(c.id)}
               className="px-5 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-all relative overflow-hidden"
               style={{
                 background: tab === c.id ? "rgba(0,240,255,0.15)" : "rgba(255,255,255,0.03)",
                 border: `1px solid ${tab === c.id ? "rgba(0,240,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                 color: tab === c.id ? "#00f0ff" : "rgba(232,232,240,0.5)",
                 clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                 fontFamily: "Rajdhani, sans-serif",
               }}>
               {tab === c.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />}
               {c.label}
             </button>
           ))}
         </div>

         {/* Rarity legend */}
         <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] w-full lg:w-auto" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
           <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 mr-2">Rarity Scale:</span>
           {Object.entries(RARITY).map(([key, r]) => (
             <div key={key} className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: "Rajdhani, sans-serif" }}>
               <span style={{ color: r.color, filter: `drop-shadow(0 0 5px ${r.glow})` }}>◈</span>
               <span style={{ color: r.color }}>{r.label}</span>
             </div>
           ))}
         </div>
      </div>

      {/* Grid */}
      <motion.div 
         layout
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
      >
        <AnimatePresence>
           {visible.map((item, i) => (
             <motion.div 
               layout
               key={item.id} 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 25 }}
               className="h-full"
             >
               <ShopSlot item={item} coins={currentCoins} onBuy={handleBuy} />
             </motion.div>
           ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
