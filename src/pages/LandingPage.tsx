import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Wind,
  X,
  Heart,
  Globe,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const { user, hasProfile } = useAuth();
  const journeyPath = user && hasProfile ? '/recommendations' : '/onboarding';
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState<'intro' | 'breathing' | 'complete'>('intro');
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showReset && resetStep === 'breathing') {
      const cycleDuration = 12000; // 4s inhale + 4s hold + 4s exhale
      
      const runPhase = () => {
        setBreathPhase('Inhale');
        setTimeout(() => setBreathPhase('Hold'), 4000);
        setTimeout(() => setBreathPhase('Exhale'), 8000);
      };

      runPhase();
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev >= 2) { // 3 cycles (0, 1, 2)
            setResetStep('complete');
            return 2;
          }
          runPhase();
          return prev + 1;
        });
      }, cycleDuration);
    }
    return () => clearInterval(timer);
  }, [showReset, resetStep]);

  const closeReset = () => {
    setShowReset(false);
    setResetStep('intro');
    setBreathCount(0);
    setBreathPhase('Inhale');
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-12 md:pb-20">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 md:space-y-8 pt-8 md:pt-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-100 rounded-full shadow-sm mx-auto"
          >
            <div className="flex -space-x-2">
              {['NM', 'LK', 'ZT', 'AP'].map((initials, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black"
                  style={{ background: ['#9333ea', '#ec4899', '#6366f1', '#f43f5e'][i] }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Join 5,000+ young women in SA
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tight text-gray-900">
            Your Future, <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">Defined by You.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            PathHer AI is your companion in navigating the South African career landscape.
            Discover your strengths, build your brand, and unlock opportunities specifically
            designed for young women like you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4 sm:pt-8">
            <Link
              to={journeyPath}
              className="group relative px-7 sm:px-10 py-4 sm:py-5 bg-purple-600 text-white rounded-2xl font-bold text-base sm:text-xl shadow-xl shadow-purple-200 hover:shadow-purple-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">Start My Journey</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <button
              onClick={() => setShowReset(true)}
              className="group px-7 sm:px-10 py-4 sm:py-5 bg-white text-purple-700 border-2 border-purple-100 rounded-2xl font-bold text-base sm:text-xl hover:bg-purple-50 hover:border-purple-600 transition-all flex items-center justify-center gap-3"
            >
              <Wind size={20} className="group-hover:rotate-180 transition-transform duration-1000" />
              Take a 30-second reset
            </button>
          </div>
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className="py-10 md:py-12 border-y border-purple-50">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 md:mb-8">
          Empowering women with partners across SA
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 lg:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {['TechSA', 'FutureLeaders', 'EmpowerHer', 'SAInnovate', 'WomenInTech'].map((name) => (
            <div key={name} className="font-black text-lg sm:text-xl md:text-2xl text-gray-400 tracking-tighter">
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-10 md:space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">How We Empower You</h2>
          <p className="text-gray-500 font-medium">Three pillars to build your successful career.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: Target,
              title: "Discover suitable career paths",
              desc: "Our AI matches your strengths and interests with high-growth industries in South Africa.",
              color: "bg-purple-50 text-purple-600",
              accent: "border-purple-100"
            },
            {
              icon: Zap,
              title: "Build your personal brand",
              desc: "Generate professional CVs and LinkedIn bios that stand out to top recruiters.",
              color: "bg-pink-50 text-pink-600",
              accent: "border-pink-100"
            },
            {
              icon: Globe,
              title: "Unlock real opportunities",
              desc: "Connect with bursaries, learnerships, and jobs specifically for young female talent.",
              color: "bg-orange-50 text-orange-600",
              accent: "border-orange-100"
            }
          ].map((benefit, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className={cn("p-6 md:p-8 lg:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] border shadow-sm transition-all space-y-4 md:space-y-6", benefit.accent)}
            >
              <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center", benefit.color)}>
                <benefit.icon size={28} className="md:hidden" />
                <benefit.icon size={32} className="hidden md:block" />
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SA Context & Empowerment Section */}
      <section className="bg-white rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-8 sm:p-12 md:p-16 lg:p-20 border border-purple-50 shadow-sm overflow-hidden relative">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
              <Heart size={14} />
              <span>South African Context</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Empowering the Next Generation of <span className="text-purple-600">SA Leaders.</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed font-medium">
              We understand the unique challenges and vibrant opportunities in South Africa.
              Our mission is to bridge the gap for young women, providing them with the tools
              and network to lead in tech, business, and beyond.
            </p>
            <div className="space-y-3 md:space-y-4">
              {[
                "Localized funding & bursary matching",
                "Partnerships with SA's top tech employers",
                "Community-driven mentorship network"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="font-bold text-gray-700 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 aspect-square flex items-center justify-center">
              <div className="text-white text-center space-y-4 p-12">
                <div className="text-7xl font-black opacity-20">SA</div>
                <p className="font-black text-2xl leading-tight">Built for young women<br/>across South Africa</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'].map(city => (
                    <span key={city} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{city}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Quote card — hidden on small screens to prevent overflow */}
            <div className="hidden sm:block absolute -bottom-6 -right-6 bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-purple-50 max-w-[180px] md:max-w-[200px]">
              <p className="text-xs md:text-sm font-bold text-gray-900 leading-tight">
                "Investing in women is the most effective way to change the world."
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
      </section>

      {/* 30-Second Reset Modal */}
      <AnimatePresence>
        {showReset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-purple-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 max-w-2xl w-full text-center space-y-8 relative overflow-hidden"
            >
              <button 
                onClick={closeReset}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <X size={24} />
              </button>

              {resetStep === 'intro' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Wind size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black">Time for a quick reset?</h3>
                    <p className="text-gray-500 text-lg font-medium">
                      Career planning can be overwhelming. Let's take 30 seconds to breathe and clear your mind before we begin.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setResetStep('breathing')}
                      className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-base sm:text-xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
                    >
                      Start Breathing
                    </button>
                    <button 
                      onClick={closeReset}
                      className="text-purple-600 font-bold hover:underline"
                    >
                      Skip and continue
                    </button>
                  </div>
                </motion.div>
              )}

              {resetStep === 'breathing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8 sm:space-y-12"
                >
                  <div className="relative flex items-center justify-center h-48 sm:h-64">
                    <motion.div 
                      animate={{ 
                        scale: breathPhase === 'Inhale' ? 1.8 : breathPhase === 'Hold' ? 1.8 : 1,
                      }}
                      transition={{ 
                        duration: 4, 
                        ease: "easeInOut"
                      }}
                      className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-40"
                    />
                    <motion.div 
                      animate={{ 
                        scale: breathPhase === 'Inhale' ? 1.5 : breathPhase === 'Hold' ? 1.5 : 1,
                      }}
                      transition={{ 
                        duration: 4, 
                        ease: "easeInOut"
                      }}
                      className="absolute w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-purple-200"
                    >
                      <Wind size={40} />
                    </motion.div>
                    <div className="absolute -bottom-8 font-black text-purple-600 text-3xl uppercase tracking-widest">
                      {breathPhase}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Cycle {breathCount + 1} of 3</p>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className={cn(
                          "w-3 h-3 rounded-full transition-all duration-500",
                          i <= breathCount ? "bg-purple-600" : "bg-purple-100"
                        )} />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={closeReset}
                    className="text-gray-400 font-bold hover:text-purple-600 transition-colors"
                  >
                    Skip reset
                  </button>
                </motion.div>
              )}

              {resetStep === 'complete' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black">Feeling Refreshed?</h3>
                    <p className="text-gray-500 text-lg font-medium">
                      You're ready to start your journey with a clear mind.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to={journeyPath}
                      onClick={closeReset}
                      className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-base sm:text-xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
                    >
                      Continue My Journey
                    </Link>
                    <button
                      onClick={closeReset}
                      className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-base sm:text-xl hover:bg-gray-200 transition-all"
                    >
                      Skip
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="pt-10 md:pt-12 border-t border-purple-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-gray-500 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[10px]">P</div>
          <span className="font-bold text-gray-900">PathHer AI</span>
          <span>&copy; 2026 Nobztech. All rights reserved.</span>
        </div>
        <div className="flex gap-5 sm:gap-8 font-medium">
          <Link to="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-purple-600 transition-colors">Terms of Service</Link>
          <a href="mailto:support@pathher.app" className="hover:text-purple-600 transition-colors">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}

function Check({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
