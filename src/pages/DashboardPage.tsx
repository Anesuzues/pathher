import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download, X, Plus, ChevronDown, Briefcase, XCircle, LayoutDashboard, UserCheck, Users, Sparkles,
} from 'lucide-react';
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { saveRole, loadUserRoles, closeRole, PostedRole } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { CAREER_PATHS } from '../constants';
import { aiErrorMessage, requestAi, type RoleResult } from '../lib/ai';

const MAX_DESCRIPTION = 3000;

// Turns an AI draft into plain text the recruiter can edit before posting.
function roleDraftText(r: RoleResult): string {
  return `${r.summary}\n\nWhat you'll do:\n${r.responsibilities.map(x => `• ${x}`).join('\n')}\n\nWhat we're looking for:\n${r.skills.map(x => `• ${x}`).join('\n')}`;
}

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPathId, setJobPathId] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftNotice, setDraftNotice] = useState('');
  const [jobPosted, setJobPosted] = useState(false);
  const [postedRoles, setPostedRoles] = useState<PostedRole[]>([]);
  const [isPostingRole, setIsPostingRole] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [closeError, setCloseError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [recruiterRequested, setRecruiterRequested] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadUserRoles(user.uid).then(roles => {
      setPostedRoles(roles.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
    });
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        if (snap.data()?.isRecruiter === true) setIsRecruiter(true);
        if (snap.data()?.recruiterRequested === true) setRecruiterRequested(true);
      }
    }).catch(() => { /* non-fatal */ });
  }, [user]);

  if (!isRecruiter) {
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
        {recruiterRequested ? (
          <div className="px-8 py-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-bold text-sm text-center max-w-xs">
            Request received — our team will review your application and get back to you within 2 business days.
          </div>
        ) : (
          <button
            type="button"
            onClick={async () => {
              if (!user) return;
              setRequestError('');
              try {
                await setDoc(doc(db, 'users', user.uid), { recruiterRequested: true }, { merge: true });
                setRecruiterRequested(true);
              } catch {
                setRequestError("We couldn't send your request. Please try again.");
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-200 transition-all"
          >
            Request Recruiter Access
          </button>
        )}
        {requestError && <p className="text-sm text-red-600 font-medium">{requestError}</p>}
      </div>
    );
  }

  const pathTitle = (id?: string) => CAREER_PATHS.find(p => p.id === id)?.title;

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

  const handleDraftRole = async () => {
    if (!jobTitle.trim() || isDrafting) return;
    setDraftNotice('');
    setIsDrafting(true);
    try {
      const draft = await requestAi('role', { title: jobTitle.trim(), type: jobType, paths: CAREER_PATHS.map(p => p.title) });
      setJobDescription(roleDraftText(draft).slice(0, MAX_DESCRIPTION));
      setJobPathId(CAREER_PATHS.find(p => p.title === draft.pathTitle)?.id ?? '');
    } catch (e) {
      setDraftNotice(aiErrorMessage(e));
    } finally {
      setIsDrafting(false);
    }
  };

  const resetPostForm = () => {
    setShowPostModal(false);
    setJobTitle('');
    setJobType('Full-time');
    setJobDescription('');
    setJobPathId('');
    setDraftNotice('');
    setJobPosted(false);
  };

  const handlePostRole = async () => {
    if (!jobTitle.trim() || !user) return;
    setRoleError('');
    setIsPostingRole(true);
    const displayName = user.displayName || user.email?.split('@')[0] || 'Admin';
    const details = {
      ...(jobDescription.trim() ? { description: jobDescription.trim().slice(0, MAX_DESCRIPTION) } : {}),
      ...(jobPathId ? { pathId: jobPathId } : {}),
    };
    const id = await saveRole({
      title: jobTitle.trim(),
      type: jobType,
      ...details,
      postedBy: user.uid,
      postedByName: displayName,
      createdAt: Timestamp.now(),
      status: 'active',
    });
    setIsPostingRole(false);
    if (!id) {
      setRoleError("We couldn't post this role. Please check your connection and try again.");
      return;
    }
    const newRole: PostedRole = {
      id,
      title: jobTitle.trim(),
      type: jobType,
      ...details,
      postedBy: user.uid,
      postedByName: displayName,
      createdAt: Timestamp.now(),
      status: 'active',
    };
    setPostedRoles(prev => [newRole, ...prev]);
    setJobPosted(true);
    setTimeout(resetPostForm, 1800);
  };

  const handleCloseRole = async (roleId: string) => {
    setCloseError('');
    if (!(await closeRole(roleId))) {
      setCloseError("We couldn't close that role. Please try again.");
      return;
    }
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
              <button type="button" title="Close" onClick={() => setShowPostModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600">
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
                          title="Job type"
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-bold text-gray-700">Description (optional)</label>
                        <button
                          type="button"
                          onClick={handleDraftRole}
                          disabled={!jobTitle.trim() || isDrafting}
                          className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles size={12} className={isDrafting ? 'animate-pulse' : ''} />
                          {isDrafting ? 'Writing…' : jobDescription.trim() ? 'Rewrite with AI' : 'Write with AI'}
                        </button>
                      </div>
                      <textarea
                        value={jobDescription}
                        onChange={e => setJobDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
                        placeholder="What the role involves and who it suits. Add a title, then let AI write a first draft."
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all resize-none"
                      />
                      {draftNotice && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{draftNotice}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Best-suited PathHer path</label>
                      <div className="relative">
                        <select
                          title="Career path"
                          value={jobPathId}
                          onChange={e => setJobPathId(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Not linked to a path</option>
                          {CAREER_PATHS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  {roleError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{roleError}</p>
                  )}
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
          <p className="text-gray-500 text-sm md:text-base">Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Recruiter'}. Manage the roles you've posted.</p>
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
          {closeError && (
            <p className="mx-4 md:mx-8 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{closeError}</p>
          )}
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
                      {pathTitle(role.pathId) && <span className="text-purple-500">{pathTitle(role.pathId)} path</span>}
                    </div>
                    {role.description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pt-1">{role.description}</p>
                    )}
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
