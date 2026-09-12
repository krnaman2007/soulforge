import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchFollowing, fetchFollowers, followUser, unfollowUser, searchUsers, fetchPublicProfile, clearPublicProfile } from "../store/slices/socialSlice";

type View = "following" | "followers" | "add";

function FriendCard({ friend, view, onSocialChange }: { friend: any; view?: string; onSocialChange?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = friend.isOnline !== undefined ? friend.isOnline : friend.online;
  const [isFollowingLocal, setIsFollowingLocal] = useState(friend.isFollowing);

  useEffect(() => {
    setIsFollowingLocal(friend.isFollowing);
  }, [friend.isFollowing]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowingLocal) {
        setIsFollowingLocal(false);
        await dispatch(unfollowUser(friend.id)).unwrap();
      } else {
        setIsFollowingLocal(true);
        await dispatch(followUser(friend.id)).unwrap();
      }
      onSocialChange?.();
    } catch (err) {
      // Revert optimistic update on failure
      setIsFollowingLocal(!isFollowingLocal);
    }
  };

  return (
    <div className="relative group preserve-3d">
      <div className="p-4 md:p-5 bg-[rgba(15,15,22,0.6)] backdrop-blur-md border transition-all duration-300 relative z-10"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          boxShadow: "none"
        }}>
        
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 hex-clip flex items-center justify-center text-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                {friend.avatarId ? '👤' : (friend.avatar || '☄')}
              </div>

            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-base md:text-lg uppercase tracking-wide text-white font-['Rajdhani'] truncate">{friend.username || friend.name}</p>
                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] truncate" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>Lv {friend.level}</span>
              </div>
              <p className="text-[10px] md:text-xs text-[rgba(232,232,240,0.5)] font-['Inter'] truncate">{friend.rankTitle || friend.titleId?.replace('title_', '').toUpperCase() || 'Novice'}</p>
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs font-black stat-num text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">{(friend.xp || 0).toLocaleString()} XP</span>
                <span className="flex items-center gap-1 text-xs font-black stat-num text-[#ec4899] drop-shadow-[0_0_5px_rgba(236,72,153,0.4)]">
                  <span className="flame-pulse text-[10px]">🔥</span> {friend.currentStreak || friend.streak || 0}d
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 mt-4 sm:mt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.05)] pt-3 sm:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgba(232,232,240,0.3)]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Level {friend.level || 1}
            </span>
            {view === "add" ? (
              <button 
                onClick={handleFollowToggle}
                className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 font-black uppercase tracking-widest text-xs transition-all relative overflow-hidden group/btn"
                style={{
                  background: isFollowingLocal ? "rgba(255,255,255,0.05)" : "rgba(0,240,255,0.1)",
                  border: `1px solid ${isFollowingLocal ? "rgba(255,255,255,0.1)" : "rgba(0,240,255,0.4)"}`,
                  color: isFollowingLocal ? "rgba(232,232,240,0.5)" : "#00f0ff",
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  fontFamily: "Rajdhani, sans-serif"
                }}>
                {isFollowingLocal ? "Unfollow" : "Follow"}
              </button>
            ) : (
              <div className="flex gap-2 mt-4 sm:mt-0">
                <button onClick={() => dispatch(fetchPublicProfile(friend.id))} className="px-4 py-2 font-black uppercase tracking-widest text-xs transition-all bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff] hover:text-[#00f0ff]"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))", fontFamily: "Rajdhani, sans-serif" }}>
                  View Profile
                </button>
                <button 
                  onClick={handleFollowToggle}
                  className="px-4 py-2 font-black uppercase tracking-widest text-xs transition-all bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[#ef4444] hover:text-[#ef4444]"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))", fontFamily: "Rajdhani, sans-serif" }}>
                  {isFollowingLocal ? "Unfollow" : "Follow"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}

export default function Friends() {
  const dispatch = useDispatch<AppDispatch>();
  const { following, followers, searchResults, publicProfile, status } = useSelector((state: RootState) => state.social);
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        dispatch(searchUsers({ q: query }));
        setView("add");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      dispatch(searchUsers({ q: query }));
      setView("add");
    }
  };

  const getActiveList = () => {
    if (view === "following") return following.users;
    if (view === "followers") return followers.users;
    if (view === "add") return searchResults.users;
    if (view === "guilds") return [];
    return [];
  };

  const list = getActiveList();
  const activeList = list;

  const filtered = view === "add" 
    ? activeList // Backend already filters search results
    : activeList.filter((f: any) => {
        const usernameMatch = f.username?.toLowerCase().includes(query.toLowerCase());
        const nameMatch = f.name?.toLowerCase().includes(query.toLowerCase());
        return usernameMatch || nameMatch;
      });

  const dynamicSuggestions = useMemo(() => {
    return followers.users.filter(f => !f.isFollowing).slice(0, 5);
  }, [followers.users]);

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
          Track your allies' forge progress and maintain accountability through real social connections.
        </p>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["following", "followers", "add"] as View[]).map((v) => (
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
              {status === 'loading' && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}>
                  <div className="w-12 h-12 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[#8b5cf6] font-['Rajdhani'] font-black tracking-widest uppercase">Loading Allies...</p>
                </div>
              )}

              {status !== 'loading' && (
                <AnimatePresence>
                  {filtered.map((f: any, i: number) => (
                    <motion.div
                      key={f.id || f.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, type: "spring" }}
                    >
                      <FriendCard friend={f} view={view} onSocialChange={() => { if (authUser?.id) { dispatch(fetchFollowing({ userId: authUser.id })); dispatch(fetchFollowers({ userId: authUser.id })); } }} />
                    </motion.div>
                  ))}
                  {filtered.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)" }}>
                      <p className="text-xs uppercase font-bold tracking-widest text-[rgba(232,232,240,0.3)] font-['Rajdhani']">
                        {query ? "No allies found matching query." : `No allies found in ${view}.`}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          

          {/* Suggestions */}
          {dynamicSuggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">Suggested Allies</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
              </div>
              
              <div className="space-y-3">
                {dynamicSuggestions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                    className="p-3 md:p-4 bg-[rgba(20,20,30,0.4)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-colors"
                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 hex-clip flex items-center justify-center text-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                        {s.avatarId === 'avatar_starter' || !s.avatarId ? '👤' : s.avatarId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm uppercase tracking-wide truncate font-['Rajdhani'] text-white">{s.username || s.name}</p>
                        <p className="text-[10px] text-[rgba(232,232,240,0.5)] truncate font-['Inter']">Lv {s.level} · {s.rankTitle || 'Novice'}</p>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(followUser(s.id));
                          setAdded((prev) => [...prev, s.id]);
                        }}
                        disabled={added.includes(s.id) || s.isFollowing}
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all disabled:opacity-50 flex-shrink-0 font-['Rajdhani']"
                        style={{
                          background: (added.includes(s.id) || s.isFollowing) ? "rgba(16,224,127,0.1)" : "rgba(0,240,255,0.1)",
                          border: `1px solid ${(added.includes(s.id) || s.isFollowing) ? "rgba(16,224,127,0.3)" : "rgba(0,240,255,0.3)"}`,
                          color: (added.includes(s.id) || s.isFollowing) ? "#10e07f" : "#00f0ff",
                          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)"
                        }}
                      >
                        {(added.includes(s.id) || s.isFollowing) ? "Followed" : "Add Ally"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {publicProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => dispatch(clearPublicProfile())}>
          <div className="w-full max-w-lg p-6 bg-[#0f0f16] border border-[rgba(0,240,255,0.25)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#00f0ff] font-black">Public Profile</p>
                <h2 className="text-3xl font-black uppercase text-white font-['Rajdhani'] mt-2">{publicProfile.username || publicProfile.name}</h2>
                <p className="text-xs text-white/50 mt-1">{publicProfile.name}</p>
              </div>
              <button onClick={() => dispatch(clearPublicProfile())} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 border border-white/10"><p className="text-[9px] text-white/40 uppercase">Level</p><p className="text-xl text-[#00f0ff] font-black">{publicProfile.level}</p></div>
              <div className="p-4 border border-white/10"><p className="text-[9px] text-white/40 uppercase">Rank</p><p className="text-xl text-[#8b5cf6] font-black">{publicProfile.rankTitle || "Iron"}</p></div>
              <div className="p-4 border border-white/10"><p className="text-[9px] text-white/40 uppercase">XP</p><p className="text-xl text-white font-black">{(publicProfile.xp || 0).toLocaleString()}</p></div>
              <div className="p-4 border border-white/10"><p className="text-[9px] text-white/40 uppercase">Streak</p><p className="text-xl text-[#ec4899] font-black">{publicProfile.currentStreak}d</p></div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
