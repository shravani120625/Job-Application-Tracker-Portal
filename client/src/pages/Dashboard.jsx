import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ApplicationModal from '../components/ApplicationModal';
import ApplicationDrawer from '../components/ApplicationDrawer';
import { 
  Plus, Search, SlidersHorizontal, MapPin, Tag, 
  DollarSign, CheckSquare, Phone, MoreVertical, Edit2, 
  FileSpreadsheet, Upload, Download, Loader2, ArrowRight
} from 'lucide-react';

const STAGES = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

const Dashboard = () => {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  
  // Modals & Drawers states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppForEdit, setSelectedAppForEdit] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState(null);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvSuccessMessage, setCsvSuccessMessage] = useState('');

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error('[Fetch Apps Failed]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  // Apply filters
  useEffect(() => {
    let result = [...applications];

    // Search query filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.company.toLowerCase().includes(term) ||
          app.roleTitle.toLowerCase().includes(term)
      );
    }

    // Location filter
    if (locationFilter !== 'All') {
      result = result.filter((app) => app.location === locationFilter);
    }

    // Source filter
    if (sourceFilter !== 'All') {
      result = result.filter((app) => app.source === sourceFilter);
    }

    setFilteredApps(result);
  }, [applications, searchTerm, locationFilter, sourceFilter]);

  // Handle new or updated application from modal save
  const handleSaveApp = (savedApp) => {
    // Check if it was an update or create
    const exists = applications.some((a) => a._id === savedApp._id);
    if (exists) {
      setApplications(applications.map((a) => (a._id === savedApp._id ? savedApp : a)));
    } else {
      setApplications([savedApp, ...applications]);
    }
  };

  // Handle drawer application updates (e.g. stage changed in drawer, tasks updated)
  const handleUpdateApp = (updatedApp) => {
    setApplications(applications.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
  };

  // Handle application delete
  const handleDeleteApp = (appId) => {
    setApplications(applications.filter((a) => a._id !== appId));
  };

  // Drag and Drop (Fallback interactive stage selectors)
  const handleMoveStage = async (appId, currentStage, direction) => {
    const currentIndex = STAGES.indexOf(currentStage);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= STAGES.length) return;
    
    const nextStage = STAGES[nextIndex];
    try {
      const res = await fetch(`${API_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: nextStage })
      });
      const json = await res.json();
      if (json.success) {
        handleSaveApp(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client-side CSV Parser & Uploader
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvUploading(true);
    setCsvSuccessMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      
      // Parse Headers: e.g. Company,Role,Location,Source,Stage,Salary,Url
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newApps = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple comma split (fails for values with commas inside quotes, but standard for student tests)
        const values = lines[i].split(',').map(v => v.trim());
        
        const appObj = {};
        headers.forEach((header, idx) => {
          let key = header;
          if (header.includes('company')) key = 'company';
          if (header.includes('role') || header.includes('title')) key = 'roleTitle';
          if (header.includes('loc')) key = 'location';
          if (header.includes('source')) key = 'source';
          if (header.includes('stage')) key = 'stage';
          if (header.includes('salary')) key = 'salaryNote';
          if (header.includes('url') || header.includes('link')) key = 'url';
          
          appObj[key] = values[idx] || '';
        });

        // Validation & Defaults
        if (!appObj.company || !appObj.roleTitle) continue;
        if (!appObj.stage) appObj.stage = 'Saved';
        
        // Match stage casing to enum
        const matchedStage = STAGES.find(s => s.toLowerCase() === appObj.stage.toLowerCase());
        appObj.stage = matchedStage || 'Saved';

        newApps.push(appObj);
      }

      // Upload apps in sequence
      let count = 0;
      for (const newApp of newApps) {
        try {
          const res = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newApp)
          });
          const json = await res.json();
          if (json.success) {
            count++;
          }
        } catch (err) {
          console.error('[CSV Row Upload Failed]', err);
        }
      }

      setCsvSuccessMessage(`Imported ${count} applications successfully!`);
      setCsvUploading(false);
      fetchApplications(); // Reload board
    };

    reader.readAsText(file);
    e.target.value = null; // Reset file input
  };

  // Helper lists for dropdown filters
  const uniqueLocations = ['All', ...new Set(applications.map((a) => a.location).filter(Boolean))];
  const uniqueSources = ['All', ...new Set(applications.map((a) => a.source).filter(Boolean))];

  // Group applications by column
  const columns = {};
  STAGES.forEach((stage) => {
    columns[stage] = filteredApps.filter((app) => app.stage === stage);
  });

  return (
    <div className="min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Welcome Dashboard Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between bg-slate-850 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden animate-fade-in">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Hello, <span className="text-indigo-400">{user?.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              You are currently tracking <span className="text-white font-bold">{applications.length}</span> applications in your job search.
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
            {/* CSV Import */}
            <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs border border-white/10 transition-all cursor-pointer shadow">
              <Upload className="h-4 w-4" />
              <span>{csvUploading ? 'Importing...' : 'Bulk CSV Import'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={csvUploading}
                className="hidden"
              />
            </label>

            {/* Manual Track */}
            <button
              onClick={() => {
                setSelectedAppForEdit(null);
                setIsModalOpen(true);
              }}
              className="accent-gradient text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Track Application</span>
            </button>
          </div>
        </div>

        {csvSuccessMessage && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <span>{csvSuccessMessage}</span>
            <button onClick={() => setCsvSuccessMessage('')} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Search, Filter, Stats Controls Row */}
        <div className="mb-6 bg-slate-850 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by company or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2 rounded-lg text-sm"
            />
          </div>

          {/* Filters Toggle and Dropdowns */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                showFilters 
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                  : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 animate-fade-in">
                {/* Location Filter */}
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="glass-input text-xs px-2.5 py-2 rounded-lg cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  {uniqueLocations.filter(l => l !== 'All').map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="glass-input text-xs px-2.5 py-2 rounded-lg cursor-pointer"
                >
                  <option value="All">All Sources</option>
                  {uniqueSources.filter(s => s !== 'All').map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-2" />
            <p className="text-xs font-semibold">Syncing career board...</p>
          </div>
        )}

        {/* Kanban Board Grid Layout */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const appList = columns[stage] || [];
              return (
                <div key={stage} className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 flex flex-col min-w-[190px]">
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3.5 px-1.5">
                    <span className="font-bold text-white text-sm tracking-wide">{stage}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-white/5 px-2 py-0.5 rounded-full shadow-inner">
                      {appList.length}
                    </span>
                  </div>

                  {/* Kanban Cards Scroll Area */}
                  <div className="space-y-3.5 kanban-column pr-0.5">
                    {appList.length > 0 ? (
                      appList.map((app) => (
                        <div
                          key={app._id}
                          onClick={() => {
                            setSelectedAppForDrawer(app._id);
                            setIsDrawerOpen(true);
                          }}
                          className="glass glass-hover p-4 rounded-xl flex flex-col space-y-3 cursor-pointer relative group"
                        >
                          {/* Card Controls */}
                          <div className="flex justify-between items-start gap-1">
                            <h5 className="font-extrabold text-white text-sm leading-snug truncate pr-3" title={app.roleTitle}>
                              {app.roleTitle}
                            </h5>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppForEdit(app);
                                setIsModalOpen(true);
                              }}
                              className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div>
                            <p className="text-slate-350 text-xs font-semibold truncate" title={app.company}>
                              {app.company}
                            </p>
                          </div>

                          {/* Quick details */}
                          <div className="flex flex-col space-y-1.5 text-[10px] text-slate-450 font-semibold pt-1 border-t border-white/5">
                            <div className="flex items-center space-x-1.5 text-slate-400">
                              <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                              <span className="truncate">{app.location}</span>
                            </div>
                            {app.salaryNote && (
                              <div className="flex items-center space-x-1.5 text-indigo-300">
                                <DollarSign className="h-3 w-3 text-indigo-400/80 flex-shrink-0" />
                                <span className="truncate">{app.salaryNote}</span>
                              </div>
                            )}
                          </div>

                          {/* Sub-resource summaries (Tasks count) */}
                          {app.tasks && app.tasks.length > 0 && (
                            <div className="flex items-center justify-between text-[9px] font-bold bg-slate-900/40 p-1.5 rounded-lg border border-white/5 text-slate-450">
                              <span className="flex items-center space-x-1">
                                <CheckSquare className="h-3 w-3 text-slate-500" />
                                <span>Action Item</span>
                              </span>
                              <span className="text-slate-300">
                                {app.tasks.filter((t) => t.done).length}/{app.tasks.length} Done
                              </span>
                            </div>
                          )}

                          {/* Quick Stage shifting tools */}
                          <div className="flex justify-between items-center pt-2 text-[9px] text-slate-500 border-t border-white/5 font-semibold">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app._id, app.stage, -1);
                              }}
                              disabled={stage === STAGES[0]}
                              className="hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer"
                            >
                              ◀ Prev
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app._id, app.stage, 1);
                              }}
                              disabled={stage === STAGES[STAGES.length - 1]}
                              className="hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer"
                            >
                              Next ▶
                            </button>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="h-28 border border-dashed border-white/5 rounded-xl flex items-center justify-center p-3 text-slate-650 text-[10px] text-center font-medium select-none">
                        Drop items or track new cards here
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Global Modals and Side Sliders */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppForEdit(null);
        }}
        onSave={handleSaveApp}
        application={selectedAppForEdit}
      />

      <ApplicationDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedAppForDrawer(null);
        }}
        applicationId={selectedAppForDrawer}
        onUpdate={handleUpdateApp}
        onDelete={handleDeleteApp}
      />
    </div>
  );
};

export default Dashboard;
