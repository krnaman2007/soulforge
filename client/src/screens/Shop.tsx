import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { 
  fetchRewards, 
  redeemReward, 
  fetchRedemptions,
  clearRedemptionState,
  Reward,
  RedeemedReward
} from '../store/slices/shopSlice';
import { fetchCurrentUser } from '../store/slices/authSlice';
import GamingBackground from '../components/GamingBackground';

const CATEGORIES = ['ALL', 'FOOD', 'SHOPPING', 'GAMING', 'LEARNING', 'ENTERTAINMENT', 'TRAVEL', 'TECH'];

const RARITY_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  COMMON: { color: '#9ca3af', bg: 'rgba(156,163,175,0.05)', border: 'rgba(156,163,175,0.2)', label: 'COMMON' },
  UNCOMMON: { color: '#10b981', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)', label: 'UNCOMMON' },
  RARE: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.05)', border: 'rgba(14,165,233,0.2)', label: 'RARE' },
  EPIC: { color: '#a78bfa', bg: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.2)', label: 'EPIC' },
  LEGENDARY: { color: '#f59e0b', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.3)', label: 'LEGENDARY' },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30, rotateX: 10 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
};

function Shop() {
  const dispatch = useDispatch<AppDispatch>();
  const { rewards, redemptions, status, redemptionStatus, lastRedeemedCoupon, redemptionError } = useSelector((state: RootState) => state.shop);
  const { character } = useSelector((state: RootState) => state.auth);

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchRewards({}));
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (showHistory) {
      dispatch(fetchRedemptions());
    }
  }, [showHistory, dispatch]);

  useEffect(() => {
    if (redemptionStatus === 'succeeded' && lastRedeemedCoupon) {
      setSelectedReward(null);
      setShowSuccess(true);
      dispatch(fetchCurrentUser()); // Refresh XP
    }
  }, [redemptionStatus, lastRedeemedCoupon, dispatch]);

  const currentXP = character?.xp || 0;

  const filteredRewards = useMemo(() => {
    return rewards.filter(r => {
      const matchCategory = activeCategory === 'ALL' || r.category === activeCategory;
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.brand && r.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [rewards, activeCategory, searchQuery]);

  const handleRedeem = (reward: Reward) => {
    dispatch(redeemReward(reward.id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="relative min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto selection:bg-[#00f0ff] selection:text-[#0a0a12]">
      {/* Background Environment matching Dashboard */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        <div className="absolute w-[100vw] h-[100vw] bg-transparent z-0" />
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz4KPC9zdmc+')] z-2 pointer-events-none" />
      </div>

      <GamingBackground />
      
      {/* Header & XP Balance matching Dashboard */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-px bg-[#a78bfa]" />
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#a78bfa] font-['Rajdhani']">Marketplace Online</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a78bfa]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            XP Rewards Marketplace
          </h1>
          <p className="text-[rgba(232,232,240,0.6)] font-['Inter'] mt-2 text-sm max-w-xl">Earn XP. Redeem premium rewards. Elevate your lifestyle.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.7)] hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            History <span className="opacity-50">→</span>
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-[rgba(167,139,250,0.05)] border border-[rgba(167,139,250,0.2)] backdrop-blur-sm group"
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
            <span className="text-[#a78bfa] text-lg group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_currentColor] animate-pulse">✦</span>
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[rgba(232,232,240,0.4)] font-['Rajdhani'] leading-none">Available XP</span>
              <span className="text-lg font-black stat-num text-[#a78bfa] leading-none mt-1">{currentXP.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-10 relative z-10 bg-[rgba(15,15,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] p-2" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-[rgba(167,139,250,0.15)] text-[#a78bfa] border border-[rgba(167,139,250,0.3)] shadow-[0_0_10px_rgba(167,139,250,0.2)]' 
                  : 'bg-transparent text-[rgba(255,255,255,0.4)] border border-transparent hover:text-white hover:bg-[rgba(255,255,255,0.02)]'
              }`}
              style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] pl-9 pr-4 py-2 text-white font-['Inter'] text-sm focus:outline-none focus:border-[#a78bfa] transition-colors"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
          />
        </div>
      </motion.div>

      {/* Rewards Grid */}
      {status === 'loading' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] animate-pulse" 
                 style={{ clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)" }} />
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-20 relative z-10 bg-[rgba(20,20,30,0.6)] border border-[rgba(255,255,255,0.05)]"
             style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)" }}>
          <p className="text-2xl text-white font-black font-['Rajdhani'] mb-2">No rewards found</p>
          <p className="text-[rgba(232,232,240,0.5)]">Check back later or adjust your filters. Keep earning XP!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filteredRewards.map((reward, i) => {
            const style = RARITY_STYLES[reward.rarity] || RARITY_STYLES['COMMON'];
            const canAfford = currentXP >= reward.xpCost;
            const outOfStock = reward.remainingStock !== null && reward.remainingStock <= 0;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.3 + i * 0.05 }}
                className="group relative bg-[rgba(15,15,22,0.6)] backdrop-blur-xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col preserve-3d"
                style={{ 
                  borderColor: style.border,
                  clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Rarity & Brand Header */}
                <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-start relative z-10" style={{ background: `linear-gradient(90deg, ${style.bg}, transparent)` }}>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: style.color, boxShadow: `0 0 5px ${style.color}` }} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-[rgba(255,255,255,0.6)]">
                        {style.label}
                      </span>
                    </div>
                    <h3 className="text-white font-black uppercase tracking-wide font-['Rajdhani'] text-xl leading-tight max-w-[200px]">
                      {reward.name}
                    </h3>
                  </div>
                  {reward.brand && (
                    <span className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase font-black tracking-widest bg-[rgba(255,255,255,0.02)] px-2 py-1" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}>{reward.brand}</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col relative z-10">
                  {reward.discountValue && (
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[rgba(255,255,255,0.7)] font-['Rajdhani'] mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      {reward.discountValue}
                    </p>
                  )}
                  <p className="text-xs text-[rgba(232,232,240,0.6)] font-['Inter'] mb-5 line-clamp-3 leading-relaxed">
                    {reward.description}
                  </p>
                  
                  {/* Indicators */}
                  <div className="flex flex-wrap gap-2 mt-auto mb-5">
                    {reward.isFlash && (
                      <span className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1.5 uppercase tracking-widest font-bold">⚡ Flash</span>
                    )}
                    {reward.remainingStock !== null && (
                      <span className="text-[9px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] px-2 py-1.5 uppercase tracking-widest">
                        {reward.remainingStock} Left
                      </span>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="pt-5 border-t border-[rgba(255,255,255,0.05)] mt-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[rgba(255,255,255,0.4)] font-['Rajdhani'] mb-0.5">Required</span>
                      <span className={`text-xl font-black font-['Rajdhani'] leading-none ${canAfford ? 'text-white' : 'text-red-400'}`}>
                        {reward.xpCost.toLocaleString()} <span className={canAfford ? 'text-[#a78bfa]' : 'text-red-400'}>XP</span>
                      </span>
                    </div>

                    <div className="flex-1 max-w-[140px]">
                      {outOfStock ? (
                        <button disabled className="w-full py-2.5 bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.2)] font-black uppercase tracking-widest text-[10px] cursor-not-allowed text-center border border-[rgba(255,255,255,0.05)]">
                          Sold Out
                        </button>
                      ) : !canAfford ? (
                        <button disabled className="w-full py-2.5 bg-red-500/5 border border-red-500/20 text-red-400/50 font-black uppercase tracking-widest text-[10px] text-center">
                          Not Enough
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedReward(reward)}
                          className="relative w-full py-2.5 bg-[rgba(167,139,250,0.1)] hover:bg-[#a78bfa] hover:text-black border border-[rgba(167,139,250,0.3)] hover:border-[#a78bfa] text-[#a78bfa] font-black uppercase tracking-widest text-[10px] transition-all text-center group/btn overflow-hidden"
                          style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
                        >
                          <span className="relative z-10">Acquire</span>
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 z-0" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateX: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-[rgba(15,15,22,0.95)] backdrop-blur-xl border border-[rgba(167,139,250,0.3)] p-8 shadow-[0_0_50px_rgba(167,139,250,0.15)] relative preserve-3d"
              style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(167,139,250,0.05)] to-transparent pointer-events-none" />

              <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                <span className="text-[#a78bfa] text-xl animate-pulse">✦</span>
                Confirm Acquisition
              </h2>
              
              <div className="bg-[rgba(0,0,0,0.4)] p-5 mb-6 border border-[rgba(255,255,255,0.05)] relative z-10" style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}>
                <p className="text-xl text-white font-black uppercase tracking-wide font-['Rajdhani'] mb-1">{selectedReward.name}</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)] mb-5 font-bold tracking-wide uppercase">{selectedReward.discountValue}</p>
                
                <div className="space-y-3 text-sm font-['Inter'] font-bold">
                  <div className="flex justify-between text-[rgba(255,255,255,0.6)] uppercase tracking-widest text-[10px]">
                    <span>Current Balance</span>
                    <span className="text-white text-xs">{currentXP.toLocaleString()} XP</span>
                  </div>
                  <div className="flex justify-between text-red-400/80 uppercase tracking-widest text-[10px]">
                    <span>Cost</span>
                    <span className="text-red-400 text-xs">- {selectedReward.xpCost.toLocaleString()} XP</span>
                  </div>
                  <div className="h-px bg-[rgba(255,255,255,0.05)] my-3" />
                  <div className="flex justify-between text-[#a78bfa] uppercase tracking-widest text-[10px]">
                    <span>Balance After</span>
                    <span className="text-sm">{(currentXP - selectedReward.xpCost).toLocaleString()} XP</span>
                  </div>
                </div>
              </div>

              {redemptionError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs uppercase tracking-widest font-bold text-center relative z-10">
                  {redemptionError}
                </div>
              )}

              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => setSelectedReward(null)}
                  disabled={redemptionStatus === 'loading'}
                  className="flex-1 py-3.5 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.7)] hover:text-white uppercase tracking-widest font-black text-[10px] transition-all disabled:opacity-50"
                  style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleRedeem(selectedReward)}
                  disabled={redemptionStatus === 'loading'}
                  className="flex-1 py-3.5 bg-[rgba(167,139,250,0.15)] hover:bg-[#a78bfa] hover:text-black border border-[rgba(167,139,250,0.4)] hover:border-[#a78bfa] text-[#a78bfa] uppercase tracking-widest font-black text-[10px] shadow-[0_0_15px_rgba(167,139,250,0.2)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
                >
                  {redemptionStatus === 'loading' ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSuccess && lastRedeemedCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-[rgba(15,15,22,0.95)] border border-[#a78bfa]/50 p-10 shadow-[0_0_50px_rgba(167,139,250,0.15)] text-center relative overflow-hidden"
              style={{ clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#a78bfa] to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.15),transparent_70%)] pointer-events-none" />
              
              <div className="w-20 h-20 mx-auto bg-[rgba(167,139,250,0.1)] border border-[#a78bfa]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(167,139,250,0.3)] relative z-10">
                <span className="text-4xl">🎉</span>
              </div>
              
              <h2 className="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-widest mb-2 relative z-10">Reward Acquired</h2>
              <p className="text-[rgba(255,255,255,0.6)] mb-8 font-['Inter'] relative z-10 text-sm">Transaction complete. Access code generated.</p>
              
              <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(167,139,250,0.3)] p-6 mb-8 relative group z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" style={{ clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))" }}>
                <p className="text-[10px] uppercase tracking-widest text-[#a78bfa] font-bold mb-3">Access Code</p>
                <p className="text-3xl sm:text-4xl font-mono text-white tracking-widest font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{lastRedeemedCoupon}</p>
                
                <button 
                  onClick={() => copyToClipboard(lastRedeemedCoupon)}
                  className="mt-5 px-8 py-2.5 bg-[rgba(167,139,250,0.1)] hover:bg-[#a78bfa] hover:text-black border border-[#a78bfa] text-[#a78bfa] font-black uppercase tracking-widest text-[10px] transition-all"
                  style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
                >
                  Copy Code
                </button>
              </div>

              <button 
                onClick={() => {
                  setShowSuccess(false);
                  dispatch(clearRedemptionState());
                }}
                className="w-full py-4 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] text-[rgba(255,255,255,0.6)] hover:text-white uppercase tracking-widest font-black text-[10px] transition-colors relative z-10"
                style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
              >
                Return to Marketplace
              </button>
            </motion.div>
          </div>
        )}

        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-2xl max-h-[80vh] bg-[rgba(15,15,22,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] p-8 shadow-2xl flex flex-col"
              style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
            >
              <div className="flex justify-between items-center mb-8 border-b border-[rgba(255,255,255,0.05)] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-pulse" />
                  <h2 className="text-xl font-black text-white font-['Rajdhani'] uppercase tracking-widest">Transaction History</h2>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)] scrollbar-track-transparent">
                {redemptions.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[rgba(255,255,255,0.3)] font-['Rajdhani']">No transactions logged</p>
                  </div>
                ) : (
                  redemptions.map(red => (
                    <div key={red.id} className="p-5 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.08)] transition-colors flex flex-col sm:flex-row justify-between gap-4" style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}>
                      <div>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] uppercase font-black tracking-widest mb-1.5">{new Date(red.redeemedAt).toLocaleDateString()}</p>
                        <p className="font-black text-white mb-2 uppercase font-['Rajdhani'] text-lg tracking-wide">{red.reward?.name || 'Unknown Reward'}</p>
                        <p className="font-mono text-xs text-[#a78bfa] font-bold tracking-widest">{red.couponCode}</p>
                      </div>
                      <div className="text-left sm:text-right flex flex-col justify-center">
                        <p className="text-sm font-black text-red-400 mb-1 font-['Rajdhani'] tracking-widest">- {red.reward?.xpCost?.toLocaleString() || 0} XP</p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.4)] uppercase font-bold tracking-widest">Valid Until: {red.expiresAt ? new Date(red.expiresAt).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Shop;
