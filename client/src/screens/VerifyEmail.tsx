import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { verifyEmail } from '../store/slices/authSlice';
import GamingBackground from '../components/GamingBackground';
import EmailVerificationPortal from '../components/EmailVerificationPortal';

export default function VerifyEmail() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { status, error, user, character } = useSelector((state: RootState) => state.auth);
  
  const hasVerified = useRef(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      dispatch(verifyEmail(token))
        .unwrap()
        .then(() => {
          // Trigger countdown to auto-navigate
          let remaining = 3;
          const interval = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
              clearInterval(interval);
              navigate('/app');
            }
          }, 1000);
        })
        .catch((err) => {
          setVerificationError(err);
        });
    }
  }, [token, dispatch, navigate]);

  // If no token in URL, render the full Verification Portal
  if (!token) {
    return (
      <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] selection:bg-[#00f0ff] selection:text-[#0a0a12] flex items-center justify-center p-4">
        <GamingBackground />
        <EmailVerificationPortal
          title="Direct Verification Portal"
          subtitle="No verification token was detected in your current URL. Enter your token or link below, or dispatch a fresh activation link to your email."
          onBackToLogin={() => navigate('/login')}
          onVerificationSuccess={() => navigate('/app')}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] selection:bg-[#00f0ff] selection:text-[#0a0a12] flex items-center justify-center p-4">
      <GamingBackground />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,240,255,0.08)] to-transparent opacity-50 blur-3xl pointer-events-none" />

        {/* Loading / Scanning State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[rgba(10,10,18,0.9)] border border-[rgba(255,255,255,0.12)] backdrop-blur-2xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.8)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
          >
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani'] flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#00f0ff] animate-ping" />
              Security Protocol // Active Scan
            </div>

            <div className="my-8 relative flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-[rgba(0,240,255,0.15)] border-t-[#00f0ff] rounded-full animate-spin" />
              <div className="absolute w-16 h-16 border-2 border-[rgba(139,92,246,0.2)] border-b-[#8b5cf6] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute text-[11px] font-mono font-bold text-[#00f0ff]">SCAN</div>
            </div>

            <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Authenticating Signature
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] mb-6">
              Validating cryptographic token against the SoulForge Nexus...
            </p>

            <div className="w-full bg-[rgba(255,255,255,0.05)] h-1 overflow-hidden">
              <div className="h-full bg-[#00f0ff] animate-pulse w-3/4" />
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'succeeded' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[rgba(10,10,18,0.9)] border border-[#10e07f]/40 backdrop-blur-2xl p-8 text-center shadow-[0_0_50px_rgba(16,224,127,0.15)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
          >
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#10e07f]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Identity Verified // Access Granted
              </span>
              <span className="text-[10px] font-mono text-[#10e07f] bg-[rgba(16,224,127,0.1)] px-2 py-0.5">
                STATUS: ACTIVE
              </span>
            </div>

            <div
              className="w-20 h-20 mx-auto bg-[rgba(16,224,127,0.1)] border-2 border-[#10e07f] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,224,127,0.3)]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <svg className="w-10 h-10 text-[#10e07f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Welcome, {user?.name || user?.username || 'Hero'}
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[#10e07f] font-bold mb-6">
              Your neural frequency has been verified. Welcome to the SoulForge Nexus.
            </p>

            {character && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] mb-6 text-center">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[rgba(232,232,240,0.5)] font-['Rajdhani']">Level</div>
                  <div className="text-base font-black text-white font-mono">{character.level || 1}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[rgba(232,232,240,0.5)] font-['Rajdhani']">Gold</div>
                  <div className="text-base font-black text-[#f59e0b] font-mono">{character.coins || 0}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[rgba(232,232,240,0.5)] font-['Rajdhani']">XP</div>
                  <div className="text-base font-black text-[#00f0ff] font-mono">{character.xp || 0}</div>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/app')}
              className="w-full py-4 text-sm font-black uppercase tracking-[0.2em] transition-all bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 shadow-[0_0_25px_rgba(0,240,255,0.3)] mb-3"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}
            >
              Enter SoulForge Nexus {countdown > 0 ? `(${countdown}s)` : ''}
            </button>
            <p className="text-[10px] uppercase font-mono text-[rgba(232,232,240,0.4)]">
              Redirecting automatically to your command dashboard...
            </p>
          </motion.div>
        )}

        {/* Failed / Expired Token State with In-Place Portal */}
        {(status === 'failed' || verificationError) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div
              className="p-4 bg-[rgba(239,68,68,0.1)] border border-red-500/60 text-center"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
            >
              <div className="flex items-center justify-center gap-2 text-red-400 font-bold uppercase tracking-wider text-xs mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Token Verification Failed
              </div>
              <p className="text-xs text-[rgba(232,232,240,0.8)]">
                {verificationError || error || 'The verification link has expired or has already been consumed.'}
              </p>
            </div>

            {/* Embedded Portal to Resend or Enter Fresh Token */}
            <EmailVerificationPortal
              title="Request New Activation Link"
              subtitle="Enter your email to dispatch a fresh verification link, or paste a new token below."
              onBackToLogin={() => navigate('/login')}
              onVerificationSuccess={() => navigate('/app')}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
