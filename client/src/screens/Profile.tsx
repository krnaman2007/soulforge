import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { logoutUser, logoutLocally } from "../store/slices/authSlice";
import { fetchPublicProfile } from "../store/slices/socialSlice";
import { fetchActivityStats } from "../store/slices/activitySlice";
import { getLevelProgress } from "../utils/rpg";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const character = useSelector((state: RootState) => state.auth.character);
  const profile = useSelector((state: RootState) => state.social.publicProfile);
  const stats = useSelector((state: RootState) => state.activity.stats);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPublicProfile(user.id));
      dispatch(fetchActivityStats("all"));
    }
  }, [dispatch, user?.id]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
    } finally {
      dispatch(logoutLocally());
      navigate("/login");
    }
  };

  const name = profile?.username || user?.username || user?.name || "Adventurer";
  const title = character?.titleId?.replace(/^title_/, "").replace(/_/g, " ").toUpperCase() || "APPRENTICE";
  const level = character?.level || 1;
  const xp = character?.xp || 0;
  const progress = getLevelProgress(level, xp);

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-5xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Top Header & Logout Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            Player Identity & Neural Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white font-['Rajdhani']">
            Player Profile
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(239,68,68,0.08)] border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-wider font-['Rajdhani']"
            style={{
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Identity & Vitality */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 p-6 md:p-8 bg-[rgba(15,15,22,0.85)] border border-[rgba(0,240,255,0.2)] backdrop-blur-xl relative"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
          }}
        >
          <div className="flex items-center gap-5">
            {/* Hexagonal Hero Crest (Zero Emojis) */}
            <div
              className="w-24 h-24 flex items-center justify-center bg-[rgba(0,240,255,0.08)] border-2 border-[#00f0ff]/50 relative group flex-shrink-0 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <svg className="w-12 h-12 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-2xl font-black uppercase text-white truncate font-['Rajdhani'] tracking-wider">
                {name}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[10px] font-black uppercase tracking-widest text-[#00f0ff] font-['Rajdhani']">
                {title}
              </div>
              <p className="text-xs text-white/50 mt-2 font-mono">
                Level {level} · Tier {Math.min(10, Math.floor(level / 10) + 1)} · {profile?.rankTitle || "Iron"}
              </p>
            </div>
          </div>

          {/* Progression Quick Bar */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex justify-between text-[11px] font-mono mb-1.5">
              <span className="text-white/60">XP PROGRESS</span>
              <span className="text-[#00f0ff]">{progress.currentXP} / {progress.requiredXP} ({Math.round(progress.percentage)}%)</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff]/60 to-[#00f0ff] transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Stat label="Lifetime XP" value={progress.totalXP.toLocaleString()} />
            <Stat label="Current Streak" value={`${profile?.currentStreak ?? character?.currentStreak ?? 0} Days`} />
            <Stat label="Gold Reserve" value={`${character?.coins ?? 0} G`} color="#f59e0b" />
            <Stat label="Longest Streak" value={`${character?.longestStreak ?? 0} Days`} />
          </div>
        </motion.section>

        {/* Right Column: Forge Record & Account Settings */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-7 p-6 md:p-8 bg-[rgba(15,15,22,0.85)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl flex flex-col justify-between"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
          }}
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">
                Operational Telemetry
              </h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Tasks Completed" value={String(stats?.tasksCompleted ?? 0)} />
              <Stat label="Campaigns" value={String(stats?.questsCompleted ?? 0)} />
              <Stat label="XP Earned" value={(stats?.totalXP ?? 0).toLocaleString()} />
              <Stat label="Coins Looted" value={(stats?.totalCoins ?? 0).toLocaleString()} />
            </div>

            {/* Account Status Card */}
            <div className="mt-8 p-5 border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.02)] relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff] font-black font-['Rajdhani']">
                    Network Authentication Status
                  </p>
                  <p className="text-xs text-white/80 mt-1.5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user?.isVerified ? "bg-[#10e07f]" : "bg-yellow-400"}`} />
                    {user?.isVerified ? "Verified Neural Link" : "Email Verification Pending"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Email Designation</span>
                  <span className="text-xs font-mono text-white/70">{user?.email || "—"}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                <span>Account Created: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</span>
                <span>Timezone: {user?.timezone || "UTC"}</span>
              </div>
            </div>
          </div>

          {/* Session Management Area */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              Terminating your session clears active authorization tokens and disconnects your neural uplink from this device.
            </p>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-red-500/10 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-400 transition-all font-black text-xs uppercase tracking-widest font-['Rajdhani'] shrink-0"
              style={{
                clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)"
              }}
            >
              Sign Out / Disconnect
            </button>
          </div>
        </motion.section>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[rgba(12,12,18,0.95)] border border-red-500/40 p-6 md:p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
              }}
            >
              <div className="flex items-center gap-3 text-red-400 mb-4 font-['Rajdhani']">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-black uppercase tracking-wider">Confirm Disconnect</h3>
              </div>

              <p className="text-xs text-white/70 leading-relaxed mb-6 font-['Inter']">
                Are you sure you want to terminate this neural session? You will be returned to the authentication portal and must provide credentials to reconnect.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={isLoggingOut}
                  className="py-3 px-4 border border-white/20 text-white/70 hover:text-white hover:border-white/40 uppercase font-black text-xs tracking-wider transition-all font-['Rajdhani']"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white uppercase font-black text-xs tracking-wider transition-all font-['Rajdhani'] shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50"
                >
                  {isLoggingOut ? "Disconnecting..." : "Confirm Logout"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, color = "#00f0ff" }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4 border border-white/10 bg-white/[0.02] relative group hover:border-[#00f0ff]/30 transition-all">
      <p className="text-[9px] uppercase tracking-widest text-white/40 font-['Rajdhani'] font-bold">{label}</p>
      <p className="text-xl font-black mt-1 font-['Rajdhani']" style={{ color }}>{value}</p>
    </div>
  );
}
