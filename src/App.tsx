import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, User, Briefcase, GraduationCap, LayoutDashboard,
  Award, Menu, X, Bell, LogOut, MailWarning,
} from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from './lib/firebase';
import { cn } from './lib/utils';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import RecommendationsPage from './pages/RecommendationsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import BrandingPage from './pages/BrandingPage';
import EcosystemPage from './pages/EcosystemPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

const NOTIFICATIONS = [
  { id: 1, title: 'Career match ready!', body: 'Your PathHer AI career recommendations are live.', time: '2 min ago', unread: true },
  { id: 2, title: 'New opportunity added', body: 'Entelect Graduate Programme 2026 applications are now open.', time: '1 hr ago', unread: true },
  { id: 3, title: 'Profile incomplete', body: 'Complete your work style preferences to improve your match score.', time: '2 hrs ago', unread: false },
  { id: 4, title: 'Application deadline', body: "WeThinkCode_ applications close in 7 days. Don't miss out!", time: '1 day ago', unread: false },
];

function Navigation({
  isCollapsed, setIsCollapsed, isHovered, setIsHovered,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isHovered: boolean;
  setIsHovered: (v: boolean) => void;
}) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem('read_notifications');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  const { user, signOut } = useAuth();
  const unreadCount = NOTIFICATIONS.filter(n => n.unread && !readIds.has(n.id)).length;

  const markAllRead = () => {
    const allIds = NOTIFICATIONS.map(n => n.id);
    setReadIds(new Set(allIds));
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
    setIsNotificationsOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recommendations', label: 'Careers', icon: Briefcase },
    { path: '/opportunities', label: 'Learning', icon: GraduationCap },
    { path: '/branding', label: 'Branding', icon: Award },
    { path: '/ecosystem', label: 'Network', icon: User },
    { path: '/dashboard', label: 'Admin', icon: LayoutDashboard },
  ];

  const isActive = (path: string) => location.pathname === path;
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const sidebarExpanded = !isCollapsed || isHovered;

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.nav
        initial={false}
        animate={{ width: sidebarExpanded ? '280px' : '80px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:flex fixed top-0 left-0 bottom-0 bg-white border-r border-purple-100 z-50 flex-col py-8 gap-8 transition-all duration-300"
      >
        <div className="px-6 flex items-center justify-between mb-4">
          {sidebarExpanded ? (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-100">P</div>
              <span className="font-black text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">PathHer</span>
            </Link>
          ) : (
            <Link to="/" className="mx-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-100">P</div>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className={cn('p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors', !sidebarExpanded && 'hidden')}
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if (!isCollapsed) setIsCollapsed(true); }}
              className={cn(
                'flex items-center gap-4 p-3 rounded-2xl transition-all group relative overflow-hidden',
                isActive(item.path) ? 'text-purple-700 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50/50'
              )}
            >
              <item.icon size={24} className="shrink-0" />
              {sidebarExpanded && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-bold whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
              {isActive(item.path) && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-purple-600 rounded-r-full" />
              )}
            </Link>
          ))}
        </div>

        {/* User section */}
        <div className="px-4 mt-auto space-y-2">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className={cn('relative flex items-center gap-4 p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all w-full', !sidebarExpanded && 'justify-center')}
          >
            <Bell size={24} className="shrink-0" />
            {sidebarExpanded && <span className="font-bold">Notifications</span>}
            {unreadCount > 0 && (
              <span className={cn('w-5 h-5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0', sidebarExpanded ? 'ml-auto' : 'absolute top-1.5 right-1.5')}>
                {unreadCount}
              </span>
            )}
          </button>

          {user && (
            <Link
              to="/profile"
              className={cn('flex items-center gap-3 p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors group', !sidebarExpanded && 'justify-center')}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white text-xs font-black shrink-0">
                {initials}
              </div>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{displayName}</p>
                  <button
                    onClick={e => { e.preventDefault(); signOut(); }}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors font-bold uppercase tracking-wider mt-0.5"
                  >
                    <LogOut size={10} />
                    Sign out
                  </button>
                </div>
              )}
            </Link>
          )}

          {!user && sidebarExpanded && (
            <Link to="/auth" className="flex items-center gap-4 p-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-all justify-center">
              Sign In
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-purple-100 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileMenu} className="p-2 text-gray-500 hover:bg-purple-50 rounded-lg">
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
            <span className="text-xl font-black bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">PathHer</span>
          </Link>
        </div>
        <button onClick={() => setIsNotificationsOpen(true)} className="relative p-2 text-gray-500 hover:text-purple-600 transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />}
        </button>
      </header>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] sm:w-[380px] bg-white z-[70] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-purple-100">
                <div>
                  <h2 className="font-bold text-lg">Notifications</h2>
                  <p className="text-xs text-gray-400">{unreadCount} unread</p>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-purple-50">
                {NOTIFICATIONS.map(n => {
                  const isRead = readIds.has(n.id) || !n.unread;
                  return (
                    <div key={n.id} className={cn('p-5 flex gap-3', !isRead && 'bg-purple-50/50')}>
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', !isRead ? 'bg-purple-600' : 'bg-gray-200')} />
                      <div className="space-y-1 flex-1">
                        <p className="font-bold text-sm text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-purple-100">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="w-full py-3 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors disabled:text-gray-300 disabled:cursor-default"
                >
                  {unreadCount === 0 ? 'All caught up' : 'Mark all as read'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.nav
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] md:hidden flex flex-col py-8 gap-8 shadow-2xl"
            >
              <div className="px-6 flex items-center justify-between mb-4">
                <Link to="/" className="flex items-center gap-3" onClick={toggleMobileMenu}>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-100">P</div>
                  <span className="font-black text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">PathHer</span>
                </Link>
                <button onClick={toggleMobileMenu} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1 px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-2xl transition-all',
                      isActive(item.path) ? 'text-purple-700 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50/50'
                    )}
                  >
                    <item.icon size={24} />
                    <span className="font-bold">{item.label}</span>
                  </Link>
                ))}
              </div>

              {user && (
                <div className="px-4 space-y-2">
                  <Link
                    to="/profile"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white text-sm font-black shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{displayName}</p>
                      <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">Edit Profile →</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => { signOut(); toggleMobileMenu(); }}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}

              {!user && (
                <div className="px-4">
                  <Link to="/auth" onClick={toggleMobileMenu} className="block w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-center hover:bg-purple-700 transition-all">
                    Sign In
                  </Link>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resent, setResent] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    try {
      await sendEmailVerification(auth.currentUser!);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch { /* rate-limited — ignore */ }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <MailWarning size={18} className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 font-medium truncate">
          Please verify your email address to secure your account.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleResend}
          className="text-xs font-bold text-amber-700 hover:underline"
        >
          {resent ? 'Sent!' : 'Resend'}
        </button>
        <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarExpanded = !isCollapsed || isHovered;

  return (
    <div className="min-h-screen bg-[#FDF8FF] text-gray-900 font-sans pt-16 md:pt-0">
      <Navigation
        isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}
        isHovered={isHovered} setIsHovered={setIsHovered}
      />
      {/* Outer shell shifts right of the sidebar using margin (not padding),
          so max-width centering inside works correctly across all screen sizes */}
      <main className={cn(
        'transition-all duration-300',
        sidebarExpanded ? 'md:ml-[280px]' : 'md:ml-[80px]'
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <EmailVerificationBanner />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
              <Route path="/recommendations" element={<PrivateRoute><RecommendationsPage /></PrivateRoute>} />
              <Route path="/opportunities" element={<PrivateRoute><OpportunitiesPage /></PrivateRoute>} />
              <Route path="/branding" element={<PrivateRoute><BrandingPage /></PrivateRoute>} />
              <Route path="/ecosystem" element={<PrivateRoute><EcosystemPage /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
