import React from 'react';
import { Shield, Cloud, Lock, Zap, Clock, BrainCircuit } from 'lucide-react';

const TrustSection = () => {
  return (
    <section className="nc-trust" id="why-choose">
      <div className="nc-trust-inner">
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="reveal">
          <div className="section-tag violet">The Advantage</div>
          <h2 className="section-title">Why Choose Namma Clinic?</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            We combine clinical expertise with modern technology to provide the most comprehensive 
            operating system for healthcare providers.
          </p>
        </div>

        <div className="nc-why-grid">
          <div className="nc-why-card reveal">
            <div className="nc-why-icon" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--nc-blue)' }}><Shield size={32} /></div>
            <h4>End-to-End Security</h4>
            <p>Your data is protected by industry-leading AES-256 encryption and is fully HIPAA compliant, ensuring patient privacy is never compromised.</p>
          </div>
          
          <div className="nc-why-card reveal delay-100">
            <div className="nc-why-icon" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--nc-violet)' }}><BrainCircuit size={32} /></div>
            <h4>AI-Powered Intelligence</h4>
            <p>Go beyond simple record-keeping. Our AI engine helps with diagnostic suggestions, prescription OCR, and predictive health trends.</p>
          </div>

          <div className="nc-why-card reveal delay-200">
            <div className="nc-why-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--nc-emerald)' }}><Zap size={32} /></div>
            <h4>Lighting Fast Workflows</h4>
            <p>Reduce administrative overhead by up to 40%. From instant scheduling to automated billing, we streamline every aspect of your clinic.</p>
          </div>
        </div>

        <div className="nc-trust-grid reveal" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--nc-border)' }}>
          <div className="nc-trust-item"><Shield size={20} /> HIPAA Compliant</div>
          <div className="nc-trust-item"><Lock size={20} /> AES-256 Encryption</div>
          <div className="nc-trust-item"><Cloud size={20} /> Cloud Infrastructure</div>
          <div className="nc-trust-item"><Zap size={20} /> 99.9% Uptime</div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
