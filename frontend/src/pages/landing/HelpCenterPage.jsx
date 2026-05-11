import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronRight, Search } from 'lucide-react';

const HelpCenterPage = () => {
  const faqs = [
    { q: "How do I reset my staff credentials?", a: "Clinic administrators can reset credentials from the Staff Management tab in settings." },
    { q: "Is Namma Clinic HIPAA compliant?", a: "Yes, we use end-to-end encryption and adhere to all HIPAA and GDPR data privacy standards." },
    { q: "Can I use the app offline?", a: "The core EMR supports offline data entry which syncs automatically once a connection is restored." },
    { q: "What laboratory systems are supported?", a: "We support HL7 and FHIR standards for integration with major laboratory chains globally." },
  ];

  return (
    <LandingPageLayout 
      title="Help Center" 
      description="Find answers to common questions and contact our support team for assistance."
    >
      <section className="nc-hero" style={{ minHeight: '40vh', padding: '120px 0 40px', background: '#f8fafc' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <h1 className="hero-headline">How can we <span className="gradient-text">Help?</span></h1>
            <p className="hero-subtitle">Search our knowledge base or reach out to our dedicated support team.</p>
            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Describe your issue..." 
                style={{ width: '100%', padding: '16px 24px 16px 50px', borderRadius: '16px', border: '1px solid var(--nc-border)', fontSize: '16px', outline: 'none' }} 
              />
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--nc-text-light)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="nc-trust" style={{ background: '#fff' }}>
        <div className="nc-trust-inner">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="reveal" style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid var(--nc-border)' }}>
              <MessageSquare size={32} className="text-blue-600" style={{ marginBottom: '20px' }} />
              <h4>Live Chat</h4>
              <p style={{ fontSize: '14px', color: 'var(--nc-text-muted)' }}>Average response time: 2 minutes</p>
              <button className="btn btn-glass" style={{ marginTop: '20px', width: '100%' }}>Start Chat</button>
            </div>
            <div className="reveal delay-100" style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid var(--nc-border)' }}>
              <Phone size={32} className="text-emerald-600" style={{ marginBottom: '20px' }} />
              <h4>Phone Support</h4>
              <p style={{ fontSize: '14px', color: 'var(--nc-text-muted)' }}>Available 24/7 for Enterprise customers</p>
              <button 
                className="btn btn-glass" 
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => window.location.href = 'tel:+916382715355'}
              >
                Call Us
              </button>
            </div>
            <div className="reveal delay-200" style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid var(--nc-border)' }}>
              <Mail size={32} className="text-violet-600" style={{ marginBottom: '20px' }} />
              <h4>Email Support</h4>
              <p style={{ fontSize: '14px', color: 'var(--nc-text-muted)' }}>Typical response: within 4 hours</p>
              <button 
                className="btn btn-glass" 
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => window.location.href = 'mailto:zuhvix.tech@gmail.com'}
              >
                Send Email
              </button>
            </div>
          </div>

          <div style={{ marginTop: '80px' }} className="reveal">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ paddingBottom: '24px', borderBottom: '1px solid var(--nc-border)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '18px' }}>
                    <HelpCircle size={20} className="text-blue-600" /> {faq.q}
                  </h4>
                  <p style={{ color: 'var(--nc-text-muted)', marginLeft: '32px' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default HelpCenterPage;
