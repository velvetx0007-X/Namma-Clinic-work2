import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Search, Clock, ShieldCheck, AlertTriangle, Activity, Zap } from 'lucide-react';

const MedicationInfo = ({ onClose, isAdvanced }) => {
    const [medicine, setMedicine] = useState('');
    const [info, setInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheck = () => {
        if (!medicine.trim()) return;
        setIsLoading(true);
        setInfo(null);

        // Simulating Advanced AI fetch
        setTimeout(() => {
            setInfo({
                dosage: "500mg, 1 tablet",
                timing: "Twice daily (Post-meal)",
                precautions: "No alcohol intake; monitor dizziness",
                sideEffects: "Drowsiness, dry mouth",
                safetyRating: 88
            });
            setIsLoading(false);
        }, 1800);
    };

    if (isAdvanced) {
        return (
            <div className="advanced-module-inner">
                <div className="module-intro">
                    <div className="intro-icon bg-pink-500/10">
                        <Pill className="text-pink-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Medicinal Intelligence</h2>
                        <p className="text-slate-400 text-sm">Pharmacological insights and safety analysis powered by medical AI.</p>
                    </div>
                </div>

                <div className="advanced-form-grid">
                    <div className="input-section">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block">Medicine Lookup</label>
                        <div className="textarea-glow-wrapper !h-auto">
                            <div className="flex items-center px-6 py-4">
                                <Search className="text-slate-500 mr-4" size={24} />
                                <input 
                                    type="text"
                                    value={medicine}
                                    onChange={(e) => setMedicine(e.target.value)}
                                    placeholder="Enter medicine name (e.g., Amoxicillin)..."
                                    className="bg-transparent border-none outline-none text-white text-lg w-full"
                                />
                            </div>
                            <div className="textarea-focus-ring"></div>
                        </div>
                        
                        <button 
                            onClick={handleCheck} 
                            disabled={isLoading || !medicine.trim()}
                            className="advanced-action-btn"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mini-loader"></div>
                                    <span>Scanning Database...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    <span>Verify Medication</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="result-preview-section">
                        <AnimatePresence mode="wait">
                            {!info && !isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="empty-result-vibe"
                                >
                                    <Activity size={48} className="text-slate-700 mb-4" />
                                    <p>Neural search ready</p>
                                </motion.div>
                            )}

                            {info && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="advanced-result-content"
                                >
                                    <div className="result-header-card bg-pink-900/10 border-pink-500/10 mb-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="text-emerald-400" size={20} />
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Safety Verified</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-500 uppercase block">Safety Score</span>
                                                <span className="text-2xl font-black text-pink-400">{info.safetyRating}%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock size={16} className="text-blue-400" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">Frequency</span>
                                                </div>
                                                <p className="text-sm font-bold">{info.timing}</p>
                                            </div>
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Activity size={16} className="text-amber-400" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">Dosage</span>
                                                </div>
                                                <p className="text-sm font-bold">{info.dosage}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 flex items-start gap-4">
                                            <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Precautions</p>
                                                <p className="text-xs font-medium text-slate-300 leading-relaxed">{info.precautions}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 flex items-start gap-4">
                                            <Activity className="text-pink-500 shrink-0 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Potential Side Effects</p>
                                                <p className="text-xs font-medium text-slate-300 leading-relaxed">{info.sideEffects}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">💊</span>
                        <h3>Medication Info</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px', color: '#555' }}>
                        Enter a medicine name to check dosage and side effects.
                    </p>
                    <input 
                        type="text"
                        value={medicine}
                        onChange={(e) => setMedicine(e.target.value)}
                        placeholder="e.g., Paracetamol, Amoxicillin..."
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '15px' }}
                    />
                    
                    <button 
                        onClick={handleCheck} 
                        disabled={isLoading || !medicine.trim()}
                        className="btn-primary-filled"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? 'Checking...' : 'Check Medication'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicationInfo;
