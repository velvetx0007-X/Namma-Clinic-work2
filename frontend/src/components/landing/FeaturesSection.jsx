import { LayoutDashboard, Users, Activity, FileText, CalendarCheck } from 'lucide-react';
import { HospitalVisual } from './MedicalIllustrations';

const FeaturesSection = () => {
  return (
    <section className="nc-features" id="features" style={{ position: 'relative' }}>
      <HospitalVisual className="features-hospital reveal" />
      <div style={{ textAlign: 'center', marginBottom: '80px' }} className="reveal">
        <div className="section-tag blue">Platform Features</div>
        <h2 className="section-title">What You'll Experience in Our Live Demo</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          A powerful, integrated suite of tools designed to streamline clinical workflows and enhance patient care.
        </p>
      </div>

      <div className="nc-bento-grid">
        <div className="nc-bento-card reveal">
          <div className="nc-bento-icon"><LayoutDashboard size={28} /></div>
          <h3>Smart Doctor Dashboard</h3>
          <p>Get a complete overview of your day. Manage appointments, review patient histories, and access AI-generated insights all from a single, intuitive interface.</p>
        </div>

        <div className="nc-bento-card reveal delay-100">
          <div className="nc-bento-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FileText size={28} /></div>
          <h3>Digital Prescriptions</h3>
          <p>Create, send, and track digital prescriptions in seconds. Built-in drug interaction warnings and template support.</p>
        </div>

        <div className="nc-bento-card reveal delay-200">
          <div className="nc-bento-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><Activity size={28} /></div>
          <h3>Wellness Tracking</h3>
          <p>Monitor patient health metrics longitudinally. Automatically flag abnormal vitals and schedule follow-ups.</p>
        </div>

        <div className="nc-bento-card reveal">
          <div className="nc-bento-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><CalendarCheck size={28} /></div>
          <h3>Automated Scheduling</h3>
          <p>Reduce no-shows with automated SMS and email reminders. Seamless calendar sync for the entire clinic staff.</p>
        </div>

        <div className="nc-bento-card nc-bento-large reveal delay-100">
          <div className="nc-bento-icon" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}><Users size={28} /></div>
          <h3>Patient Portal</h3>
          <p>Empower patients with a dedicated app to view their records, download prescriptions, and manage their health goals securely.</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
