import React from 'react';
import dashboardImg from '../../assets/dashboard-preview.png';
import mobileImg from '../../assets/mobile-preview.png';

const features = [
  {
    tag: 'Doctor Workflow',
    title: 'Clinical Intelligence at Your Fingertips',
    desc: 'Manage consultations, write digital prescriptions, review patient history, and access AI-powered clinical decision support — all from a single unified dashboard designed for speed.',
    img: dashboardImg,
    reversed: false,
  },
  {
    tag: 'Patient Experience',
    title: 'Healthcare That Patients Actually Love',
    desc: 'Patients access their prescriptions, lab reports, appointment history, and wellness tracking from their personal dashboard. The AI health assistant provides 24/7 guidance on diet, exercise, and medication.',
    img: mobileImg,
    reversed: true,
  },
];

const FeaturesSection = () => (
  <section className="nc-section" id="features" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
    <div className="nc-section-inner">
      <div className="nc-section-header centered">
        <div className="nc-section-tag">Platform Features</div>
        <h2 className="nc-section-title">Built for Every Role in Healthcare</h2>
        <p className="nc-section-subtitle">Purpose-built workflows for doctors, patients, nurses, receptionists, and administrators.</p>
      </div>

      {features.map((f, i) => (
        <div key={i} className={`nc-feature-block ${f.reversed ? 'reversed' : ''}`}>
          <div className="nc-feature-content">
            <div className="tag">{f.tag}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
          <div className="nc-feature-visual">
            <img src={f.img} alt={f.tag} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
