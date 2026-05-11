import React from 'react';
import { BrainCircuit, ScanSearch, LineChart } from 'lucide-react';
import { DashboardVisual } from './MedicalIllustrations';

const AISection = () => {
  return (
    <section className="nc-ai" id="ai-health" style={{ position: 'relative' }}>
      <DashboardVisual className="ai-dashboard reveal" />
      <div className="nc-ai-glow"></div>
      <div className="nc-ai-inner">
        <div className="reveal">
          <div className="section-tag violet">Powered by Advanced AI</div>
          <h2 className="section-title">Healthcare Intelligence</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Leverage state-of-the-art machine learning to augment clinical decisions, automate data entry, and predict patient health trends.
          </p>
        </div>

        <div className="nc-ai-grid reveal delay-200">
          <div className="nc-ai-card">
            <div className="icon"><BrainCircuit size={32} /></div>
            <h4 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>Clinical Decision Support</h4>
            <p style={{ color: 'var(--nc-text-muted)', lineHeight: 1.6 }}>Our AI engine analyzes patient symptoms and history against vast medical databases to suggest potential diagnoses and treatment pathways.</p>
          </div>
          
          <div className="nc-ai-card">
            <div className="icon"><ScanSearch size={32} /></div>
            <h4 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>OCR Prescription Upload</h4>
            <p style={{ color: 'var(--nc-text-muted)', lineHeight: 1.6 }}>Instantly digitize handwritten notes and old medical records using our medical-grade Optical Character Recognition technology.</p>
          </div>
          
          <div className="nc-ai-card">
            <div className="icon"><LineChart size={32} /></div>
            <h4 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>Predictive Health Trends</h4>
            <p style={{ color: 'var(--nc-text-muted)', lineHeight: 1.6 }}>Identify at-risk patients before conditions worsen. Our models analyze longitudinal data to flag early warning signs automatically.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
