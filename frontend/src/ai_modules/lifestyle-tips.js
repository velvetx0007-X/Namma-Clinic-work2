import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Moon, Utensils, Accessibility, Brain } from 'lucide-react';

const LifestyleTips = ({ onClose, isAdvanced }) => {
    const [tips, setTips] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedTip, setSelectedTip] = useState(null);

    const handleFetchTips = () => {
        setIsLoading(true);
        setTimeout(() => {
            setTips([
                { category: 'Diet', text: 'Increase intake of Omega-3 rich foods like walnuts or flaxseeds to support cognitive health.', icon: <Utensils className="text-orange-400" size={18} /> },
                { category: 'Exercise', text: 'Engage in 15 minutes of dynamic stretching daily to improve joint mobility.', icon: <Accessibility className="text-blue-400" size={18} /> },
                { category: 'Mental Health', text: 'Practice 4-7-8 breathing technique before sleep to lower cortisol levels.', icon: <Brain className="text-purple-400" size={18} /> },
                { category: 'Sleep', text: 'Maintain a consistent sleep-wake cycle within a 30-minute variance for circadian stability.', icon: <Moon className="text-indigo-400" size={18} /> }
            ]);
            setIsLoading(false);
        }, 1200);
    };

    useEffect(() => {
        if (isAdvanced) handleFetchTips();
    }, [isAdvanced]);

    if (isAdvanced) {
        return (
            <div className="advanced-module-inner">
                <div className="module-intro">
                    <div className="intro-icon bg-amber-500/10">
                        <Zap className="text-amber-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Lifestyle Optimization</h2>
                        <p className="text-slate-400 text-sm">Personalized health routines and bio-optimization tips generated for your profile.</p>
                    </div>
                </div>

                <div className="lifestyle-tabs-row flex gap-4 mb-8">
                    {['All', 'Diet', 'Exercise', 'Mental Health'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="lifestyle-tips-grid grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse bg-white/5 h-32 rounded-3xl border border-white/5"></div>
                            ))
                        ) : (
                            tips?.filter(t => activeCategory === 'All' || t.category === activeCategory).map((tip, i) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="lifestyle-tip-card group cursor-pointer"
                                    key={i}
                                    onClick={() => setSelectedTip(tip)}
                                >
                                    <div className="group-hover:translate-x-2 transition-transform duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-slate-900/50 rounded-2xl border border-white/5">
                                                {tip.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{tip.category}</span>
                                        </div>
                                        <p className="text-sm font-semibold leading-relaxed text-slate-200">
                                            {tip.text}
                                        </p>
                                    </div>
                                    <div className="card-flare opacity-0 group-hover:opacity-100"></div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">⚡</span>
                        <h3>Lifestyle Tips</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '30px', marginTop: '20px' }}>
                        <span style={{ fontSize: '3rem' }}>🧘‍♂️🍏💧</span>
                        <p style={{ marginTop: '15px', color: '#555', fontSize: '1.1rem' }}>
                            Get your daily personalized health and wellness advice.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleFetchTips} 
                        disabled={isLoading}
                        className="btn-primary-filled"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? 'Generating Tips...' : 'Get Daily Tips'}
                    </button>

                    {tips && (
                        <div style={{ textAlign: 'left', background: 'var(--bg-tertiary)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '20px' }}>
                            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Your Daily Tips:</h4>
                            <ul style={{ paddingLeft: '20px', margin: 0, color: '#333' }}>
                                {tips.map((tip, index) => (
                                    <li key={index} style={{ marginBottom: '10px', lineHeight: '1.4' }}>{tip.text}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LifestyleTips;
