import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavItem, NavGroup, ScreenId } from "./Sidebar";

interface MobileNavProps {
  currentScreen: ScreenId;
  setScreen: (id: ScreenId) => void;
  navItems: NavItem[];
  onLogout?: () => void;
}

export default function MobileNav({ currentScreen, setScreen, navItems, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Take the first 4 for the main bar, reserve the 5th spot for "More"
  const topItems = navItems.slice(0, 4);
  const overflowItems = navItems.slice(4);

  return (
    <>
      {/* Overflow Menu (More) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="lg:hidden fixed bottom-24 inset-x-4 z-40 p-4"
            style={{
              background: "rgba(10,10,15,0.95)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(0,240,255,0.2)",
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,240,255,0.15)",
            }}
          >
            <div className="grid grid-cols-4 gap-3">
              {overflowItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setScreen(item.id);
                    setIsOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 py-3 relative group"
                  style={{
                    background: currentScreen === item.id ? "rgba(0,240,255,0.1)" : "rgba(255,255,255,0.03)",
                    color: currentScreen === item.id ? "#00f0ff" : "rgba(232,232,240,0.5)",
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    border: currentScreen === item.id ? "1px solid rgba(0,240,255,0.3)" : "1px solid transparent",
                  }}
                >
                  {/* Glowing active state */}
                  {currentScreen === item.id && (
                    <motion.div layoutId="mobileNavActiveOverflow" className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.15),transparent)] pointer-events-none" />
                  )}

                  <span className="text-xl" style={{ filter: currentScreen === item.id ? "drop-shadow(0 0 8px rgba(0,240,255,0.8))" : "none", color: currentScreen === item.id ? "#fff" : "inherit" }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "Rajdhani, sans-serif", fontWeight: currentScreen === item.id ? 700 : 500 }}>
                    {item.label}
                  </span>
                </button>
              ))}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 py-3 relative group col-span-4 mt-2"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <span className="text-xl">✖</span>
                  <span style={{ fontSize: 10, fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>LOGOUT</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom HUD */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-50">
        <div 
          className="flex items-center justify-between p-2 relative overflow-hidden"
          style={{ 
            background: "rgba(10,10,15,0.85)", 
            backdropFilter: "blur(32px)", 
            border: "1px solid rgba(0,240,255,0.15)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.8), 0 0 15px rgba(0,240,255,0.1)",
            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
          }}
        >
          {/* Subtle ambient light from the bottom */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[20px] bg-[#00f0ff] blur-[20px] opacity-20 pointer-events-none" />

          {topItems.map((item) => (
            <MobileNavButton 
              key={item.id} 
              item={item} 
              active={currentScreen === item.id} 
              onClick={() => { setScreen(item.id); setIsOpen(false); }} 
            />
          ))}

          {/* "More" Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 flex flex-col items-center gap-1 py-2 relative transition-all"
            style={{ color: isOpen ? "#00f0ff" : "rgba(232,232,240,0.5)" }}
          >
            {isOpen && (
              <motion.div layoutId="mobileNavActiveIndicator" className="absolute top-0 w-8 h-[2px] bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
            )}
            <span className="text-2xl leading-none transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', filter: isOpen ? "drop-shadow(0 0 8px rgba(0,240,255,0.8))" : "none" }}>⋯</span>
            <span style={{ fontSize: 10, fontFamily: "Rajdhani, sans-serif", fontWeight: isOpen ? 700 : 500 }}>More</span>
          </button>
        </div>
      </div>
    </>
  );
}

function MobileNavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-2 relative transition-all"
      style={{ color: active ? "#00f0ff" : "rgba(232,232,240,0.5)" }}
    >
      {/* Top Active Indicator */}
      {active && (
        <motion.div
          layoutId="mobileNavActiveIndicator"
          className="absolute top-0 w-8 h-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]"
        />
      )}

      <motion.span 
        className="text-xl leading-none"
        animate={{ scale: active ? 1.15 : 1, y: active ? -2 : 0 }}
        style={{ 
          filter: active ? "drop-shadow(0 0 8px rgba(0,240,255,0.8))" : "none",
          color: active ? "#fff" : "inherit"
        }}
      >
        {item.icon}
      </motion.span>
      <span style={{ 
        fontSize: 10, 
        fontFamily: "Rajdhani, sans-serif", 
        fontWeight: active ? 700 : 500,
        letterSpacing: "0.05em"
      }}>
        {item.label}
      </span>
    </button>
  );
}
