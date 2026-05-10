import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Zap, Activity } from 'lucide-react';
import dashboardImg from '../../assets/dashboard-preview.png';

const HeroSection = () => {
  return (
    <section className="nc-hero">
      <div className="nc-hero-bg" />
      <div className="nc-hero-grid" />

      <div className="nc-hero-inner">
        <div className="nc-hero-content">
          <div className="nc-hero-badge">
            <span className="dot" />
            AI-Powered Healthcare Platform
          </div>

          <h1>
            The Operating System for{' '}
            <span className="gradient-text">Modern Clinics</span>
          </h1>

          <p className="nc-hero-subtitle">
            NAMMA CLINIC unifies prescriptions, appointments, patient records, 
            wellness tracking, and AI-powered analytics into one intelligent 
            platform — built for doctors, clinics, and hospitals.
          </p>

          <div className="nc-hero-actions">
            <Link to="/signup" className="nc-hero-btn-lg">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a href="#showcase" className="nc-hero-btn-outline">
              <Play size={16} /> Watch Demo
            </a>
          </div>

          <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
            {[
              { icon: <Shield size={16} />, text: 'HIPAA Compliant' },
              { icon: <Zap size={16} />, text: 'AI-Powered' },
              { icon: <Activity size={16} />, text: 'Real-Time' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                <span style={{ color: '#3b82f6' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="nc-hero-visual">
          <div className="nc-hero-glow" />
          <div className="nc-hero-mockup">
            <img src={dashboardImg} alt="NAMMA CLINIC Dashboard" />
          </div>

          <div className="nc-hero-float-card card-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Activity size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Patient Vitals</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: 800 }}>98.2% Normal</div>
              </div>
            </div>
          </div>

          <div className="nc-hero-float-card card-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>AI Analysis</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: 800 }}>Completed ✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
