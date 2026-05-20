import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, TrendingUp, UserCheck, Clock, Search, Download, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, X, Plus, ChevronDown, Briefcase, XCircle, LayoutDashboard,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { saveRole, loadUserRoles, closeRole, loadUserField, saveUserField, PostedRole } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const AVATAR_COLORS = [
  'from-purple-500 to-pink-400',
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-orange-500 to-amber-400',
  'from-rose-500 to-pink-400',
  'from-indigo-500 to-violet-400',
];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const pieData = [
  { name: 'Tech', value: 45 },
  { name: 'Business', value: 25 },
  { name: 'Creative', value: 20 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#9333ea', '#ec4899', '#6366f1', '#f43f5e'];

const ALL_CANDIDATES = [
  { name: 'Nompumelelo D.', path: 'Software Developer', readiness: '95%', status: 'Available' },
  { name: 'Lerato M.', path: 'Data Analyst', readiness: '88%', status: 'Interviewing' },
  { name: 'Sarah K.', path: 'UX Designer', readiness: '92%', status: 'Available' },
  { name: 'Zanele T.', path: 'Digital Marketing', readiness: '84%', status: 'Hired' },
  { name: 'Thandi P.', path: 'Software Developer', readiness: '78%', status: 'Available' },
  { name: 'Nomsa B.', path: 'Data Analyst', readiness: '91%', status: 'Interviewing' },
  { name: 'Palesa M.', path: 'UX Designer', readiness: '87%', status: 'Available' },
  { name: 'Aisha K.', path: 'Digital Marketing', readiness: '93%', status: 'Hired' },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
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

  const visibleCandidates = showAll ? ALL_CANDIDATES : ALL_CANDIDATES.slice(0, 4);
  const filteredCandidates = visibleCandidates.filter(c => {
    const q = searchQuery.toLowerCase();
    return q === '' || c.name.toLowerCase().includes(q) || c.path.toLowerCase().includes(q) || c.status.toLowerCase().includes(q);
  });

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

  const handleExportCSV = () => {
    const headers = ['Name', 'Recommended Path', 'Readiness', 'Status'];
    const rows = ALL_CANDIDATES.map(c => [c.name, c.path, c.readiness, c.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pathher-talent-report.csv';
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

  const formatDate = (ts: Timestamp) =>
    ts.toDate().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

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
                    <p className="text-gray-500 text-sm">Reach thousands of qualified young women in SA.</p>
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
          <p className="text-gray-500 text-sm md:text-base">Welcome back, Nobztech Admin. Here's what's happening today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-purple-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-50 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export Report
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Talent', value: '15,420', change: '+12.5%', trend: 'up', icon: Users },
          { label: 'Active Roles', value: '1,245', change: '+5.2%', trend: 'up', icon: TrendingUp },
          { label: 'Hired This Month', value: '384', change: '-2.1%', trend: 'down', icon: UserCheck },
          { label: 'Avg. Time to Hire', value: '18 Days', change: '+1.4%', trend: 'up', icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-purple-50 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <stat.icon size={24} />
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
                stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              )}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-purple-50 shadow-sm space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold">Talent Growth</h2>
            <select className="bg-purple-50 border-none rounded-lg text-xs font-bold text-purple-700 px-3 py-1 focus:ring-0">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[220px] sm:h-[260px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="value" fill="#9333ea" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-purple-50 shadow-sm space-y-6 md:space-y-8">
          <h2 className="text-lg md:text-xl font-bold">Career Interests</h2>
          <div className="h-[200px] sm:h-[230px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posted Roles */}
      {postedRoles.length > 0 && (
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

      {/* Talent Table */}
      <div className="bg-white rounded-[2.5rem] border border-purple-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-purple-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Top Talent Matches</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search talent..."
              className="pl-10 pr-4 py-2 bg-purple-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 w-full sm:w-64 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-purple-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Candidate</th>
                <th className="px-8 py-4">Recommended Path</th>
                <th className="px-8 py-4">Readiness</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredCandidates.length > 0 ? filteredCandidates.map((talent, i) => (
                <tr key={i} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(talent.name)} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                        {getInitials(talent.name)}
                      </div>
                      <span className="font-bold text-gray-900">{talent.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600">{talent.path}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: talent.readiness }}></div>
                      </div>
                      <span className="text-xs font-bold text-purple-700">{talent.readiness}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      talent.status === 'Available' ? 'bg-green-50 text-green-600' :
                      talent.status === 'Interviewing' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-400'
                    )}>
                      {talent.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
                    No candidates match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-purple-50/50 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-purple-600 font-bold text-sm hover:underline"
          >
            {showAll ? 'Show Less' : `View All Candidates (${ALL_CANDIDATES.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
