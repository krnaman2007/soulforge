import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { claimUsername } from '../store/slices/authSlice';
import GamingBackground from '../components/GamingBackground';

export default function ClaimUsername() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(claimUsername(username));
    if (claimUsername.fulfilled.match(resultAction)) {
      navigate('/app');
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] selection:bg-[#f59e0b] selection:text-[#0a0a12] flex items-center justify-center p-4">
      <GamingBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(245,158,11,0.05)] to-transparent opacity-50 blur-2xl pointer-events-none" />
        
        <div className="relative bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl p-8"
             style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
          
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#f59e0b] mb-2 font-['Rajdhani'] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#f59e0b] animate-pulse" />
              Finalize Identity
            </div>
            <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Claim Handle
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)]">
              You must select a unique username before proceeding.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-red-500/50 text-red-400 text-xs text-center uppercase tracking-wider font-bold">
                {error}
              </div>
            )}
            
            <div className="relative group">
              <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#f59e0b] focus:bg-[rgba(245,158,11,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                placeholder="dragon_slayer"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading' || !username.trim()}
              type="submit"
              className="w-full py-4 text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 group relative overflow-hidden bg-transparent border-2 border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
              style={{
                fontFamily: "Rajdhani, sans-serif",
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
              }}
            >
              {status === 'loading' ? 'Checking Database...' : 'Lock Handle'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
