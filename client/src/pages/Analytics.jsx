import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { 
  Award, RefreshCw, Layers, CheckCircle2, TrendingUp, 
  Clock, Calendar, Sparkles, Loader2, ListChecks
} from 'lucide-react';

const Analytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartWidth, setChartWidth] = useState(500);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (cardRef.current) {
        // Subtract 48px padding (p-6 is 24px left + 24px right)
        setChartWidth(cardRef.current.clientWidth - 48);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    // Delay slightly to ensure browser has completed layout reflow
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [data, isLoading]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Failed to load analytics metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  // Format Date for Upcoming Tasks
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get days remaining
  const getDaysRemaining = (dateStr) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-2" />
          <p className="text-xs font-semibold">Running database aggregates...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-md mx-auto mt-24 p-6 glass rounded-2xl text-center">
          <p className="text-red-400 mb-4">{error || 'Could not fetch data'}</p>
          <button onClick={fetchAnalytics} className="accent-gradient text-white px-4 py-2 rounded-xl text-xs font-bold shadow">
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const { kpis, funnel, monthlyData, upcomingTasks } = data;

  // Format funnel data for Recharts Bar Chart
  const funnelChartData = [
    { stage: 'Saved', applications: funnel.Saved, fill: '#64748b' },
    { stage: 'Applied', applications: funnel.Applied, fill: '#3b82f6' },
    { stage: 'OA', applications: funnel.OA, fill: '#a855f7' },
    { stage: 'Interview', applications: funnel.Interview, fill: '#f59e0b' },
    { stage: 'Offer', applications: funnel.Offer, fill: '#10b981' },
    { stage: 'Rejected', applications: funnel.Rejected, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Title */}
        <div className="mb-8 flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Search Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">Isolate conversion bottlenecks and view scheduling calendars</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/5 shadow cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Report</span>
          </button>
        </div>

        {/* KPI Scorecards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8 animate-fade-in">
          
          {/* Card 1: Total Apps */}
          <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 bg-indigo-500/10 rounded-bl-2xl">
              <Layers className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">Total Tracked</span>
            <span className="text-3xl font-extrabold text-white mt-4 block">{kpis.totalApplications}</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1.5">applications added</span>
          </div>

          {/* Card 2: Active Apps */}
          <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 bg-blue-500/10 rounded-bl-2xl">
              <TrendingUp className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">Active Submissions</span>
            <span className="text-3xl font-extrabold text-white mt-4 block">{kpis.activeApplications}</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1.5">excluding saved drafts</span>
          </div>

          {/* Card 3: Interviews */}
          <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 bg-amber-500/10 rounded-bl-2xl">
              <Clock className="h-4.5 w-4.5 text-amber-400" />
            </div>
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">Interviewing</span>
            <span className="text-3xl font-extrabold text-white mt-4 block">{kpis.interviews}</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1.5">stages active currently</span>
          </div>

          {/* Card 4: Offers */}
          <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 rounded-bl-2xl">
              <Award className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">Offers Converted</span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-4 block">{kpis.offers}</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1.5">successful conversions</span>
          </div>

          {/* Card 5: Response Rate */}
          <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 bg-purple-500/10 rounded-bl-2xl">
              <CheckCircle2 className="h-4.5 w-4.5 text-purple-400" />
            </div>
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">Response Rate</span>
            <span className="text-3xl font-extrabold text-white mt-4 block">{kpis.responseRate}</span>
            <span className="text-[10px] text-slate-550 font-semibold block mt-1.5">feedback response frequency</span>
          </div>

        </div>

        {/* Charts Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in">
          
          {/* Funnel chart card */}
          <div ref={cardRef} className="glass p-6 rounded-2xl border border-white/5 flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <Layers className="h-5 w-5 text-indigo-400" />
              <h4 className="text-base font-bold text-white tracking-wide">Application Funnel Breakdown</h4>
            </div>
            <div className="h-[280px] w-full flex-1">
              <BarChart width={chartWidth} height={280} data={funnelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="applications" radius={[6, 6, 0, 0]}>
                  {funnelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </div>
          </div>

          {/* Line Trend chart card */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h4 className="text-base font-bold text-white tracking-wide">Submission Volume Trend</h4>
            </div>
            <div className="h-[280px] w-full flex-1">
              <LineChart width={chartWidth} height={280} data={monthlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </div>
          </div>

        </div>

        {/* Upcoming events calendar panel */}
        <div className="glass p-6 rounded-2xl border border-white/5 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <h4 className="text-base font-bold text-white tracking-wide">Upcoming Action Item Deadlines</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">Urgent checklists due within the next 14 days</p>

          <div className="space-y-3">
            {upcomingTasks && upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <div 
                  key={task.taskId} 
                  className="bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/25 text-indigo-400 flex-shrink-0">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-indigo-400 font-bold block mb-0.5 uppercase tracking-wider">{task.company}</span>
                      <p className="font-extrabold text-sm text-slate-200 truncate">{task.taskTitle}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Role: {task.roleTitle} ({task.stage})
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-semibold">
                    <div className="text-left sm:text-right">
                      <p className="text-slate-350">{formatDate(task.dueAt)}</p>
                      <p className="text-indigo-400 text-[10px] mt-0.5 uppercase tracking-wider font-bold">
                        {getDaysRemaining(task.dueAt)}
                      </p>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 bg-slate-800/10 rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center">
                <Sparkles className="h-6 w-6 text-slate-650 mb-2 animate-bounce" />
                <p className="text-xs font-semibold">All caught up! No deadlines pending in the next two weeks.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Analytics;
