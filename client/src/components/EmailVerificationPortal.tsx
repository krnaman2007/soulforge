import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { resendVerification, verifyEmail, resetResendStatus } from '../store/slices/authSlice';

interface EmailVerificationPortalProps {
  email?: string;
  onBackToLogin?: () => void;
  onVerificationSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function EmailVerificationPortal({
  email = '',
  onBackToLogin,
  onVerificationSuccess,
  title = 'Email Verification Required',
  subtitle = 'A secure activation link has been dispatched to your designated frequency.'
}: EmailVerificationPortalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { resendStatus, resendMessage } = useSelector((state: RootState) => state.auth);

  const [inputEmail, setInputEmail] = useState(email);
  const [isEditingEmail, setIsEditingEmail] = useState(!email);
  const [tokenInput, setTokenInput] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState(false);

  useEffect(() => {
    if (email) {
      setInputEmail(email);
      setIsEditingEmail(false);
    }
  }, [email]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: any = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleResend = async () => {
    const targetEmail = inputEmail.trim();
    if (!targetEmail || !canResend) return;

    setCanResend(false);
    setCooldown(60);
    dispatch(resetResendStatus());
    await dispatch(resendVerification(targetEmail));
  };

  const extractToken = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.includes('token=')) {
      try {
        const urlObj = new URL(trimmed);
        return urlObj.searchParams.get('token') || trimmed;
      } catch {
        const match = trimmed.match(/token=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : trimmed;
      }
    }
    return trimmed;
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);
    const cleaned = extractToken(tokenInput);

    if (!cleaned) {
      setTokenError('Please enter a valid verification token or URL');
      return;
    }

    setIsVerifying(true);
    try {
      const action = await dispatch(verifyEmail(cleaned));
      if (verifyEmail.fulfilled.match(action)) {
        setTokenSuccess(true);
        setTimeout(() => {
          if (onVerificationSuccess) {
            onVerificationSuccess();
          } else {
            navigate('/app');
          }
        }, 1500);
      } else {
        setTokenError((action.payload as string) || 'Verification failed. Token may be expired or invalid.');
      }
    } catch (err: any) {
      setTokenError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-left relative z-10">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,240,255,0.08)] to-transparent opacity-40 blur-3xl pointer-events-none" />

      <div
        className="relative bg-[rgba(10,10,18,0.85)] border border-[rgba(255,255,255,0.12)] backdrop-blur-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
        }}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] -ml-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f0ff]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Security Protocol // Neural Mesh
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgba(232,232,240,0.4)] px-2 py-0.5 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            Awaiting Verification
          </span>
        </div>

        {/* Title and Icon */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 bg-[rgba(0,240,255,0.06)] border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {title}
          </h2>
          <p className="text-xs text-[rgba(232,232,240,0.6)] leading-relaxed max-w-md mx-auto">
            {subtitle}
          </p>

          {/* Email badge / Input */}
          <div className="mt-4 flex flex-col items-center justify-center">
            {!isEditingEmail && inputEmail ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(0,240,255,0.05)] border border-[#00f0ff]/25">
                <span className="text-[11px] font-mono text-[#00f0ff] font-medium">{inputEmail}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-[10px] uppercase font-bold text-[rgba(232,232,240,0.4)] hover:text-white transition-colors underline ml-1"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="w-full max-w-xs flex gap-2 mt-1">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter recipient email..."
                  className="flex-1 px-3 py-1.5 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs outline-none focus:border-[#00f0ff] font-mono"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-2.5 py-1 text-[10px] uppercase font-bold text-[rgba(232,232,240,0.6)] hover:text-white border border-[rgba(255,255,255,0.1)]"
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence>
          {resendStatus === 'succeeded' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3.5 bg-[rgba(16,224,127,0.1)] border border-[#10e07f]/50 text-[#10e07f] text-xs flex items-center gap-3"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{resendMessage || 'Fresh verification link dispatched to your inbox.'}</span>
            </motion.div>
          )}

          {resendStatus === 'failed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3.5 bg-[rgba(239,68,68,0.1)] border border-red-500/50 text-red-400 text-xs flex items-center gap-3"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{resendMessage || 'Failed to dispatch verification link.'}</span>
            </motion.div>
          )}

          {tokenError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3.5 bg-[rgba(239,68,68,0.1)] border border-red-500/50 text-red-400 text-xs flex items-center gap-3"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{tokenError}</span>
            </motion.div>
          )}

          {tokenSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 bg-[rgba(16,224,127,0.15)] border border-[#10e07f] text-[#10e07f] text-center"
            >
              <div className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Identity Confirmed // Access Granted
              </div>
              <div className="text-xs text-[rgba(232,232,240,0.8)] mt-1">Initializing profile and logging into Nexus...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action 1: Quick Webmail Launchers */}
        <div className="mb-6">
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[rgba(232,232,240,0.5)] mb-2.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Quick Webmail Launchers
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href="https://mail.google.com/mail/u/0/#search/SoulForge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5 transition-all text-xs font-bold text-white tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              Gmail
            </a>
            <a
              href="https://outlook.live.com/mail/0/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5 transition-all text-xs font-bold text-white tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.5 2h-19C1.1 2 0 3.1 0 4.5v15C0 20.9 1.1 22 2.5 22h19c1.4 0 2.5-1.1 2.5-2.5v-15c0-1.4-1.1-2.5-2.5-2.5zM22 19.5c0 .3-.2.5-.5.5h-19c-.3 0-.5-.2-.5-.5v-11l10 6.2 10-6.2v11z" />
              </svg>
              Outlook
            </a>
            <a
              href="https://mail.yahoo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5 transition-all text-xs font-bold text-white tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z" />
              </svg>
              Yahoo
            </a>
            <a
              href="https://mail.proton.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5 transition-all text-xs font-bold text-white tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              Proton
            </a>
          </div>
          <div className="mt-2 text-[10px] text-[rgba(232,232,240,0.4)] flex items-center gap-1.5 font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff]/40" />
            Check Spam, Junk, or Promotions folder if not visible immediately. Links remain valid for 24 hours.
          </div>
        </div>

        {/* Divider with Terminal Label */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
          </div>
          <span className="relative px-3 bg-[rgba(10,10,18,0.95)] text-[9px] uppercase tracking-[0.2em] text-[rgba(232,232,240,0.4)]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Direct Token Authorization
          </span>
        </div>

        {/* Action 2: Manual Token Form */}
        <form onSubmit={handleManualVerify} className="space-y-3 mb-6">
          <div className="relative">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Paste Verification Token or Full Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste hex token or full link here..."
                className="flex-1 px-3.5 py-2.5 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.12)] text-white text-xs outline-none focus:border-[#00f0ff] focus:bg-[rgba(0,240,255,0.02)] transition-all font-mono placeholder-[rgba(255,255,255,0.2)]"
              />
              <button
                type="submit"
                disabled={isVerifying || !tokenInput.trim()}
                className="px-5 py-2.5 bg-[#00f0ff] text-black font-black uppercase tracking-wider text-xs hover:bg-[#00f0ff]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {isVerifying ? 'Verifying...' : 'Authorize'}
              </button>
            </div>
          </div>
        </form>

        {/* Action 3: Resend Verification Form */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[rgba(232,232,240,0.5)] text-[11px]">
            {canResend ? 'Did not receive the link?' : `Resend available in ${cooldown}s`}
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resendStatus === 'loading'}
            className={`px-4 py-2 border text-[11px] font-black uppercase tracking-wider transition-all ${
              canResend && resendStatus !== 'loading'
                ? 'border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]'
                : 'border-[rgba(255,255,255,0.1)] text-[rgba(232,232,240,0.3)] cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {resendStatus === 'loading' ? 'Dispatching...' : canResend ? 'Resend Verification Link' : `Cooldown (${cooldown}s)`}
          </button>
        </div>

        {/* Action 4: Return to Login */}
        {onBackToLogin && (
          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs uppercase tracking-widest text-[rgba(232,232,240,0.5)] hover:text-[#00f0ff] transition-colors font-bold"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
