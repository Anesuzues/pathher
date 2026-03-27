import { motion } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  ExternalLink, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { OPPORTUNITIES } from '../constants';
import { cn } from '../lib/utils';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Learning & Funding</h1>
          <p className="text-gray-600 max-w-2xl">
            Discover bursaries, learnerships, and online courses to help you gain the skills for your chosen career path.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search opportunities..." 
              className="pl-10 pr-4 py-3 bg-white border border-purple-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
            />
          </div>
          <button className="p-3 bg-white border border-purple-100 rounded-xl text-gray-600 hover:bg-purple-50 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Featured Opportunity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden"
      >
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Featured Funding
            </div>
            <h2 className="text-4xl font-bold leading-tight">NSFAS 2026 Applications Now Open</h2>
            <p className="text-purple-100 text-lg leading-relaxed">
              Don't miss out on government funding for your tertiary studies. Check your eligibility and apply before the deadline.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.nsfas.org.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-purple-800 rounded-2xl font-bold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-xl"
              >
                Apply Now
                <ExternalLink size={18} />
              </a>
              <button className="px-8 py-4 bg-purple-600/30 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                Check Eligibility
              </button>
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
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </motion.div>

      {/* Opportunity Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {OPPORTUNITIES.map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  opp.type === 'Bursary' ? "bg-green-50 text-green-600" : 
                  opp.type === 'Internship' ? "bg-blue-50 text-blue-600" : 
                  "bg-orange-50 text-orange-600"
                )}>
                  {opp.type}
                </div>
                <button className="text-gray-400 hover:text-purple-600">
                  <Bookmark size={18} />
                </button>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{opp.title}</h3>
                <p className="text-sm text-purple-600 font-medium">{opp.provider}</p>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {opp.description}
              </p>
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
                <ChevronRight size={16} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Online Courses Section */}
      <section className="space-y-8 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recommended Online Courses</h2>
          <button className="text-purple-600 font-bold text-sm">View All</button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Introduction to Web Development",
              platform: "Coursera",
              duration: "4 weeks",
              rating: "4.8",
              image: "https://picsum.photos/seed/coding/400/250"
            },
            {
              title: "Data Science Fundamentals",
              platform: "edX",
              duration: "6 weeks",
              rating: "4.9",
              image: "https://picsum.photos/seed/data/400/250"
            }
          ].map((course, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-purple-50 shadow-sm flex flex-col sm:flex-row">
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
                    <Sparkles className="text-yellow-500" size={14} />
                    <span>{course.rating}</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Bookmark({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
  );
}

function ChevronRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function Sparkles({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
    </svg>
  );
}
