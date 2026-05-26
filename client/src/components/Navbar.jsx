import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, BarChart2, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/10 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="accent-gradient p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Career<span className="text-indigo-400">Sphere</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        {user && (
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive('/')
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/analytics"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive('/analytics')
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </div>
        )}

        {/* Profile / Logout */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-slate-850 px-3 py-1.5 rounded-lg border border-white/5">
              <div className="bg-indigo-650 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs uppercase shadow">
                {user.name ? user.name[0] : <UserIcon className="h-3 w-3" />}
              </div>
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-semibold text-sm border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-400 hover:text-white font-medium text-sm">
              Login
            </Link>
            <Link to="/register" className="accent-gradient text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all">
              Sign Up
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
