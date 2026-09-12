import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchPublicProfile } from "../store/slices/socialSlice";
import { fetchActivityStats } from "../store/slices/activitySlice";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const character = useSelector((state: RootState) => state.auth.character);
  const profile = useSelector((state: RootState) => state.social.publicProfile);
  const stats = useSelector((state: RootState) => state.activity.stats);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPublicProfile(user.id));
      dispatch(fetchActivityStats("all"));
    }
  }, [dispatch, user?.id]);

  const name = profile?.username || user?.username || user?.name || "Adventurer";
  const title = character?.titleId?.replace("title_", "").replace(/_/g, " ") || "Apprentice";

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2">Player Identity</div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white font-['Rajdhani']">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 p-6 md:p-8 bg-[rgba(15,15,22,0.7)] border border-[rgba(0,240,255,0.2)]">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 hex-clip flex items-center justify-center text-5xl bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.35)]">
              {character?.avatarId === "avatar_starter" || !character?.avatarId ? "⚔️" : character.avatarId}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black uppercase text-white truncate font-['Rajdhani']">{name}</p>
              <p className="text-xs uppercase tracking-widest text-[#00f0ff] mt-1">{title}</p>
              <p className="text-[10px] text-white/40 mt-2">Level {profile?.level ?? character?.level ?? 1} · {profile?.rankTitle || "Iron"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <Stat label="Lifetime XP" value={(profile?.xp ?? 0).toLocaleString()} />
            <Stat label="Current Streak" value={`${profile?.currentStreak ?? character?.currentStreak ?? 0}d`} />
            <Stat label="Followers" value={String(profile?.followersCount ?? 0)} />
            <Stat label="Following" value={String(profile?.followingCount ?? 0)} />
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="lg:col-span-7 p-6 md:p-8 bg-[rgba(15,15,22,0.7)] border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white font-['Rajdhani']">Forge Record</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Tasks" value={String(stats?.tasksCompleted ?? 0)} />
            <Stat label="Campaigns" value={String(stats?.questsCompleted ?? 0)} />
            <Stat label="XP Earned" value={(stats?.totalXP ?? 0).toLocaleString()} />
            <Stat label="Coins Earned" value={(stats?.totalCoins ?? 0).toLocaleString()} />
          </div>

          <div className="mt-8 p-5 border border-[rgba(0,240,255,0.12)] bg-[rgba(0,240,255,0.03)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff] font-black">Account Status</p>
            <p className="text-xs text-white/60 mt-2">{user?.isVerified ? "Verified account" : "Email verification pending"}</p>
            <p className="text-[10px] text-white/30 mt-1">Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border border-white/10 bg-white/[0.02]">
      <p className="text-[9px] uppercase tracking-widest text-white/35">{label}</p>
      <p className="text-xl font-black text-[#00f0ff] mt-1 font-['Rajdhani']">{value}</p>
    </div>
  );
}
