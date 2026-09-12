import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AppDispatch, RootState } from '../store/store';
import { registerUser, loginWithGoogle } from '../store/slices/authSlice';
import GamingBackground from '../components/GamingBackground';

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      // Optional: Navigate to login after delay
      setTimeout(() => navigate('/login'), 5000);
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
    <div className="relative min-h-screen bg-transparent text-[#e8e8f0] font-['Inter'] selection:bg-[#8b5cf6] selection:text-[#0a0a12] flex items-center justify-center p-4">
      <GamingBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(139,92,246,0.05)] to-transparent opacity-50 blur-2xl pointer-events-none" />
        
        <div className="relative bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl p-8"
             style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
          
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5cf6] mb-2 font-['Rajdhani'] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#8b5cf6] animate-pulse" />
              New Profile Setup
            </div>
            <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Forge Identity
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)]">
              Register to begin tracking your real-world progression.
            </p>
          </div>

          {successMessage ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-[rgba(16,224,127,0.1)] border border-[#10e07f] text-[#10e07f] text-center"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
            >
              <div className="text-3xl mb-2">✓</div>
              <p className="font-bold uppercase tracking-wider text-sm font-['Rajdhani']">{successMessage}</p>
              <p className="text-[10px] mt-4 opacity-70">Redirecting to login sequence...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-red-500/50 text-red-400 text-xs text-center uppercase tracking-wider font-bold">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                <div className="relative group">
                  <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#8b5cf6] focus:bg-[rgba(139,92,246,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                    placeholder="Hero Name"
                  />
                </div>

                <div className="relative group">
                  <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#8b5cf6] focus:bg-[rgba(139,92,246,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                    placeholder="unique_handle"
                  />
                </div>

                <div className="relative group">
                  <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                    Email Designation
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#8b5cf6] focus:bg-[rgba(139,92,246,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                    placeholder="player@domain.com"
                  />
                </div>

                <div className="relative group">
                  <label className="block text-[9px] font-black mb-1.5 uppercase tracking-[0.2em] text-[rgba(232,232,240,0.6)] font-['Rajdhani']">
                    Security Key
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none transition-all focus:border-[#8b5cf6] focus:bg-[rgba(139,92,246,0.02)] placeholder-[rgba(255,255,255,0.1)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'loading'}
                type="submit"
                className="w-full mt-4 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 group relative overflow-hidden bg-transparent border-2 border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                }}
              >
                {status === 'loading' ? 'Transmitting...' : 'Register Profile'}
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
                    console.error('Google Registration Failed');
                  }}
                  theme="filled_black"
                  shape="rectangular"
                  text="signup_with"
                  size="large"
                />
              </div>
              
              <div className="text-center mt-6">
                <p className="text-xs text-[rgba(232,232,240,0.5)]">
                  Already have an active profile? {' '}
                  <Link to="/login" className="text-[#8b5cf6] hover:underline uppercase tracking-wider font-bold">
                    Initialize Link
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
