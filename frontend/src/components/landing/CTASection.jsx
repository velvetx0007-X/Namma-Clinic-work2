import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="nc-cta">
      <div className="nc-cta-box reveal">
        <h2 className="nc-cta-title">Modernize your clinic today.</h2>
        <p className="nc-cta-text">
          Join hundreds of innovative clinics using Namma Clinic to automate workflows, reduce errors, and deliver better patient care with AI.
        </p>
        <div className="nc-hero-actions" style={{ marginBottom: 0 }}>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '18px 36px' }}>
            Book a Demo <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-glass" style={{ padding: '18px 36px' }}>
            Login to Portal
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
