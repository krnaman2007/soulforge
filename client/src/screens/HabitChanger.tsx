import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

interface HabitTask {
  title: string;
  xp: number;
  day: number;
  type: "replace" | "cue" | "reward" | "track";
}

const TYPE_LABELS: Record<string, string> = {
  replace: "Replacement",
  cue: "Cue Hack",
  reward: "Reward Design",
  track: "Tracking",
};
const TYPE_COLORS: Record<string, string> = {
  replace: "#a78bfa",
  cue: "#f6ad37",
  reward: "#34d399",
  track: "#ff6b35",
};

function generateHabitPlan(habit: string): HabitTask[] {
  if (habit.toLowerCase().includes("phone") || habit.toLowerCase().includes("scroll")) {
    return [
      { title: "Audit: track screen time for 24h without judgment", xp: 50, day: 1, type: "track" },
      { title: "Remove social apps from home screen — friction hack", xp: 80, day: 1, type: "cue" },
      { title: "Replace first 10 min of phone use with journaling", xp: 100, day: 2, type: "replace" },
      { title: "Set a 'phone-free zone' in your bedroom", xp: 90, day: 3, type: "cue" },
      { title: "Design a non-phone reward for hitting 7 days", xp: 60, day: 4, type: "reward" },
      { title: "Log daily screen time for 7 days straight", xp: 120, day: 7, type: "track" },
    ];
  }
  return [
    { title: "Awareness check — journal current habit pattern", xp: 50, day: 1, type: "track" },
    { title: "Identify the cue that triggers the habit", xp: 70, day: 1, type: "cue" },
    { title: "Design a healthier replacement behavior", xp: 100, day: 2, type: "replace" },
    { title: "Implement the replacement for 3 consecutive days", xp: 130, day: 3, type: "replace" },
    { title: "Create a reward to reinforce the new loop", xp: 80, day: 5, type: "reward" },
    { title: "7-day habit review — score your consistency", xp: 120, day: 7, type: "track" },
  ];
}

function VioletParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: [0, 0.6, 0], y: [0, -50, -90] }}
      transition={{ duration: 1.8, delay, repeat: Infinity, repeatDelay: Math.random() * 1.5 }}
      style={{
        position: "absolute",
        left: `${Math.random() * 100}%`,
        bottom: 0,
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "#a78bfa",
        boxShadow: "0 0 5px #a78bfa",
        pointerEvents: "none",
      }}
    />
  );
}

export default function HabitChanger() {
  const [habit, setHabit] = useState("");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<HabitTask[] | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleGenerate = () => {
    if (!habit.trim()) return;
    setGenerating(true);
    setPlan(null);
    setTimeout(() => {
      setPlan(generateHabitPlan(habit));
      setGenerating(false);
    }, 2200);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: "#a78bfa", fontSize: 18 }}>◈</span>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Habit Changer</h1>
        </div>
        <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>
          Describe a habit you want to break or build. AI generates a targeted quest chain using proven behavior science.
        </p>
      </div>

      {/* Input panel — violet AI atmosphere */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", backdropFilter: "blur(20px)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {Array.from({ length: 10 }, (_, i) => <VioletParticle key={i} delay={i * 0.25} />)}
        </div>
        <div className="relative z-10 p-5">
          <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "#a78bfa" }}>
            What habit do you want to change?
          </label>
          <textarea
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            rows={3}
            placeholder="e.g. Stop scrolling my phone first thing in the morning, Build a daily reading habit, Quit snacking after 9pm..."
            className="w-full resize-none rounded-xl p-3 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(167,139,250,0.15)",
              color: "#e8e8f0",
            }}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={!habit.trim() || generating}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{
              background: "rgba(167,139,250,0.25)",
              border: "1px solid rgba(167,139,250,0.35)",
              color: "#a78bfa",
            }}
          >
            {generating ? "◈ Analyzing habit loop..." : "◈ Generate Habit Quest Chain"}
          </motion.button>
        </div>
      </div>

      {/* Loading skeletons */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-center uppercase tracking-widest" style={{ color: "#a78bfa" }}>
              ◈ Analyzing behavior loop...
            </p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 skeleton rounded-xl" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest chain */}
      <AnimatePresence>
        {plan && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }} />
              <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>Habit Quest Chain — {plan.length} steps</p>
              <div className="flex-1 h-px" style={{ background: "rgba(167,139,250,0.2)" }} />
            </div>

            {plan.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
              >
                <GlassCard className="p-4 flex items-start gap-3 relative overflow-hidden" hover={false}>
                  {/* Violet left accent */}
                  <div className="absolute left-0 inset-y-0 w-0.5 rounded-l-2xl"
                    style={{ background: `linear-gradient(180deg, ${TYPE_COLORS[task.type]}, ${TYPE_COLORS[task.type]}44)` }} />

                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ml-2"
                    style={{ background: `${TYPE_COLORS[task.type]}18`, color: TYPE_COLORS[task.type], border: `1px solid ${TYPE_COLORS[task.type]}30` }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-1.5 py-0.5 rounded-full"
                        style={{ background: `${TYPE_COLORS[task.type]}15`, color: TYPE_COLORS[task.type] }}>
                        {TYPE_LABELS[task.type]}
                      </span>
                      <span style={{ color: "rgba(232,232,240,0.4)" }}>Day {task.day}</span>
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "#f6ad37" }}>+{task.xp} XP</span>
                </GlassCard>
              </motion.div>
            ))}

            {!accepted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: plan.length * 0.08 + 0.2 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => { setPlan(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,232,240,0.5)" }}
                >
                  Try again
                </button>
                <button
                  onClick={() => setAccepted(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", color: "#fff" }}
                >
                  Accept Chain →
                </button>
              </motion.div>
            )}

            {accepted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#a78bfa" }}>◈ Habit chain activated</p>
                <p className="text-xs mt-1" style={{ color: "rgba(232,232,240,0.5)" }}>
                  Quest chain added to your Daily Log. The AI will verify completions.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
