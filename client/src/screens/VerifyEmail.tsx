import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { verifyEmail } from '../store/slices/authSlice';
import GamingBackground from '../components/GamingBackground';

export default function VerifyEmail() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { status, error } = useSelector((state: RootState) => state.auth);
  
  const hasVerified = useRef(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      dispatch(verifyEmail(token))
        .unwrap()
        .then(() => {
          // Success: wait a moment then redirect to app
          setTimeout(() => navigate('/app'), 3000);
        })
        .catch((err) => {
          setVerificationError(err);
        });
    }
  }, [token, dispatch, navigate]);

  if (!token) {
    return (
      <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] flex items-center justify-center p-4">
        <GamingBackground />
        <div className="relative z-10 bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] p-8 max-w-md text-center">
          <h1 className="text-3xl font-black uppercase text-red-500 mb-4 font-['Rajdhani']">Missing Token</h1>
          <p className="text-sm text-[rgba(232,232,240,0.6)]">No verification token provided in the URL.</p>
          <Link to="/login" className="mt-6 inline-block text-[#00f0ff] uppercase tracking-widest text-xs font-bold hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] selection:bg-[#00f0ff] selection:text-[#0a0a12] flex items-center justify-center p-4">
      <GamingBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,240,255,0.05)] to-transparent opacity-50 blur-2xl pointer-events-none" />
        
        <div className="relative bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl p-8"
             style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
          
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani'] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] animate-pulse" />
              Security Protocol
            </div>
            
            {status === 'loading' && (
              <>
                <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-4 mt-6" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Verifying Link
                </h1>
                <p className="text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] mb-8">
                  Confirming your identity signature...
                </p>
                <div className="w-16 h-16 border-4 border-[rgba(0,240,255,0.2)] border-t-[#00f0ff] rounded-full animate-spin mx-auto" />
              </>
            )}

            {status === 'succeeded' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-20 h-20 mx-auto bg-[rgba(16,224,127,0.1)] border border-[#10e07f] flex items-center justify-center mb-6"
                     style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  <span className="text-3xl text-[#10e07f]">✓</span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Identity Confirmed
                </h1>
                <p className="text-xs uppercase tracking-[0.1em] text-[#10e07f] font-bold mb-8">
                  Profile activated. Redirecting to hub...
                </p>
              </motion.div>
            )}

            {(status === 'failed' || verificationError) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-20 h-20 mx-auto bg-[rgba(239,68,68,0.1)] border border-red-500 flex items-center justify-center mb-6"
                     style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  <span className="text-3xl text-red-500">✖</span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Verification Failed
                </h1>
                <p className="text-xs text-[rgba(232,232,240,0.6)] mb-8 p-3 bg-red-500/10 border border-red-500/30">
                  {verificationError || error}
                </p>
                <Link to="/login" className="inline-block py-3 px-8 text-xs font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      style={{ fontFamily: "Rajdhani, sans-serif", clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
                  Return to Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
