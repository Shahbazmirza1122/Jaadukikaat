
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, ArrowRight, User, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        const { error } = await signup(name, email, password);
        if (error) throw error;
        
        // Show verification popup on successful signup
        setShowVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred.');
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
      <div className="min-h-screen pt-24 pb-20 bg-spirit-50 flex items-center justify-center px-4 animate-fade-in">
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
    <div className="min-h-screen pt-24 pb-20 bg-spirit-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-spirit-100 animate-fade-in-up">
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
             <Sun className="w-8 h-8 text-accent-500" />
           </div>
           <h1 className="text-3xl font-serif font-bold text-spirit-900 mb-2">
             {isLogin ? 'Welcome Back' : 'Join the Sanctuary'}
           </h1>
           <p className="text-slate-500 text-sm">
             {isLogin ? 'Sign in to continue your spiritual journey.' : 'Create an account to track your orders and requests.'}
           </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
             <AlertCircle className="w-5 h-5 shrink-0" />
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
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
            />
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
