import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { motion } from 'framer-motion';
import { Stethoscope, Heart, Briefcase, Building2, Users, ClipboardCheck } from 'lucide-react';

const SolutionsPage = () => {
  const solutions = [
    { title: "For Private Clinics", desc: "Digitalize your practice with easy scheduling and digital prescriptions.", icon: <Stethoscope size={32} /> },
    { title: "For Specialized Hospitals", desc: "Manage complex multi-department workflows and high patient volume.", icon: <Building2 size={32} /> },
    { title: "For Diagnostic Centers", desc: "Automate lab report delivery and integrate results into EMRs.", icon: <ClipboardCheck size={32} /> },
    { title: "For Chronic Care", desc: "Long-term patient tracking and AI-driven wellness management.", icon: <Heart size={32} /> },
  ];

  return (
    <LandingPageLayout 
      title="Healthcare Solutions" 
      description="Tailored healthcare management solutions for clinics, hospitals, and specialized centers."
    >
      <section className="nc-hero" style={{ minHeight: '30vh', padding: '80px 0 20px' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag violet">Tailored Solutions</div>
            <h1 className="hero-headline">One Platform, <span className="gradient-text">Infinite Possibilities</span></h1>
            <p className="hero-subtitle">Whether you're a solo practitioner or a multi-specialty hospital, NAMMA CLINIC scales to meet your specific clinical needs.</p>
          </div>
        </div>
      </section>

      <section className="nc-trust">
        <div className="nc-why-grid">
          {solutions.map((s, i) => (
            <div key={i} className="nc-why-card reveal">
              <div className="nc-why-icon" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--nc-blue)' }}>{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="nc-problem-solution">
        <div className="nc-split-grid">
          <div className="reveal">
            <h2 className="section-title">Designed for Modern Medicine</h2>
            <p className="section-subtitle">We bridge the gap between legacy healthcare systems and the AI-driven future.</p>
            <div className="nc-ps-list">
              <div className="nc-ps-item">
                <div className="nc-ps-icon green"><ClipboardCheck size={18} /></div>
                <div className="nc-ps-text">
                  <h4>Unified Dashboard</h4>
                  <p>Access all clinical data, patient history, and analytics from a single interface.</p>
                </div>
              </div>
              <div className="nc-ps-item">
                <div className="nc-ps-icon green"><ClipboardCheck size={18} /></div>
                <div className="nc-ps-text">
                  <h4>Collaborative Care</h4>
                  <p>Enable doctors, nurses, and specialists to work together on patient records in real-time.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nc-ps-visual reveal delay-200" style={{ background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', borderRadius: '32px' }}>
             {/* Visual representation of a dashboard would go here */}
             <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <Users size={120} style={{ opacity: 0.1, color: 'var(--nc-blue)' }} />
             </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default SolutionsPage;
