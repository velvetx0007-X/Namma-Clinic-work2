import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Users, 
  Calendar, 
  Activity, 
  Heart, 
  Plus, 
  Search, 
  Bell 
} from 'lucide-react';

const ShowcaseSection = () => {
  return (
    <section id="showcase" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Experience the <span className="text-blue-700">Future of Care</span></h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Clean, intuitive interfaces designed for speed and clarity. Preview our award-winning dashboard designs.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-[2.5rem] border border-gray-100 bg-gray-50 p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white font-bold">N</div>
                <div>
                  <h4 className="font-bold text-gray-900">Dr. Sarah Wilson</h4>
                  <p className="text-xs text-gray-500">General Practitioner • City Clinic</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-gray-200">
                  <Search size={18} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-gray-200 relative">
                  <Bell size={18} />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Patients', value: '1,284', icon: <Users size={20} />, color: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'Appointments', value: '24', icon: <Calendar size={20} />, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                { label: 'Pending Tests', value: '12', icon: <Activity size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Revenue', value: '$8.4k', icon: <BarChart size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-bold text-gray-900">Today's Schedule</h5>
                  <button className="text-blue-700 text-xs font-bold flex items-center gap-1 hover:underline">
                    View All <Plus size={12} />
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { time: '09:30 AM', name: 'John Doe', type: 'Checkup', status: 'In Progress' },
                    { time: '10:15 AM', name: 'Emily Chen', type: 'Vaccination', status: 'Pending' },
                    { time: '11:00 AM', name: 'Marcus Miller', type: 'Consultation', status: 'Pending' },
                  ].map((appt, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="text-xs font-bold text-blue-700 whitespace-nowrap">{appt.time}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">{appt.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{appt.type}</div>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${appt.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                        {appt.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-bold text-gray-900">AI Patient Analysis</h5>
                  <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <Activity size={10} /> Live
                  </div>
                </div>
                <div className="relative h-40 flex items-end justify-between gap-2 px-2">
                  {[40, 70, 45, 90, 65, 80, 55, 30].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="flex-1 bg-gradient-to-t from-blue-700 to-indigo-600 rounded-t-lg"
                    />
                  ))}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full h-px bg-gray-200"></div>
                    <div className="w-full h-px bg-gray-200"></div>
                    <div className="w-full h-px bg-gray-200"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side Mobile Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border-[8px] border-gray-900 bg-white h-[600px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
            
            <div className="p-6 pt-12 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700">
                  <Heart size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Health Tracker</h5>
                  <p className="text-[10px] text-gray-500">Connected to Watch</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-700 to-blue-700 rounded-3xl p-6 text-white mb-6">
                <div className="text-xs font-medium opacity-80 mb-1">Current Heart Rate</div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black">72</span>
                  <span className="text-sm font-bold opacity-80 mb-1">BPM</span>
                </div>
                <div className="h-10 flex items-center gap-1">
                  {[3, 5, 2, 8, 4, 6, 3, 7, 4, 5, 3, 6].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${h * 4}px`, `${h * 6}px`, `${h * 4}px`] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-white/40 rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <h6 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Today's Goals</h6>
                  <span className="text-[10px] text-blue-700 font-bold">85% Done</span>
                </div>
                
                {[
                  { label: 'Steps', value: '8,432', target: '10k', color: 'bg-emerald-500' },
                  { label: 'Sleep', value: '7h 20m', target: '8h', color: 'bg-indigo-700' },
                  { label: 'Water', value: '1.8L', target: '2.5L', color: 'bg-blue-700' },
                ].map((goal, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-700">{goal.label}</span>
                      <span className="text-[10px] text-gray-400">{goal.value} / {goal.target}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${goal.color} rounded-full`} style={{ width: '70%' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between bg-white border border-gray-100 p-2 rounded-2xl">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <div className="w-10 h-10 text-gray-300 rounded-xl flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div className="w-10 h-10 text-gray-300 rounded-xl flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div className="w-10 h-10 text-gray-300 rounded-xl flex items-center justify-center">
                  <BarChart size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
