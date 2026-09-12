import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchFollowing, fetchFollowers, followUser, unfollowUser, searchUsers } from "../store/slices/socialSlice";

const FRIENDS_LIST = [
  { name: "Alex Torres", title: "The Hustler", level: 22, streak: 15, avatar: "☄", xp: 48200, online: true, guild: "Shadow Syndicate" },
  { name: "Sarah Chen", title: "Master Architect", level: 31, streak: 42, avatar: "✧", xp: 89000, online: true, guild: "Neon Knights" },
  { name: "Marcus Webb", title: "The Relentless", level: 18, streak: 7, avatar: "⚡", xp: 22400, online: false, guild: "None" },
  { name: "Elena Rostova", title: "Void Walker", level: 45, streak: 120, avatar: "◈", xp: 156000, online: true, guild: "Shadow Syndicate" },
  { name: "James Holden", title: "Journeyman", level: 12, streak: 2, avatar: "⚙", xp: 14200, online: false, guild: "Neon Knights" },
  { name: "Maya Lin", title: "Zen Master", level: 28, streak: 65, avatar: "✿", xp: 76000, online: true, guild: "None" },
];

const SUGGESTIONS = [
  { name: "Morgan Blake", title: "Night Owl", level: 14, avatar: "🌙" },
  { name: "Riley Stone", title: "Forge Born", level: 9, avatar: "🔥" },
];

type View = "following" | "followers" | "add" | "guilds";

function FriendCard({ friend, view }: { friend: any; view?: string }) {
  const [sharing, setSharing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = friend.isOnline !== undefined ? friend.isOnline : friend.online;

  return (
    <div className="relative group preserve-3d">
      <div className="p-4 md:p-5 bg-[rgba(15,15,22,0.6)] backdrop-blur-md border transition-all duration-300 relative z-10"
        style={{
          borderColor: friend.isOnline ? "rgba(16,224,127,0.3)" : "rgba(255,255,255,0.05)",
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          boxShadow: friend.isOnline ? "0 0 20px rgba(16,224,127,0.05)" : "none"
        }}>
        
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 hex-clip flex items-center justify-center text-2xl"
                style={{
                  background: friend.isOnline ? "linear-gradient(135deg, rgba(16,224,127,0.1), rgba(10,10,15,0.9))" : "rgba(255,255,255,0.05)",
                  border: friend.isOnline ? "1px solid rgba(16,224,127,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                {friend.avatarId ? '👤' : (friend.avatar || '☄')}
              </div>
              {friend.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#10e07f] shadow-[0_0_8px_#10e07f] border border-[#0d0d14]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-base md:text-lg uppercase tracking-wide text-white font-['Rajdhani'] truncate">{friend.username || friend.name}</p>
                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] truncate" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>Lv {friend.level}</span>
              </div>
              <p className="text-[10px] md:text-xs text-[rgba(232,232,240,0.5)] font-['Inter'] truncate">{friend.title || 'Novice'} <span className="mx-1">•</span> <span className="text-[#00f0ff]">{friend.guild || 'No Guild'}</span></p>
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs font-black stat-num text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">{(friend.xp || 0).toLocaleString()} XP</span>
                <span className="flex items-center gap-1 text-xs font-black stat-num text-[#ec4899] drop-shadow-[0_0_5px_rgba(236,72,153,0.4)]">
                  <span className="flame-pulse text-[10px]">🔥</span> {friend.currentStreak || friend.streak || 0}d
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 mt-4 sm:mt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.05)] pt-3 sm:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isOnline ? "#10e07f" : "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif" }}>
              {isOnline ? "Online" : "Offline"}
            </span>
            {view === "add" ? (
              <button 
                onClick={() => friend.isFollowing ? dispatch(unfollowUser(friend.id)) : dispatch(followUser(friend.id))}
                className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 font-black uppercase tracking-widest text-xs transition-all relative overflow-hidden group/btn"
                style={{
                  background: friend.isFollowing ? "rgba(255,255,255,0.05)" : "rgba(0,240,255,0.1)",
                  border: `1px solid ${friend.isFollowing ? "rgba(255,255,255,0.1)" : "rgba(0,240,255,0.4)"}`,
                  color: friend.isFollowing ? "rgba(232,232,240,0.5)" : "#00f0ff",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  fontFamily: "Rajdhani, sans-serif"
                }}>
                {friend.isFollowing ? "Unfollow" : "Follow"}
              </button>
            ) : (
              <div className="flex gap-2 mt-4 sm:mt-0">
                <button className="px-4 py-2 font-black uppercase tracking-widest text-xs transition-all bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff] hover:text-[#00f0ff]"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))", fontFamily: "Rajdhani, sans-serif" }}>
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shareable glass card mini (Hidden by default, shown on hover/expand in a real app, keeping it here for aesthetics) */}
        <div className="mt-4 p-3 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] relative"
          style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}>
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#8b5cf6] to-transparent" />
          <div className="flex items-center justify-between mb-2 pl-2">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani']">Recent Activity</span>
          </div>
          <p className="text-xs text-[rgba(232,232,240,0.7)] font-['Inter'] pl-2">
            Completed <span className="text-[#00f0ff] font-bold">"Mastery Challenge: Deep Work"</span> (+300 XP)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Friends() {
  const dispatch = useDispatch<AppDispatch>();
  const { following, followers, searchResults, status } = useSelector((state: RootState) => state.social);
  const authUser = useSelector((state: RootState) => state.auth.user);
  
  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchFollowing({ userId: authUser.id }));
      dispatch(fetchFollowers({ userId: authUser.id }));
    }
  }, [dispatch, authUser]);

  const [view, setView] = useState<View>("following");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState<string[]>([]);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (query) {
      dispatch(searchUsers({ q: query }));
      setView("add");
    }
  };

  const getActiveList = () => {
    if (view === "following") return following.users;
    if (view === "followers") return followers.users;
    if (view === "add") return searchResults.users;
    return [];
  };

  const list = getActiveList();
  const activeList = list.length > 0 ? list : FRIENDS_LIST;

  const filtered = activeList.filter((f: any) =>
    (f.username || f.name).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-5xl mx-auto selection:bg-[#8b5cf6] selection:text-[#0a0a12]">
      {/* Background Environment */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        <div className="absolute top-0 w-full h-[30vh] bg-gradient-to-b from-[rgba(139,92,246,0.05)] to-transparent" />
      </div>

      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 flex justify-center md:justify-start items-center gap-4">
            <span className="w-8 h-px bg-[#8b5cf6]" />
            Guild Interface
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8b5cf6]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Alliances
          </h1>
        </div>
        <p className="text-xs text-[rgba(232,232,240,0.5)] max-w-sm md:text-right font-['Inter']">
          Track your allies' forge progress, form parties for multiplayer quests, and maintain accountability.
        </p>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["following", "followers", "add", "guilds"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all font-['Rajdhani'] ${
              view === v
                ? "bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                : "bg-[rgba(255,255,255,0.03)] text-[rgba(232,232,240,0.6)] hover:bg-[rgba(255,255,255,0.06)]"
            }`}
            style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Friends List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[rgba(232,232,240,0.3)] group-focus-within:text-[#8b5cf6] transition-colors">
              ⌕
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH ALLIES BY NAME OR ID..."
              className="w-full pl-10 pr-4 py-3 bg-[rgba(15,15,22,0.6)] border border-[rgba(255,255,255,0.05)] text-sm outline-none transition-all focus:border-[rgba(139,92,246,0.5)] focus:bg-[rgba(139,92,246,0.05)] text-white font-['Rajdhani'] font-bold tracking-widest placeholder-[rgba(255,255,255,0.2)]"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
            />
          </form>

          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">
                Active Roster <span className="text-[rgba(232,232,240,0.3)]">({filtered.length})</span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((f: any, i: number) => (
                  <motion.div
                    key={f.id || f.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                  >
                    <FriendCard friend={f} view={view} />
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}>
                    <p className="text-xs uppercase font-bold tracking-widest text-[rgba(232,232,240,0.3)] font-['Rajdhani']">No allies found matching query.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Party Status */}
          <div className="p-6 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)]" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5cf6] font-['Rajdhani'] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse" /> Party Status
            </h2>
            <div className="text-center py-6 border border-dashed border-[rgba(139,92,246,0.3)] bg-[rgba(0,0,0,0.2)]">
               <p className="text-xs font-bold text-[rgba(232,232,240,0.5)] font-['Inter'] mb-3">You are currently solo.</p>
               <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-colors font-['Rajdhani']"
                style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}>
                 Create Party
               </button>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">Suggested Allies</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>
            
            <div className="space-y-3">
              {SUGGESTIONS.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                  className="p-3 md:p-4 bg-[rgba(20,20,30,0.4)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-colors"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 hex-clip flex items-center justify-center text-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm uppercase tracking-wide truncate font-['Rajdhani'] text-white">{s.name}</p>
                      <p className="text-[10px] text-[rgba(232,232,240,0.5)] truncate font-['Inter']">Lv {s.level} · {s.title}</p>
                    </div>
                    <button
                      onClick={() => setAdded((prev) => [...prev, s.name])}
                      disabled={added.includes(s.name)}
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all disabled:opacity-50 flex-shrink-0 font-['Rajdhani']"
                      style={{
                        background: added.includes(s.name) ? "rgba(16,224,127,0.1)" : "rgba(0,240,255,0.1)",
                        border: `1px solid ${added.includes(s.name) ? "rgba(16,224,127,0.3)" : "rgba(0,240,255,0.3)"}`,
                        color: added.includes(s.name) ? "#10e07f" : "#00f0ff",
                        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)"
                      }}
                    >
                      {added.includes(s.name) ? "Request Sent" : "Add Ally"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
