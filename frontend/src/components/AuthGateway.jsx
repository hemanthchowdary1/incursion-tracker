import React, { useState } from 'react';
import axios from 'axios';
import bgImage from '../assets/login-bg.jpg';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function AuthGateway({ onBack, onLogin }) { 
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Automatically removes any spaces if they type them in the username field
    if (e.target.name === 'username') {
      value = value.replace(/\s+/g, ''); 
    }

    setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/api/auth/request-otp/`, {
        email: formData.email,
        username: formData.username
      });
      setStep(2); // Move to OTP input screen
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/register/`, formData);
      localStorage.setItem('username', response.data.username);
      onLogin(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login/`, {
        username: formData.username,
        password: formData.password
      });
      localStorage.setItem('username', response.data.username);
      onLogin(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full fixed inset-0 z-[100] flex items-center justify-center font-['Inter']">
      
      <div className="absolute inset-0 bg-[#050706]">
        <img 
          src={bgImage} 
          alt="Cinematic Background" 
          className="w-full h-full object-cover opacity-50 blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-[#050706]/80 to-[#050706]/40" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] p-10 rounded-3xl bg-gradient-to-b from-emerald-950/30 to-black/50 backdrop-blur-2xl border border-emerald-400/15 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.08)] mx-4 animate-fade-in-up">
        
        <div className="mb-10 text-center">
          <h2 className="font-['Chakra_Petch'] text-3xl text-white/80 font-semibold tracking-wide">
            {isLogin ? 'Welcome Back' : (step === 1 ? 'Create Account' : 'Verify Email')}
          </h2>
          
          <p className="text-white/50 text-s mt-2 font-light">
            {isLogin ? 'Sign in to sync your timeline progress.' : (
              step === 1 ? 'Join to track the multiversal collision.' : (
                <>
                  Code sent to <span className="text-emerald-400">{formData.email}</span>
                  <br />
                  <button 
                    type="button" 
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }} 
                    className="text-white/45 hover:text-white text-xs mt-1.5 transition-colors underline"
                  >
                    Change email address
                  </button>
                </>
              )
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : (step === 1 ? handleRequestOTP : handleVerifyAndRegister)} key={`${isLogin}-${step}`} className="flex flex-col gap-5">

          {/* STEP 1: Standard Inputs */}
          {(!isLogin && step === 2) ? null : (
            <>
              {/* Username */}
              <div className="flex flex-col gap-2 animate-fade-in-up">
                <label className="text-s text-white/60 font-medium ml-1">Username</label>
                <input 
                  type="text" name="username" onChange={handleChange} required
                  className="w-full bg-emerald-500/[0.04] border border-emerald-400/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/40 focus:bg-emerald-500/[0.08] transition-all text-s" 
                  placeholder="logan" 
                />
              </div>

              {/* Email Field */}
              {!isLogin && (
                <div className="flex flex-col gap-2 animate-fade-in-up">
                  <label className="text-s text-white/60 font-medium ml-1">Email</label>
                  <input 
                    type="email" name="email" onChange={handleChange} required={!isLogin}
                    className="w-full bg-emerald-500/[0.04] border border-emerald-400/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/40 focus:bg-emerald-500/[0.08] transition-all text-s" 
                    placeholder="you@example.com" 
                  />
                </div>
              )}

              {/* Password */}
              <div className="flex flex-col gap-2 animate-fade-in-up">
                <div className="flex items-center ml-1">
                    <label className="text-s text-white/60 font-medium">Password</label>
                </div>
                <input 
                  type="password" name="password" onChange={handleChange} required
                  className="w-full bg-emerald-500/[0.04] border border-emerald-400/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/40 focus:bg-emerald-500/[0.08] transition-all text-lg tracking-widest" 
                  placeholder="••••••••" 
                />
              </div>
            </>
          )}

          {/* STEP 2: OTP Input */}
          {!isLogin && step === 2 && (
            <div className="flex flex-col gap-2 animate-fade-in-up">
              <label className="text-s text-emerald-400/70 font-['JetBrains_Mono'] tracking-widest ml-1 uppercase">Transmission Code</label>
              <input 
                type="text" name="otp" onChange={handleChange} required maxLength="6"
                className="w-full bg-emerald-500/[0.04] border border-emerald-400/20 rounded-xl px-4 py-3 text-emerald-500 placeholder-white/20 focus:outline-none focus:border-emerald-400/60 focus:bg-emerald-500/[0.08] transition-all text-xl tracking-[0.5em] text-center font-['JetBrains_Mono']" 
                placeholder="000000" 
              />
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading} 
            className="mt-4 w-full bg-white/90 text-black hover:bg-gray-300 font-semibold py-3.5 rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:hover:bg-white/90"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : (step === 1 ? 'Continue' : 'Verify & Create Account'))}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-8 text-center text-sm text-white/50">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1); // Reset step if toggled
              setError('');
            }} 
            className="text-[#00a555] hover:text-[#00cf64] hover:underline font-medium ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

        {/* Close Button */}
        <button 
          onClick={onBack}
          className="absolute top-5 right-5 text-white/40 hover:text-emerald-300 transition-colors p-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}