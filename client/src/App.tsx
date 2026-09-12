import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { fetchCurrentUser, logoutLocally } from "./store/slices/authSlice";

import GamingBackground from "./components/GamingBackground";
import Sidebar, { ScreenId, NavItem, NavGroup } from "./components/Sidebar";
import MobileNav from "./components/MobileNav";

import Landing from "./screens/Landing";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import QuestLog from "./screens/QuestLog";
import Projects from "./screens/Projects";
import AIPlanner from "./screens/AIPlanner";
import HabitChanger from "./screens/HabitChanger";
import CharacterSheet from "./screens/CharacterSheet";
import Profile from "./screens/Profile";
import Shop from "./screens/Shop";
import Leaderboard from "./screens/Leaderboard";
import Stats from "./screens/Stats";
import Friends from "./screens/Friends";
import ProgressionPath from "./screens/ProgressionPath";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import VerifyEmail from "./screens/VerifyEmail";
import ClaimUsername from "./screens/ClaimUsername";

const NAV: NavItem[] = [
  { id: "dashboard", icon: "⌂", label: "Home", group: "forge" },
  { id: "quests", icon: "⚔", label: "Quest Log", group: "forge" },
  { id: "projects", icon: "◈", label: "Projects", group: "forge" },
  { id: "planner", icon: "✦", label: "AI Planner", group: "ai" },
  { id: "habits", icon: "◐", label: "Habit Changer", group: "ai" },
  { id: "profile", icon: "◎", label: "Profile", group: "you" },
  { id: "character", icon: "◉", label: "Character", group: "you" },
  { id: "progression", icon: "▲", label: "Progression", group: "you" },
  { id: "shop", icon: "☆", label: "Shop", group: "you" },
  { id: "leaderboard", icon: "◎", label: "Leaderboard", group: "world" },
  { id: "friends", icon: "♦", label: "Friends", group: "world" },
  { id: "stats", icon: "▥", label: "Stats", group: "world" },
];

const GROUPS: NavGroup[] = [
  { id: "forge", label: "Forge" },
  { id: "ai", label: "AI" },
  { id: "you", label: "You" },
  { id: "world", label: "World" },
];

const SCREENS: Record<ScreenId, React.ReactElement> = {
  dashboard: <Dashboard />,
  quests: <QuestLog />,
  projects: <Projects />,
  planner: <AIPlanner />,
  habits: <HabitChanger />,
  profile: <Profile />,
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
  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleNavEvent = (e: CustomEvent<ScreenId>) => {
      if (e.detail && SCREENS[e.detail]) {
        setScreen(e.detail);
      }
    };
    window.addEventListener("soulforge:navigate" as any, handleNavEvent as any);
    return () => window.removeEventListener("soulforge:navigate" as any, handleNavEvent as any);
  }, []);

  const handleLogout = () => {
    dispatch(logoutLocally());
    navigate('/login');
  };

  return (
    <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-screen w-full">
      {/* Desktop Premium Sidebar */}
      <Sidebar 
        currentScreen={screen} 
        setScreen={setScreen} 
        navItems={NAV} 
        groups={GROUPS}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen pb-28 lg:pb-8 w-full max-w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={screen}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full"
          >
            {SCREENS[screen]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Premium HUD Nav */}
      <MobileNav 
        currentScreen={screen} 
        setScreen={setScreen} 
        navItems={NAV}
        onLogout={handleLogout}
      />
    </motion.div>
  );
}
