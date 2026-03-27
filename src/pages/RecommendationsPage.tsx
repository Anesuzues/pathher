import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  BarChart, 
  Layout, 
  Megaphone, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2,
  Bookmark,
  Share2,
  Sparkles
} from 'lucide-react';
import { CAREER_PATHS } from '../constants';
import { CareerPath } from '../types';
import { cn } from '../lib/utils';

const iconMap: Record<string, any> = {
  Code,
  BarChart,
  Layout,
  Megaphone
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<CareerPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI recommendation logic
    const timer = setTimeout(() => {
      // In a real app, we'd send the profile to an AI service
      // For now, we'll just show the first 3 paths
      setRecommendations(CAREER_PATHS.slice(0, 3));
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-purple-600 animate-pulse" size={24} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Analyzing Your Profile...</h2>
          <p className="text-gray-500">Our AI is finding the perfect South African career paths for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Your Career Recommendations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your interests in technology and problem-solving, we've identified these 3 high-growth paths in South Africa.
        </p>
      </div>

      <div className="grid gap-8">
        {recommendations.map((path, index) => {
          const Icon = iconMap[path.icon] || Code;
          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-purple-50 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-100">
                    <Icon size={40} />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold group-hover:text-purple-700 transition-colors">{path.title}</h2>
                      <p className="text-purple-600 font-medium text-sm">High Demand in SA</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <Bookmark size={20} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Why it fits you
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{path.whyItFits}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-900">Skills to build</h3>
                        <div className="flex flex-wrap gap-2">
                          {path.skillsNeeded.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-900">SA Opportunities</h3>
                        <ul className="space-y-1">
                          {path.saExamples.map(ex => (
                            <li key={ex} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4">
                    <Link 
                      to="/opportunities" 
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                      View Learning Path
                      <ArrowRight size={16} />
                    </Link>
                    <button className="px-6 py-3 bg-white text-purple-600 border border-purple-100 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all">
                      Save Recommendation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Steps Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-bold">Ready to take the next step?</h2>
          <p className="text-indigo-100 opacity-90 max-w-md">
            Generate your professional CV and LinkedIn bio based on these recommendations to start applying.
          </p>
        </div>
        <Link 
          to="/branding" 
          className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl whitespace-nowrap"
        >
          Generate My CV & Bio
        </Link>
      </div>
    </div>
  );
}
