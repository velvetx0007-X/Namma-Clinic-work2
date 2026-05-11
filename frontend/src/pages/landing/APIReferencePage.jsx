import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { Code, Terminal, Database, ShieldCheck, Copy, ChevronRight } from 'lucide-react';

const APIReferencePage = () => {
  const endpoints = [
    { method: "GET", path: "/v1/patients", desc: "Retrieve a list of patients in your clinic." },
    { method: "POST", path: "/v1/appointments", desc: "Create a new appointment record." },
    { method: "GET", path: "/v1/analytics/vitals", desc: "Fetch real-time vital trends for a specific patient." },
    { method: "PATCH", path: "/v1/prescriptions/:id", desc: "Update an existing prescription record." },
  ];

  return (
    <LandingPageLayout 
      title="API Reference" 
      description="Integrate NAMMA CLINIC into your existing healthcare infrastructure with our robust developer API."
    >
      <section className="nc-hero" style={{ minHeight: '50vh', padding: '100px 0 40px', background: '#0f172a', color: '#fff' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag violet" style={{ background: 'rgba(255,255,255,0.1)', color: '#a78bfa', borderColor: 'rgba(255,255,255,0.1)' }}>Developer API</div>
            <h1 className="hero-headline" style={{ color: '#fff' }}>Build on <span className="gradient-text">Neural Health OS</span></h1>
            <p className="hero-subtitle" style={{ color: '#94a3b8' }}>Connect your clinic's data to custom dashboards, laboratory systems, and internal reporting tools.</p>
          </div>
        </div>
      </section>

      <section className="nc-trust" style={{ background: '#fff', paddingBottom: '80px' }}>
        <div className="nc-trust-inner">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 reveal">
              <h2 className="section-title">Common Endpoints</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                {endpoints.map((ep, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--nc-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', background: ep.method === 'GET' ? '#dcfce7' : ep.method === 'POST' ? '#dbeafe' : '#fef9c3', color: ep.method === 'GET' ? '#166534' : ep.method === 'POST' ? '#1e40af' : '#854d0e', fontSize: '12px', fontWeight: '800' }}>{ep.method}</span>
                    <code style={{ fontSize: '14px', color: 'var(--nc-text)', fontWeight: '600', flex: 1 }}>{ep.path}</code>
                    <p style={{ fontSize: '13px', color: 'var(--nc-text-light)', margin: 0 }}>{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal delay-200">
               <div style={{ background: '#1e293b', borderRadius: '24px', padding: '32px', color: '#fff' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}><Terminal size={20} className="text-blue-400" /> Authentication</h4>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>All API requests must include your organization's API Key in the Authorization header.</p>
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', marginTop: '20px', position: 'relative' }}>
                    <code style={{ fontSize: '12px', color: '#38bdf8' }}>Authorization: Bearer NC_SK_...</code>
                    <Copy size={14} style={{ position: 'absolute', right: '16px', top: '16px', cursor: 'pointer', opacity: 0.5 }} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default APIReferencePage;
