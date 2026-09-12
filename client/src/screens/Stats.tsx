import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import GlassCard from "../components/GlassCard";
import { RANKS } from "./ProgressionPath";

const XP_DATA = [
  { day: "Sep 1", xp: 120 }, { day: "Sep 2", xp: 120 }, { day: "Sep 3", xp: 320 },
  { day: "Sep 4", xp: 500 }, { day: "Sep 5", xp: 840 }, { day: "Sep 6", xp: 1120 },
  { day: "Sep 7", xp: 1540 }, { day: "Sep 8", xp: 1920 }, { day: "Sep 9", xp: 2420 },
  { day: "Sep 10", xp: 2880 }, { day: "Sep 11", xp: 3200 }, { day: "Sep 12", xp: 3400 },
];

const CALENDAR = [
  [1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1],
  [1, 1, null, null, null, null, null],
];

const HEAT_MAX = 500;
const HEAT_DATA: number[] = [
  120, 0, 200, 180, 340, 280, 420,
  380, 500, 460, 320, 200, 0, 0,
  150, 280, 340, 400, 320, 180, 90,
  460, 500, 380, 200, 120, 300, 420,
];

function heatColor(val: number) {
  if (val === 0) return "rgba(255,255,255,0.04)";
  const pct = val / HEAT_MAX;
  if (pct < 0.33) return "rgba(246,173,55,0.25)";
  if (pct < 0.66) return "rgba(246,173,55,0.55)";
  return "rgba(246,173,55,0.9)";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs"
      style={{ background: "rgba(18,18,46,0.95)", border: "1px solid rgba(246,173,55,0.25)", color: "#e8e8f0" }}>
      <p style={{ color: "rgba(232,232,240,0.5)" }}>{label}</p>
      <p className="font-semibold" style={{ color: "#f6ad37" }}>{payload[0].value} XP</p>
    </div>
  );
};

const CustomReferenceLabel = (props: any) => {
  const { viewBox, rank, setHovered } = props;
  if (!viewBox) return null;
  const isPrismatic = rank.color === "prismatic";
  const fill = isPrismatic ? "#a78bfa" : rank.color;
  
  return (
    <g 
      style={{ cursor: "pointer" }}
      onMouseEnter={(e) => setHovered({ rank, x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => setHovered({ rank, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setHovered(null)}
    >
      <rect x={viewBox.x} y={viewBox.y - 6} width={viewBox.width} height={12} fill="transparent" />
      <text
        x={viewBox.x + 10}
        y={viewBox.y}
        dy={5}
        fill={fill}
        fontSize={14}
      >
        {rank.icon}
      </text>
    </g>
  );
};

export default function Stats() {
  const [hoveredRank, setHoveredRank] = useState<{ rank: any, x: number, y: number } | null>(null);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 relative">
      {hoveredRank && (
        <div 
          className="fixed z-50 px-3 py-2 rounded-xl pointer-events-none"
          style={{ 
            background: "rgba(18,18,46,0.95)", 
            border: `1px solid ${hoveredRank.rank.color === "prismatic" ? "#a78bfa" : hoveredRank.rank.color}40`, 
            color: "#e8e8f0",
            left: hoveredRank.x + 15,
            top: hoveredRank.y + 15,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: hoveredRank.rank.color === "prismatic" ? "#a78bfa" : hoveredRank.rank.color }}>{hoveredRank.rank.icon}</span>
            <span className="font-bold text-sm" style={{ color: hoveredRank.rank.color === "prismatic" ? "#a78bfa" : hoveredRank.rank.color }}>{hoveredRank.rank.name}</span>
          </div>
          <p className="font-semibold text-xs" style={{ color: "#f6ad37" }}>{hoveredRank.rank.xpMin.toLocaleString()} XP Required</p>
          <p className="mt-1 pt-1 text-xs" style={{ color: "rgba(232,232,240,0.5)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>{hoveredRank.rank.desc}</p>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Stats & History</h1>
        <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>Your forge history, growth trends, and personal records.</p>
      </div>

      {/* Personal records */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Best Streak", value: "23 days", icon: "🔥", color: "#ff6b35" },
          { label: "Total Quests", value: "142", icon: "⚔", color: "#f6ad37" },
          { label: "Best Day", value: "500 XP", icon: "⭐", color: "#a78bfa" },
          { label: "Total XP", value: "28.4K", icon: "◈", color: "#f6ad37" },
        ].map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <GlassCard className="p-4 text-center" hover={false}>
              <p className="text-xl mb-1">{r.icon}</p>
              <p className="font-bold text-lg" style={{ color: r.color, fontFamily: "Sora, sans-serif" }}>{r.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.4)" }}>{r.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* XP over time */}
      <GlassCard className="p-5" hover={false}>
        <h2 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: "rgba(232,232,240,0.5)", fontFamily: "Sora, sans-serif" }}>
          XP Earned — Last 12 Days
        </h2>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={XP_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f6ad37" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f6ad37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "rgba(232,232,240,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(232,232,240,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {RANKS.filter(r => r.xpMin > 0 && r.xpMin <= 3500).map(rank => (
                <ReferenceLine
                  key={rank.id}
                  y={rank.xpMin}
                  stroke={rank.color === "prismatic" ? "#a78bfa" : rank.color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={<CustomReferenceLabel rank={rank} setHovered={setHoveredRank} />}
                />
              ))}
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#f6ad37"
                strokeWidth={2}
                fill="url(#xpGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#f6ad37", stroke: "#0a0a12", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Activity heatmap */}
      <GlassCard className="p-5" hover={false}>
        <h2 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: "rgba(232,232,240,0.5)", fontFamily: "Sora, sans-serif" }}>
          Activity Heatmap
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {HEAT_DATA.map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              title={`${val} XP`}
              className="w-6 h-6 rounded-md cursor-default transition-all hover:scale-125"
              style={{ background: heatColor(val), border: "1px solid rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "rgba(232,232,240,0.35)" }}>
          <span>Less</span>
          {["0.04", "0.25", "0.55", "0.9"].map((o) => (
            <div key={o} className="w-3.5 h-3.5 rounded-sm" style={{ background: `rgba(246,173,55,${o})` }} />
          ))}
          <span>More</span>
        </div>
      </GlassCard>

      {/* Streak calendar */}
      <GlassCard className="p-5" hover={false}>
        <h2 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: "rgba(232,232,240,0.5)", fontFamily: "Sora, sans-serif" }}>
          September 2026
        </h2>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-xs" style={{ color: "rgba(232,232,240,0.3)" }}>{d}</div>
          ))}
        </div>
        <div className="space-y-1">
          {CALENDAR.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                const dayNum = wi * 7 + di + 1;
                return (
                  <div key={di} className="aspect-square rounded-md flex items-center justify-center text-xs transition-all hover:scale-110"
                    style={{
                      background: day === null ? "transparent"
                        : day === 1 ? "rgba(246,173,55,0.7)"
                        : "rgba(255,255,255,0.04)",
                      border: day === null ? "none" : "1px solid rgba(255,255,255,0.04)",
                      color: day === 1 ? "#0a0a12" : "rgba(232,232,240,0.3)",
                      fontWeight: day === 1 ? 700 : 400,
                      cursor: day !== null ? "default" : "default",
                    }}>
                    {day !== null ? dayNum : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 text-xs" style={{ color: "rgba(232,232,240,0.4)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(246,173,55,0.7)" }} />
            <span>Quest completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.04)" }} />
            <span>Missed</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
