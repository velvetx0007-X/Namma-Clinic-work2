import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { Briefcase, Zap, Heart, Globe, ArrowRight, Star } from 'lucide-react';

const CareersPage = () => {
  const jobs = [
    { title: "Senior AI Engineer", location: "Remote / Bengaluru", type: "Full-time", dept: "Engineering" },
    { title: "Product Designer", location: "Remote", type: "Full-time", dept: "Design" },
    { title: "Clinical Workflow Specialist", location: "Chennai", type: "Hybrid", dept: "Operations" },
    { title: "Customer Success Manager", location: "Mumbai", type: "Full-time", dept: "Success" },
  ];

  return (
    <LandingPageLayout 
      title="Careers" 
      description="Join the team building the future of AI-powered healthcare management."
    >
      <section className="nc-hero" style={{ minHeight: '50vh', padding: '100px 0 40px', background: '#f8fafc' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag violet">Hiring Healthcare Innovators</div>
            <h1 className="hero-headline">Build the future of <span className="gradient-text">Medicine</span></h1>
            <p className="hero-subtitle">We're looking for passionate individuals who want to solve the most complex problems in healthcare technology.</p>
            <button className="btn btn-primary">View Open Roles</button>
          </div>
        </div>
      </section>

      <section className="nc-trust" style={{ background: '#fff' }}>
        <div className="nc-trust-inner">
          <h2 className="section-title text-center">Why join us?</h2>
          <div className="nc-why-grid" style={{ marginTop: '40px' }}>
            <div className="nc-why-card reveal">
              <Zap className="text-blue-600" style={{ marginBottom: '20px' }} />
              <h4>Impact at Scale</h4>
              <p>Your work will directly influence the care experience for millions of patients and doctors.</p>
            </div>
            <div className="nc-why-card reveal delay-100">
              <Heart className="text-red-500" style={{ marginBottom: '20px' }} />
              <h4>Health-First Culture</h4>
              <p>We prioritize our team's mental and physical well-being with premium health benefits.</p>
            </div>
            <div className="nc-why-card reveal delay-200">
              <Globe className="text-emerald-600" style={{ marginBottom: '20px' }} />
              <h4>Remote-First</h4>
              <p>Work from anywhere in the world. We value outcomes over hours spent in an office.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="nc-problem-solution">
        <div className="nc-trust-inner">
          <h2 className="section-title">Open Positions</h2>
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.map((job, i) => (
              <div key={i} className="reveal" style={{ background: '#fff', padding: '24px 32px', borderRadius: '20px', border: '1px solid var(--nc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s', cursor: 'pointer' }}>
                <div>
                  <h4 style={{ fontSize: '20px', marginBottom: '4px' }}>{job.title}</h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--nc-text-light)' }}>
                    <span>{job.dept}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <ArrowRight className="text-blue-600" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default CareersPage;
