import React from 'react';
import dashboardImg from '../../assets/dashboard-preview.png';

const ShowcaseSection = () => (
  <section className="nc-section nc-showcase" id="showcase">
    <div className="nc-section-inner">
      <div className="nc-section-header centered">
        <div className="nc-section-tag">Product Showcase</div>
        <h2 className="nc-section-title">See the Platform in Action</h2>
        <p className="nc-section-subtitle">A unified clinical operating system that transforms how healthcare teams work, collaborate, and deliver patient care.</p>
      </div>
      <div className="nc-showcase-mockup">
        <div style={{
          background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>app.nammaclinic.in — Doctor Dashboard</span>
          </div>
        </div>
        <img src={dashboardImg} alt="NAMMA CLINIC Dashboard" />
      </div>
    </div>
  </section>
);

export default ShowcaseSection;
