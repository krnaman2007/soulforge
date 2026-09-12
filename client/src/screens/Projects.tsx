import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

const PROJECTS = [
  {
    id: 1, title: "Learn React + TypeScript", icon: "⚛", color: "#60a5fa",
    tasks: 12, completed: 9, xpBonus: 800, coins: 320,
    description: "Full stack mastery from hooks to advanced patterns",
    dueDate: "Sep 28",
  },
  {
    id: 2, title: "Morning Fitness Routine", icon: "⚡", color: "#34d399",
    tasks: 20, completed: 14, xpBonus: 600, coins: 240,
    description: "Build the foundation of physical discipline",
    dueDate: "Oct 5",
  },
  {
    id: 3, title: "Launch Side Project", icon: "🚀", color: "#f6ad37",
    tasks: 18, completed: 5, xpBonus: 1200, coins: 500,
    description: "Ship something real to real users",
    dueDate: "Nov 1",
  },
  {
    id: 4, title: "Read 12 Books This Year", icon: "📚", color: "#a78bfa",
    tasks: 24, completed: 7, xpBonus: 900, coins: 360,
    description: "Expand your mental models and knowledge base",
    dueDate: "Dec 31",
  },
];

interface ProjectTask {
  title: string;
  xp: number;
  done: boolean;
}

const PROJECT_TASKS: Record<number, ProjectTask[]> = {
  1: [
    { title: "Complete React hooks deep-dive", xp: 120, done: true },
    { title: "Build custom useLocalStorage hook", xp: 100, done: true },
    { title: "TypeScript generics mastery", xp: 140, done: false },
    { title: "Context API + state management", xp: 110, done: false },
  ],
  2: [
    { title: "Day 1: Foundation mobility", xp: 80, done: true },
    { title: "Day 2: Push protocol", xp: 80, done: true },
    { title: "Day 3: Pull protocol", xp: 80, done: false },
    { title: "Day 4: Active recovery", xp: 60, done: false },
  ],
  3: [
    { title: "Validate idea with 5 users", xp: 200, done: true },
    { title: "Build MVP wireframes", xp: 150, done: false },
    { title: "Set up infrastructure", xp: 180, done: false },
    { title: "Deploy beta version", xp: 250, done: false },
  ],
  4: [
    { title: "Finish Atomic Habits", xp: 120, done: true },
    { title: "Finish Deep Work", xp: 120, done: true },
    { title: "Start The Almanack of Naval", xp: 120, done: false },
    { title: "Write 3 book summaries", xp: 90, done: false },
  ],
};

function ProgressRing({ pct, color, size = 60 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="progress-ring" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} stroke="rgba(255,255,255,0.06)" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4}
        stroke={color}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
        style={{ strokeDasharray: circ, filter: `drop-shadow(0 0 4px ${color}66)` }}
      />
    </svg>
  );
}

function ProjectDetail({ project, onBack }: { project: typeof PROJECTS[0]; onBack: () => void }) {
  const tasks = PROJECT_TASKS[project.id] || [];
  const pct = Math.round((project.completed / project.tasks) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="space-y-5"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
        style={{ color: "rgba(232,232,240,0.5)" }}>
        ← Back to Projects
      </button>

      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${project.color}20`, border: `1px solid ${project.color}30` }}>
            {project.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sora, sans-serif" }}>{project.title}</h2>
            <p className="text-sm mb-4" style={{ color: "rgba(232,232,240,0.5)" }}>{project.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ProgressRing pct={pct} color={project.color} size={40} />
                <div>
                  <p className="font-semibold text-xs" style={{ color: project.color }}>{pct}%</p>
                  <p className="text-xs" style={{ color: "rgba(232,232,240,0.4)" }}>{project.completed}/{project.tasks}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(246,173,55,0.12)", color: "#f6ad37" }}>
                  +{project.xpBonus} XP bonus
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(246,173,55,0.08)", color: "rgba(246,173,55,0.7)" }}>
                  ◈ {project.coins}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,232,240,0.5)" }}>
                  Due {project.dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-2">
        {tasks.map((task, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard className="p-4 flex items-center gap-3" hover={false}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: task.done ? project.color : "transparent",
                  border: `1.5px solid ${task.done ? project.color : "rgba(255,255,255,0.15)"}`,
                }}>
                {task.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#0a0a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <p className="flex-1 text-sm" style={{
                color: task.done ? "rgba(232,232,240,0.35)" : "#e8e8f0",
                textDecoration: task.done ? "line-through" : "none",
              }}>
                {task.title}
              </p>
              <span className="text-xs" style={{ color: "#f6ad37" }}>+{task.xp} XP</span>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <AnimatePresence mode="wait">
        {selected ? (
          <ProjectDetail key="detail" project={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-5">
              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Sora, sans-serif" }}>Projects</h1>
              <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>Long-term quests with bonus rewards on completion.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROJECTS.map((p, i) => {
                const pct = Math.round((p.completed / p.tasks) * 100);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <GlassCard className="p-5" glow="none" onClick={() => setSelected(p)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: `${p.color}18`, border: `1px solid ${p.color}25` }}>
                          {p.icon}
                        </div>
                        <ProgressRing pct={pct} color={p.color} />
                      </div>
                      <h3 className="font-bold text-sm mb-1" style={{ fontFamily: "Sora, sans-serif" }}>{p.title}</h3>
                      <p className="text-xs mb-3" style={{ color: "rgba(232,232,240,0.4)" }}>{p.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: "rgba(232,232,240,0.4)" }}>{p.completed}/{p.tasks} tasks</span>
                        <span style={{ color: "#f6ad37" }}>+{p.xpBonus} XP</span>
                      </div>
                      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.3 + i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: p.color, boxShadow: `0 0 6px ${p.color}66` }}
                        />
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
