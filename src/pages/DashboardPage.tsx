import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download, X, Plus, ChevronDown, Briefcase, XCircle, LayoutDashboard, UserCheck, Users,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { saveRole, loadUserRoles, closeRole, loadUserField, saveUserField, PostedRole } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [jobPosted, setJobPosted] = useState(false);
  const [postedRoles, setPostedRoles] = useState<PostedRole[]>([]);
  const [isPostingRole, setIsPostingRole] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      loadUserField<boolean>(user.uid, 'isRecruiter', false),
      loadUserRoles(user.uid),
    ]).then(([recruiter, roles]) => {
      setIsRecruiter(recruiter);
      setPostedRoles(roles.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
      setRoleLoading(false);
    });
  }, [user]);

  if (roleLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isRecruiter) {
    const handleRequestAccess = async () => {
      if (!user) return;
      await saveUserField(user.uid, 'isRecruiter', true);
      setIsRecruiter(true);
    };

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600">
          <LayoutDashboard size={40} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-2xl font-bold">Recruiter Access Required</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            The talent dashboard is available to verified employers and hiring partners. Request access to unlock candidate analytics and role posting.
          </p>
        </div>
        <button
          onClick={handleRequestAccess}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-200 transition-all"
        >
          Request Recruiter Access
        </button>
        <p className="text-xs text-gray-400">For demo purposes, clicking above grants instant access.</p>
      </div>
    );
  }

  const formatDate = (ts: Timestamp) =>
    ts.toDate().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleExportCSV = () => {
    const headers = ['Title', 'Type', 'Status', 'Posted'];
    const rows = postedRoles.map(r => [r.title, r.type, r.status, formatDate(r.createdAt)]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pathher-roles.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePostRole = async () => {
    if (!jobTitle.trim() || !user) return;
    setIsPostingRole(true);
    const displayName = user.displayName || user.email?.split('@')[0] || 'Admin';
    const id = await saveRole({
      title: jobTitle.trim(),
      type: jobType,
      postedBy: user.uid,
      postedByName: displayName,
      createdAt: Timestamp.now(),
      status: 'active',
    });
    if (id) {
      const newRole: PostedRole = {
        id,
        title: jobTitle.trim(),
        type: jobType,
        postedBy: user.uid,
        postedByName: displayName,
        createdAt: Timestamp.now(),
        status: 'active',
      };
      setPostedRoles(prev => [newRole, ...prev]);
    }
    setIsPostingRole(false);
    setJobPosted(true);
    setTimeout(() => {
      setShowPostModal(false);
      setJobTitle('');
      setJobType('Full-time');
      setJobPosted(false);
    }, 1800);
  };

  const handleCloseRole = async (roleId: string) => {
    await closeRole(roleId);
    setPostedRoles(prev => prev.map(r => r.id === roleId ? { ...r, status: 'closed' } : r));
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Post Role Modal */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-purple-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={e => { if (e.target === e.currentTarget) setShowPostModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg space-y-8 relative"
            >
              <button onClick={() => setShowPostModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
              {!jobPosted ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Post a New Role</h2>
                    <p className="text-gray-500 text-sm">Share an opening with women on the PathHer network.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        placeholder="e.g. Junior Software Developer"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Job Type</label>
                      <div className="relative">
                        <select
                          value={jobType}
                          onChange={e => setJobType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm appearance-none cursor-pointer"
                        >
                          {['Full-time', 'Part-time', 'Contract', 'Internship', 'Graduate Program'].map(t => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePostRole}
                    disabled={!jobTitle.trim() || isPostingRole}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPostingRole
                      ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : 'Post Role'
                    }
                  </button>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <UserCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Role Posted!</h3>
                  <p className="text-gray-500 text-sm">"{jobTitle}" is now live to the talent network.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-gray-500 text-sm md:text-base">Welcome back, {user?.displayName?.split(' ')[0] || 'there'}. Manage the roles you've posted.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            disabled={postedRoles.length === 0}
            className="px-4 py-2 bg-white border border-purple-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export Roles
          </button>
          <button
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Post New Role
          </button>
        </div>
      </div>

      {/* Posted Roles */}
      {postedRoles.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-purple-50 shadow-sm p-10 text-center space-y-3">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase size={28} />
          </div>
          <h2 className="text-xl font-bold">No roles posted yet</h2>
          <p className="text-gray-500 text-sm">Post your first role to start reaching candidates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-purple-50 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-purple-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <h2 className="text-xl font-bold">Your Posted Roles</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium">{postedRoles.filter(r => r.status === 'active').length} active</span>
          </div>
          <div className="divide-y divide-purple-50">
            {postedRoles.map(role => (
              <div key={role.id} className="px-4 md:px-8 py-4 md:py-5 flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{role.title}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-400">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                        role.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                      )}>{role.status}</span>
                      <span>{role.type}</span>
                      <span>{formatDate(role.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {role.status === 'active' && (
                  <button
                    onClick={() => role.id && handleCloseRole(role.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle size={16} />
                    Close
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talent */}
      <div className="bg-white rounded-[2.5rem] border border-purple-50 shadow-sm p-10 text-center space-y-3">
        <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
          <Users size={28} />
        </div>
        <h2 className="text-xl font-bold">Talent Matches</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Candidates will appear here as women complete their assessment and earn certificates. There are no matches to show yet.
        </p>
      </div>
    </div>
  );
}
