import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection = () => (
  <section className="nc-cta">
    <div className="nc-cta-glow" />
    <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
      <div className="nc-section-tag violet" style={{ margin: '0 auto 20px' }}>
        <Sparkles size={14} /> Ready to Transform?
      </div>
      <h2 className="nc-section-title" style={{ textAlign: 'center' }}>
        Modernize Your Clinic with AI
      </h2>
      <p style={{ fontSize: 18, color: '#94a3b8', textAlign: 'center', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
        Join hundreds of healthcare providers already using NAMMA CLINIC to deliver faster, smarter, and more efficient patient care.
      </p>
      <div className="nc-cta-actions">
        <Link to="/signup" className="nc-hero-btn-lg">
          Start Free Trial <ArrowRight size={18} />
        </Link>
        <a href="#contact" className="nc-hero-btn-outline">
          Request Demo
        </a>
      </div>
    </div>
  </section>
);

export default CTASection;
