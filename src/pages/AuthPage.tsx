import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/unauthorized-domain': 'This domain is not authorised for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorised domains.',
  'auth/operation-not-allowed': 'Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.',
  'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/internal-error': 'An internal error occurred. Check the browser console for details.',
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, fullName);
        navigate('/onboarding');
      } else {
        await signIn(email, password);
        navigate(from || '/recommendations');
      }
    } catch (err: any) {
      setError(FIREBASE_ERRORS[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // RecommendationsPage redirects to /onboarding if no profile exists
      navigate(from || '/recommendations');
    } catch (err: any) {
      console.error('Google sign-in error:', err.code, err.message);
      setError(FIREBASE_ERRORS[err.code] || `Google sign-in failed (${err.code || 'unknown'}). Check the browser console for details.`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(FIREBASE_ERRORS[err.code] || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-purple-200">
              P
            </div>
            <span className="font-black text-3xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">PathHer</span>
          </Link>
          <p className="text-gray-500 font-medium">Your career journey starts here.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 lg:p-10 shadow-sm border border-purple-50 space-y-6">
          {/* Tab toggle — hidden in reset mode */}
          {mode !== 'reset' && (
            <div className="flex bg-purple-50 rounded-2xl p-1">
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-bold text-sm transition-all',
                    mode === m ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  {m === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {resetSent ? (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">Check your inbox</h3>
                      <p className="text-sm text-gray-500">A password reset link was sent to <span className="font-bold text-gray-700">{email}</span>.</p>
                    </div>
                    <button
                      onClick={() => { setMode('signin'); setResetSent(false); setError(''); }}
                      className="w-full py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-all"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); setError(''); }}
                      className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <ChevronLeft size={16} /> Back to Sign In
                    </button>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">Reset your password</h3>
                      <p className="text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Send Reset Link <ArrowRight size={18} /></>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {mode !== 'reset' && (
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Thandiwe Molefe"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(''); }}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.form>
            )}
          </AnimatePresence>

          {mode !== 'reset' && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={isGoogleLoading}
                className="w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 flex items-center justify-center gap-3 hover:border-purple-200 hover:bg-purple-50/50 transition-all disabled:opacity-70"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={switchMode} className="font-bold text-purple-600 hover:underline">
                  {mode === 'signin' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 font-medium">
          By continuing you agree to our{' '}
          <a href="/terms" className="text-purple-600 hover:underline">Terms</a> and{' '}
          <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
