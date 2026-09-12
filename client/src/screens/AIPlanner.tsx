import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

interface GeneratedTask {
  title: string;
  xp: number;
  coins: number;
  diff: "Easy" | "Medium" | "Hard";
  day: number;
}

function generateTasks(goal: string): GeneratedTask[] {
  const examples: Record<string, GeneratedTask[]> = {
    default: [
      { title: "Research and outline your approach", xp: 80, coins: 32, diff: "Easy", day: 1 },
      { title: "Complete foundation milestone", xp: 120, coins: 48, diff: "Medium", day: 1 },
      { title: "Build on momentum — intermediate step", xp: 150, coins: 60, diff: "Medium", day: 2 },
      { title: "Challenge session — push limits", xp: 180, coins: 72, diff: "Hard", day: 3 },
      { title: "Review and consolidate progress", xp: 90, coins: 36, diff: "Easy", day: 3 },
      { title: "Final push — deliver the result", xp: 200, coins: 80, diff: "Hard", day: 5 },
    ],
  };
  if (goal.toLowerCase().includes("run") || goal.toLowerCase().includes("fitness")) {
    return [
      { title: "Day 1: 20-min easy run — establish baseline", xp: 80, coins: 32, diff: "Easy", day: 1 },
      { title: "Day 2: Dynamic stretching + mobility work", xp: 60, coins: 24, diff: "Easy", day: 2 },
      { title: "Day 3: 30-min interval run (1:2 ratio)", xp: 120, coins: 48, diff: "Medium", day: 3 },
      { title: "Day 5: Long slow distance — 45 minutes", xp: 150, coins: 60, diff: "Medium", day: 5 },
      { title: "Day 7: Full 5K run attempt", xp: 200, coins: 80, diff: "Hard", day: 7 },
    ];
  }
  if (goal.toLowerCase().includes("learn") || goal.toLowerCase().includes("course") || goal.toLowerCase().includes("study")) {
    return [
      { title: "Map the full learning path — outline 5 milestones", xp: 70, coins: 28, diff: "Easy", day: 1 },
      { title: "Complete first module + take notes", xp: 100, coins: 40, diff: "Easy", day: 1 },
      { title: "Build a small practice project", xp: 150, coins: 60, diff: "Medium", day: 3 },
      { title: "Spaced repetition review session", xp: 80, coins: 32, diff: "Easy", day: 4 },
      { title: "Teach-back exercise — explain what you learned", xp: 120, coins: 48, diff: "Medium", day: 5 },
      { title: "Apply in a real project or portfolio piece", xp: 220, coins: 88, diff: "Hard", day: 7 },
    ];
  }
  return examples.default;
}

const DIFF_COLORS: Record<string, string> = {
  Easy: "#34d399",
  Medium: "#f6ad37",
  Hard: "#ff6b35",
};

// Violet AI particle dot
function VioletParticle({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0, 0.8, 0], y: [0, -60, -100], x: [(Math.random() - 0.5) * 40] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: 0,
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "#a78bfa",
        boxShadow: "0 0 6px #a78bfa",
        pointerEvents: "none",
      }}
    />
  );
}

export default function AIPlanner() {
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState<GeneratedTask[] | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleGenerate = () => {
    if (!goal.trim()) return;
    setGenerating(true);
    setTasks(null);
    setTimeout(() => {
      setTasks(generateTasks(goal));
      setGenerating(false);
    }, 2400);
  };

  const totalXP = tasks?.reduce((s, t) => s + t.xp, 0) ?? 0;
  const totalCoins = tasks?.reduce((s, t) => s + t.coins, 0) ?? 0;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: "#a78bfa", fontSize: 18 }}>✦</span>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>AI Project Planner</h1>
        </div>
        <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>
          Describe your goal. The AI will forge a quest plan with XP rewards pre-assigned.
        </p>
      </div>

      {/* Input */}
      <GlassCard className="p-5 overflow-hidden relative" glow="violet">
        {/* Violet particle atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {Array.from({ length: 8 }, (_, i) => (
            <VioletParticle key={i} delay={i * 0.3} />
          ))}
        </div>

        <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "#a78bfa" }}>
          What do you want to achieve?
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="e.g. Run a 5K without stopping, Learn TypeScript in 2 weeks, Launch my first SaaS..."
          className="w-full resize-none rounded-xl p-3 text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(167,139,250,0.2)",
            color: "#e8e8f0",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.2)")}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={!goal.trim() || generating}
          className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(167,139,250,0.15))",
            border: "1px solid rgba(167,139,250,0.3)",
            color: "#a78bfa",
            fontFamily: "Sora, sans-serif",
          }}
        >
          {generating ? "Forging your quest plan..." : "✦ Generate Quest Plan"}
        </motion.button>
      </GlassCard>

      {/* Generating state */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-center" style={{ color: "#a78bfa" }}>
              ✦ Soulforge AI is building your plan...
            </p>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 skeleton rounded-2xl" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated tasks */}
      <AnimatePresence>
        {tasks && !generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {!accepted && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ color: "#a78bfa", fontSize: 14 }}>✦</span>
                  <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>
                    Quest plan ready — {tasks.length} tasks generated
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: "#f6ad37" }}>+{totalXP} XP</span>
                  <span style={{ color: "rgba(246,173,55,0.6)" }}>◈ {totalCoins}</span>
                </div>
              </div>
            )}

            {tasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 24 }}
              >
                <GlassCard className="p-4 flex items-center gap-3" hover={false} glow="violet">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span style={{ color: DIFF_COLORS[task.diff] }}>● {task.diff}</span>
                      <span style={{ color: "rgba(232,232,240,0.3)" }}>·</span>
                      <span style={{ color: "rgba(232,232,240,0.4)" }}>Day {task.day}</span>
                      <span className="ml-auto px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>
                        ✦ AI-graded
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs flex-shrink-0">
                    <p style={{ color: "#f6ad37" }}>+{task.xp} XP</p>
                    <p style={{ color: "rgba(246,173,55,0.6)" }}>◈ {task.coins}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {!accepted && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tasks.length * 0.08 + 0.2 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => { setTasks(null); setGoal(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(232,232,240,0.5)",
                  }}
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setAccepted(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                    color: "#fff",
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  Accept Plan →
                </button>
              </motion.div>
            )}

            {accepted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#34d399" }}>✓ Quest plan added to your Quest Log</p>
                <p className="text-xs" style={{ color: "rgba(232,232,240,0.5)" }}>
                  Tasks are now visible under Projects. Complete them to earn {totalXP} XP total.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
