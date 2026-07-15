import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Briefcase, Star, MessageSquare,
  CheckCircle, Building2, TrendingUp, X, Send, Sparkles,
} from 'lucide-react';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { loadUserField, saveUserField, saveMentorRequest } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const BASE_PARTNERS = [
  { name: 'Standard Bank', color: '#0033a0', industries: ['Finance', 'Tech'] },
  { name: 'Discovery', color: '#e10f6a', industries: ['Healthcare', 'Data'] },
  { name: 'Takealot', color: '#0077c8', industries: ['E-commerce', 'Logistics'] },
  { name: 'OfferZen', color: '#ff5a36', industries: ['Tech Recruitment'] },
  { name: 'Entelect', color: '#6d2077', industries: ['Software', 'Consulting'] },
  { name: 'Absa', color: '#dc0a1e', industries: ['Finance', 'Digital'] },
];

const EXTRA_PARTNERS = [
  { name: 'Capitec Bank', color: '#007a4d', industries: ['Finance', 'Fintech'] },
  { name: 'Vodacom', color: '#e60000', industries: ['Telecoms', 'Tech'] },
  { name: 'MTN', color: '#ffcb00', industries: ['Telecoms', 'Digital'] },
  { name: 'Old Mutual', color: '#006341', industries: ['Finance', 'Insurance'] },
  { name: 'WeThinkCode_', color: '#1a1a2e', industries: ['Education', 'Tech'] },
  { name: 'Amazon SA', color: '#ff9900', industries: ['Tech', 'E-commerce'] },
];

export default function EcosystemPage() {
  const [isJoined, setIsJoined] = useState(() => !!localStorage.getItem('joined_network'));
  const [showAllPartners, setShowAllPartners] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorField, setMentorField] = useState('');
  const [mentorMessage, setMentorMessage] = useState('');
  const [mentorSent, setMentorSent] = useState(false);
  const [isSendingMentor, setIsSendingMentor] = useState(false);
  const [networkingTip, setNetworkingTip] = useState('');
  const [careerInsight, setCareerInsight] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadUserField<boolean>(user.uid, 'joinedNetwork', false).then(joined => {
      if (joined) {
        setIsJoined(true);
        localStorage.setItem('joined_network', 'true');
      }
    });
    // Load AI-generated tips
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      const aiData = snap.data()?.aiData;
      if (aiData?.networkingTip) setNetworkingTip(aiData.networkingTip);
      if (aiData?.careerInsight) setCareerInsight(aiData.careerInsight);
    }).catch(() => {});
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

  const visiblePartners = showAllPartners
    ? [...BASE_PARTNERS, ...EXTRA_PARTNERS]
    : BASE_PARTNERS;

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">Join the PathHer Talent Network</h1>
            <p className="text-purple-100 text-sm md:text-lg opacity-90">
              Connect with top South African employers looking for young female talent. Show your readiness and get matched with your dream role.
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
                <span className="font-bold">You're in! Your profile is now visible to recruiters.</span>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Partner Companies', value: '50+', icon: Building2 },
          { label: 'Active Roles', value: '1.2k', icon: Briefcase },
          { label: 'Talent in Network', value: '15k', icon: Users },
          { label: 'Success Rate', value: '92%', icon: Star },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-purple-50 text-center space-y-2">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Partners */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top Hiring Partners</h2>
            <button
              onClick={() => setShowAllPartners(!showAllPartners)}
              className="text-purple-600 font-bold text-sm hover:underline"
            >
              {showAllPartners ? 'Show Less' : 'View All Partners'}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {visiblePartners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-6 group cursor-pointer"
              >
                <div
                  className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-white text-lg font-black"
                  style={{ backgroundColor: partner.color }}
                >
                  {partner.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">{partner.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.industries.map(ind => (
                      <span key={ind} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ind}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-purple-50 space-y-6 md:space-y-8">
            <h2 className="text-xl md:text-2xl font-bold">Your Readiness Status</h2>
            <div className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Profile Completion</span>
                  <span className="text-purple-600">{isJoined ? '90%' : '85%'}</span>
                </div>
                <div className="h-3 bg-purple-50 rounded-full overflow-hidden">
                  <div className={cn('h-full bg-purple-600 rounded-full transition-all duration-700', isJoined ? 'w-[90%]' : 'w-[85%]')}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[
                  { label: 'Skills Verified', value: '12/15', color: 'text-green-600 bg-green-50' },
                  { label: 'CV Strength', value: 'Excellent', color: 'text-blue-600 bg-blue-50' },
                  { label: 'Network Score', value: isJoined ? 'Top 5%' : 'Top 10%', color: 'text-purple-600 bg-purple-50' },
                ].map((item, i) => (
                  <div key={i} className={cn('p-3 md:p-4 rounded-xl md:rounded-2xl text-center space-y-1', item.color)}>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 leading-tight">{item.label}</p>
                    <p className="text-base md:text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Community */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Community Activity</h2>
          <div className="space-y-6">
            {[
              { user: 'Lerato M.', action: 'joined Standard Bank as Intern', time: '2h ago' },
              { user: 'Sarah K.', action: 'completed UX Design Path', time: '5h ago' },
              { user: 'Zanele T.', action: 'matched with 3 recruiters', time: '1d ago' },
              { user: 'Thandi P.', action: 'updated her professional bio', time: '1d ago' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {activity.user.split(' ').map(w => w[0]).join('')}
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          {(networkingTip || careerInsight) && (
            <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 space-y-4">
              <div className="flex items-center gap-2 text-purple-700">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Your AI Insight</span>
              </div>
              {careerInsight && <p className="text-sm text-purple-900 font-medium leading-relaxed">"{careerInsight}"</p>}
              {networkingTip && (
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Networking Tip</p>
                  <p className="text-sm text-purple-800 leading-relaxed">{networkingTip}</p>
                </div>
              )}
            </div>
          )}

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
