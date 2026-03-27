import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  Star, 
  MessageSquare,
  CheckCircle,
  Building2,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function EcosystemPage() {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = () => {
    setIsJoined(true);
  };

  const partners = [
    { name: "Standard Bank", logo: "https://picsum.photos/seed/sb/100/100", industries: ["Finance", "Tech"] },
    { name: "Discovery", logo: "https://picsum.photos/seed/disc/100/100", industries: ["Healthcare", "Data"] },
    { name: "Takealot", logo: "https://picsum.photos/seed/tk/100/100", industries: ["E-commerce", "Logistics"] },
    { name: "OfferZen", logo: "https://picsum.photos/seed/oz/100/100", industries: ["Tech Recruitment"] },
    { name: "Entelect", logo: "https://picsum.photos/seed/ent/100/100", industries: ["Software", "Consulting"] },
    { name: "Absa", logo: "https://picsum.photos/seed/absa/100/100", industries: ["Finance", "Digital"] }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero / Join Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Join the Nobztech Talent Network</h1>
            <p className="text-purple-100 text-lg opacity-90">
              Connect with top South African employers looking for young female talent. Show your readiness and get matched with your dream role.
            </p>
            {!isJoined ? (
              <button 
                onClick={handleJoin}
                className="px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-xl hover:bg-purple-50 transition-all shadow-xl"
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
              {/* Floating icons */}
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

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Partner Companies", value: "50+", icon: Building2 },
          { label: "Active Roles", value: "1.2k", icon: Briefcase },
          { label: "Talent in Network", value: "15k", icon: Users },
          { label: "Success Rate", value: "92%", icon: Star }
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
        {/* Left: Partner Ecosystem */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top Hiring Partners</h2>
            <button className="text-purple-600 font-bold text-sm">View All Partners</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {partners.map((partner, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl border border-purple-50 shadow-sm flex items-center gap-6 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                  <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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

          <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 space-y-8">
            <h2 className="text-2xl font-bold">Your Readiness Status</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Profile Completion</span>
                  <span className="text-purple-600">85%</span>
                </div>
                <div className="h-3 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 w-[85%] rounded-full"></div>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Skills Verified", value: "12/15", color: "text-green-600 bg-green-50" },
                  { label: "CV Strength", value: "Excellent", color: "text-blue-600 bg-blue-50" },
                  { label: "Network Score", value: "Top 10%", color: "text-purple-600 bg-purple-50" }
                ].map((item, i) => (
                  <div key={i} className={cn("p-4 rounded-2xl text-center space-y-1", item.color)}>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity / Community */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Community Activity</h2>
          <div className="space-y-6">
            {[
              { user: "Lerato M.", action: "joined Standard Bank as Intern", time: "2h ago", img: "https://picsum.photos/seed/l/50/50" },
              { user: "Sarah K.", action: "completed UX Design Path", time: "5h ago", img: "https://picsum.photos/seed/s/50/50" },
              { user: "Zanele T.", action: "matched with 3 recruiters", time: "1d ago", img: "https://picsum.photos/seed/z/50/50" },
              { user: "Thandi P.", action: "updated her professional bio", time: "1d ago", img: "https://picsum.photos/seed/t/50/50" }
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <img src={activity.img} alt={activity.user} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
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
            <button className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold text-sm hover:bg-pink-700 transition-all">
              Find a Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
