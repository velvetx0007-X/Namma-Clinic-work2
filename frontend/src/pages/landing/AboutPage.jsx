import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { Heart, Globe, Users, Target, Award, Rocket } from 'lucide-react';

const AboutPage = () => {
  return (
    <LandingPageLayout 
      title="Our Mission" 
      description="Learn about the team and vision behind NAMMA CLINIC and our commitment to modernizing healthcare."
    >
      <section className="nc-hero" style={{ minHeight: '60vh', padding: '100px 0 40px', background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 70%)' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag blue">Our Mission</div>
            <h1 className="hero-headline">Revolutionizing <span className="gradient-text">Clinical Care</span></h1>
            <p className="hero-subtitle">We started NAMMA CLINIC with a simple goal: to make world-class healthcare technology accessible to every clinic, ensuring better outcomes for patients everywhere.</p>
          </div>
        </div>
      </section>

      <section className="nc-problem-solution" style={{ background: '#fff' }}>
        <div className="nc-split-grid">
          <div className="reveal">
            <h2 className="section-title">Why We Exist</h2>
            <p className="section-subtitle">The healthcare system is often slowed down by fragmented data and administrative complexity. We build tools that cut through the noise.</p>
            <div className="nc-ps-list">
              <div className="nc-ps-item">
                <div className="nc-ps-icon red"><Heart size={18} /></div>
                <div className="nc-ps-text">
                  <h4>Patient-First Design</h4>
                  <p>Every feature we build is designed to improve the patient experience and clinical accuracy.</p>
                </div>
              </div>
              <div className="nc-ps-item">
                <div className="nc-ps-icon green"><Target size={18} /></div>
                <div className="nc-ps-text">
                  <h4>Precision Technology</h4>
                  <p>Our AI models are trained to assist, not replace, the clinical judgment of healthcare professionals.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nc-ps-visual reveal delay-200" style={{ background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', padding: '60px', borderRadius: '32px' }}>
             <Globe size={140} style={{ opacity: 0.1, color: 'var(--nc-blue)' }} />
          </div>
        </div>
      </section>

      <section className="nc-trust">
        <div className="nc-trust-inner">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="reveal">
              <div style={{ color: 'var(--nc-blue)', marginBottom: '20px' }}><Users size={40} style={{ margin: '0 auto' }} /></div>
              <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>500+</h3>
              <p style={{ color: 'var(--nc-text-muted)' }}>Clinics Empowered</p>
            </div>
            <div className="reveal delay-100">
              <div style={{ color: 'var(--nc-emerald)', marginBottom: '20px' }}><Award size={40} style={{ margin: '0 auto' }} /></div>
              <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>15+</h3>
              <p style={{ color: 'var(--nc-text-muted)' }}>Industry Awards</p>
            </div>
            <div className="reveal delay-200">
              <div style={{ color: 'var(--nc-violet)', marginBottom: '20px' }}><Rocket size={40} style={{ margin: '0 auto' }} /></div>
              <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>1M+</h3>
              <p style={{ color: 'var(--nc-text-muted)' }}>Patients Served</p>
            </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default AboutPage;
