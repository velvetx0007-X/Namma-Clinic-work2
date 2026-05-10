import React from 'react';
import { Brain, Scan, Activity, HeartPulse, TrendingUp, Shield } from 'lucide-react';
import aiBg from '../../assets/ai-visual.png';

const aiFeatures = [
  { icon: <Brain size={20} />, title: 'Clinical Decision Support', desc: 'AI analyzes patient vitals and history to suggest diagnoses and treatment paths.' },
  { icon: <Scan size={20} />, title: 'OCR Prescription Engine', desc: 'Upload handwritten prescriptions — AI extracts drugs, dosage, and frequency automatically.' },
  { icon: <HeartPulse size={20} />, title: 'Predictive Health Alerts', desc: 'Proactive notifications when patient vitals deviate from safe thresholds.' },
  { icon: <Activity size={20} />, title: 'Smart Wellness Plans', desc: 'Personalized diet, exercise, and medication reminders powered by Gemini AI.' },
  { icon: <TrendingUp size={20} />, title: 'Revenue Intelligence', desc: 'AI forecasting for clinic revenue, appointment trends, and growth opportunities.' },
  { icon: <Shield size={20} />, title: 'Drug Interaction Alerts', desc: 'Real-time cross-referencing of prescribed medications for safety conflicts.' },
];

const AISection = () => (
  <section className="nc-section nc-ai-section" id="ai">
    <div className="nc-ai-bg">
      <img src={aiBg} alt="" />
    </div>
    <div className="nc-section-inner nc-ai-content">
      <div className="nc-section-header centered">
        <div className="nc-section-tag violet">Artificial Intelligence</div>
        <h2 className="nc-section-title">Healthcare Intelligence,<br />Redefined</h2>
        <p className="nc-section-subtitle">Our Gemini-powered AI engine transforms raw clinical data into actionable insights — helping doctors make faster, safer, and smarter decisions.</p>
      </div>
      <div className="nc-ai-grid">
        {aiFeatures.map((f, i) => (
          <div key={i} className="nc-ai-card">
            <div className="icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AISection;
