import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { ShieldCheck, Lock, FileText, Scale, Globe, Bell } from 'lucide-react';

const LegalPrivacyPage = () => {
  return (
    <LandingPageLayout 
      title="Legal & Privacy" 
      description="Review our privacy policy, terms of service, and healthcare data compliance standards."
    >
      <section className="nc-hero" style={{ minHeight: '40vh', padding: '100px 0 40px', background: '#f8fafc' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <h1 className="hero-headline">Trust & <span className="gradient-text">Compliance</span></h1>
            <p className="hero-subtitle">We hold our platform to the highest standards of healthcare data security and legal integrity.</p>
          </div>
        </div>
      </section>

      <section className="nc-trust" style={{ background: '#fff' }}>
        <div className="nc-trust-inner" style={{ maxWidth: '900px' }}>
          <div className="reveal" style={{ marginBottom: '80px' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ShieldCheck size={32} className="text-blue-600" /> Privacy Policy
            </h2>
            <p style={{ color: 'var(--nc-text-light)', marginBottom: '24px' }}>Last Updated: May 2026</p>
            <div style={{ color: 'var(--nc-text-muted)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p>At NAMMA CLINIC, we take patient data privacy with the utmost seriousness. Our platform is built from the ground up to comply with global healthcare standards, including HIPAA (USA) and DISHA (India).</p>
              <h4 style={{ color: 'var(--nc-text)', fontWeight: '700' }}>1. Data Ownership</h4>
              <p>Patients and healthcare providers retain 100% ownership of their medical records. NAMMA CLINIC acts only as a secure custodian of this data, providing the infrastructure to manage it effectively.</p>
              <h4 style={{ color: 'var(--nc-text)', fontWeight: '700' }}>2. AI Usage Disclosure</h4>
              <p>Our AI Health Assistant analyzes data locally within secure environments. No patient data is used to train external AI models without explicit, informed consent and complete de-identification protocols.</p>
            </div>
          </div>

          <div className="reveal" style={{ marginBottom: '80px' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Scale size={32} className="text-indigo-600" /> Terms of Service
            </h2>
            <div style={{ color: 'var(--nc-text-muted)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p>By using NAMMA CLINIC, healthcare providers agree to maintain accurate medical records and respect patient confidentiality as per their local medical council guidelines.</p>
              <h4 style={{ color: 'var(--nc-text)', fontWeight: '700' }}>Platform Availability</h4>
              <p>We guarantee 99.9% uptime for our clinical services, ensuring that vital patient information is always accessible when needed most.</p>
            </div>
          </div>

          <div className="reveal">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Lock size={32} className="text-emerald-600" /> Security Standards
            </h2>
            <div className="nc-why-grid" style={{ marginTop: '40px' }}>
              <div className="nc-why-card">
                 <h5 style={{ fontWeight: '700', marginBottom: '8px' }}>AES-256 Encryption</h5>
                 <p style={{ fontSize: '14px' }}>All data is encrypted at rest and in transit using military-grade protocols.</p>
              </div>
              <div className="nc-why-card">
                 <h5 style={{ fontWeight: '700', marginBottom: '8px' }}>Biometric Auth</h5>
                 <p style={{ fontSize: '14px' }}>Multi-factor authentication is required for all staff level access.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default LegalPrivacyPage;
