import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  X, Calendar, Plus, Trash2, CheckSquare, Square, 
  UserPlus, Mail, Phone, Tag, PlusCircle, AlertTriangle, 
  MapPin, Link2, DollarSign, FileText, CheckCircle2, RefreshCw
} from 'lucide-react';

const ApplicationDrawer = ({ isOpen, onClose, applicationId, onUpdate, onDelete }) => {
  const { token } = useAuth();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  
  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '', title: '', email: '', phone: '', notes: ''
  });

  // Note form state
  const [noteContent, setNoteContent] = useState('');

  // Fetch application details
  const fetchAppDetails = async () => {
    if (!applicationId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setApp(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Failed to fetch details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchAppDetails();
      // Reset form states
      setTaskTitle('');
      setTaskDue('');
      setNoteContent('');
      setShowContactForm(false);
      setContactForm({ name: '', title: '', email: '', phone: '', notes: '' });
      setError('');
    }
  }, [isOpen, applicationId]);

  if (!isOpen || !app) return null;

  // Change stage handler
  const handleStageChange = async (newStage) => {
    try {
      const res = await fetch(`${API_URL}/applications/${app._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage })
      });
      const json = await res.json();
      if (json.success) {
        setApp(json.data);
        onUpdate(json.data); // Notify parent board
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // TASKS MANAGEMENT
  // ==========================================
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDue) return;

    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: taskTitle, dueAt: taskDue })
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails(); // Reload app state
        onUpdate(json.application);
        setTaskTitle('');
        setTaskDue('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ done: !currentStatus })
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails();
        onUpdate(json.application);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails();
        onUpdate(json.application);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // CONTACTS MANAGEMENT
  // ==========================================
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name) return;

    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactForm)
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails();
        onUpdate(json.application);
        setShowContactForm(false);
        setContactForm({ name: '', title: '', email: '', phone: '', notes: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails();
        onUpdate(json.application);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // NOTES MANAGEMENT
  // ==========================================
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent) return;

    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: noteContent })
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails();
        onUpdate(json.application);
        setNoteContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`${API_URL}/applications/${app._id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchAppDetails();
        onUpdate(json.application);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete entire application
  const handleDeleteApp = async () => {
    if (window.confirm(`Are you sure you want to stop tracking ${app.roleTitle} at ${app.company}?`)) {
      try {
        const res = await fetch(`${API_URL}/applications/${app._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          onDelete(app._id);
          onClose();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Format Date for Display
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get stage color
  const getStageBadge = (stage) => {
    const colors = {
      Saved: 'bg-slate-500/20 text-slate-300 border-slate-500/35',
      Applied: 'bg-blue-500/20 text-blue-300 border-blue-500/35',
      OA: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
      Interview: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
      Offer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
      Rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    };
    return colors[stage] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-slate-900/95 border-l border-white/10 shadow-2xl backdrop-blur-md flex flex-col transition-transform duration-300 animate-fade-in">
      
      {/* Drawer Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{app.roleTitle}</h3>
          <p className="text-slate-400 text-sm font-semibold">{app.company}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        
        {/* Stage and Core info Grid */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status Stage</span>
            <select
              value={app.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="glass-input text-xs px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="OA">OA</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase ${getStageBadge(app.stage)}`}>
              {app.stage}
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-semibold text-slate-400">Added: {formatDate(app.createdAt)}</span>
          </div>

          {/* Quick info tags */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/5">
            <div className="flex items-center space-x-2">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-300 truncate">{app.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-300 truncate">{app.salaryNote || 'No salary specified'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-300 truncate">via {app.source}</span>
            </div>
            {app.url && (
              <div className="flex items-center space-x-2">
                <Link2 className="h-3.5 w-3.5 text-slate-500" />
                <a 
                  href={app.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:text-indigo-300 font-semibold truncate hover:underline"
                >
                  Job Posting
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Status description note */}
        {app.statusNote && (
          <div className="border-l-2 border-indigo-500 pl-4 py-1 text-slate-300 text-sm bg-indigo-500/5 rounded-r-lg pr-2 border-y border-r border-indigo-500/10">
            <span className="text-slate-400 font-bold block text-xs uppercase tracking-wider mb-0.5">Status Note</span>
            <p>{app.statusNote}</p>
          </div>
        )}

        {/* Skills Extraction / JD Keywords */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span>Job Required Technologies</span>
          </h4>
          {app.skillsMatched && app.skillsMatched.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {app.skillsMatched.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-800/20 p-3 rounded-lg border border-white/5">
              No skills listed. You can add a Job Description in the Edit form to trigger auto keyword extraction.
            </p>
          )}
        </div>

        {/* Tasks Section */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Tasks & Reminders</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-md">
              {app.tasks.filter(t => t.done).length}/{app.tasks.length} Done
            </span>
          </h4>

          {/* Task Addition Form */}
          <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add next checklist action..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="glass-input flex-1 px-3 py-1.5 rounded-lg text-xs"
              required
            />
            <input
              type="date"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
              className="glass-input w-[110px] px-2 py-1.5 rounded-lg text-[10px] cursor-pointer"
              required
            />
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg cursor-pointer transition-colors shadow"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Task Items */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {app.tasks && app.tasks.length > 0 ? (
              app.tasks.map((task) => (
                <div 
                  key={task._id} 
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs ${
                    task.done 
                      ? 'bg-slate-900/30 border-white/5 text-slate-500 line-through' 
                      : 'bg-slate-800/30 border-white/5 hover:border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <button 
                      onClick={() => handleToggleTask(task._id, task.done)}
                      className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      {task.done ? (
                        <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
                      ) : (
                        <Square className="h-4.5 w-4.5" />
                      )}
                    </button>
                    <div className="truncate pr-2">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Due: {formatDate(task.dueAt)}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-800/10 rounded-lg">
                No reminders scheduled. Add an interview date or OA deadline above!
              </p>
            )}
          </div>
        </div>

        {/* Contacts Section */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-indigo-400" />
              <span>Contacts & Recruiters</span>
            </span>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md cursor-pointer flex items-center space-x-0.5"
            >
              <PlusCircle className="h-3 w-3" />
              <span>{showContactForm ? 'Hide' : 'New'}</span>
            </button>
          </h4>

          {/* Contact Addition Form */}
          {showContactForm && (
            <form onSubmit={handleAddContact} className="bg-slate-800/50 p-4 rounded-lg border border-white/5 space-y-3 mb-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name *"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="glass-input px-3 py-1.5 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Role (e.g. HR, Referral)"
                  value={contactForm.title}
                  onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                  className="glass-input px-3 py-1.5 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="glass-input px-3 py-1.5 rounded-lg text-xs"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="glass-input px-3 py-1.5 rounded-lg text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="Personal notes about contact..."
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                className="glass-input w-full px-3 py-1.5 rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-3 py-1 bg-transparent text-slate-400 hover:text-white rounded-md text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg text-[10px] font-bold shadow cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Contact Items */}
          <div className="space-y-2">
            {app.contacts && app.contacts.length > 0 ? (
              app.contacts.map((contact) => (
                <div 
                  key={contact._id} 
                  className="bg-slate-800/20 p-3 rounded-lg border border-white/5 text-xs flex justify-between items-start"
                >
                  <div className="space-y-1.5 min-w-0 pr-2">
                    <div>
                      <span className="font-bold text-slate-200 block text-xs">{contact.name}</span>
                      {contact.title && (
                        <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-550/10 px-1.5 py-0.5 rounded border border-indigo-550/20">
                          {contact.title}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-0.5 text-[10px] text-slate-400 font-semibold">
                      {contact.email && (
                        <div className="flex items-center space-x-1.5">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center space-x-1.5">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-[10px] text-slate-450 italic border-t border-white/5 pt-1 mt-1 truncate">
                        "{contact.notes}"
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteContact(contact._id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-800/10 rounded-lg">
                No recruiter or network contacts logged yet.
              </p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
            <PlusCircle className="h-4 w-4 text-indigo-400" />
            <span>Interview Notes Log</span>
          </h4>

          {/* Note Input */}
          <form onSubmit={handleAddNote} className="space-y-2 mb-3">
            <textarea
              placeholder="Log details of your last call, technical interview questions, or follow-ups here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows="3"
              className="glass-input w-full p-2.5 rounded-lg text-xs"
              required
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {app.notes && app.notes.length > 0 ? (
              app.notes.slice().reverse().map((note) => (
                <div 
                  key={note._id} 
                  className="bg-slate-900/40 p-3 rounded-lg border border-white/5 text-xs relative group"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mb-1">
                    <span>{formatDate(note.createdAt)}</span>
                    <button 
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-slate-600 hover:text-red-400 p-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{note.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-800/10 rounded-lg">
                No logs entered. Log mock feedback or interview questions.
              </p>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-500/15 pt-6 mt-8">
          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Danger Zone</span>
          </h4>
          <button
            onClick={handleDeleteApp}
            className="w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer"
          >
            Delete Job Application Entry
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApplicationDrawer;
