import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";

export const RANKS = [
  { id: "novice", name: "Novice", xpMin: 0, xpMax: 1000, tier: 1, color: "#9ca3af", icon: "◇", desc: "Every forge begins here." },
  { id: "apprentice", name: "Apprentice", xpMin: 1000, xpMax: 2000, tier: 2, color: "#9ca3af", icon: "◈", desc: "Learning the craft." },
  { id: "journeyman", name: "Journeyman", xpMin: 2000, xpMax: 6000, tier: 3, color: "#60a5fa", icon: "◉", desc: "The path is taking shape." },
  { id: "adept", name: "Adept", xpMin: 6000, xpMax: 15000, tier: 4, color: "#60a5fa", icon: "⬡", desc: "Skill sharpens like steel." },
  { id: "specialist", name: "Specialist", xpMin: 15000, xpMax: 30000, tier: 5, color: "#e2e8f0", icon: "◎", desc: "The professional emerges." },
  { id: "expert", name: "Expert", xpMin: 30000, xpMax: 60000, tier: 6, color: "#cd7f32", icon: "▲", desc: "Bronze-tempered resolve." },
  { id: "master", name: "Master", xpMin: 60000, xpMax: 120000, tier: 7, color: "#f6ad37", icon: "★", desc: "Gold burns in the veins." },
  { id: "grandmaster", name: "Grand Master", xpMin: 120000, xpMax: 250000, tier: 8, color: "#f6ad37", icon: "✦", desc: "Few reach this height." },
  { id: "enlightened", name: "Enlightened", xpMin: 250000, xpMax: Infinity, tier: 9, color: "prismatic", icon: "◈", desc: "Beyond rank. Beyond limit." },
];

const CURRENT_XP = 3420;
const CURRENT_RANK = RANKS.find((r, i) => CURRENT_XP >= r.xpMin && (CURRENT_XP < r.xpMax || r.xpMax === Infinity)) || RANKS[1];

function JourneyNode({ rank, index, isCurrent, isCompleted }: { rank: typeof RANKS[0]; index: number; isCurrent: boolean; isCompleted: boolean }) {
  const isLeft = index % 2 === 0;
  const isLast = index === RANKS.length - 1;
  const isFuture = !isCurrent && !isCompleted;
  const isPrismatic = rank.color === "prismatic";
  const nodeColor = isPrismatic ? "#a78bfa" : rank.color;
  const [isHovered, setIsHovered] = useState(false);

  // For the SVG path connecting to the NEXT node
  // The next node will be on the opposite side.
  const xStart = isLeft ? 30 : 70;
  const xEnd = isLeft ? 70 : 30;

  return (
    <div className="relative w-full h-32 md:h-40 flex justify-center">
      {/* SVG Connecting Path to the Next Node */}
      {!isLast && (
        <svg className="absolute top-1/2 left-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none" viewBox="0 0 100 100">
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            d={`M ${xStart},0 C ${xStart},50 ${xEnd},50 ${xEnd},100`}
            fill="none"
            stroke={isCompleted ? nodeColor : "rgba(255,255,255,0.05)"}
            strokeWidth="3"
            strokeDasharray={isFuture ? "8 8" : "none"}
            vectorEffect="non-scaling-stroke"
            style={{ filter: isCompleted ? `drop-shadow(0 0 4px ${nodeColor})` : "none" }}
          />
        </svg>
      )}

      {/* Node Container */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 z-10"
        style={{ left: `${isLeft ? 30 : 70}%`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative cursor-pointer flex flex-col items-center"
        >
          {/* Main Node Circle */}
          <motion.div 
            whileHover={!isFuture ? { scale: 1.1 } : { scale: 1.05 }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent ? 'scale-110' : ''}`}
            style={{
              background: isFuture ? "rgba(255,255,255,0.03)" : `linear-gradient(135deg, rgba(18,18,46,1), rgba(18,18,46,0.8))`,
              border: `2px solid ${isFuture ? "rgba(255,255,255,0.1)" : nodeColor}`,
              boxShadow: isCurrent 
                ? `0 0 20px ${nodeColor}88, inset 0 0 10px ${nodeColor}44` 
                : isCompleted 
                  ? `0 0 10px ${nodeColor}44` 
                  : "none",
              color: isFuture ? "rgba(255,255,255,0.2)" : nodeColor,
              filter: isPrismatic && !isFuture ? `drop-shadow(0 0 8px #a78bfa)` : undefined,
            }}
          >
            <span className={isPrismatic && !isFuture ? "prismatic-text text-2xl font-bold" : "text-xl md:text-2xl font-bold"}>
              {isFuture ? "🔒" : rank.icon}
            </span>
          </motion.div>

          {/* Current Level Ring Animation */}
          {isCurrent && (
            <div className="absolute inset-0 rounded-full animate-ping pointer-events-none" 
                 style={{ border: `2px solid ${nodeColor}`, opacity: 0.5, animationDuration: '2.5s' }} />
          )}
          
          {/* Checkmark for completed */}
          {isCompleted && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs pointer-events-none"
                 style={{ background: "#10e07f", color: "#000", border: "2px solid #0a0a12" }}>
              ✓
            </div>
          )}

          {/* Level Number Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider pointer-events-none whitespace-nowrap"
               style={{ background: isFuture ? "rgba(255,255,255,0.1)" : nodeColor, color: isFuture ? "rgba(255,255,255,0.5)" : "#000" }}>
            LVL {index + 1}
          </div>

          {/* Current Level CTA Label under node */}
          {isCurrent && (
            <div className="absolute top-full mt-2 text-[10px] uppercase font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none"
                 style={{ background: `${nodeColor}20`, color: nodeColor, border: `1px solid ${nodeColor}40` }}>
              Continue
            </div>
          )}

          {/* Hover Tooltip Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: isLeft ? 10 : -10 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.9, x: isHovered ? 0 : (isLeft ? 10 : -10) }}
            className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-full ml-4 md:ml-6' : 'right-full mr-4 md:mr-6'} w-40 md:w-48 pointer-events-none z-50`}
            style={{ display: isHovered ? 'block' : 'none' }}
          >
            <GlassCard className="p-3 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className={isPrismatic ? "prismatic-text font-bold text-sm md:text-base" : "font-bold text-sm md:text-base"} style={{ color: !isPrismatic ? nodeColor : undefined }}>
                  {rank.name}
                </span>
                {isCompleted && <span className="text-[10px]" style={{ color: "#10e07f" }}>✓</span>}
              </div>
              <p className="text-[10px] md:text-xs" style={{ color: "rgba(232,232,240,0.5)" }}>{rank.desc}</p>
              {!isFuture && (
                <div className="mt-2 pt-2 text-[10px] md:text-xs font-semibold" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "#f6ad37" }}>
                  {rank.xpMax === Infinity ? `${(rank.xpMin / 1000).toFixed(0)}K+ XP` : `${(rank.xpMin / 1000).toFixed(0)}K - ${(rank.xpMax / 1000).toFixed(0)}K XP`}
                </div>
              )}
              {isFuture && (
                <div className="mt-2 pt-2 text-[10px] md:text-xs font-semibold" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>
                  Requires {(rank.xpMin / 1000).toFixed(0)}K XP to unlock
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProgressionPath() {
  const currentIndex = RANKS.findIndex((r) => r.id === CURRENT_RANK.id);
  const completedCount = currentIndex;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-8 overflow-hidden pb-20">
      <div className="text-center mt-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>Your Journey</h1>
        <p className="text-xs md:text-sm max-w-md mx-auto" style={{ color: "rgba(232,232,240,0.5)" }}>
          Follow the path of the forge. Complete each stage to ascend to Enlightenment.
        </p>
        
        {/* Overall Progress Indicator */}
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl md:text-2xl font-bold" style={{ color: "#f6ad37" }}>{completedCount}</span>
            <span className="text-xs md:text-sm" style={{ color: "rgba(232,232,240,0.4)" }}>/ {RANKS.length} Ranks Completed</span>
          </div>
          <div className="w-48 md:w-64 h-1.5 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${(completedCount / RANKS.length) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full rounded-full" 
              style={{ background: "#f6ad37", boxShadow: "0 0 10px #f6ad37" }} 
            />
          </div>
        </div>
      </div>

      {/* The Journey Map */}
      <div className="relative mt-8 py-12 rounded-3xl" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)" }}>
        {RANKS.map((rank, i) => {
          const isCurrent = i === currentIndex;
          const isCompleted = i < currentIndex;
          return (
            <JourneyNode 
              key={rank.id} 
              rank={rank} 
              index={i} 
              isCurrent={isCurrent} 
              isCompleted={isCompleted} 
            />
          );
        })}
      </div>

      {/* Footer Callout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-10"
      >
        <GlassCard className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default">
          <span className="text-xs md:text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>Total XP:</span>
          <span className="text-lg md:text-xl font-bold" style={{ color: "#f6ad37" }}>{CURRENT_XP.toLocaleString()}</span>
        </GlassCard>
      </motion.div>
    </div>
  );
}
