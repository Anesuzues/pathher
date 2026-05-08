import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { loadUserField, saveUserField } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  ExternalLink,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  BookOpen,
  X,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { OPPORTUNITIES } from '../constants';
import { cn } from '../lib/utils';

const FILTER_TYPES = ['All', 'Bursary', 'Internship', 'Learnership', 'Graduate Program'] as const;

const COURSES = [
  {
    title: 'Introduction to Web Development',
    platform: 'Coursera',
    duration: '4 weeks',
    rating: '4.8',
    image: 'https://picsum.photos/seed/coding/400/250',
    url: 'https://www.coursera.org/learn/web-development',
  },
  {
    title: 'Data Science Fundamentals',
    platform: 'edX',
    duration: '6 weeks',
    rating: '4.9',
    image: 'https://picsum.photos/seed/data/400/250',
    url: 'https://www.edx.org/learn/data-science',
  },
  {
    title: 'Google UX Design Certificate',
    platform: 'Coursera',
    duration: '7 months',
    rating: '4.8',
    image: 'https://picsum.photos/seed/ux/400/250',
    url: 'https://grow.google/certificates/ux-design/',
  },
  {
    title: 'Digital Marketing Essentials',
    platform: 'HubSpot Academy',
    duration: '3 weeks',
    rating: '4.7',
    image: 'https://picsum.photos/seed/marketing/400/250',
    url: 'https://academy.hubspot.com',
  },
];

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [savedOpps, setSavedOpps] = useState<string[]>(() => {
    const raw = localStorage.getItem('saved_opportunities');
    return raw ? JSON.parse(raw) : [];
  });
  const { user } = useAuth();

  // Load saved opportunities from Firestore on mount
  useEffect(() => {
    if (!user) return;
    loadUserField<string[]>(user.uid, 'savedOpportunities', []).then(fromFirestore => {
      if (fromFirestore.length > 0) {
        setSavedOpps(fromFirestore);
        localStorage.setItem('saved_opportunities', JSON.stringify(fromFirestore));
      }
    });
  }, [user]);

  const filteredOpportunities = OPPORTUNITIES.filter(opp => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      opp.title.toLowerCase().includes(q) ||
      opp.provider.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q);
    const matchesFilter = activeFilter === 'All' || opp.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleSaveOpp = (id: string) => {
    const updated = savedOpps.includes(id)
      ? savedOpps.filter(s => s !== id)
      : [...savedOpps, id];
    setSavedOpps(updated);
    localStorage.setItem('saved_opportunities', JSON.stringify(updated));
    if (user) saveUserField(user.uid, 'savedOpportunities', updated);
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Learning & Funding</h1>
          <p className="text-gray-600 max-w-2xl">
            Discover bursaries, learnerships, and online courses to help you gain the skills for your chosen career path.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search opportunities..."
              className="pl-10 pr-4 py-3 bg-white border border-purple-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-56 md:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={cn(
                'p-3 border rounded-xl flex items-center gap-2 transition-colors text-sm font-bold',
                activeFilter !== 'All'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white border-purple-100 text-gray-600 hover:bg-purple-50'
              )}
            >
              <Filter size={18} />
              {activeFilter !== 'All' && <span>{activeFilter}</span>}
              <ChevronDown size={14} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-purple-50 z-10 overflow-hidden">
                {FILTER_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setActiveFilter(type); setShowFilterMenu(false); }}
                    className={cn(
                      'w-full text-left px-4 py-3 text-sm font-bold transition-colors',
                      activeFilter === type ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Opportunity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 text-white relative overflow-hidden"
      >
        <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Featured Funding
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">NSFAS 2026 Applications Now Open</h2>
            <p className="text-purple-100 text-sm md:text-lg leading-relaxed">
              Don't miss out on government funding for your tertiary studies. Check your eligibility and apply before the deadline.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <a
                href="https://www.nsfas.org.za"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 md:px-8 py-3 md:py-4 bg-white text-purple-800 rounded-2xl font-bold text-sm md:text-base hover:bg-purple-50 transition-all flex items-center gap-2 shadow-xl"
              >
                Apply Now
                <ExternalLink size={16} />
              </a>
              <a
                href="https://www.nsfas.org.za/content/eligibility.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 md:px-8 py-3 md:py-4 bg-purple-600/30 border border-white/20 text-white rounded-2xl font-bold text-sm md:text-base hover:bg-white/10 transition-all flex items-center gap-2"
              >
                Check Eligibility
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-purple-700 flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-bold uppercase">Deadline</p>
                  <p className="font-bold">30 November 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-purple-700 flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-bold uppercase">Coverage</p>
                  <p className="font-bold">Tuition, Accommodation & Allowance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </motion.div>

      {/* Opportunity Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <GraduationCap size={48} className="text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">No opportunities match your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
            className="text-purple-600 font-bold text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOpportunities.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    opp.type === 'Bursary' ? 'bg-green-50 text-green-600' :
                    opp.type === 'Internship' ? 'bg-blue-50 text-blue-600' :
                    opp.type === 'Graduate Program' ? 'bg-purple-50 text-purple-600' :
                    'bg-orange-50 text-orange-600'
                  )}>
                    {opp.type}
                  </div>
                  <button
                    onClick={() => toggleSaveOpp(opp.id)}
                    className={cn('transition-colors', savedOpps.includes(opp.id) ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600')}
                  >
                    <Bookmark size={18} fill={savedOpps.includes(opp.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{opp.title}</h3>
                  <p className="text-sm text-purple-600 font-medium">{opp.provider}</p>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{opp.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-purple-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <MapPin size={14} />
                  <span>South Africa</span>
                </div>
                <a
                  href={opp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Learn More
                  <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Online Courses Section */}
      <section className="space-y-8 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recommended Online Courses</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {COURSES.map((course, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-purple-50 shadow-sm flex flex-col sm:flex-row hover:shadow-md transition-all">
              <div className="sm:w-48 h-40 sm:h-auto shrink-0">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-6 space-y-4 flex-1">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.platform}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} />
                  Enroll Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
