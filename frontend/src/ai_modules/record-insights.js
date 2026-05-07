import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, ClipboardList, ShieldAlert, Sparkles, TrendingUp, HeartPulse } from 'lucide-react';

const RecordInsights = ({ onClose, isAdvanced }) => {
    const [recordText, setRecordText] = useState('');
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        if (!recordText.trim()) return;
        setIsLoading(true);
        setInsights(null);

        // Simulating Advanced AI summarization
        setTimeout(() => {
            setInsights({
                status: "Optimal",
                summary: "Neural analysis of the provided records indicates a stable clinical trajectory with no immediate red flags detected in historical patterns.",
                details: [
                    { label: "Key Conditions", value: "Stable baseline, mild seasonal rhinitis", icon: <ClipboardList className="text-blue-400" size={18} /> },
                    { label: "Detected Patterns", value: "Normal cardiovascular recovery", icon: <TrendingUp className="text-emerald-400" size={18} /> },
                    { label: "Risk Assessment", value: "Low cardiovascular risk (based on history)", icon: <HeartPulse className="text-pink-400" size={18} /> }
                ],
                alerts: [
                    "Follow-up advisable in 3 months for routine screening."
                ]
            });
            setIsLoading(false);
        }, 2500);
    };

    if (isAdvanced) {
        return (
            <div className="advanced-module-inner">
                <div className="module-intro">
                    <div className="intro-icon bg-blue-500/10">
                        <FileText className="text-blue-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Health Record Summarizer</h2>
                        <p className="text-slate-400 text-sm">Neural summarization of medical history, prescriptions, and lab reports.</p>
                    </div>
                </div>

                <div className="advanced-form-grid">
                    <div className="input-section">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block">Paste Record Content</label>
                        <div className="textarea-glow-wrapper">
                            <textarea 
                                value={recordText}
                                onChange={(e) => setRecordText(e.target.value)}
                                placeholder="Paste text from lab reports, discharge summaries, or prescriptions here..."
                                className="advanced-textarea"
                            />
                            <div className="textarea-focus-ring"></div>
                        </div>
                        
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !recordText.trim()}
                            className="advanced-action-btn"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mini-loader"></div>
                                    <span>Synthesizing Records...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    <span>Generate Insights</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="result-preview-section">
                        <AnimatePresence mode="wait">
                            {!insights && !isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="empty-result-vibe"
                                >
                                    <Search size={48} className="text-slate-700 mb-4" />
                                    <p>Awaiting record analysis</p>
                                </motion.div>
                            )}

                            {insights && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="advanced-result-content"
                                >
                                    <div className="result-header-card mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analysis Summary</span>
                                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                                Status: {insights.status}
                                            </div>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4">
                                            "{insights.summary}"
                                        </p>
                                    </div>

                                    <div className="insights-stack space-y-4">
                                        {insights.details.map((item, i) => (
                                            <div key={i} className="suggestion-pill py-4">
                                                <div className="bg-slate-800 p-2 rounded-lg">{item.icon}</div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{item.label}</p>
                                                    <p className="text-sm font-semibold">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {insights.alerts.length > 0 && (
                                        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
                                            <ShieldAlert className="text-orange-400 shrink-0" size={18} />
                                            <p className="text-xs text-orange-200">{insights.alerts[0]}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback/Legacy
    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">📄</span>
                        <h3>Record Insights</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px', color: '#555' }}>
                        Paste your medical records or doctor's notes for a summary.
                    </p>
                    <textarea 
                        value={recordText}
                        onChange={(e) => setRecordText(e.target.value)}
                        placeholder="Paste record text here..."
                        style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', resize: 'none', marginBottom: '15px' }}
                    />
                    
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !recordText.trim()}
                        className="btn-primary-filled"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? 'Generating...' : 'Generate Insights'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordInsights;
