import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in">
        
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Heading */}
        <div className="text-center mb-8 relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm">
            Sign in to manage your career applications
          </p>
        </div>

        {/* Errors display */}
        {(localError || authError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 animate-ping"></span>
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5 relative">
          
          {/* Email field */}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="accent-gradient w-full text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>

        </form>

        {/* Footer links */}
        <div className="mt-8 text-center border-t border-white/5 pt-6 text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center space-x-1 hover:underline">
            <span>Register here</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
