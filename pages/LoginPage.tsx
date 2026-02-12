
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, ArrowRight, User, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, WifiOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await signup(name, email, password);
      }

      if (result.error) {
        throw result.error;
      }

      // If session exists (login success or auto-confirmed signup)
      if (result.data && result.data.session) {
        navigate(from, { replace: true });
      } else if (!isLogin && result.data && !result.data.session) {
        // Signup successful but email confirmation required
        setShowVerification(true);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      // Determine the best error message to show
      let msg = 'An authentication error occurred.';
      
      if (typeof err === 'string') {
        msg = err;
      } else if (err?.message) {
        msg = err.message;
      } else if (err?.error_description) {
        msg = err.error_description;
      }

      // Normalize message for check
      const lowerMsg = msg.toLowerCase();

      if (
        lowerMsg.includes('failed to fetch') || 
        lowerMsg.includes('network request failed') ||
        lowerMsg.includes('networkerror') ||
        lowerMsg.includes('connection refused')
      ) {
        msg = 'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (lowerMsg.includes('invalid login credentials')) {
        msg = 'Incorrect email or password. Please try again.';
      } else if (lowerMsg.includes('user already registered')) {
        msg = 'This email is already registered. Please sign in instead.';
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    setIsLogin(true); // Switch to login mode
    setPassword(''); // Clear password for security
  };

  if (showVerification) {
    return (
      <div className="min-h-screen pt-48 pb-24 bg-spirit-50 flex items-center justify-center px-4 animate-fade-in">
         <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-spirit-100 text-center relative animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Mail className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-spirit-900 mb-4">Check Your Email</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
               We have sent a confirmation link to <span className="font-bold text-spirit-900 block mt-1">{email}</span>
               <span className="block mt-4 text-sm">Please verify your email address to complete your registration and access the sanctuary.</span>
            </p>
            <button 
              onClick={handleVerificationClose}
              className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-spirit-800 transition shadow-lg flex items-center justify-center gap-2"
            >
               <span>Return to Login</span>
               <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-48 pb-24 bg-spirit-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-spirit-100 animate-fade-in-up">
        
        <div className="text-center mb-8">
           <div className="mx-auto mb-6">
             <img src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1770399481/Jaadu_Ki-removebg-preview_wnzo57.png" alt="Jaadu ki kaat Logo" className="h-40 mx-auto invert" />
           </div>
           <h1 className="text-3xl font-serif font-bold text-spirit-900 mb-2">
             {isLogin ? 'Welcome Back' : 'Join the Sanctuary'}
           </h1>
           <p className="text-slate-500 text-sm">
             {isLogin ? 'Sign in to continue your spiritual journey.' : 'Create an account to track your orders and requests.'}
           </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
             {error.toLowerCase().includes('connect') ? <WifiOff className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
             <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-spirit-600 focus:outline-none p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-accent-600 transition shadow-lg flex items-center justify-center gap-2 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }} 
              className="text-accent-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
