import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AppDispatch, RootState } from '../store/store';
import { loginUser, loginWithGoogle } from '../store/slices/authSlice';
import GamingBackground from '../components/GamingBackground';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/app');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const resultAction = await dispatch(loginWithGoogle(credentialResponse.credential));
      if (loginWithGoogle.fulfilled.match(resultAction)) {
        navigate('/app');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] selection:bg-[#00f0ff] selection:text-[#0a0a12] flex items-center justify-center p-4">
      <GamingBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,240,255,0.05)] to-transparent opacity-50 blur-2xl pointer-events-none" />
        
        <div className="relative bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl p-8"
             style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
          
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani'] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] animate-pulse" />
              Auth Protocol
            </div>
            <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Access Link
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)]">
              Enter your credentials to resume your journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-red-500/50 text-red-400 text-xs text-center uppercase tracking-wider font-bold">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                  Email Designation
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#00f0ff] focus:bg-[rgba(0,240,255,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                  placeholder="player@domain.com"
                />
              </div>

              <div className="relative group">
                <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                  Security Key
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#00f0ff] focus:bg-[rgba(0,240,255,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading'}
              type="submit"
              className="w-full py-4 text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 group relative overflow-hidden bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
              style={{
                fontFamily: "Rajdhani, sans-serif",
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
              }}
            >
              {status === 'loading' ? 'Authenticating...' : 'Initialize'}
            </motion.button>
            
            <div className="flex items-center justify-center space-x-4 my-6">
              <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[rgba(232,232,240,0.5)] font-['Rajdhani']">OR</span>
              <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                theme="filled_black"
                shape="rectangular"
                text="continue_with"
                size="large"
              />
            </div>
            
            <div className="text-center mt-6">
              <p className="text-xs text-[rgba(232,232,240,0.5)]">
                No active profile? {' '}
                <Link to="/signup" className="text-[#00f0ff] hover:underline uppercase tracking-wider font-bold">
                  Establish Link
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
