import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/slices/authSlice";
import GlassCard from "../components/GlassCard";
import Starfield from "../components/Starfield";

export const RANKS = [
  { id: "iron", name: "Iron", xpMin: 0, xpMax: 1000, tier: 1, color: "#9ca3af", icon: "◇", desc: "Every forge begins here. Establish your foundations and learn the basics." },
  { id: "bronze", name: "Bronze", xpMin: 1000, xpMax: 5000, tier: 2, color: "#cd7f32", icon: "◈", desc: "Bronze-tempered resolve. You are starting to shape your fate." },
  { id: "silver", name: "Silver", xpMin: 5000, xpMax: 15000, tier: 3, color: "#e2e8f0", icon: "◉", desc: "The path is taking shape. Your consistency is starting to pay off." },
  { id: "gold", name: "Gold", xpMin: 15000, xpMax: 30000, tier: 4, color: "#fbbf24", icon: "⬡", desc: "Skill sharpens like gold. You are becoming a force to be reckoned with." },
  { id: "platinum", name: "Platinum", xpMin: 30000, xpMax: 50000, tier: 5, color: "#94a3b8", icon: "◎", desc: "The professional emerges. Precision and focus define your daily actions." },
  { id: "diamond", name: "Diamond", xpMin: 50000, xpMax: 80000, tier: 6, color: "#38bdf8", icon: "▲", desc: "Diamond resolve. Others look to you for guidance." },
  { id: "master", name: "Master", xpMin: 80000, xpMax: 120000, tier: 7, color: "#00f0ff", icon: "★", desc: "Neon burns in the veins. Mastery over mind, body, and craft." },
  { id: "grandmaster", name: "Grand Master", xpMin: 120000, xpMax: Infinity, tier: 8, color: "#a78bfa", icon: "✦", desc: "Few reach this height. Your legacy is being forged into legend." }
];

// CURRENT_XP and CURRENT_RANK are now derived in the component

// Defining organic positions and scaling for the journey
const JOURNEY_STAGES = [
  { x: 50, yOffset: 0, scale: 1, isMilestone: false },       // Iron
  { x: 65, yOffset: 200, scale: 1, isMilestone: false },     // Bronze
  { x: 80, yOffset: 220, scale: 1.2, isMilestone: true },    // Silver
  { x: 60, yOffset: 260, scale: 1.2, isMilestone: false },   // Gold
  { x: 35, yOffset: 300, scale: 1.3, isMilestone: false },   // Platinum
  { x: 20, yOffset: 330, scale: 1.5, isMilestone: true },    // Diamond
  { x: 45, yOffset: 380, scale: 1.5, isMilestone: false },   // Master
  { x: 70, yOffset: 450, scale: 1.7, isMilestone: true },    // Grand Master
];

// Calculate absolute Y positions
let currentY = 40;
const NODE_POSITIONS = JOURNEY_STAGES.map((stage) => {
  currentY += stage.yOffset;
  return { ...stage, y: currentY };
});

const TOTAL_HEIGHT = currentY + 500; // Extra space at bottom

function JourneyNode({ rank, index, isCurrent, isCompleted, currentXP }: { rank: typeof RANKS[0]; index: number; isCurrent: boolean; isCompleted: boolean; currentXP: number }) {
  const stage = NODE_POSITIONS[index];
  const isFuture = !isCurrent && !isCompleted;
  const nodeColor = rank.color;
  const [isHovered, setIsHovered] = useState(false);
  
  // Decide which side to place the permanent label and hover card
  const isLeft = stage.x < 50;

  // Parallax effect based on scroll
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [stage.y - 800, stage.y + 800], [40, -40]);
  const opacityReveal = useTransform(scrollY, [stage.y - 1200, stage.y - 400], [0, 1]);

  // Increased base size for much larger nodes
  const baseSize = 64; 
  const size = baseSize * stage.scale;
  const nodeShapeClass = stage.isMilestone ? "rotate-45 rounded-[2rem]" : "rounded-full";
  const contentShapeClass = stage.isMilestone ? "-rotate-45" : "";

  return (
    <motion.div 
      className="absolute z-10"
      style={{ 
        top: `${stage.y}px`, 
        left: `${stage.x}%`, 
        y: yParallax,
        opacity: opacityReveal,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Ambience / Glow */}
      {(isCurrent || stage.isMilestone) && (
        <motion.div 
          animate={isCurrent ? { opacity: [0.15, 0.4, 0.15], scale: [1, 1.1, 1] } : { opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: isCurrent ? 3 : 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-3xl"
          style={{
            width: size * 3,
            height: size * 3,
            background: isCurrent ? "#0ea5e9" : nodeColor,
            zIndex: -1
          }}
        />
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative cursor-pointer flex flex-col items-center justify-center"
      >
        
        {/* Permanent Level Label (Fades out when hovered to make room for card) */}
        <div 
          className={`absolute flex flex-col pointer-events-none transition-opacity duration-300 ${
            isLeft 
              ? 'right-[calc(100%+24px)] items-end text-right' 
              : 'left-[calc(100%+24px)] items-start text-left'
          } ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          style={{ width: '160px' }}
        >
          <span className="text-[11px] md:text-xs uppercase tracking-widest font-black drop-shadow-md mb-0.5" 
                style={{ color: isFuture ? "rgba(255,255,255,0.4)" : isCurrent ? "#0ea5e9" : nodeColor }}>
            Level {index + 1 > 9 ? index + 1 : `0${index + 1}`}
          </span>
          <span className="font-black text-lg md:text-2xl tracking-wide drop-shadow-xl leading-none" 
                style={{ color: isFuture ? "rgba(255,255,255,0.3)" : "#fff", fontFamily: "Rajdhani, sans-serif" }}>
            {rank.name}
          </span>
          {stage.isMilestone && (
            <span className="px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest mt-1.5" 
                  style={{ background: `rgba(255,255,255,0.05)`, color: "rgba(255,255,255,0.6)", border: `1px solid rgba(255,255,255,0.15)` }}>
              Milestone
            </span>
          )}
        </div>

        {/* Current Node: Animated Orbiting Rings */}
        {isCurrent && (
          <>
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute pointer-events-none rounded-full border border-dashed"
              style={{ 
                width: size * 1.6, 
                height: size * 1.6,
                borderColor: "#0ea5e9", 
                opacity: 0.5 
              }} 
            />
            <motion.div 
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute pointer-events-none rounded-full" 
              style={{ 
                width: size * 1.35, 
                height: size * 1.35,
                border: `2px solid #0ea5e9` 
              }} 
            />
          </>
        )}

        {/* Outer Ring */}
        <div className={`absolute transition-all duration-300 ${nodeShapeClass}`} 
             style={{ 
               width: size + 24,
               height: size + 24,
               border: `2px solid ${isFuture ? "rgba(255,255,255,0.05)" : isCurrent ? "#0ea5e9" : nodeColor}80`,
               background: isCurrent ? "rgba(14,165,233,0.05)" : "rgba(255,255,255,0.02)",
               backdropFilter: "blur(12px)",
               transform: isHovered && !isFuture ? "scale(1.05)" : "scale(1)"
             }} />
        
        {/* Main Node Body */}
        <motion.div 
          animate={isCurrent ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={!isFuture ? { scale: 1.1 } : { scale: 1.05 }}
          className={`flex items-center justify-center transition-all duration-500 relative z-10 ${nodeShapeClass}`}
          style={{
            width: size,
            height: size,
            background: isFuture ? "rgba(10,10,15,0.8)" : isCurrent ? `linear-gradient(135deg, rgba(14,165,233,0.2), rgba(10,10,25,1))` : `linear-gradient(135deg, ${nodeColor}33, rgba(20,20,40,0.9))`,
            border: `3px solid ${isFuture ? "rgba(255,255,255,0.1)" : isCurrent ? "#0ea5e9" : nodeColor}`,
            boxShadow: isCurrent 
              ? `0 0 50px rgba(14,165,233,0.5), inset 0 0 25px rgba(14,165,233,0.4)` 
              : isCompleted 
                ? `0 0 30px ${nodeColor}55, inset 0 0 15px ${nodeColor}33` 
                : "inset 0 0 15px rgba(0,0,0,0.8)",
            color: isFuture ? "rgba(255,255,255,0.15)" : isCurrent ? "#0ea5e9" : nodeColor,
          }}
        >
          <span className={`${contentShapeClass} font-bold drop-shadow-md`} style={{ fontSize: `${size * 0.35}px` }}>
            {isFuture ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            ) : rank.icon}
          </span>
        </motion.div>

        {/* Completion Badge */}
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute rounded-full flex items-center justify-center z-20 font-bold shadow-[0_0_20px_rgba(16,224,127,0.6)]"
            style={{ 
              width: size * 0.35, 
              height: size * 0.35,
              bottom: stage.isMilestone ? -8 : 0, 
              right: stage.isMilestone ? -8 : 0,
              background: "linear-gradient(135deg, #10e07f, #059669)", 
              color: "#000", 
              border: "3px solid #0a0a12",
              fontSize: `${size * 0.18}px`
            }}
          >
            ✓
          </motion.div>
        )}

        {/* Current Level CTA */}
        {isCurrent && (
          <div className="absolute top-[calc(100%+32px)] flex flex-col items-center gap-2 z-20">
            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[#0ea5e9] text-xl font-bold"
            >
              ↓
            </motion.div>
            <div className="text-[12px] md:text-[14px] uppercase font-black px-6 py-3 rounded-lg whitespace-nowrap tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.5)] bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-black">
              CONTINUE
            </div>
          </div>
        )}

        {/* Interactive Hover Card */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, x: isLeft ? 20 : -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: isHovered ? 0 : (isLeft ? 20 : -20) }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-full ml-10' : 'right-full mr-10'} w-72 md:w-80 z-50 pointer-events-none`}
            >
              <GlassCard className="p-6 shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10 relative overflow-hidden group">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity" style={{ background: isCurrent ? "#0ea5e9" : nodeColor }} />
                
                <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-widest font-black mb-1" style={{ color: isFuture ? "rgba(255,255,255,0.3)" : isCurrent ? "#0ea5e9" : nodeColor }}>
                      Level {index + 1 > 9 ? index + 1 : `0${index + 1}`}
                    </span>
                    <span className="font-black text-2xl md:text-3xl tracking-wide leading-none" style={{ color: isFuture ? "rgba(255,255,255,0.5)" : "#fff", fontFamily: "Rajdhani, sans-serif" }}>
                      {rank.name}
                    </span>
                  </div>
                </div>
                
                <p className="text-[13px] text-gray-300 leading-relaxed mb-5 relative z-10">{rank.desc}</p>
                
                <div className="flex flex-col gap-2 pt-4 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {!isFuture ? (
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500 uppercase tracking-wider text-[11px]">Progress</span>
                      <span style={{ color: isCurrent ? "#0ea5e9" : "#10e07f" }}>
                        {isCompleted ? "100%" : `${Math.floor(Math.max(0, Math.min(100, ((currentXP - rank.xpMin) / (rank.xpMax - rank.xpMin)) * 100)))}%`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500 uppercase tracking-wider text-[11px]">Requirement</span>
                      <span className="text-gray-400">{(rank.xpMin / 1000).toFixed(0)}K XP</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500 uppercase tracking-wider text-[11px]">Status</span>
                    <span style={{ color: isCompleted ? "#10e07f" : isCurrent ? "#0ea5e9" : "rgba(255,255,255,0.3)" }}>
                      {isCompleted ? "Unlocked & Conquered" : isCurrent ? "Currently Active" : "Locked"}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function ProgressionPath() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, character } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  const level = character?.level || 1;
  const currentXp = character?.xp || 0;
  
  const calculateTotalXP = (lvl: number, xp: number) => {
    let total = Math.max(0, xp);
    for (let i = 1; i < lvl; i++) {
      total += Math.floor(100 * Math.pow(i, 1.6));
    }
    return total;
  };
  
  const CURRENT_XP = calculateTotalXP(level, currentXp);
  const CURRENT_RANK = RANKS.find((r) => CURRENT_XP >= r.xpMin && (CURRENT_XP < r.xpMax || r.xpMax === Infinity)) || RANKS[0];
  const currentIndex = RANKS.findIndex((r) => r.id === CURRENT_RANK.id);
  
  // Create continuous SVG Path data using calculated absolute coordinates
  const generatePath = (count: number) => {
    if (count <= 1) return "";
    return Array.from({ length: count }).map((_, i) => {
      const pos = NODE_POSITIONS[i];
      const x = pos.x;
      const y = pos.y;
      
      if (i === 0) return `M ${x},${y}`;
      
      const prevPos = NODE_POSITIONS[i - 1];
      const prevX = prevPos.x;
      const prevY = prevPos.y;
      
      // Control points vertically tangent to create perfect, smooth S-curves
      const cy1 = prevY + (y - prevY) / 2;
      const cy2 = y - (y - prevY) / 2;
      
      return `C ${prevX},${cy1} ${x},${cy2} ${x},${y}`;
    }).join(" ");
  };

  const fullPathData = generatePath(RANKS.length);
  const completedPathData = generatePath(currentIndex + 1);

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden selection:bg-cyan-900">
      {/* Immersive Deep Parallax Background */}
      <div className="fixed inset-0 z-0 opacity-50 mix-blend-screen pointer-events-none">
        <Starfield />
      </div>

      {/* Atmospheric Ambient Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#0ea5e9]/10 to-transparent blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 w-full h-[800px] bg-gradient-to-t from-[#a78bfa]/15 to-transparent blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-4 md:px-8">
        {/* Cinematic Header Intro */}
        <div className="text-center pt-24 pb-12 relative z-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-8xl font-black mb-6 tracking-wide" 
            style={{ fontFamily: "Rajdhani, sans-serif", textShadow: "0 0 50px rgba(14,165,233,0.4)" }}
          >
            The Ascent
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-sm md:text-xl max-w-3xl mx-auto leading-relaxed px-6" 
            style={{ color: "rgba(232,232,240,0.6)" }}
          >
            Forge your legacy. Follow the winding path, overcome trials, and evolve into the ultimate master. The journey grows with you.
          </motion.p>
          
          {/* Header Progress Tracker */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 flex flex-col items-center"
          >
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl md:text-6xl font-black leading-none" style={{ color: "#0ea5e9", fontFamily: "Rajdhani, sans-serif" }}>{currentIndex}</span>
              <span className="text-sm md:text-lg font-semibold uppercase tracking-widest pb-1.5" style={{ color: "rgba(232,232,240,0.4)" }}>/ {RANKS.length} Mastered</span>
            </div>
            <div className="w-72 md:w-[500px] h-3 rounded-full overflow-hidden relative bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentIndex / RANKS.length) * 100}%` }}
                transition={{ duration: 2.5, delay: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-600 via-[#0ea5e9] to-[#818cf8]" 
                style={{ boxShadow: "0 0 20px #0ea5e9" }} 
              />
            </div>
          </motion.div>
        </div>

        {/* The Expansive Organic Journey Map */}
        <div className="relative w-full mx-auto mt-16" style={{ height: `${TOTAL_HEIGHT}px` }}>
          
          {/* SVG Map Path using absolute Y pixels and % X coordinates */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            preserveAspectRatio="none" 
            viewBox={`0 0 100 ${TOTAL_HEIGHT}`}
          >
            <defs>
               <filter id="glow-path" x="-50%" y="-50%" width="200%" height="200%">
                   <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                   <feMerge>
                       <feMergeNode in="coloredBlur"/>
                       <feMergeNode in="SourceGraphic"/>
                   </feMerge>
               </filter>
               <linearGradient id="path-gradient" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="0%" stopColor="#10e07f" />
                  <stop offset="40%" stopColor="#0ea5e9" />
                  <stop offset="80%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
               </linearGradient>
            </defs>
            
            <path 
              d={fullPathData} 
              fill="none" 
              stroke="rgba(255,255,255,0.06)" 
              strokeWidth="2.5" 
              vectorEffect="non-scaling-stroke" 
              strokeDasharray="6 12"
              strokeLinecap="round"
            />
            
            {/* Flowing Energy Path */}
            <motion.path
              animate={{ strokeDashoffset: [0, -80] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              d={completedPathData}
              fill="none"
              stroke="url(#path-gradient)"
              strokeWidth="6"
              vectorEffect="non-scaling-stroke"
              filter="url(#glow-path)"
              strokeDasharray="20 20"
              style={{
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }}
            />
          </svg>

          {/* Render Nodes mapped across the expansive path */}
          {RANKS.map((rank, i) => (
            <JourneyNode 
              key={rank.id} 
              rank={rank} 
              index={i} 
              isCurrent={i === currentIndex} 
              isCompleted={i < currentIndex}
              currentXP={CURRENT_XP}
            />
          ))}
        </div>

        {/* Footer Destination / Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, type: "spring" }}
          className="flex justify-center pb-40 relative z-20"
        >
          <GlassCard className="px-12 py-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 hover:bg-white/5 transition-all duration-500 cursor-default border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
            <div className="flex flex-col items-center md:items-end">
              <span className="text-base uppercase tracking-widest font-bold text-gray-500 mb-2">Total XP Forged</span>
              <span className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                {CURRENT_XP.toLocaleString()} <span className="text-2xl text-[#0ea5e9]">XP</span>
              </span>
            </div>
            <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="flex flex-col items-center md:items-start mt-4 md:mt-0">
              <span className="text-base uppercase tracking-widest font-bold text-gray-500 mb-2">Next Destination</span>
              <span className="text-xl md:text-2xl font-bold text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                {RANKS[currentIndex + 1]?.name || "Infinite Horizon"}
              </span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
