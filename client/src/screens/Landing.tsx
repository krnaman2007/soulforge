import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);

  useEffect(() => {
    // Cinematic Boot Sequence
    const interval = setInterval(() => {
      setBootProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setBooting(false), 500);
          return 100;
        }
        return p + Math.floor(Math.random() * 20);
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  if (booting) {
    return (
      <div className="fixed inset-0 bg-transparent z-[100] flex flex-col items-center justify-center font-['Rajdhani'] selection:bg-none">
        <div className="w-64">
          <div className="text-[#00f0ff] text-[10px] tracking-[0.3em] uppercase mb-2 flex justify-between">
            <span>System Boot</span>
            <span>{Math.min(bootProgress, 100)}%</span>
          </div>
          <div className="h-1 bg-[rgba(255,255,255,0.05)] w-full overflow-hidden">
            <div className="h-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" style={{ width: `${bootProgress}%` }} />
          </div>
          <div className="mt-4 text-[rgba(232,232,240,0.3)] text-[10px] tracking-widest uppercase text-center animate-pulse">
            Establishing Link...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-[400vh] bg-transparent text-[#e8e8f0] overflow-x-hidden selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      
      {/* ─── GLOBAL HUD ─── */}
      <div className="fixed inset-0 pointer-events-none z-[60] p-4 md:p-8 flex flex-col justify-between mix-blend-screen">
        {/* Top HUD */}
        <div className="flex justify-between items-start opacity-50">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] uppercase font-black tracking-[0.2em] font-['Rajdhani'] text-[#00f0ff] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] animate-pulse rounded-full" />
              SYSTEM.ONLINE // LINK ACTIVE
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] font-['Rajdhani'] text-[rgba(232,232,240,0.5)]">
              LOC: UNKNOWN
            </div>
          </div>
          <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-50">
            <path d="M40 0 H20 L10 10 V40" fill="none" stroke="#00f0ff" strokeWidth="1" />
          </svg>
        </div>
        {/* Bottom HUD */}
        <div className="flex justify-between items-end opacity-50">
          <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-50">
            <path d="M0 40 H20 L30 30 V0" fill="none" stroke="#00f0ff" strokeWidth="1" />
          </svg>
          <div className="text-[9px] uppercase font-black tracking-[0.2em] font-['Rajdhani'] text-right text-[rgba(232,232,240,0.5)]">
            <span className="block mb-1 text-[#00f0ff]">v2.4 ENGINE</span>
            <span>AWAITING INPUT</span>
          </div>
        </div>
      </div>

      {/* ─── ENVIRONMENTAL LAYER ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        {/* Deep Core Glow */}
        {/* Perspective Grid */}
        <div className="absolute bottom-0 w-[200%] h-[50vh] bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(75deg)] opacity-30 origin-bottom" style={{ perspective: '1000px' }} />
      </div>

      {/* ─── 1. TITLE SCREEN (HERO) ─── */}
      <motion.div 
        className="sticky top-0 h-screen flex flex-col items-center justify-center p-6 z-10"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center flex flex-col items-center w-full max-w-5xl"
        >
          {/* Main Title Group */}
          <div className="relative mb-8">
            <h1 className="relative text-[12vw] md:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-[#e8e8f0] to-[#8b5cf6]"
                style={{ fontFamily: "Rajdhani, sans-serif", lineHeight: 0.9 }}>
              SOULFORGE
            </h1>
            <h1 className="absolute inset-0 text-[12vw] md:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-[#00f0ff] to-transparent mix-blend-overlay opacity-80"
                style={{ fontFamily: "Rajdhani, sans-serif", lineHeight: 0.9 }}>
              SOULFORGE
            </h1>
            {/* Minimal Subtitle */}
            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-sm font-bold tracking-[0.4em] text-[#00f0ff] uppercase whitespace-nowrap bg-transparent px-4">
              Gamify Your Existence
            </p>
          </div>

          <p className="text-sm md:text-lg text-[rgba(232,232,240,0.6)] max-w-xl mb-16 leading-relaxed font-['Inter']" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
            The ultimate RPG engine for your real life. Complete quests, level up your attributes, and unlock your true potential in the physical world.
          </p>

          {/* Primary Gaming CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative flex items-center justify-center px-12 py-5 font-black uppercase tracking-[0.25em] text-sm md:text-base cursor-pointer overflow-visible"
            style={{ fontFamily: "Rajdhani, sans-serif" }}
          >
            {/* Button Background Layers */}
            <div className="absolute inset-0 bg-transparent border border-[#00f0ff] opacity-80 group-hover:bg-[rgba(0,240,255,0.1)] transition-colors duration-300" style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }} />
            <div className="absolute inset-[-2px] bg-gradient-to-r from-[#00f0ff] via-[#ec4899] to-[#00f0ff] z-[-1] opacity-50 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500" style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }} />
            
            {/* Button Inner Accents */}
            <svg className="absolute left-0 top-0 w-3 h-3 text-[#00f0ff]" fill="currentColor" viewBox="0 0 12 12"><polygon points="0,0 12,0 0,12"/></svg>
            <svg className="absolute right-0 bottom-0 w-3 h-3 text-[#00f0ff]" fill="currentColor" viewBox="0 0 12 12"><polygon points="12,12 0,12 12,0"/></svg>

            <span className="relative z-10 text-[#00f0ff] group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300">
              Initialize Link
            </span>
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8b5cf6]">Scroll to explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-[#8b5cf6] to-transparent" />
        </motion.div>
      </motion.div>

      {/* ─── 2. GAME SYSTEMS (HOLOGRAPHIC PANELS) ─── */}
      <div className="relative z-20 min-h-screen py-32 px-4 md:px-12 max-w-7xl mx-auto flex flex-col justify-center perspective-1000">
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-24 flex flex-col items-center"
        >
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-4 flex items-center gap-4">
            <span className="w-8 h-px bg-[#8b5cf6]" />
            Core Mechanics
            <span className="w-8 h-px bg-[#8b5cf6]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white" style={{ fontFamily: "Rajdhani, sans-serif", textShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
            Engine Features
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel 1: Quests */}
          <GameSystemPanel 
            delay={0.1}
            title="Quest Matrix"
            color="#10e07f"
            icon={<path d="M12 2L2 22h20L12 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>}
            desc="Every task is a mission. Earn XP and credits for brushing your teeth, finishing projects, or hitting the gym. The ultimate gamified task manager."
            stats={[
              { label: "Difficulty Scaling", val: "Dynamic" },
              { label: "Loot Drops", val: "Active" }
            ]}
          />
          {/* Panel 2: Stats */}
          <GameSystemPanel 
            delay={0.2}
            title="Attribute Scaling"
            color="#00f0ff"
            icon={<><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
            desc="Build your real-world character sheet. Track Strength, Intellect, Discipline and more. Watch your avatar evolve as you maintain consistency."
            stats={[
              { label: "Sync Rate", val: "99.8%" },
              { label: "Max Level", val: "99" }
            ]}
          />
          {/* Panel 3: AI */}
          <GameSystemPanel 
            delay={0.3}
            title="AI Overseer"
            color="#8b5cf6"
            icon={<><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
            desc="Your personal game master. The AI generates personalized quests, adjusts difficulty if you struggle, and helps you optimize your daily routine."
            stats={[
              { label: "Neural Net", val: "Online" },
              { label: "Adaptation", val: "Real-time" }
            ]}
          />
        </div>
      </div>

      {/* ─── 3. PROGRESSION MAP PREVIEW ─── */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-32 bg-transparent">
        {/* Map Background Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center relative z-10 w-full max-w-6xl"
        >
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#0ea5e9] mb-4">
            Phase 3 // The Journey
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-24" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            The Path to Grandmaster
          </h2>

          <div className="relative w-full h-[400px] flex items-center justify-center">
            
            {/* The SVG S-Curve Path */}
            <svg className="absolute w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 200">
              {/* Base Path */}
              <path d="M 100 100 Q 300 -50 500 100 T 900 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              {/* Animated Glowing Path */}
              <motion.path 
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                d="M 100 100 Q 300 -50 500 100 T 900 100" 
                fill="none" 
                stroke="url(#mapGrad)" 
                strokeWidth="4"
                style={{ filter: "drop-shadow(0 0 10px rgba(14,165,233,0.8))" }}
              />
              <defs>
                <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10e07f" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Map Nodes */}
            <div className="absolute w-full h-full flex justify-between items-center px-[10%]">
              <MapNode delay={0} label="Novice" status="completed" x="0%" y="0%" color="#10e07f" />
              <MapNode delay={1.5} label="Journeyman" status="current" x="0%" y="-80px" color="#0ea5e9" />
              <MapNode delay={3} label="Master" status="locked" x="0%" y="0%" color="#8b5cf6" />
              <MapNode delay={3} label="Grandmaster" status="milestone" x="0%" y="0%" color="#00f0ff" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="mt-16"
          >
            <button 
              onClick={onStart}
              className="px-16 py-6 font-black uppercase tracking-[0.2em] text-lg bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)]"
              style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
            >
              Enter The Forge
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── 4. TERMINAL FOOTER ─── */}
      <footer className="relative z-20 border-t border-[rgba(255,255,255,0.05)] bg-transparent border-t border-[rgba(255,255,255,0.05)] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#00f0ff] flex items-center justify-center text-black font-black text-xs" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>S</div>
              <span className="font-['Rajdhani'] font-bold tracking-widest uppercase text-xl">Soulforge</span>
            </div>
            <span className="text-[10px] font-mono text-[rgba(232,232,240,0.4)]">SYS.ADMIN // ALL SYSTEMS NOMINAL</span>
          </div>
          
          <div className="flex gap-12 font-['Rajdhani'] text-xs font-bold tracking-[0.2em] uppercase text-[rgba(232,232,240,0.5)]">
            <a href="#" className="hover:text-[#00f0ff] transition-colors">Manifesto</a>
            <a href="#" className="hover:text-[#00f0ff] transition-colors">Patch Notes</a>
            <a href="#" className="hover:text-[#00f0ff] transition-colors">Command Log</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

/* ─── HOLOGRAPHIC PANEL COMPONENT ─── */
function GameSystemPanel({ title, desc, icon, color, delay, stats }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, rotateX: 20, y: 50 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, type: "spring" }}
      className="group relative preserve-3d"
    >
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80 pointer-events-none transition-opacity duration-300 group-hover:opacity-40" 
        style={{ zIndex: -1 }}
      />
      <div 
        className="relative h-full flex flex-col p-8 bg-[rgba(20,20,30,0.4)] border border-[rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-500 overflow-hidden cursor-crosshair"
        style={{ 
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Hover Inner Glow Layer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }} />
        
        {/* Animated Corner Brackets */}
        <svg className="absolute top-2 left-2 w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" stroke={color} viewBox="0 0 24 24"><path d="M8 4H4v4" strokeWidth="2"/></svg>
        <svg className="absolute bottom-2 right-2 w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" stroke={color} viewBox="0 0 24 24"><path d="M16 20h4v-4" strokeWidth="2"/></svg>

        {/* Icon */}
        <div className="w-16 h-16 mb-8 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
             style={{ 
               background: `linear-gradient(135deg, rgba(255,255,255,0.05), transparent)`, 
               border: `1px solid ${color}40`, 
               color: color,
               clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
               boxShadow: `0 0 20px ${color}20 inset`
             }}>
          <svg width="24" height="24" viewBox="0 0 24 24">{icon}</svg>
        </div>
        
        <h3 className="text-3xl font-black uppercase mb-4 tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif", color: color, textShadow: `0 0 15px ${color}50` }}>
          {title}
        </h3>
        
        <p className="text-sm text-[rgba(232,232,240,0.6)] leading-relaxed mb-8 flex-1 font-['Inter']">
          {desc}
        </p>
        
        {/* Data Readout Footer */}
        <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)] grid grid-cols-2 gap-4">
          {stats.map((s: any, i: number) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[rgba(232,232,240,0.4)] font-['Rajdhani']">{s.label}</span>
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: color, fontFamily: "Rajdhani, sans-serif" }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAP NODE COMPONENT ─── */
function MapNode({ delay, label, status, x, y, color }: any) {
  const isComplete = status === 'completed';
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';
  const isMilestone = status === 'milestone';

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className="relative flex flex-col items-center group cursor-help z-10"
      style={{ transform: `translate(${x}, ${y})` }}
    >
      {/* Node Graphic */}
      <div className={`
        relative flex items-center justify-center transition-all duration-500
        ${isMilestone ? 'w-20 h-20' : 'w-12 h-12 md:w-16 md:h-16'}
      `}>
        {/* Core Shape */}
        <div className="absolute inset-0 bg-transparent" style={{ 
          clipPath: isMilestone ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          border: `2px solid ${isLocked ? 'rgba(255,255,255,0.1)' : color}`
        }} />
        
        {/* Inner Fill */}
        <div className="absolute inset-1 transition-colors duration-500" style={{ 
          background: isComplete || isCurrent ? color : 'transparent',
          clipPath: isMilestone ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          opacity: isComplete ? 0.2 : (isCurrent ? 0.4 : 0)
        }} />

        {/* Pulse for current */}
        {isCurrent && (
          <div className="absolute inset-[-10px] border border-current rounded-full animate-ping opacity-50" style={{ color: color, animationDuration: '3s' }} />
        )}
        
        {/* Icon */}
        <span className="relative z-10 text-xl font-bold" style={{ color: isLocked ? 'rgba(255,255,255,0.2)' : color, textShadow: isComplete || isCurrent ? `0 0 10px ${color}` : 'none' }}>
          {isComplete ? '✓' : isLocked ? '🔒' : isMilestone ? '★' : '◉'}
        </span>
      </div>

      {/* Label */}
      <span className={`
        absolute -bottom-8 whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-widest transition-colors
        ${isCurrent ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : isLocked ? 'text-[rgba(255,255,255,0.3)]' : `text-[${color}]`}
      `} style={{ fontFamily: "Rajdhani, sans-serif" }}>
        {label}
      </span>
      
      {/* Hover Info Panel (Tooltip) */}
      <div className="absolute top-[-100px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col items-center">
        <div className="bg-[rgba(10,10,15,0.9)] border border-[rgba(255,255,255,0.1)] p-3 text-center min-w-[120px]" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}>
          <span className="block text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: color }}>Rank</span>
          <span className="block text-white text-sm font-black tracking-wider uppercase font-['Rajdhani']">{label}</span>
        </div>
        <div className="w-px h-4 bg-[rgba(255,255,255,0.2)]" />
      </div>
    </motion.div>
  );
}
