import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GlassCard from "../components/GlassCard";

const FRIENDS_LIST = [
  { name: "Alex Torres", title: "The Hustler", level: 22, streak: 15, avatar: "☄", xp: 48200, online: true },
  { name: "Jamie Liu", title: "Builder", level: 18, streak: 9, avatar: "🛠", xp: 34600, online: true },
  { name: "Sam Rivera", title: "Explorer", level: 5, streak: 3, avatar: "🗺", xp: 1840, online: false },
  { name: "Casey Park", title: "The Spark", level: 11, streak: 6, avatar: "⚡", xp: 18400, online: false },
];

const SUGGESTIONS = [
  { name: "Morgan Blake", title: "Night Owl", level: 14, avatar: "🌙" },
  { name: "Riley Stone", title: "Forge Born", level: 9, avatar: "🔥" },
];

function FriendCard({ friend }: { friend: typeof FRIENDS_LIST[0] }) {
  const [sharing, setSharing] = useState(false);

  return (
    <GlassCard className="p-4" glow="none">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
            {friend.avatar}
          </div>
          {friend.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: "#34d399", borderColor: "#0a0a12" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{friend.name}</p>
          <p className="text-xs" style={{ color: "#a78bfa" }}>{friend.title} · Lv {friend.level}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span style={{ color: "#f6ad37" }}>{friend.xp.toLocaleString()} XP</span>
            <span className="flex items-center gap-0.5" style={{ color: "#ff6b35" }}>
              <span className="flame-pulse inline-block">🔥</span> {friend.streak}d
            </span>
          </div>
        </div>
        <button
          onClick={() => { setSharing(true); setTimeout(() => setSharing(false), 2000); }}
          className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
          style={{
            background: sharing ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${sharing ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)"}`,
            color: sharing ? "#34d399" : "rgba(232,232,240,0.5)",
          }}
        >
          {sharing ? "✓ Shared" : "Share"}
        </button>
      </div>

      {/* Shareable glass card mini */}
      <div className="mt-3 p-3 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "rgba(232,232,240,0.35)" }}>Public card</span>
          <span style={{ color: friend.online ? "#34d399" : "rgba(232,232,240,0.3)" }}>
            {friend.online ? "● Online" : "● Offline"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            {friend.avatar}
          </div>
          <div>
            <p className="text-xs font-semibold">{friend.name}</p>
            <p className="text-xs" style={{ color: "#a78bfa" }}>Lv {friend.level} · {friend.title}</p>
          </div>
          <div className="ml-auto text-right text-xs">
            <p style={{ color: "#ff6b35" }}>🔥 {friend.streak}d</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Friends() {
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<string[]>([]);

  const filtered = FRIENDS_LIST.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Friends</h1>
        <p className="text-sm" style={{ color: "rgba(232,232,240,0.5)" }}>Track your friends&apos; forge progress and keep each other accountable.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(232,232,240,0.3)" }}>
          ⌕
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search or add friends..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e8e8f0",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(246,173,55,0.3)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
      </div>

      {/* Friends list */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(232,232,240,0.35)" }}>
          Friends ({FRIENDS_LIST.length})
        </p>
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <FriendCard friend={f} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(232,232,240,0.35)" }}>
          Suggested
        </p>
        <div className="space-y-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
            >
              <GlassCard className="p-3 flex items-center gap-3" hover={false}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  {s.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs" style={{ color: "#a78bfa" }}>Lv {s.level} · {s.title}</p>
                </div>
                <button
                  onClick={() => setAdded((prev) => [...prev, s.name])}
                  disabled={added.includes(s.name)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{
                    background: added.includes(s.name) ? "rgba(52,211,153,0.12)" : "rgba(246,173,55,0.12)",
                    border: `1px solid ${added.includes(s.name) ? "rgba(52,211,153,0.25)" : "rgba(246,173,55,0.2)"}`,
                    color: added.includes(s.name) ? "#34d399" : "#f6ad37",
                  }}
                >
                  {added.includes(s.name) ? "✓ Added" : "+ Add"}
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
