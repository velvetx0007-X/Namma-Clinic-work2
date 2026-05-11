import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Cpu, Activity, Database, Globe, Layers, BarChart } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    { title: "Smart EMR System", desc: "Digital health records with AI-powered data entry and intelligent search.", icon: <Database size={24} />, color: "blue" },
    { title: "AI Diagnostics", desc: "Pre-screening algorithms that assist doctors in identifying early health risks.", icon: <Cpu size={24} />, color: "violet" },
    { title: "Workflow Automation", desc: "Automate appointment scheduling, billing, and follow-ups seamlessly.", icon: <Zap size={24} />, color: "emerald" },
    { title: "Secure Data Vault", desc: "Military-grade encryption for all patient and clinical data.", icon: <Shield size={24} />, color: "indigo" },
    { title: "Real-time Vitals", desc: "Live monitoring of patient health metrics with instant alerts.", icon: <Activity size={24} />, color: "cyan" },
    { title: "Clinical Analytics", desc: "Deep insights into clinic performance and patient outcomes.", icon: <BarChart size={24} />, color: "blue" },
  ];

  return (
    <LandingPageLayout 
      title="Advanced Features" 
      description="Explore the powerful AI-driven features of NAMMA CLINIC that modernize healthcare management."
    >
      <section className="nc-hero" style={{ minHeight: '30vh', padding: '80px 0 20px' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag blue">Platform Capabilities</div>
            <h1 className="hero-headline">Features that empower <span className="gradient-text">Healthcare Leaders</span></h1>
            <p className="hero-subtitle">Our comprehensive suite of tools is designed to eliminate administrative burden and focus on what matters most: patient care.</p>
          </div>
        </div>
      </section>

      <section className="nc-features" style={{ background: '#fff' }}>
        <div className="nc-bento-grid">
          {features.map((f, i) => (
            <div key={i} className="nc-bento-card reveal">
              <div className={`nc-bento-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="nc-cta">
        <div className="nc-cta-box reveal">
          <h2 className="nc-cta-title">Ready to transform your clinic?</h2>
          <p className="nc-cta-text">Experience the most advanced AI healthcare platform today.</p>
          <div className="nc-hero-actions">
            <button className="btn btn-primary">Start Free Trial</button>
            <button className="btn btn-glass">Request Demo</button>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default FeaturesPage;
