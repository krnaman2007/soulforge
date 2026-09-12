import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchActivityStats, fetchActivityFeed, fetchActivityAnalytics } from "../store/slices/activitySlice";
import { fetchCurrentUser } from "../store/slices/authSlice";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import GlassCard from "../components/GlassCard";
import { RANKS } from "./ProgressionPath";

const HEAT_MAX = 500;

function heatColor(val: number) {
  if (val === 0) return "rgba(255,255,255,0.02)";
  const pct = val / HEAT_MAX;
  if (pct < 0.33) return "rgba(139,92,246,0.2)"; // Low (Violet)
  if (pct < 0.66) return "rgba(0,240,255,0.5)"; // Medium (Gold)
  return "rgba(16,224,127,0.8)"; // High (Emerald)
}

function heatGlow(val: number) {
  if (val === 0) return "none";
  const pct = val / HEAT_MAX;
  if (pct < 0.33) return "0 0 5px rgba(139,92,246,0.3)";
  if (pct < 0.66) return "0 0 10px rgba(0,240,255,0.5)";
  return "0 0 15px rgba(16,224,127,0.6)";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-none relative overflow-hidden"
      style={{ 
        background: "rgba(10,10,15,0.95)", 
        border: "1px solid rgba(139,92,246,0.4)", 
        color: "#e8e8f0",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        boxShadow: "0 0 20px rgba(139,92,246,0.2)",
        backdropFilter: "blur(10px)"
      }}>
      <div className="absolute top-0 left-0 w-1 h-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]" />
      <p className="font-['Rajdhani'] font-black uppercase tracking-widest text-[10px]" style={{ color: "rgba(232,232,240,0.5)" }}>Log Entry: {label}</p>
      <p className="font-['Rajdhani'] font-black text-lg mt-1 tracking-wider" style={{ color: "#8b5cf6" }}>
         <span className="text-xs">✦</span> {payload[0].value} <span className="text-[10px]">XP</span>
      </p>
    </div>
  );
};

const CustomReferenceLabel = (props: any) => {
  const { viewBox, rank, setHovered } = props;
  if (!viewBox) return null;
  const isPrismatic = rank.color === "prismatic";
  const fill = isPrismatic ? "#c084fc" : rank.color;
  
  return (
    <g 
      style={{ cursor: "pointer" }}
      onMouseEnter={(e) => setHovered({ rank, x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => setHovered({ rank, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setHovered(null)}
    >
      <rect x={viewBox.x} y={viewBox.y - 10} width={viewBox.width} height={20} fill="transparent" />
      <text
        x={viewBox.x + 15}
        y={viewBox.y}
        dy={4}
        fill={fill}
        fontSize={16}
        fontWeight="bold"
        style={{ filter: `drop-shadow(0 0 5px ${fill}80)` }}
      >
        {rank.icon}
      </text>
    </g>
  );
};

export default function Stats() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, analytics, status } = useSelector((state: RootState) => state.activity);
  const { character } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchActivityStats('all'));
    dispatch(fetchActivityAnalytics());
  }, [dispatch]);

  const [hoveredRank, setHoveredRank] = useState<{ rank: any, x: number, y: number } | null>(null);

  // Use real data where possible
  const maxStreak = character?.longestStreak || 0;
  const totalQuests = stats?.questsCompleted || 0;
  const totalTasks = stats?.tasksCompleted || 0;
  const totalXP = stats?.totalXP || 0;
  const peakVelocity = analytics?.peakVelocity || 0;
  const xpTrajectory = analytics?.xpTrajectory || [];
  const activityDensity = analytics?.activityDensity || Array(28).fill(0);
  const operationalMatrix = analytics?.operationalMatrix || [];
  const currentMonthLabel = analytics?.currentMonthLabel || 'Current Month';

  if (status === 'loading' && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-12 h-12 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#00f0ff] font-['Rajdhani'] font-black tracking-widest uppercase">Fetching Analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen bg-transparent relative overflow-hidden">
      
      {/* Background ambient lighting */}
      {hoveredRank && (
        <div 
          className="fixed z-50 px-4 py-3 pointer-events-none transition-all duration-75"
          style={{ 
            background: "rgba(10,10,15,0.95)", 
            border: `1px solid ${hoveredRank.rank.color === "prismatic" ? "#c084fc" : hoveredRank.rank.color}60`, 
            color: "#e8e8f0",
            left: hoveredRank.x + 15,
            top: hoveredRank.y + 15,
            boxShadow: `0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px ${hoveredRank.rank.color === "prismatic" ? "#c084fc" : hoveredRank.rank.color}15`,
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg drop-shadow-md" style={{ color: hoveredRank.rank.color === "prismatic" ? "#c084fc" : hoveredRank.rank.color }}>{hoveredRank.rank.icon}</span>
            <span className="font-black text-sm uppercase tracking-widest font-['Rajdhani'] drop-shadow-md" style={{ color: hoveredRank.rank.color === "prismatic" ? "#c084fc" : hoveredRank.rank.color }}>{hoveredRank.rank.name}</span>
          </div>
          <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-2 font-['Rajdhani']" style={{ color: "#00f0ff" }}>
             <span className="text-[8px]">✦</span> {hoveredRank.rank.xpMin.toLocaleString()} XP THRESHOLD
          </p>
          <p className="pt-2 text-[10px] uppercase tracking-wider font-['Inter'] leading-relaxed max-w-[200px]" style={{ color: "rgba(232,232,240,0.5)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
             {hoveredRank.rank.desc}
          </p>
        </div>
      )}
      
      <div className="mb-10 border-b border-[rgba(255,255,255,0.05)] pb-6 relative z-10">
         <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 font-['Rajdhani'] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#8b5cf6] animate-pulse" />
            Telemetry & Diagnostics
         </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>Performance Analytics</h1>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter'] max-w-md leading-relaxed">
          Historical data, growth velocity, and personal operational records.
        </p>
      </div>

      {/* Personal records */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 relative z-10">
        {[
          { label: "Max Streak", value: `${maxStreak} DAYS`, icon: "🔥", color: "#ec4899", glow: "rgba(236,72,153,0.2)" },
          { label: "Missions Cleared", value: (totalTasks + totalQuests).toString(), icon: "⚔", color: "#00f0ff", glow: "rgba(0,240,255,0.2)" },
          { label: "Peak Velocity", value: `${peakVelocity} XP`, icon: "✦", color: "#8b5cf6", glow: "rgba(139,92,246,0.2)" },
          { label: "Total Yield", value: totalXP > 1000 ? `${(totalXP / 1000).toFixed(1)}K` : totalXP.toString(), icon: "◈", color: "#10e07f", glow: "rgba(16,224,127,0.2)" },
        ].map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
            className="group relative h-full"
          >
             <div className="p-5 md:p-6 h-full flex flex-col relative overflow-hidden transition-all duration-300"
               style={{
                 background: "rgba(15,15,22,0.7)",
                 border: `1px solid rgba(255,255,255,0.05)`,
                 clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                 boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
               }}>
               {/* Hover effect */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${r.glow}, transparent 70%)` }} />
               <div className="absolute top-0 left-0 w-1.5 h-full transition-colors duration-300" style={{ background: "rgba(255,255,255,0.05)", boxShadow: `inset 2px 0 0 ${r.color}` }} />

               <p className="text-2xl md:text-3xl mb-3 relative z-10 transition-transform duration-300 group-hover:scale-110 origin-left" style={{ filter: `drop-shadow(0 0 8px ${r.color})` }}>{r.icon}</p>
               
               <div className="mt-auto relative z-10">
                  <p className="font-black text-xl md:text-2xl tracking-wider mb-1 font-['Rajdhani']" style={{ color: r.color, textShadow: `0 0 10px ${r.glow}` }}>{r.value}</p>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-black" style={{ color: "rgba(232,232,240,0.4)" }}>{r.label}</p>
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
         {/* XP over time (Span 2 columns on large screens) */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 relative group"
         >
           <div className="p-6 md:p-8 h-full relative overflow-hidden transition-all duration-300"
             style={{
               background: "rgba(15,15,22,0.7)",
               border: "1px solid rgba(139,92,246,0.15)",
               clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
               boxShadow: "inset 0 0 30px rgba(139,92,246,0.03)"
             }}>
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b5cf6] to-transparent opacity-50" />
             
             <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] font-['Rajdhani'] flex items-center gap-2" style={{ color: "#e8e8f0" }}>
                     <span className="text-[#8b5cf6]">✦</span> Progression Trajectory
                  </h2>
                  <p className="text-[9px] uppercase tracking-widest text-[rgba(232,232,240,0.4)] mt-1 font-['Inter']">XP Accumulation — Last 12 Days</p>
               </div>
               
               <div className="px-3 py-1.5 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[9px] font-black uppercase tracking-widest text-[#c084fc]" style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                  <span className="animate-pulse mr-1">●</span> Live
               </div>
             </div>
             
             <div style={{ height: 280 }} className="relative z-10 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={xpTrajectory} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                   <defs>
                     <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                       <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                       <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                     </linearGradient>
                     <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                     </filter>
                   </defs>
                   
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   
                   <XAxis 
                     dataKey="day" 
                     tick={{ fill: "rgba(232,232,240,0.4)", fontSize: 9, fontFamily: "Inter", fontWeight: "bold" }} 
                     axisLine={{ stroke: "rgba(255,255,255,0.1)" }} 
                     tickLine={false} 
                     dy={10}
                   />
                   <YAxis 
                     tick={{ fill: "rgba(232,232,240,0.4)", fontSize: 9, fontFamily: "Inter", fontWeight: "bold" }} 
                     axisLine={false} 
                     tickLine={false} 
                     dx={-10}
                     tickFormatter={(val) => `${val} XP`}
                     domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 1000)]}
                   />
                   <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                   
                   {RANKS.filter(r => r.xpMin > 0 && r.xpMin <= 3500).map(rank => (
                     <ReferenceLine
                       key={rank.id}
                       y={rank.xpMin}
                       stroke={rank.color === "prismatic" ? "#c084fc" : rank.color}
                       strokeDasharray="2 4"
                       strokeOpacity={0.4}
                       label={<CustomReferenceLabel rank={rank} setHovered={setHoveredRank} />}
                     />
                   ))}
                   
                   <Area
                     type="monotone"
                     dataKey="xp"
                     stroke="#a78bfa"
                     strokeWidth={3}
                     fill="url(#xpGrad)"
                     dot={false}
                     activeDot={{ r: 6, fill: "#10e07f", stroke: "#0a0a12", strokeWidth: 3, filter: "drop-shadow(0 0 5px #10e07f)" }}
                     style={{ filter: "url(#glow)" }}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>
         </motion.div>

         <div className="flex flex-col gap-6">
            {/* Activity heatmap */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="relative group h-full"
            >
              <div className="p-6 h-full relative overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(15,15,22,0.7)",
                  border: "1px solid rgba(16,224,127,0.15)",
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  boxShadow: "inset 0 0 20px rgba(16,224,127,0.03)"
                }}>
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#10e07f] to-transparent opacity-50" />
                
                <h2 className="text-xs font-black mb-6 uppercase tracking-[0.2em] font-['Rajdhani'] flex items-center gap-2" style={{ color: "#e8e8f0" }}>
                   <span className="text-[#10e07f]">◈</span> Activity Density
                </h2>
                
                <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
                  {activityDensity.map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (i * 0.02), type: "spring", stiffness: 300, damping: 20 }}
                      title={`${val} XP Yield`}
                      className="w-5 h-5 md:w-6 md:h-6 cursor-crosshair transition-all duration-300 hover:scale-125 hover:z-10 relative group/cell"
                      style={{ 
                         background: heatColor(val), 
                         border: val === 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                         clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", // Hexagons
                         boxShadow: heatGlow(val)
                      }}
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-[rgba(10,10,15,0.9)] border border-[rgba(255,255,255,0.1)] px-2 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap pointer-events-none z-20">
                          {val} XP
                       </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                   <span className="text-[8px] uppercase tracking-widest font-black text-gray-500">Low</span>
                   <div className="flex gap-1.5">
                     {[0, 100, 300, 500].map((val) => (
                       <div key={val} className="w-3 h-3" style={{ background: heatColor(val), clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", boxShadow: heatGlow(val) }} />
                     ))}
                   </div>
                   <span className="text-[8px] uppercase tracking-widest font-black text-gray-500">High</span>
                </div>
              </div>
            </motion.div>

            {/* Streak calendar */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5 }}
               className="relative group h-full"
            >
              <div className="p-6 h-full relative overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(15,15,22,0.7)",
                  border: "1px solid rgba(0,240,255,0.15)",
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  boxShadow: "inset 0 0 20px rgba(0,240,255,0.03)"
                }}>
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#00f0ff] to-transparent opacity-50" />

                <h2 className="text-xs font-black mb-1 uppercase tracking-[0.2em] font-['Rajdhani'] flex items-center gap-2" style={{ color: "#e8e8f0" }}>
                   <span className="text-[#00f0ff]">★</span> Operational Matrix
                </h2>
                <p className="text-[9px] uppercase tracking-widest text-[rgba(232,232,240,0.4)] mb-5 font-['Inter']">{currentMonthLabel}</p>
                
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-black" style={{ color: "rgba(232,232,240,0.3)", fontFamily: "Rajdhani" }}>{d}</div>
                  ))}
                </div>
                
                <div className="space-y-1.5">
                  {operationalMatrix.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1.5">
                      {week.map((day, di) => {
                        const dayNum = wi * 7 + di + 1;
                        return (
                          <div key={di} className="aspect-square flex items-center justify-center text-[10px] font-black transition-all duration-300 relative group/day"
                            style={{
                              background: day === null ? "transparent"
                                : day === 1 ? "rgba(0,240,255,0.15)"
                                : "rgba(255,255,255,0.02)",
                              border: day === null ? "none" : `1px solid ${day === 1 ? "rgba(0,240,255,0.5)" : "rgba(255,255,255,0.05)"}`,
                              color: day === 1 ? "#00f0ff" : "rgba(232,232,240,0.2)",
                              clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                              boxShadow: day === 1 ? "0 0 10px rgba(0,240,255,0.2)" : "none",
                              cursor: "default"
                            }}>
                            {day !== null ? dayNum : ""}
                            
                            {/* Highlight border on hover for valid days */}
                            {day !== null && (
                               <div className="absolute inset-0 border border-[#00f0ff] opacity-0 group-hover/day:opacity-100 transition-opacity" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] text-[9px] uppercase tracking-widest font-black" style={{ color: "rgba(232,232,240,0.4)" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5" style={{ background: "rgba(0,240,255,0.15)", border: "1px solid rgba(0,240,255,0.5)", clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))" }} />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))" }} />
                    <span>Dormant</span>
                  </div>
                </div>
              </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
