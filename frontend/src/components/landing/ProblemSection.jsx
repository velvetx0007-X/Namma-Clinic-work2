import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

const ProblemSection = () => {
  return (
    <section className="nc-problem-solution" id="solutions">
      <div className="nc-split-grid">
        <div className="nc-ps-content reveal">
          <div className="section-tag">The Challenge</div>
          <h2 className="section-title">Traditional clinics are broken.</h2>
          <p className="section-subtitle" style={{ marginBottom: '40px' }}>
            Paper records, disconnected systems, and manual workflows are costing your clinic time, money, and compromising patient care.
          </p>
          
          <ul className="nc-ps-list">
            <li className="nc-ps-item">
              <div className="nc-ps-icon red"><XCircle size={18} /></div>
              <div className="nc-ps-text">
                <h4>Scattered Patient Records</h4>
                <p>Doctors waste hours searching through paper files and outdated legacy software.</p>
              </div>
            </li>
            <li className="nc-ps-item">
              <div className="nc-ps-icon red"><XCircle size={18} /></div>
              <div className="nc-ps-text">
                <h4>Manual Prescriptions</h4>
                <p>Handwritten prescriptions lead to pharmacy errors and poor patient compliance tracking.</p>
              </div>
            </li>
            <li className="nc-ps-item">
              <div className="nc-ps-icon red"><XCircle size={18} /></div>
              <div className="nc-ps-text">
                <h4>No Data Insights</h4>
                <p>Clinics operate blind without real-time analytics on revenue, patient flow, or treatment efficacy.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="nc-ps-visual reveal delay-200">
          <div className="section-tag blue" style={{ marginBottom: '24px' }}>The Solution</div>
          <h3 style={{ fontSize: '28px', marginBottom: '32px', fontWeight: '800', color: 'var(--nc-text)' }}>Namma Clinic OS</h3>
          <ul className="nc-ps-list" style={{ gap: '24px' }}>
            <li className="nc-ps-item">
              <div className="nc-ps-icon green"><CheckCircle2 size={18} /></div>
              <div className="nc-ps-text">
                <h4 style={{ color: 'var(--nc-text)', fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Unified Digital Records</h4>
                <p style={{ fontSize: '15px', color: 'var(--nc-text-muted)' }}>Everything in one secure cloud dashboard.</p>
              </div>
            </li>
            <li className="nc-ps-item">
              <div className="nc-ps-icon green"><CheckCircle2 size={18} /></div>
              <div className="nc-ps-text">
                <h4 style={{ color: 'var(--nc-text)', fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>AI Smart Prescriptions</h4>
                <p style={{ fontSize: '15px', color: 'var(--nc-text-muted)' }}>Generate and track digital prescriptions instantly.</p>
              </div>
            </li>
            <li className="nc-ps-item">
              <div className="nc-ps-icon green"><CheckCircle2 size={18} /></div>
              <div className="nc-ps-text">
                <h4 style={{ color: 'var(--nc-text)', fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Predictive Analytics</h4>
                <p style={{ fontSize: '15px', color: 'var(--nc-text-muted)' }}>Real-time clinic performance and patient health insights.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
