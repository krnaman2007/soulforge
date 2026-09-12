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
  COMMON: { color: '#a0aec0', bg: 'rgba(160,174,192,0.1)', border: 'rgba(160,174,192,0.3)', label: 'COMMON' },
  UNCOMMON: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'UNCOMMON' },
  RARE: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', label: 'RARE' },
  EPIC: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', label: 'EPIC' },
  LEGENDARY: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'LEGENDARY' },
};

function Shop() {
  const dispatch = useDispatch<AppDispatch>();
  const { rewards, redemptions, status, redemptionStatus, lastRedeemedCoupon } = useSelector((state: RootState) => state.shop);
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
    <div className="min-h-screen pt-20 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative z-10">
      <GamingBackground />
      
      {/* Header & XP Balance */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-[rgba(255,255,255,0.7)] font-['Rajdhani'] mb-2">
            XP Rewards Marketplace
          </h1>
          <p className="text-[rgba(232,232,240,0.6)] font-['Inter']">Earn XP. Redeem premium rewards. Elevate your lifestyle.</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white text-sm font-bold tracking-widest uppercase transition-all"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            History
          </button>
          
          <div className="p-4 bg-[rgba(0,240,255,0.1)] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)] text-right"
               style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff] font-bold mb-1">Your XP Balance</p>
            <p className="text-2xl font-black text-white font-['Rajdhani'] leading-none">
              {currentXP.toLocaleString()} <span className="text-[#00f0ff]">XP</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 relative z-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' 
                  : 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
              }`}
              style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search rewards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-[rgba(20,20,30,0.8)] border border-[rgba(255,255,255,0.1)] px-4 py-2 text-white font-['Inter'] focus:outline-none focus:border-[#00f0ff] transition-colors"
          style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
        />
      </div>

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-[rgba(20,20,30,0.8)] backdrop-blur-md border transition-all duration-300 hover:-translate-y-1 flex flex-col"
                style={{ 
                  borderColor: style.border,
                  boxShadow: `0 0 20px ${style.bg} inset, 0 10px 30px rgba(0,0,0,0.5)`,
                  clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))"
                }}
              >
                {/* Rarity & Brand Header */}
                <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-start bg-[rgba(0,0,0,0.2)]">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5" 
                          style={{ color: style.color, backgroundColor: style.bg, border: `1px solid ${style.border}` }}>
                      {style.label}
                    </span>
                    <h3 className="text-white font-black uppercase tracking-wide font-['Rajdhani'] text-lg mt-2">
                      {reward.name}
                    </h3>
                  </div>
                  {reward.brand && (
                    <span className="text-xs text-[rgba(255,255,255,0.4)] uppercase font-bold tracking-wider">{reward.brand}</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col">
                  {reward.discountValue && (
                    <p className="text-2xl font-black text-white font-['Rajdhani'] mb-2 shadow-[0_0_10px_currentColor]" style={{ color: style.color }}>
                      {reward.discountValue}
                    </p>
                  )}
                  <p className="text-sm text-[rgba(232,232,240,0.7)] font-['Inter'] mb-4 line-clamp-2">
                    {reward.description}
                  </p>
                  
                  {/* Indicators */}
                  <div className="flex flex-wrap gap-2 mt-auto mb-4">
                    {reward.isFlash && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 uppercase tracking-widest font-bold">⚡ Flash</span>
                    )}
                    {reward.remainingStock !== null && (
                      <span className="text-[10px] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] px-2 py-1 uppercase tracking-widest">
                        {reward.remainingStock} Left
                      </span>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.4)]">Cost</span>
                      <span className={`text-lg font-black font-['Rajdhani'] ${canAfford ? 'text-[#00f0ff]' : 'text-red-400'}`}>
                        {reward.xpCost.toLocaleString()} XP
                      </span>
                    </div>

                    {outOfStock ? (
                      <button disabled className="w-full py-2 bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] font-bold uppercase tracking-widest cursor-not-allowed">
                        Sold Out
                      </button>
                    ) : !canAfford ? (
                      <button disabled className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest text-xs">
                        Earn More XP
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedReward(reward)}
                        className="w-full py-2 bg-[rgba(0,240,255,0.1)] hover:bg-[#00f0ff] hover:text-black border border-[#00f0ff] text-[#00f0ff] font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                        style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                      >
                        Redeem
                      </button>
                    )}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[rgba(20,20,30,0.95)] border border-[rgba(255,255,255,0.1)] p-6 shadow-2xl relative"
              style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)" }}
            >
              <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-widest mb-4">Confirm Redemption</h2>
              
              <div className="bg-[rgba(0,0,0,0.3)] p-4 mb-6 border border-[rgba(255,255,255,0.05)]">
                <p className="text-lg text-white font-bold mb-1">{selectedReward.name}</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)] mb-4">{selectedReward.discountValue}</p>
                
                <div className="space-y-2 text-sm font-['Inter']">
                  <div className="flex justify-between text-[rgba(255,255,255,0.7)]">
                    <span>Current Balance:</span>
                    <span>{currentXP.toLocaleString()} XP</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Cost:</span>
                    <span>- {selectedReward.xpCost.toLocaleString()} XP</span>
                  </div>
                  <div className="h-px bg-[rgba(255,255,255,0.1)] my-2" />
                  <div className="flex justify-between text-[#00f0ff] font-bold">
                    <span>Balance After:</span>
                    <span>{(currentXP - selectedReward.xpCost).toLocaleString()} XP</span>
                  </div>
                </div>
              </div>

              {redemptionError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {redemptionError}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedReward(null)}
                  disabled={redemptionStatus === 'loading'}
                  className="flex-1 py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white uppercase tracking-widest font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleRedeem(selectedReward)}
                  disabled={redemptionStatus === 'loading'}
                  className="flex-1 py-3 bg-[#00f0ff] hover:bg-[#00d0dd] text-black uppercase tracking-widest font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
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
              className="w-full max-w-lg bg-gradient-to-br from-[rgba(20,20,30,0.95)] to-[rgba(10,10,15,0.95)] border border-[#00f0ff]/50 p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] text-center relative overflow-hidden"
              style={{ clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
              
              <div className="w-20 h-20 mx-auto bg-[#00f0ff]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                <span className="text-4xl">🎉</span>
              </div>
              
              <h2 className="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-widest mb-2">Reward Redeemed</h2>
              <p className="text-[rgba(255,255,255,0.6)] mb-8 font-['Inter']">Your XP has been successfully deducted. Here is your code:</p>
              
              <div className="bg-black/50 border border-[#00f0ff]/30 p-6 mb-8 relative group">
                <p className="text-[10px] uppercase tracking-widest text-[#00f0ff] font-bold mb-2 absolute -top-2 left-4 bg-[rgba(20,20,30,1)] px-2">Coupon Code</p>
                <p className="text-2xl sm:text-3xl font-mono text-white tracking-wider">{lastRedeemedCoupon}</p>
                
                <button 
                  onClick={() => copyToClipboard(lastRedeemedCoupon)}
                  className="mt-4 px-6 py-2 bg-[rgba(0,240,255,0.1)] hover:bg-[#00f0ff] hover:text-black border border-[#00f0ff] text-[#00f0ff] font-bold uppercase tracking-widest text-xs transition-all opacity-80 hover:opacity-100"
                >
                  Copy Code
                </button>
              </div>

              <button 
                onClick={() => {
                  setShowSuccess(false);
                  dispatch(clearRedemptionState());
                }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white uppercase tracking-widest font-bold text-sm transition-colors"
              >
                Back to Marketplace
              </button>
            </motion.div>
          </div>
        )}

        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full max-w-2xl max-h-[80vh] bg-[rgba(20,20,30,0.95)] border border-[rgba(255,255,255,0.1)] p-6 shadow-2xl flex flex-col"
              style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-widest">Redemption History</h2>
                <button onClick={() => setShowHistory(false)} className="text-[rgba(255,255,255,0.5)] hover:text-white text-2xl leading-none">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)] scrollbar-track-transparent">
                {redemptions.length === 0 ? (
                  <p className="text-center text-[rgba(255,255,255,0.4)] py-10">No past redemptions found.</p>
                ) : (
                  redemptions.map(red => (
                    <div key={red.id} className="p-4 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-1">{new Date(red.redeemedAt).toLocaleDateString()}</p>
                        <p className="font-bold text-white mb-1">{red.reward?.name || 'Unknown Reward'}</p>
                        <p className="font-mono text-sm text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 inline-block">{red.couponCode}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-red-400 mb-1">- {red.reward?.xpCost?.toLocaleString() || 0} XP</p>
                        <p className="text-xs text-[rgba(255,255,255,0.5)]">Expires: {red.expiresAt ? new Date(red.expiresAt).toLocaleDateString() : 'Never'}</p>
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
