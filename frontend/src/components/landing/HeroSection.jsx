import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Activity, ShieldCheck, UserPlus, FileUp, BrainCircuit, Stethoscope, CloudCog, Database } from 'lucide-react';
import { DoctorVisual, LabVisual } from './MedicalIllustrations';

const HeroSection = () => {
  return (
    <section className="nc-hero">
      <div className="nc-hero-bg"></div>
      
      {/* Decorative Background Elements */}
      <div className="nc-hero-deco deco-1"><Stethoscope size={120} /></div>
      <div className="nc-hero-deco deco-2"><Activity size={80} /></div>
      <div className="nc-hero-deco deco-3"><Database size={100} /></div>
      
      {/* Character Visuals */}
      <DoctorVisual className="hero-doctor reveal" />
      <LabVisual className="hero-lab reveal delay-200" />
      
      <div className="nc-hero-inner">
        <div className="nc-hero-content reveal visible">
          
          <h1 className="hero-headline">
            Start Your Clinic's <br />
            <span className="gradient-text">Digital Transformation Today</span>
          </h1>
          
          <p className="hero-subtitle">
            Unify patient records, prescriptions, appointments, and wellness tracking with our intelligent SaaS platform built exclusively for progressive clinics and hospitals.
          </p>
          
          <div className="nc-hero-actions">
            <Link to="/contact" className="btn btn-primary">
              Book a Demo <ArrowRight size={14} />
            </Link>
            <a href="#workflow" className="btn btn-glass">
              <Play size={14} /> Watch Product Tour
            </a>
          </div>
        </div>

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
          
          {/* Floating Medical Elements (Sides) */}
          <div className="floating-card fc-1 reveal delay-300" style={{ left: '-30%', top: '20%' }}>
            <div className="fc-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <Activity size={20} />
            </div>
            <div className="fc-info">
              <h5>Real-time Vitals</h5>
              <p>98.2% Accuracy</p>
            </div>
          </div>

          <div className="floating-card fc-2 reveal delay-300" style={{ right: '-30%', bottom: '20%' }}>
            <div className="fc-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <ShieldCheck size={20} />
            </div>
            <div className="fc-info">
              <h5>Data Security</h5>
              <p>HIPAA Compliant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
