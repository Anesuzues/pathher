import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, CheckCircle, Building2, TrendingUp, X, Send, Award, ExternalLink,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { loadUserField, saveUserField, saveMentorRequest } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { KNOBZ, CAREER_PATHS, getCertificate } from '../constants';

function loadReadiness() {
  try {
    const profile = JSON.parse(localStorage.getItem('pathher_profile') || 'null');
    const saved: string[] = JSON.parse(localStorage.getItem('saved_recommendations') || '[]');
    const fields = profile ? [
      profile.fullName, profile.email, profile.education,
      profile.interests?.length, profile.strengths?.length, profile.goals?.length, profile.workStyle?.length,
    ] : [];
    const completion = Math.round((fields.filter(Boolean).length / 7) * 100);
    const path = CAREER_PATHS.find(p => saved.includes(p.id));
    return { completion, path };
  } catch {
    return { completion: 0, path: undefined };
  }
}

export default function EcosystemPage() {
  const [isJoined, setIsJoined] = useState(() => !!localStorage.getItem('joined_network'));
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorField, setMentorField] = useState('');
  const [mentorMessage, setMentorMessage] = useState('');
  const [mentorSent, setMentorSent] = useState(false);
  const [isSendingMentor, setIsSendingMentor] = useState(false);
  const [readiness] = useState(loadReadiness);
  const { user } = useAuth();

  // Sync join status from Firestore on mount
  useEffect(() => {
    if (!user) return;
    loadUserField<boolean>(user.uid, 'joinedNetwork', false).then(joined => {
      if (joined) {
        setIsJoined(true);
        localStorage.setItem('joined_network', 'true');
      }
    });
  }, [user]);

  const handleJoin = () => {
    setIsJoined(true);
    localStorage.setItem('joined_network', 'true');
    if (user) saveUserField(user.uid, 'joinedNetwork', true);
  };

  const handleMentorRequest = async () => {
    if (!mentorField.trim() || !user) return;
    setIsSendingMentor(true);
    const profile = localStorage.getItem('pathher_profile');
    const userName = profile ? JSON.parse(profile).fullName : (user.displayName || 'Anonymous');
    await saveMentorRequest({
      userId: user.uid,
      userName,
      field: mentorField.trim(),
      message: mentorMessage.trim(),
      createdAt: Timestamp.now(),
      status: 'pending',
    });
    setIsSendingMentor(false);
    setMentorSent(true);
    setTimeout(() => {
      setShowMentorModal(false);
      setMentorSent(false);
      setMentorField('');
      setMentorMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Mentor Modal */}
      <AnimatePresence>
        {showMentorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-purple-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={e => { if (e.target === e.currentTarget) setShowMentorModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg space-y-8 relative"
            >
              <button onClick={() => setShowMentorModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
              {!mentorSent ? (
                <>
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                      <MessageSquare size={28} />
                    </div>
                    <h2 className="text-2xl font-bold pt-2">Find a Mentor</h2>
                    <p className="text-gray-500 text-sm">Tell us what field you're interested in and we'll match you with a professional woman in that space.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Field of Interest</label>
                      <input
                        type="text"
                        value={mentorField}
                        onChange={e => setMentorField(e.target.value)}
                        placeholder="e.g. Software Development, Data Science..."
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-400 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Message (optional)</label>
                      <textarea
                        value={mentorMessage}
                        onChange={e => setMentorMessage(e.target.value)}
                        placeholder="Tell your potential mentor a bit about yourself and what you hope to learn..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-400 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleMentorRequest}
                    disabled={!mentorField.trim() || isSendingMentor}
                    className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSendingMentor
                      ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <><Send size={18} />Send Request</>
                    }
                  </button>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Request Sent!</h3>
                  <p className="text-gray-500 text-sm">We'll match you with a mentor in {mentorField} shortly.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero / Join Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-5 md:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">Join the Nobztech Talent Network</h1>
            <p className="text-purple-100 text-sm md:text-lg opacity-90">
              Join so employers can find you as you build your skills and earn certificates.
            </p>
            {!isJoined ? (
              <button
                onClick={handleJoin}
                className="px-7 md:px-10 py-4 md:py-5 bg-white text-purple-600 rounded-2xl font-bold text-base md:text-xl hover:bg-purple-50 transition-all shadow-xl"
              >
                Join Network Now
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30">
                <CheckCircle className="text-green-400" size={24} />
                <span className="font-bold">You're in! Your profile is part of the talent network.</span>
              </div>
            )}
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-full border-4 border-white/20 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-white/40 flex items-center justify-center">
                  <Users size={64} className="text-white opacity-80" />
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-0 right-0 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-purple-600"
              >
                <Building2 size={24} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 -left-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-pink-500"
              >
                <TrendingUp size={24} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold">Our Partners</h2>

          <a
            href={KNOBZ.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-black shrink-0">
              K
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">{KNOBZ.name}</h3>
              <p className="text-sm text-gray-500">Learning partner: AI Developer Certificate Programme with verified certificates.</p>
            </div>
            <ExternalLink size={18} className="text-gray-400 group-hover:text-purple-600 shrink-0" />
          </a>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-purple-50 space-y-6 md:space-y-8">
            <h2 className="text-xl md:text-2xl font-bold">Your Readiness Status</h2>
            <div className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Profile Completion</span>
                  <span className="text-purple-600">{readiness.completion}%</span>
                </div>
                <div className="h-3 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all duration-700" style={{ width: `${readiness.completion}%` }}></div>
                </div>
              </div>

              {readiness.path ? (
                <div className="p-4 rounded-2xl bg-purple-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-purple-600 shrink-0" />
                    <p className="text-sm text-purple-900">
                      <span className="font-bold">{readiness.path.title}</span>: earn Certificate {readiness.path.certificate} ({getCertificate(readiness.path.certificate).title}) on {KNOBZ.name}.
                    </p>
                  </div>
                  <a
                    href={KNOBZ.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition-all whitespace-nowrap text-center"
                  >
                    Sign Up
                  </a>
                </div>
              ) : (
                <Link to="/onboarding" className="block p-4 rounded-2xl bg-purple-50 text-sm font-bold text-purple-700 hover:bg-purple-100 transition-all">
                  Take the assessment to get your recommended certificate →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-pink-50 rounded-[2.5rem] border border-pink-100 space-y-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-pink-900">Need a Mentor?</h3>
              <p className="text-pink-700 text-sm leading-relaxed">
                Connect with professional women in your chosen field for guidance and support.
              </p>
            </div>
            <button
              onClick={() => setShowMentorModal(true)}
              className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold text-sm hover:bg-pink-700 transition-all"
            >
              Find a Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
