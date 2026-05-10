import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity, TrendingUp, Users, ClipboardCheck, Sparkles, RefreshCcw, BellRing, ChevronRight } from 'lucide-react';
import api from '../api/axiosInstance';
import './AIPatientAnalysis.css';

const AIPatientAnalysis = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('7D');

    const fetchAnalytics = async () => {
        setIsRefreshing(true);
        try {
            const response = await api.get(`/analytics/patient-ai?timeRange=${timeRange}`);
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching AI patient analytics:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 800); // Visual delay for spinner
        }
    };

    useEffect(() => {
        fetchAnalytics();
        // Auto-refresh every 30 seconds for real-time feel
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, [timeRange]);

    if (loading && !analytics) {
        return (
            <div className="flex justify-center items-center h-[500px] bg-white/50 backdrop-blur-xl rounded-[36px] border border-blue-100/50">
                <div className="relative flex justify-center items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-blue-600"></div>
                    <Sparkles className="absolute text-blue-500 animate-pulse" size={24} />
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const { trendData, insights, totalPatients, activePatients, prescriptionsCompleted, appointmentsCompleted } = analytics;

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl">
                    <p className="text-slate-300 font-bold mb-2 text-xs uppercase tracking-wider">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-white font-medium text-sm">{entry.name}:</span>
                            <span className="text-white font-black text-sm">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="ai-glass-dashboard space-y-8 mt-8 relative overflow-hidden group">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl -z-10 transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -z-10 transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100/50">
                            <Sparkles size={24} />
                        </div>
                        AI Patient Intelligence
                    </h2>
                    <p className="text-slate-500 font-medium ml-15 mt-1 text-sm">Real-time clinical metrics & predictive insights</p>
                </div>
                
                <button 
                    onClick={fetchAnalytics}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-sm font-bold ${isRefreshing ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Syncing...' : 'Sync Data'}
                </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ai-stat-card ai-card-emerald">
                    <div className="ai-stat-icon-wrapper"><Users size={28} /></div>
                    <div>
                        <p className="ai-stat-label">Total Registered</p>
                        <h3 className="ai-stat-value">{totalPatients}</h3>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="ai-stat-card ai-card-blue">
                    <div className="ai-stat-icon-wrapper"><Activity size={28} /></div>
                    <div>
                        <p className="ai-stat-label">Active Cases</p>
                        <h3 className="ai-stat-value">{activePatients}</h3>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="ai-stat-card ai-card-violet">
                    <div className="ai-stat-icon-wrapper"><TrendingUp size={28} /></div>
                    <div>
                        <p className="ai-stat-label">Completed Consults</p>
                        <h3 className="ai-stat-value">{appointmentsCompleted}</h3>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="ai-stat-card ai-card-cyan">
                    <div className="ai-stat-icon-wrapper"><ClipboardCheck size={28} /></div>
                    <div>
                        <p className="ai-stat-label">Prescriptions Delivered</p>
                        <h3 className="ai-stat-value">{prescriptionsCompleted}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Main Visualizations Layout */}
            <div className="grid xl:grid-cols-3 gap-8 items-stretch">
                
                {/* Graph Section */}
                <div className="xl:col-span-2 ai-chart-section">
                    <div className="ai-chart-header">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Clinical Trajectory</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">Consultations & Prescription flow over time</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                                {['7D', '1M', '1Y'].map(range => (
                                    <button 
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`time-toggle-btn ${timeRange === range ? 'active' : ''}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <div className="ai-live-badge">
                                <span className="ai-pulse-glow"></span> LIVE
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[320px] w-full mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientAppts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gradientRx" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                                />
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600, color: '#475569' }}/>
                                <Area 
                                    type="monotone" 
                                    dataKey="appointments" 
                                    name="Appointments" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#gradientAppts)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9', className: 'drop-shadow-lg' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="prescriptions" 
                                    name="Prescriptions" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#gradientRx)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6', className: 'drop-shadow-lg' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights Panel */}
                <div className="xl:col-span-1 ai-insights-panel">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                            <BellRing size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Smart Insights</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">AI Engine</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <AnimatePresence>
                            {insights.map((insight, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.1), type: 'spring', stiffness: 100 }}
                                    className="ai-insight-item group/item"
                                >
                                    <div className="ai-insight-icon group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors duration-300">
                                        <Sparkles size={16} />
                                    </div>
                                    <p className="flex-1 pt-1">{insight}</p>
                                    <ChevronRight size={16} className="text-slate-300 mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPatientAnalysis;
