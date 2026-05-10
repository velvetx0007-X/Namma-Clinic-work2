import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, Sunrise, Activity, Calendar } from 'lucide-react';

const DashboardGreeting = ({ user, role }) => {
    const [greeting, setGreeting] = useState('');
    const [Icon, setIcon] = useState(Sun);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting('Good Morning');
                setIcon(Sunrise);
            } else if (hour >= 12 && hour < 17) {
                setGreeting('Good Afternoon');
                setIcon(Sun);
            } else if (hour >= 17 && hour < 21) {
                setGreeting('Good Evening');
                setIcon(Cloud);
            } else {
                setGreeting('Good Night');
                setIcon(Moon);
            }
        };

        updateGreeting();
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const healthMessages = [
        "Your dedication saves lives every day.",
        "Small steps in health lead to big leaps in life.",
        "Providing care with compassion and technology.",
        "Healthy patients, happy clinic, successful practice.",
        "Innovation in healthcare starts with you."
    ];

    const randomMessage = healthMessages[Math.floor(Math.random() * healthMessages.length)];

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/90 to-indigo-700/90 text-white shadow-2xl backdrop-blur-md mb-8 group"
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                        >
                            <Icon size={28} className="text-yellow-300 shadow-sm" />
                        </motion.div>
                        <span className="text-blue-100 font-bold uppercase tracking-widest text-xs">
                            {greeting}
                        </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                        {greeting}, <span className="text-white">
                            {role === 'doctor' ? `Dr. ${user.userName || user.name}` : 
                             role === 'admin' ? `Admin ${user.userName || user.name}` :
                             role === 'receptionist' ? `Receptionist ${user.userName || user.name}` :
                             role === 'nurse' ? `Nurse ${user.userName || user.name}` :
                             (user.userName || user.name)}
                        </span> 👋
                    </h1>
                    
                    <p className="text-blue-50 text-lg opacity-90 max-w-xl font-medium leading-relaxed italic">
                        "{randomMessage}"
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 self-stretch md:self-auto">
                    <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-3 shadow-lg group-hover:bg-white/15 transition-all">
                        <Calendar size={20} className="text-blue-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-blue-200 leading-none mb-1">Today's Date</span>
                            <span className="text-sm font-bold tracking-tight">
                                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-400/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-emerald-400/30 flex items-center gap-3 shadow-lg">
                        <Activity size={20} className="text-emerald-300 animate-pulse" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-emerald-200 leading-none mb-1">System Status</span>
                            <span className="text-sm font-bold tracking-tight">Clinic Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardGreeting;
