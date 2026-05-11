import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { motion } from 'framer-motion';
import { BrainCircuit, Cpu, Sparkles, ShieldAlert, LineChart, FileText } from 'lucide-react';

const AIIntelligencePage = () => {
  return (
    <LandingPageLayout 
      title="AI Intelligence" 
      description="Next-generation healthcare automation and AI-driven clinical decision support."
    >
      <section className="nc-hero" style={{ minHeight: '30vh', padding: '80px 0 20px', background: 'radial-gradient(circle at 50% 0%, #f5f3ff 0%, #ffffff 70%)' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag violet">Neural Health OS</div>
            <h1 className="hero-headline">Clinical Intelligence <br /><span className="gradient-text">Powered by AI</span></h1>
            <p className="hero-subtitle">Our proprietary AI engines process millions of data points to provide doctors with real-time insights and predictive health analytics.</p>
          </div>
        </div>
      </section>

      <section className="nc-ai">
        <div className="nc-ai-grid">
          <div className="nc-ai-card reveal">
            <div className="icon"><BrainCircuit size={24} /></div>
            <h3>Predictive Diagnostics</h3>
            <p>Early detection of chronic diseases using advanced machine learning patterns from vital signs and history.</p>
          </div>
          <div className="nc-ai-card reveal delay-100">
            <div className="icon"><FileText size={24} /></div>
            <h3>Smart Prescription OCR</h3>
            <p>Automatically digitize handwritten prescriptions and legacy records with 99.8% accuracy.</p>
          </div>
          <div className="nc-ai-card reveal delay-200">
            <div className="icon"><ShieldAlert size={24} /></div>
            <h3>Risk Stratification</h3>
            <p>Live risk scoring for patients, alerting clinical staff to high-priority cases and vital deviations.</p>
          </div>
        </div>
      </section>

      <section className="nc-problem-solution" style={{ background: '#fff' }}>
        <div className="nc-split-grid">
          <div className="nc-ps-visual reveal" style={{ background: 'linear-gradient(135deg, #f5f3ff, #f8fafc)', padding: '60px' }}>
             <Cpu size={140} style={{ opacity: 0.1, color: 'var(--nc-violet)' }} />
          </div>
          <div className="reveal delay-200">
            <h2 className="section-title">Built on Responsible AI</h2>
            <p className="section-subtitle">We prioritize clinical safety and data privacy above all. Our AI serves as a companion to the doctor, never a replacement.</p>
            <div className="nc-ps-list">
              <div className="nc-ps-item">
                <div className="nc-ps-icon blue"><Sparkles size={18} /></div>
                <div className="nc-ps-text">
                  <h4>Gemini 1.5 Integration</h4>
                  <p>Leveraging state-of-the-art multimodal AI for laboratory report analysis and patient trend detection.</p>
                </div>
              </div>
              <div className="nc-ps-item">
                <div className="nc-ps-icon blue"><LineChart size={18} /></div>
                <div className="nc-ps-text">
                  <h4>Vitals Forecasting</h4>
                  <p>Predictive modeling of blood pressure, sugar levels, and heart rate trends to prevent emergencies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default AIIntelligencePage;
