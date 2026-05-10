import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, CheckCircle, ArrowRight, Activity } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI-Powered Healthcare System
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">Namma Clinic</span> Platform
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
              Modern healthcare workflow system for clinics, doctors, and patients. 
              Wellness tracking, smart prescriptions, and AI-powered healthcare management in one seamless platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                to="/signup"
                className="px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-800 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
              >
                Get Started <ChevronRight size={20} />
              </Link>
              <a
                href="#showcase"
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 text-lg group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Play size={16} className="text-blue-600 ml-0.5" />
                </div>
                Request Demo
              </a>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                "AI Health Assistant",
                "Smart Prescriptions",
                "Patient Tracking"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-gray-500 font-medium">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Preview Card */}
            <div className="relative z-20 rounded-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/60 backdrop-blur-xl p-4 overflow-hidden group">
              <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-100 overflow-hidden relative">
                {/* Mock UI Elements */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600"></div>
                    <div className="space-y-1.5 pt-1">
                      <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100"></div>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100"></div>
                  </div>
                </div>
                
                <div className="absolute top-20 left-4 right-4 grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-white border border-gray-50 shadow-sm p-3 space-y-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Activity size={12} className="text-blue-500" />
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                      <div className="w-2/3 h-2 bg-gray-50 rounded-full"></div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 h-32 rounded-xl bg-white border border-gray-50 shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-16 h-3 bg-blue-100 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-1/2 h-2 bg-gray-50 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-1/3 h-2 bg-gray-50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating "AI Recommendation" Card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-6 top-1/4 w-56 p-4 rounded-2xl bg-white shadow-2xl border border-blue-50 z-30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-xs">AI</div>
                    <span className="text-sm font-bold text-gray-800">Health Insight</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    Patient records indicate a potential improvement in cardiac recovery.
                  </p>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-blue-700 rounded-full"></div>
                  </div>
                </motion.div>

                {/* Floating "Next Appointment" Card */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-8 bottom-10 w-48 p-4 rounded-2xl bg-white shadow-2xl border border-indigo-50 z-30"
                >
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">Next Appointment</span>
                  <p className="text-sm font-bold text-gray-800 mb-1">Dr. Sarah Wilson</p>
                  <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                </motion.div>
              </div>
            </div>

            {/* Background elements for depth */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-600/5 blur-3xl rounded-full"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
