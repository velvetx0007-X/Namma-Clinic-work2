import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import ContactSection from '../../components/landing/ContactSection';
import { Mail, Phone, MapPin, MessageSquare, Twitter, Linkedin, Github } from 'lucide-react';

const ContactPage = () => {
  return (
    <LandingPageLayout 
      title="Contact Us" 
      description="Get in touch with the NAMMA CLINIC team for support, sales, or partnership inquiries."
    >
      <section className="nc-hero" style={{ minHeight: '40vh', padding: '120px 0 40px' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <h1 className="hero-headline">Let's <span className="gradient-text">Connect</span></h1>
            <p className="hero-subtitle">We're here to help you modernize your healthcare practice.</p>
          </div>
        </div>
      </section>

      <ContactSection />

      <section className="nc-trust" style={{ background: '#fff' }}>
        <div className="nc-trust-inner">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="reveal">
              <h4 style={{ fontSize: '20px', marginBottom: '16px' }}>Office Locations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <MapPin className="text-blue-600" />
                  <div>
                    <h5 style={{ fontWeight: '700' }}>HQ & Operations</h5>
                    <p style={{ fontSize: '14px', color: 'var(--nc-text-muted)' }}>Tamil Nadu, India</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="reveal delay-100">
              <h4 style={{ fontSize: '20px', marginBottom: '16px' }}>General Inquiries</h4>
              <p style={{ fontSize: '14px', color: 'var(--nc-text-muted)', marginBottom: '12px' }}>Email: zuhvix.tech@gmail.com</p>
              <p style={{ fontSize: '14px', color: 'var(--nc-text-muted)' }}>Phone: +91 6382715355</p>
            </div>

            <div className="reveal delay-200">
              <h4 style={{ fontSize: '20px', marginBottom: '16px' }}>Social Connect</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#" style={{ color: 'var(--nc-text-muted)' }}><Twitter size={24} /></a>
                <a href="#" style={{ color: 'var(--nc-text-muted)' }}><Linkedin size={24} /></a>
                <a href="#" style={{ color: 'var(--nc-text-muted)' }}><Github size={24} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default ContactPage;
