import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const GOALS = [
  { id: "work", icon: "💼", label: "Career & Work", sub: "Projects, tasks, deep work" },
  { id: "fitness", icon: "⚡", label: "Health & Fitness", sub: "Workouts, sleep, nutrition" },
  { id: "learning", icon: "🧠", label: "Learning & Skills", sub: "Courses, books, practice" },
  { id: "creative", icon: "✦", label: "Creative Pursuits", sub: "Art, writing, music" },
  { id: "mindset", icon: "◈", label: "Mindset & Habits", sub: "Routines, journaling, calm" },
];

const PACE = [
  { id: "gentle", label: "Gentle", sub: "1–2 quests/day", xp: "+50% XP bonus" },
  { id: "steady", label: "Steady", sub: "3–5 quests/day", xp: "Standard rates" },
  { id: "intense", label: "Intense", sub: "6+ quests/day", xp: "+20% XP bonus" },
];

interface Props {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPace, setSelectedPace] = useState<string>("steady");
  const [name, setName] = useState("");

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const steps = [
    // Step 0: Name
    <motion.div
      key="s0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl"
        style={{ background: "linear-gradient(135deg, #f6ad37, #ff6b35)" }}>
        ⚔
      </div>
      <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
        Welcome to <span style={{ color: "#f6ad37" }}>Soulforge</span>
      </h1>
      <p className="text-base mb-10" style={{ color: "rgba(232,232,240,0.6)" }}>
        Your life is the adventure. Every task is a quest. Every day shapes the hero you&apos;re becoming.
      </p>
      <div className="w-full space-y-3">
        <label className="block text-left text-xs font-medium mb-1.5" style={{ color: "rgba(232,232,240,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          What should we call you?
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your forge name..."
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8e8f0",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(246,173,55,0.4)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>
    </motion.div>,

    // Step 1: Goals
    <motion.div
      key="s1"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto w-full"
    >
      <h2 className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: "Sora, sans-serif" }}>
        What do you want to forge?
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: "rgba(232,232,240,0.5)" }}>
        Pick up to 3 areas. Your starting stats and quests will be tailored to these.
      </p>
      <div className="space-y-3">
        {GOALS.map((g, i) => {
          const selected = selectedGoals.includes(g.id);
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => toggleGoal(g.id)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
              style={{
                background: selected ? "rgba(246,173,55,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected ? "rgba(246,173,55,0.4)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: selected ? "0 0 20px rgba(246,173,55,0.1)" : "none",
              }}
            >
              <span className="text-2xl w-8 flex-shrink-0">{g.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: selected ? "#f6ad37" : "#e8e8f0" }}>{g.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.45)" }}>{g.sub}</p>
              </div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: selected ? "#f6ad37" : "transparent",
                  border: `1.5px solid ${selected ? "#f6ad37" : "rgba(255,255,255,0.2)"}`,
                }}>
                {selected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#0a0a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>,

    // Step 2: Pace
    <motion.div
      key="s2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto w-full"
    >
      <h2 className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: "Sora, sans-serif" }}>
        Set your forge pace
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: "rgba(232,232,240,0.5)" }}>
        You&apos;re starting at Level 1. Lower levels have generous XP gains — this is just your daily rhythm.
      </p>
      <div className="space-y-3">
        {PACE.map((p, i) => {
          const selected = selectedPace === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedPace(p.id)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all"
              style={{
                background: selected ? "rgba(246,173,55,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected ? "rgba(246,173,55,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: selected ? "#f6ad37" : "#e8e8f0" }}>{p.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(232,232,240,0.45)" }}>{p.sub}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                {p.xp}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
        <p className="text-xs" style={{ color: "rgba(167,139,250,0.9)" }}>
          ✦ <strong>Beginner bonus active</strong> — Your first 5 levels reward 2× XP and coins. Build the habit, then the challenge scales with you.
        </p>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 6,
              background: i <= step ? "#f6ad37" : "rgba(255,255,255,0.1)",
            }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      <div className="flex gap-3 mt-10">
        {step > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep((s) => s - 1)}
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(232,232,240,0.7)",
            }}
          >
            Back
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (step < 2) setStep((s) => s + 1);
            else onComplete();
          }}
          disabled={step === 0 && !name.trim()}
          className="px-8 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #f6ad37, #ff6b35)",
            color: "#0a0a12",
            fontFamily: "Sora, sans-serif",
          }}
        >
          {step < 2 ? "Continue" : "Begin Your Journey →"}
        </motion.button>
      </div>
    </div>
  );
}
