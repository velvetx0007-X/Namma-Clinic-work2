import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShieldCheck, Activity, BrainCircuit, UserPlus, FileUp, Stethoscope, CloudCog, Database } from 'lucide-react';
import dashboardImg from '../../assets/dashboard-preview.png';
import './HeroModern.css';

const HeroSection = () => {
  return (
    <section className="nc-hero-modern">
      {/* Background with cinematic gradients & blur */}
      <div className="nc-hero-modern-bg">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>
      
      <div className="nc-hero-modern-inner">
        {/* Text Content */}
        <div className="nc-hero-modern-content reveal">
          <h1 className="hero-modern-headline">
            Start Your Clinic's <br />
            <span className="text-gradient-premium">Digital Transformation Today</span>
          </h1>
          <p className="hero-modern-subtitle">
            Unify patient records, prescriptions, appointments, and wellness tracking with our intelligent SaaS platform built exclusively for progressive clinics and hospitals.
          </p>
          <div className="nc-hero-modern-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" className="btn btn-premium" style={{ margin: 0 }}>
              Launch Platform <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn btn-premium-glass" style={{ margin: 0 }}>
              <span className="play-icon-wrapper">
                <Play size={14} fill="currentColor" />
              </span>
              Book Demo
            </Link>
          </div>
        </div>

        {/* Circular Workflow Showcase */}
        <div className="nc-hero-showcase reveal delay-200" style={{ perspective: 'none' }}>
          <div className="nc-workflow-circle-container">
            <div className="nc-workflow-center">
              <div className="nc-workflow-pulse-ring"></div>
              <div className="nc-workflow-pulse-ring delay"></div>
              <div className="nc-workflow-center-icon">
                <Activity size={40} color="#fff" />
              </div>
              <h4>Namma Clinic OS</h4>
              <p>Core Engine</p>
            </div>
            
            {/* Orbiting nodes */}
            <div className="nc-node" style={{ '--angle': '0deg' }}>
              <div className="nc-node-icon"><UserPlus size={24} /></div>
              <span>1. Patient Portal</span>
            </div>
            <div className="nc-node" style={{ '--angle': '60deg' }}>
              <div className="nc-node-icon"><FileUp size={24} /></div>
              <span>2. Upload Rx</span>
            </div>
            <div className="nc-node" style={{ '--angle': '120deg' }}>
              <div className="nc-node-icon"><BrainCircuit size={24} /></div>
              <span>3. AI Processing</span>
            </div>
            <div className="nc-node" style={{ '--angle': '180deg' }}>
              <div className="nc-node-icon"><Stethoscope size={24} /></div>
              <span>4. Consultation</span>
            </div>
            <div className="nc-node" style={{ '--angle': '240deg' }}>
              <div className="nc-node-icon"><CloudCog size={24} /></div>
              <span>5. Secure EHR</span>
            </div>
            <div className="nc-node" style={{ '--angle': '300deg' }}>
              <div className="nc-node-icon"><Database size={24} /></div>
              <span>6. Record Management</span>
            </div>
            
            {/* Connecting SVG Circle */}
            <svg className="nc-workflow-ring" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="198" fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth="2" strokeDasharray="8 8" />
            </svg>
            
            {/* Orbiting Data Particles */}
            <div className="nc-data-particle" style={{ '--angle': '0deg', '--duration': '8s' }}></div>
            <div className="nc-data-particle" style={{ '--angle': '120deg', '--duration': '12s' }}></div>
            <div className="nc-data-particle" style={{ '--angle': '240deg', '--duration': '10s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
