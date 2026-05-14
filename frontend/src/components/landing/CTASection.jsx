import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="nc-cta">
      <div className="nc-cta-box reveal">
        <h2 className="nc-cta-title">Modernize your clinic today.</h2>
        <p className="nc-cta-text">
          Join hundreds of innovative clinics using Namma Clinic to automate workflows, reduce errors, and deliver better patient care with AI.
        </p>
        <div className="nc-hero-actions" style={{ marginBottom: 0 }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '18px 36px' }}>
            Launch Platform <ArrowRight size={18} />
          </Link>
          <Link to="/contact" className="btn btn-glass" style={{ padding: '18px 36px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', padding: '5px', display: 'flex', color: 'var(--nc-text)' }}>
              <Play size={14} fill="currentColor" />
            </span>
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
