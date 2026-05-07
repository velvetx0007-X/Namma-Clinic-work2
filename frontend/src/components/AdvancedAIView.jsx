import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, Sparkles, MessageCircle, Info, Zap, ShieldCheck } from 'lucide-react';
import './AdvancedAIView.css';

// Import individual modules (to be redesigned)
import SymptomChecker from '../ai_modules/symptom-checker';
import RecordInsights from '../ai_modules/record-insights';
import MedicationInfo from '../ai_modules/medication-info';
import LifestyleTips from '../ai_modules/lifestyle-tips';

const AdvancedAIView = ({ module, user, onClose }) => {
    const [viewState, setViewState] = useState('loading');

    useEffect(() => {
        const timer = setTimeout(() => setViewState('ready'), 800);
        return () => clearTimeout(timer);
    }, []);

    const renderModule = () => {
        switch (module) {
            case 'Symptom Checker':
                return <SymptomChecker onClose={onClose} isAdvanced={true} />;
            case 'Record Insights':
                return <RecordInsights onClose={onClose} isAdvanced={true} />;
            case 'Medication Info':
                return <MedicationInfo onClose={onClose} isAdvanced={true} />;
            case 'Lifestyle Tips':
                return <LifestyleTips onClose={onClose} isAdvanced={true} />;
            default:
                return <div className="p-20 text-center">Module not found</div>;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="advanced-ai-workspace"
        >
            {/* Ambient Background Elements */}
            <div className="ai-ambient-blob blob-1"></div>
            <div className="ai-ambient-blob blob-2"></div>
            <div className="ai-glass-overlay"></div>

            <div className="ai-workspace-container">
                {/* Header Navigation */}
                <header className="ai-workspace-header">
                    <button onClick={onClose} className="ai-back-btn">
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    
                    <div className="ai-workspace-branding">
                        <div className="ai-badge-glow">
                            <Bot className="text-white" size={24} />
                        </div>
                        <div className="ai-title-vibe">
                            <h1>Advanced AI <span>Assistant</span></h1>
                            <p className="ai-status">
                                <span className="status-dot"></span>
                                Neural Engine Online
                            </p>
                        </div>
                    </div>

                    <div className="ai-workspace-actions">
                        <div className="ai-security-tag">
                            <ShieldCheck size={14} />
                            <span>HIPAA Compliant</span>
                        </div>
                    </div>
                </header>

                <main className="ai-workspace-content">
                    <AnimatePresence mode="wait">
                        {viewState === 'loading' ? (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="ai-module-loader"
                            >
                                <div className="loader-orbit">
                                    <Sparkles className="loader-sparkle" size={40} />
                                </div>
                                <h3>Initializing Medical Model</h3>
                                <p>Processing patient context & laboratory data...</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="module"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                                className="ai-active-module-container"
                            >
                                <div className="module-glass-card">
                                    {renderModule()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="ai-workspace-footer">
                    <div className="ai-tip-card">
                        <Info size={16} />
                        <p>AI suggestions are guidance only. Consult a human doctor for formal diagnosis.</p>
                    </div>
                </footer >
            </div>
        </motion.div>
    );
};

export default AdvancedAIView;
