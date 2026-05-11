import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { Package, ShieldCheck, Zap, Activity, Database, Users, Layout, Smartphone } from 'lucide-react';

const ProductPage = () => {
  const products = [
    {
      title: "Smart EMR System",
      desc: "Centralized digital patient records with automated history tracking and instant data retrieval.",
      icon: <Database size={24} />,
      color: "blue"
    },
    {
      title: "AI Prescription Assistant",
      desc: "Voice-to-text prescriptions with real-time drug interaction checks and dosage suggestions.",
      icon: <Zap size={24} />,
      color: "violet"
    },
    {
      title: "Intelligent Scheduler",
      desc: "Smart calendar management with automated patient reminders and no-show prediction.",
      icon: <Activity size={24} />,
      color: "emerald"
    },
    {
      title: "Patient Health Portal",
      desc: "A dedicated mobile-responsive app for patients to view records, book appointments, and chat with doctors.",
      icon: <Smartphone size={24} />,
      color: "cyan"
    },
    {
      title: "Clinic Analytics",
      desc: "Real-time revenue tracking, patient demographic insights, and operational efficiency reports.",
      icon: <Layout size={24} />,
      color: "orange"
    },
    {
      title: "Staff Management",
      desc: "Role-based access control for doctors, nurses, receptionists, and laboratory technicians.",
      icon: <Users size={24} />,
      color: "indigo"
    }
  ];

  return (
    <LandingPageLayout 
      title="Our Products" 
      description="Explore the comprehensive suite of healthcare management tools built into the NAMMA CLINIC ecosystem."
    >
      <section className="nc-hero" style={{ minHeight: '30vh', padding: '80px 0 20px', background: '#f8fafc' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag blue">Product Suite</div>
            <h1 className="hero-headline">The Operating System for <span className="gradient-text">Modern Clinics</span></h1>
            <p className="hero-subtitle">Unified tools designed to streamline every aspect of your healthcare facility.</p>
          </div>
        </div>
      </section>

      <section className="nc-trust" style={{ background: '#fff', paddingBottom: '100px' }}>
        <div className="nc-trust-inner">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <div key={i} className="reveal" style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid var(--nc-border)', transition: 'all 0.3s', animationDelay: `${i * 100}ms` }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: i % 2 === 0 ? '#eff6ff' : '#f5f3ff', color: i % 2 === 0 ? 'var(--nc-blue)' : 'var(--nc-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  {product.icon}
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '800' }}>{product.title}</h3>
                <p style={{ color: 'var(--nc-text-muted)', lineHeight: '1.6', fontSize: '15px' }}>{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default ProductPage;
