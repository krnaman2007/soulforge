import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import Shop from "./screens/Shop";
import Leaderboard from "./screens/Leaderboard";
import Stats from "./screens/Stats";
import Friends from "./screens/Friends";
import ProgressionPath from "./screens/ProgressionPath";

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
  character: <CharacterSheet />,
  progression: <ProgressionPath />,
  shop: <Shop />,
  leaderboard: <Leaderboard />,
  stats: <Stats />,
  friends: <Friends />,
};

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [screen, setScreen] = useState<ScreenId>("dashboard");

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Universal Gaming Environment Background */}
      <GamingBackground />

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.6 }} className="relative z-10 min-h-screen">
            <Landing onStart={() => setHasStarted(true)} />
          </motion.div>
        ) : !onboarded ? (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }} className="relative z-10 min-h-screen">
            <Onboarding onComplete={() => setOnboarded(true)} />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="relative z-10 flex min-h-screen w-full">

            {/* Desktop Premium Sidebar */}
            <Sidebar 
              currentScreen={screen} 
              setScreen={setScreen} 
              navItems={NAV} 
              groups={GROUPS} 
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
            />

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

