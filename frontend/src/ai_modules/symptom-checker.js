import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Thermometer, AlertCircle, CheckCircle2, Search, BrainCircuit, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const SymptomChecker = ({ onClose, isAdvanced }) => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = () => {
        if (!symptoms.trim()) return;
        setIsLoading(true);
        setResult(null);

        // Simulating Advanced AI analysis
        setTimeout(() => {
            setResult({
                severity: 65,
                title: "Moderate Fatigue & Dehydration Pattern",
                summary: "Based on your input, there is a strong correlation with overexertion and fluid imbalance. Neural models suggest proactive hydration and rest.",
                metrics: [
                    { name: 'Hydration', value: 40, color: '#3b82f6' },
                    { name: 'Inflammation', value: 30, color: '#f59e0b' },
                    { name: 'Immune Res', value: 85, color: '#10b981' },
                    { name: 'Stress', value: 60, color: '#ef4444' }
                ],
                suggestions: [
                    { text: "Increase alkaline fluid intake (2.5L+ daily)", icon: <Activity className="text-blue-400" size={18} /> },
                    { text: "Monitor body temperature for next 12 hours", icon: <Thermometer className="text-amber-400" size={18} /> },
                    { text: "Prioritize 8 hours of deep REM sleep", icon: <CheckCircle2 className="text-emerald-400" size={18} /> }
                ]
            });
            setIsLoading(false);
        }, 2000);
    };

    if (isAdvanced) {
        return (
            <div className="advanced-module-inner">
                <div className="module-intro">
                    <div className="intro-icon bg-indigo-500/10">
                        <BrainCircuit className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Symptom Neural Analysis</h2>
                        <p className="text-slate-400 text-sm">Deep learning model providing diagnostic patterns based on symptom history.</p>
                    </div>
                </div>

                <div className="advanced-form-grid">
                    <div className="input-section">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block">Describe your condition</label>
                        <div className="textarea-glow-wrapper">
                            <textarea 
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="I've been feeling steady headaches and fatigue for 2 days..."
                                className="advanced-textarea"
                            />
                            <div className="textarea-focus-ring"></div>
                        </div>
                        
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !symptoms.trim()}
                            className="advanced-action-btn"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mini-loader"></div>
                                    <span>Neural Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    <span>Initiate Analysis</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="result-preview-section">
                        <AnimatePresence mode="wait">
                            {!result && !isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="empty-result-vibe"
                                >
                                    <AlertCircle size={48} className="text-slate-700 mb-4" />
                                    <p>Ready for input analysis</p>
                                </motion.div>
                            )}

                            {result && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="advanced-result-content"
                                >
                                    <div className="result-header-card">
                                        <div className="severity-gauge">
                                            <div className="gauge-fill" style={{ width: `${result.severity}%` }}></div>
                                            <span className="severity-label">Severity: {result.severity}%</span>
                                        </div>
                                        <h3 className="text-xl font-bold mt-4 mb-2">{result.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{result.summary}</p>
                                    </div>

                                    <div className="analysis-viz mt-6">
                                        <h4 className="text-xs font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
                                            <BarChart3 size={14} /> Pattern Detection
                                        </h4>
                                        <div style={{ height: '180px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={result.metrics} layout="vertical">
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    />
                                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                                                        {result.metrics.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="suggestions-grid mt-6">
                                        {result.suggestions.map((s, i) => (
                                            <div key={i} className="suggestion-pill">
                                                {s.icon}
                                                <span>{s.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback/Legacy View logic
    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">🤖</span>
                        <h3>Symptom Checker</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px', color: '#555' }}>
                        Enter your symptoms to get basic health suggestions.
                    </p>
                    <textarea 
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g., headache, fever, tired..."
                        style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', resize: 'none', marginBottom: '15px' }}
                    />
                    
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading || !symptoms.trim()}
                        className="btn-primary-filled"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
                    </button>

                    {result && (
                        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Health Suggestions:</h4>
                            <ul style={{ paddingLeft: '20px', color: '#333' }}>
                                {result.suggestions.map((suggestion, index) => (
                                    <li key={index} style={{ marginBottom: '8px' }}>{suggestion.text}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SymptomChecker;
