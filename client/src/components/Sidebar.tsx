import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ScreenId = string;

export interface NavItem {
  id: ScreenId;
  icon: string;
  label: string;
  group: string;
}

export interface NavGroup {
  id: string;
  label: string;
}

interface SidebarProps {
  currentScreen: ScreenId;
  setScreen: (id: ScreenId) => void;
  navItems: NavItem[];
  groups: NavGroup[];
  user?: any;
  onLogout?: () => void;
}

const MIN_WIDTH = 220;
const MAX_WIDTH = 450;
const COLLAPSED_WIDTH = 72;

export default function Sidebar({ currentScreen, setScreen, navItems, groups, user, onLogout }: SidebarProps) {
  const [width, setWidth] = useState(260);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebarWidth");
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedWidth) setWidth(Number(savedWidth));
    if (savedCollapsed) setIsCollapsed(savedCollapsed === "true");
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      
      // Auto-collapse logic
      if (newWidth < MIN_WIDTH - 40) {
        setIsCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
        return;
      } else {
        if (isCollapsed && newWidth > COLLAPSED_WIDTH + 20) {
          setIsCollapsed(false);
          localStorage.setItem("sidebarCollapsed", "false");
        }
      }

      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
        localStorage.setItem("sidebarWidth", newWidth.toString());
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const actualWidth = isCollapsed ? COLLAPSED_WIDTH : width;

  return (
    <motion.nav
      ref={sidebarRef}
      initial={false}
      animate={{ width: actualWidth }}
      transition={{ type: isResizing ? "tween" : "spring", duration: isResizing ? 0 : 0.4, bounce: 0 }}
      className="hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen z-40 relative group/sidebar"
      style={{
        background: "rgba(10,10,15,0.75)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "10px 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Content Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pt-6 pb-4">
        
        {/* Header / Brand */}
        <div className={`flex items-center gap-3 px-4 mb-8 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-8 h-8 flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #00f0ff, #ec4899)",
              color: "#05050A",
              clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
              boxShadow: "0 0 20px rgba(0,240,255,0.4)"
            }}>
            S
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, width: 0 }}
                className="font-black text-lg tracking-widest whitespace-nowrap"
                style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.15em", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}
              >
                SOULFORGE
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1">
          {groups.map((group) => {
            const items = navItems.filter((n) => n.group === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id} className="mb-6">
                {!isCollapsed ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] uppercase font-bold px-5 mb-2 flex items-center gap-2"
                    style={{ color: "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.2em" }}
                  >
                    <span className="w-2 h-px bg-[rgba(232,232,240,0.2)]" />
                    {group.label}
                  </motion.p>
                ) : (
                   <div className="h-px w-6 mx-auto bg-[rgba(255,255,255,0.05)] mb-3 mt-4" />
                )}
                
                <div className="px-2 space-y-1">
                  {items.map((item) => (
                    <NavButton 
                      key={item.id} 
                      item={item} 
                      active={currentScreen === item.id} 
                      onClick={() => setScreen(item.id)} 
                      isCollapsed={isCollapsed} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / User Profile */}
        <div className="mt-auto px-3">
          <div className="relative overflow-hidden group/user"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              clipPath: isCollapsed ? "circle(50% at 50% 50%)" : "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              padding: isCollapsed ? "12px" : "12px 14px",
              transition: "all 0.3s ease"
            }}>
            
            {/* Hover glow */}
            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover/user:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className={`flex items-center gap-3 relative z-10 ${isCollapsed ? 'justify-center' : ''}`}>
              <button 
                onClick={() => setScreen("profile")}
                title="View Profile"
                className="w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:scale-105 transition-transform"
                style={{ 
                  background: "rgba(0,240,255,0.1)", 
                  border: "1px solid rgba(0,240,255,0.4)",
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                }}>
                <svg className="w-4 h-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </button>
              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setScreen("profile")}>
                    <p className="text-sm font-black truncate text-white hover:text-[#00f0ff] transition-colors" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      {user?.username || user?.name || 'Aiden'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest truncate text-[rgba(0,240,255,0.7)]">View Profile</p>
                  </div>
                  {onLogout && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogout();
                      }}
                      title="Terminate Session (Logout)"
                      className="p-1.5 rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-50 group/handle flex items-center justify-center"
      >
        {/* Subtle accent line on hover/active */}
        <div className={`w-0.5 h-full transition-all duration-300 ${isResizing ? 'bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]' : 'bg-transparent group-hover/handle:bg-[rgba(0,240,255,0.3)]'}`} />
      </div>

      {/* Collapse Toggle Button (Floating) */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-12 w-6 h-6 rounded-full flex items-center justify-center z-50 bg-[#05050A] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-[#00f0ff] hover:border-[#00f0ff] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
      >
        <span className="text-xs">{isCollapsed ? "❯" : "❮"}</span>
      </button>

    </motion.nav>
  );
}

function NavButton({ item, active, onClick, isCollapsed }: { item: NavItem; active: boolean; onClick: () => void; isCollapsed: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full relative flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : ''}`}
      style={{
        background: active ? "rgba(0,240,255,0.06)" : "transparent",
        color: active ? "#00f0ff" : "rgba(232,232,240,0.5)",
        fontFamily: "Rajdhani, sans-serif",
        fontWeight: active ? 700 : 500,
        letterSpacing: "0.06em",
        clipPath: active && !isCollapsed ? "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" : undefined,
      }}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active side indicator */}
      {active && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f0ff] shadow-[0_0_15px_#00f0ff]"
        />
      )}

      {/* Hover Background */}
      {!active && (
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.03)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" 
             style={{ clipPath: !isCollapsed ? "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" : undefined }}
        />
      )}

      {/* Icon */}
      <span className="w-6 flex justify-center text-lg leading-none transition-transform duration-300 group-hover:scale-110"
        style={{ 
          filter: active ? "drop-shadow(0 0 8px rgba(0,240,255,0.8))" : "none",
          color: active ? "#fff" : "inherit"
        }}>
        {item.icon}
      </span>

      {/* Label */}
      {!isCollapsed && (
        <>
          <span className="text-[15px] whitespace-nowrap">{item.label}</span>
          
          {/* AI Badge */}
          {(item.id === "planner" || item.id === "habits") && (
            <span className="ml-auto text-[9px] uppercase font-black px-1.5 py-0.5 border"
              style={{ 
                background: "rgba(139,92,246,0.15)", 
                color: "#8b5cf6",
                borderColor: "rgba(139,92,246,0.3)",
                boxShadow: "0 0 10px rgba(139,92,246,0.2)" 
              }}>
              AI
            </span>
          )}
        </>
      )}
    </button>
  );
}
