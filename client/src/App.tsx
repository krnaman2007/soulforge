import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { fetchCurrentUser, logoutLocally } from "./store/slices/authSlice";

import GamingBackground from "./components/GamingBackground";
import Landing from "./screens/Landing";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import QuestLog from "./screens/QuestLog";
import Projects from "./screens/Projects";
import AIPlanner from "./screens/AIPlanner";
import HabitChanger from "./screens/HabitChanger";
import CharacterSheet from "./screens/CharacterSheet";
import Shop from "./screens/Shop";
import Leaderboard from "./screens/Leaderboard";
import Stats from "./screens/Stats";
import Friends from "./screens/Friends";
import ProgressionPath from "./screens/ProgressionPath";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import VerifyEmail from "./screens/VerifyEmail";
import ClaimUsername from "./screens/ClaimUsername";

type Screen =
  | "dashboard"
  | "quests"
  | "projects"
  | "planner"
  | "habits"
  | "character"
  | "progression"
  | "shop"
  | "leaderboard"
  | "stats"
  | "friends";

interface NavItem {
  id: Screen;
  icon: string;
  label: string;
  group: string;
}

const NAV: NavItem[] = [
  { id: "dashboard", icon: "⌂", label: "Home", group: "forge" },
  { id: "quests", icon: "⚔", label: "Quest Log", group: "forge" },
  { id: "projects", icon: "◈", label: "Projects", group: "forge" },
  { id: "planner", icon: "✦", label: "AI Planner", group: "ai" },
  { id: "habits", icon: "◐", label: "Habit Changer", group: "ai" },
  { id: "character", icon: "◉", label: "Character", group: "you" },
  { id: "progression", icon: "▲", label: "Progression", group: "you" },
  { id: "shop", icon: "☆", label: "Shop", group: "you" },
  { id: "leaderboard", icon: "◎", label: "Leaderboard", group: "world" },
  { id: "friends", icon: "♦", label: "Friends", group: "world" },
  { id: "stats", icon: "▥", label: "Stats", group: "world" },
];

const GROUPS = [
  { id: "forge", label: "Forge" },
  { id: "ai", label: "AI" },
  { id: "you", label: "You" },
  { id: "world", label: "World" },
];

const SCREENS: Record<Screen, React.ReactElement> = {
  dashboard: <Dashboard />,
  quests: <QuestLog />,
  projects: <Projects />,
  planner: <AIPlanner />,
  habits: <HabitChanger />,
  character: <CharacterSheet />,
  progression: <ProgressionPath />,
  shop: <Shop />,
  leaderboard: <Leaderboard />,
  stats: <Stats />,
  friends: <Friends />,
};

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, status, token, needsUsername } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Universal Gaming Environment Background */}
      <GamingBackground />

      <Routes>
        <Route path="/" element={<Landing onStart={() => navigate('/login')} />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/app" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/app" />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Routes */}
        <Route path="/claim-username" element={
          isAuthenticated && needsUsername ? <ClaimUsername /> : <Navigate to="/app" />
        } />

        <Route path="/onboarding" element={
          isAuthenticated ? (needsUsername ? <Navigate to="/claim-username" /> : <Onboarding onComplete={() => navigate('/app')} />) : <Navigate to="/login" />
        } />
        
        <Route path="/app/*" element={
          isAuthenticated ? (needsUsername ? <Navigate to="/claim-username" /> : <AppLayout />) : <Navigate to="/login" />
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function AppLayout() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutLocally());
    navigate('/login');
  };

  return (
    <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-screen">
      {/* Sidebar */}
      <nav className="hidden lg:flex flex-col w-56 flex-shrink-0 py-6 px-3 sticky top-0 h-screen overflow-y-auto"
        style={{
          background: "rgba(13,13,20,0.75)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8 cursor-pointer" onClick={() => setScreen("dashboard")}>
          <div className="w-7 h-7 flex items-center justify-center text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #00f0ff, #ec4899)",
              color: "#0d0d14",
              clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
            }}>
            S
          </div>
          <span className="font-bold text-base tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.06em" }}>
            SOULFORGE
          </span>
        </div>

        {GROUPS.map((group) => {
          const items = NAV.filter((n) => n.group === group.id);
          return (
            <div key={group.id} className="mb-5">
              <p className="text-xs uppercase tracking-widest px-3 mb-2 font-medium"
                style={{ color: "rgba(232,232,240,0.22)", fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.14em" }}>
                {group.label}
              </p>
              {items.map((item) => (
                <NavButton key={item.id} item={item} active={screen === item.id} onClick={() => setScreen(item.id)} />
              ))}
            </div>
          );
        })}

        {/* User mini */}
        <div className="mt-auto px-3 py-3 relative group cursor-pointer" onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}>
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 hex-clip flex items-center justify-center text-base"
              style={{ background: "rgba(0,240,255,0.15)", border: "1px solid rgba(0,240,255,0.2)" }}>
              ⚔️
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[100px]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                {user?.username || user?.name || 'Aiden'}
              </p>
              <p className="text-[10px] group-hover:hidden transition-all" style={{ color: "rgba(232,232,240,0.38)" }}>Journeyman</p>
              <p className="text-[10px] text-red-400 hidden group-hover:block transition-all uppercase tracking-widest">Logout</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-h-screen pb-24 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div key={screen}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}>
            {SCREENS[screen]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30"
        style={{ background: "rgba(13,13,20,0.95)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-around py-2 px-2">
          {NAV.slice(0, 5).map((item) => (
            <button key={item.id} onClick={() => setScreen(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all"
              style={{ color: screen === item.id ? "#00f0ff" : "rgba(232,232,240,0.38)" }}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span style={{ fontSize: 9, fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.04em" }}>{item.label}</span>
            </button>
          ))}
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5"
            style={{ color: "rgba(232,232,240,0.38)" }}>
            <span className="text-lg leading-none">⋯</span>
            <span style={{ fontSize: 9, fontFamily: "Rajdhani, sans-serif" }}>More</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed bottom-16 inset-x-4 z-40 p-4"
            style={{
              background: "rgba(13,13,20,0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}>
            <div className="grid grid-cols-6 gap-2">
              {NAV.slice(5).map((item) => (
                <button key={item.id} onClick={() => { setScreen(item.id); setMobileNavOpen(false); }}
                  className="flex flex-col items-center gap-1 py-2 transition-all"
                  style={{
                    background: screen === item.id ? "rgba(0,240,255,0.1)" : "rgba(255,255,255,0.03)",
                    color: screen === item.id ? "#00f0ff" : "rgba(232,232,240,0.45)",
                    clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                  }}>
                  <span className="text-lg">{item.icon}</span>
                  <span style={{ fontSize: 9, fontFamily: "Rajdhani, sans-serif" }}>{item.label}</span>
                </button>
              ))}
              <button onClick={handleLogout}
                className="flex flex-col items-center gap-1 py-2 transition-all col-span-6 mt-2"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#f87171",
                  clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                }}>
                <span className="text-lg">✖</span>
                <span style={{ fontSize: 9, fontFamily: "Rajdhani, sans-serif" }}>LOGOUT</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 mb-0.5 text-sm transition-all"
      style={{
        background: active ? "rgba(0,240,255,0.08)" : "transparent",
        border: active ? "1px solid rgba(0,240,255,0.14)" : "1px solid transparent",
        color: active ? "#00f0ff" : "rgba(232,232,240,0.45)",
        fontFamily: "Rajdhani, sans-serif",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.04em",
        clipPath: active ? "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" : undefined,
      }}
    >
      <span className="w-5 text-center text-base leading-none"
        style={{ filter: active ? "drop-shadow(0 0 4px rgba(0,240,255,0.6))" : "none" }}>
        {item.icon}
      </span>
      <span className="text-sm">{item.label}</span>
      {(item.id === "planner" || item.id === "habits") && (
        <span className="ml-auto text-xs px-1"
          style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", fontFamily: "Rajdhani, sans-serif" }}>AI</span>
      )}
    </motion.button>
  );
}
