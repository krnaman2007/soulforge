import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

const FRIENDS_LIST = [
  { name: "Alex Torres", title: "The Hustler", level: 22, streak: 15, avatar: "☄", xp: 48200, online: true, guild: "Shadow Syndicate" },
  { name: "Jamie Liu", title: "Builder", level: 18, streak: 9, avatar: "🛠", xp: 34600, online: true, guild: "Iron Hands" },
  { name: "Sam Rivera", title: "Explorer", level: 5, streak: 3, avatar: "🗺", xp: 1840, online: false, guild: "None" },
  { name: "Casey Park", title: "The Spark", level: 11, streak: 6, avatar: "⚡", xp: 18400, online: false, guild: "Storm Weavers" },
];

const SUGGESTIONS = [
  { name: "Morgan Blake", title: "Night Owl", level: 14, avatar: "🌙" },
  { name: "Riley Stone", title: "Forge Born", level: 9, avatar: "🔥" },
];

function FriendCard({ friend }: { friend: typeof FRIENDS_LIST[0] }) {
  const [sharing, setSharing] = useState(false);

  return (
    <div className="relative group preserve-3d">
      <div className="p-4 md:p-5 bg-[rgba(15,15,22,0.6)] backdrop-blur-md border transition-all duration-300 relative z-10"
        style={{
          borderColor: friend.online ? "rgba(16,224,127,0.3)" : "rgba(255,255,255,0.05)",
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          boxShadow: friend.online ? "0 0 20px rgba(16,224,127,0.05)" : "none"
        }}>
        
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 hex-clip flex items-center justify-center text-2xl"
                style={{
                  background: friend.online ? "linear-gradient(135deg, rgba(16,224,127,0.1), rgba(10,10,15,0.9))" : "rgba(255,255,255,0.05)",
                  border: friend.online ? "1px solid rgba(16,224,127,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                {friend.avatar}
              </div>
              {friend.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#10e07f] shadow-[0_0_8px_#10e07f] border border-[#0d0d14]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-base md:text-lg uppercase tracking-wide text-white font-['Rajdhani'] truncate">{friend.name}</p>
                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] truncate" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>Lv {friend.level}</span>
              </div>
              <p className="text-[10px] md:text-xs text-[rgba(232,232,240,0.5)] font-['Inter'] truncate">{friend.title} <span className="mx-1">•</span> <span className="text-[#00f0ff]">{friend.guild}</span></p>
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs font-black stat-num text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">{friend.xp.toLocaleString()} XP</span>
                <span className="flex items-center gap-1 text-xs font-black stat-num text-[#ec4899] drop-shadow-[0_0_5px_rgba(236,72,153,0.4)]">
                  <span className="flame-pulse text-[10px]">🔥</span> {friend.streak}d
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 mt-4 sm:mt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.05)] pt-3 sm:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: friend.online ? "#10e07f" : "rgba(232,232,240,0.3)", fontFamily: "Rajdhani, sans-serif" }}>
              {friend.online ? "Online" : "Offline"}
            </span>
            <button
              onClick={() => { setSharing(true); setTimeout(() => setSharing(false), 2000); }}
              className="text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 transition-all flex-shrink-0 font-['Rajdhani']"
              style={{
                background: sharing ? "rgba(16,224,127,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${sharing ? "rgba(16,224,127,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: sharing ? "#10e07f" : "white",
                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
              }}
            >
              {sharing ? "Party Invite Sent" : "Invite to Party"}
            </button>
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
  const { user } = useSelector((state: any) => state.auth);
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [added, setAdded] = useState<string[]>([]);
  
  // Use debounced search for API calls if needed, but for now just fetch on load and filter locally if search is empty, or search API if not empty.
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (search.length > 2) {
      handleSearch(search);
    } else {
      // Revert suggestions to default when search is cleared
      fetchData();
    }
  }, [search]);

  const fetchData = async () => {
    try {
      const [followingRes, searchRes] = await Promise.all([
        api.get(`/social/${user.id}/following`),
        api.get(`/social/search`)
      ]);
      
      if (followingRes.data?.success) {
        setFriends(formatUsers(followingRes.data.data.users));
      }
      
      if (searchRes.data?.success) {
        // Filter out already following
        const allUsers = searchRes.data.data.users;
        const followingIds = followingRes.data?.data?.users?.map((u:any) => u.id) || [];
        const notFollowing = allUsers.filter((u:any) => u.id !== user.id && !followingIds.includes(u.id));
        setSuggestions(formatUsers(notFollowing).slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const res = await api.get(`/social/search?q=${query}`);
      if (res.data?.success) {
        const followingIds = friends.map((u:any) => u.id);
        const searchResults = res.data.data.users.filter((u:any) => u.id !== user.id && !followingIds.includes(u.id));
        setSuggestions(formatUsers(searchResults).slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatUsers = (users: any[]) => {
    return users.map(u => {
      const emojiMatch = u.avatarId ? u.avatarId.match(/[\p{Emoji}]/u) : null;
      return {
        id: u.id,
        name: u.username || u.name,
        title: u.titleId || "Apprentice",
        level: u.level || 1,
        streak: u.currentStreak || 0,
        avatar: emojiMatch ? emojiMatch[0] : "👤",
        xp: u.xp || 0,
        online: true,
        guild: "None"
      };
    });
  };

  const handleAddAlly = async (targetId: string, name: string) => {
    try {
      setAdded((prev) => [...prev, name]);
      await api.post(`/social/${targetId}/follow`);
      // Refresh friends list
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Friends List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Search */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[rgba(232,232,240,0.3)] group-focus-within:text-[#8b5cf6] transition-colors">
              ⌕
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH ALLIES BY NAME OR ID..."
              className="w-full pl-10 pr-4 py-3 bg-[rgba(15,15,22,0.6)] border border-[rgba(255,255,255,0.05)] text-sm outline-none transition-all focus:border-[rgba(139,92,246,0.5)] focus:bg-[rgba(139,92,246,0.05)] text-white font-['Rajdhani'] font-bold tracking-widest placeholder-[rgba(255,255,255,0.2)]"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
            />
          </div>

          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">
                Active Roster <span className="text-[rgba(232,232,240,0.3)]">({filtered.length})</span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                  >
                    <FriendCard friend={f} />
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
              {suggestions.map((s, i) => (
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
                      onClick={() => handleAddAlly(s.id, s.name)}
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
