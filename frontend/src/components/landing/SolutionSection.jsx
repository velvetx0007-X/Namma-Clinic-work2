import React from 'react';
import { FileText, Scan, Activity, LayoutDashboard, TrendingUp, Bot } from 'lucide-react';

const solutions = [
  { icon: <FileText size={22} />, title: 'Digital Prescriptions', desc: 'AI-generated, digitally signed prescriptions with drug interaction alerts and auto-formatting.' },
  { icon: <Scan size={22} />, title: 'OCR Upload Engine', desc: 'Upload handwritten prescriptions and let AI extract, structure, and digitize the data instantly.' },
  { icon: <Activity size={22} />, title: 'Wellness Tracking', desc: 'Monitor patient vitals, health metrics, and daily wellness tasks with smart tracking dashboards.' },
  { icon: <LayoutDashboard size={22} />, title: 'Role-Based Dashboards', desc: 'Dedicated intelligent dashboards for doctors, nurses, receptionists, patients, and admins.' },
  { icon: <TrendingUp size={22} />, title: 'Revenue Analytics', desc: 'AI-powered revenue intelligence with forecasting, department analytics, and growth insights.' },
  { icon: <Bot size={22} />, title: 'AI Health Assistant', desc: 'Context-aware Gemini AI assistant for diet plans, health guidance, and clinical decision support.' },
];

const SolutionSection = () => (
  <section className="nc-section" id="solutions" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
    <div className="nc-section-inner">
      <div className="nc-section-header centered">
        <div className="nc-section-tag emerald">The Solution</div>
        <h2 className="nc-section-title">One Platform. Every Clinical Workflow.</h2>
        <p className="nc-section-subtitle">NAMMA CLINIC replaces fragmented tools with a unified, AI-powered platform that automates and elevates every aspect of clinical operations.</p>
      </div>
      <div className="nc-solutions-grid">
        {solutions.map((s, i) => (
          <div key={i} className="nc-solution-card">
            <div className="icon">{s.icon}</div>
            <h4>{s.title}</h4>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
