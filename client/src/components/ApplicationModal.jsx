import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { X, Briefcase, Building, MapPin, Link2, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

const ApplicationModal = ({ isOpen, onClose, onSave, application = null }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    company: '',
    roleTitle: '',
    location: 'Remote',
    source: 'Direct',
    url: '',
    salaryNote: '',
    stage: 'Saved',
    statusNote: '',
    jdText: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        roleTitle: application.roleTitle || '',
        location: application.location || 'Remote',
        source: application.source || 'Direct',
        url: application.url || '',
        salaryNote: application.salaryNote || '',
        stage: application.stage || 'Saved',
        statusNote: application.statusNote || '',
        jdText: application.jdText || '',
      });
    } else {
      setFormData({
        company: '',
        roleTitle: '',
        location: 'Remote',
        source: 'Direct',
        url: '',
        salaryNote: '',
        stage: 'Saved',
        statusNote: '',
        jdText: '',
      });
    }
    setError('');
  }, [application, isOpen]);

  if (!isOpen) return null;

  const { company, roleTitle, location, source, url, salaryNote, stage, statusNote, jdText } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!company || !roleTitle) {
      setError('Company and Job Title are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const urlEndpoint = application
        ? `${API_URL}/applications/${application._id}`
        : `${API_URL}/applications`;
      
      const method = application ? 'PUT' : 'POST';

      const res = await fetch(urlEndpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        onSave(json.data);
        onClose();
      } else {
        setError(json.message || 'Error occurred while saving application');
      }
    } catch (err) {
      setError('Network error saving application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
      
      <div className="glass w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">
              {application ? 'Edit Job Track' : 'Track New Application'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Company Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Building className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="company"
                  value={company}
                  onChange={onChange}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="e.g. Google"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Job Title / Role *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Briefcase className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="roleTitle"
                  value={roleTitle}
                  onChange={onChange}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="e.g. Frontend Engineer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Status Note Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Job Location
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={onChange}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="e.g. Remote / New York"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Current Pipeline Stage
              </label>
              <select
                name="stage"
                value={stage}
                onChange={onChange}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm cursor-pointer"
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="OA">Online Assessment (OA)</option>
                <option value="Interview">Interviewing</option>
                <option value="Offer">Received Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Url, Salary, Source Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Referral / Job URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Link2 className="h-4 w-4" />
                </span>
                <input
                  type="url"
                  name="url"
                  value={url}
                  onChange={onChange}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Salary Note / Range
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="salaryNote"
                  value={salaryNote}
                  onChange={onChange}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="e.g. $120k - $140k"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Application Source
              </label>
              <input
                type="text"
                name="source"
                value={source}
                onChange={onChange}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                placeholder="e.g. LinkedIn / Referral"
              />
            </div>
          </div>

          {/* Quick status notes */}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Status Description / Note
            </label>
            <input
              type="text"
              name="statusNote"
              value={statusNote}
              onChange={onChange}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
              placeholder="e.g. Interview scheduled with EM on June 5"
            />
          </div>

          {/* Job Description (JD) text */}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Job Description (Paste text for Skill Extraction)</span>
              <span className="text-[10px] text-indigo-400 font-semibold lowercase bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                auto-extracts keywords
              </span>
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-slate-500">
                <FileText className="h-4 w-4" />
              </span>
              <textarea
                name="jdText"
                value={jdText}
                onChange={onChange}
                rows="4"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                placeholder="Paste the raw requirements or job post description here to automatically isolate technical skills needed..."
              ></textarea>
            </div>
          </div>

          {/* Footer action buttons */}
          <div className="flex items-center justify-end space-x-4 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="accent-gradient text-white py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin"></span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{application ? 'Save Changes' : 'Create Track'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ApplicationModal;
