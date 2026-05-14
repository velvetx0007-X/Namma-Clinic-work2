import React from 'react';
import { ArrowRight, FileText, Database, Clock, ShieldCheck, BrainCircuit, Activity } from 'lucide-react';
import './TransformationSection.css';

const ProblemSection = () => {
  return (
    <section className="nc-transformation-section" id="solutions">
      <div className="nc-trans-bg-glow"></div>
      
      <div className="nc-trans-container">
        
        {/* Header */}
        <div className="nc-trans-header reveal">
          <div className="nc-trans-label">Clinic Transformation Experience</div>
          <h2 className="nc-trans-title">Built for the next generation of healthcare.</h2>
          <p className="nc-trans-subtitle">
            Transition from fragmented legacy systems to a unified, AI-powered clinical operating system.
          </p>
        </div>

        {/* Transformation Grid */}
        <div className="nc-trans-grid">
          
          {/* Before */}
          <div className="nc-trans-card reveal">
            <div className="nc-trans-card-content">
              <h3>Before Namma Clinic</h3>
              
              <div className="trans-visual-item before">
                <div className="tv-icon before"><FileText size={20} /></div>
                <div className="tv-text">
                  <h4>Paperwork Overload</h4>
                  <p>Manual prescriptions and physical records</p>
                </div>
              </div>
              
              <div className="trans-visual-item before">
                <div className="tv-icon before"><Database size={20} /></div>
                <div className="tv-text">
                  <h4>Disconnected Systems</h4>
                  <p>Siloed tools and fragmented data</p>
                </div>
              </div>
              
              <div className="trans-visual-item before">
                <div className="tv-icon before"><Clock size={20} /></div>
                <div className="tv-text">
                  <h4>Delayed Appointments</h4>
                  <p>Wait times and administrative bottlenecks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="nc-trans-arrow reveal delay-100">
            <div className="arrow-circle">
              <ArrowRight size={24} strokeWidth={2.5} />
            </div>
          </div>

          {/* After */}
          <div className="nc-trans-card after-state reveal delay-200">
            <div className="nc-trans-card-glow"></div>
            <div className="nc-trans-card-content">
              <h3>After Namma Clinic</h3>
              
              <div className="trans-visual-item after">
                <div className="tv-icon after blue"><BrainCircuit size={20} /></div>
                <div className="tv-text">
                  <h4>AI Prescription Flow</h4>
                  <p>Smart, error-free digital prescribing</p>
                </div>
              </div>
              
              <div className="trans-visual-item after">
                <div className="tv-icon after purple"><ShieldCheck size={20} /></div>
                <div className="tv-text">
                  <h4>Connected Dashboards</h4>
                  <p>Unified secure health infrastructure</p>
                </div>
              </div>
              
              <div className="trans-visual-item after">
                <div className="tv-icon after green"><Activity size={20} /></div>
                <div className="tv-text">
                  <h4>Live Patient Analytics</h4>
                  <p>Real-time insights and wellness tracking</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Stats Strip */}
        <div className="nc-trans-stats reveal delay-300">
          <div className="stat-item">
            <div className="stat-value">80%</div>
            <div className="stat-label">Faster Patient Management</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">60%</div>
            <div className="stat-label">Reduced Manual Work</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Digital Record Accuracy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Trusted by Modern Clinics</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
