import React, { useState } from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { Book, Search, FileText, ChevronRight, PlayCircle, X, CheckCircle2, Clock, Shield } from 'lucide-react';

const DocumentationPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [
    { title: "Getting Started", items: ["System Requirements", "Setting up your Clinic", "Staff Onboarding", "First Patient Visit"] },
    { title: "Clinical Workflow", items: ["Managing Appointments", "Using AI Prescriptions", "Symptom Checker Guide", "Patient History"] },
    { title: "Administration", items: ["User Permissions", "Billing & Invoicing", "Clinic Settings", "Analytics Dashboard"] },
    { title: "Patient Portal", items: ["Patient Signup", "Uploading Records", "Accessing Health Data", "Virtual Consultations"] },
  ];

  const itemDetails = {
    "System Requirements": {
      title: "System Requirements",
      description: "NAMMA CLINIC is built to be lightweight and accessible on most modern devices. To ensure the best performance, we recommend using the latest version of browser environments and maintaining a stable internet connection of at least 2Mbps.",
      fullContent: "The platform is optimized for desktop and tablet displays, specifically 13-inch screens or larger for dashboard clarity. Mobile access is supported through our companion app which requires secure biometric or PIN setup. Hardware requirements are minimal, focusing on standard RAM and CPU usage typical of modern web applications.",
      time: "5 mins read"
    },
    "Setting up your Clinic": {
      title: "Setting up your Clinic",
      description: "Configure your clinical infrastructure in minutes with our guided onboarding. This initial setup is critical for establishing your clinic's digital identity and operational parameters.",
      fullContent: "Begin by registering your Clinic License and defining your primary working hours, including holidays and emergency shift rotations. You can then proceed to set up room and bed management, categorize your medical departments, and link your verified bank account for automated billing and revenue settlement.",
      time: "15 mins read"
    },
    "Managing Appointments": {
      title: "Managing Appointments",
      description: "Master the art of scheduling with our AI-powered appointment manager. The system provides a real-time view of all doctor availability and patient bookings across multiple departments.",
      fullContent: "Utilize the drag-and-drop interface for quick rescheduling and automated synchronization with doctor calendars. The platform also sends automated WhatsApp and Email reminders to patients, significantly reducing no-show rates. Advanced AI analytics provide probability scores for each appointment, allowing you to optimize daily schedules.",
      time: "10 mins read"
    },
    "Using AI Prescriptions": {
      title: "Using AI Prescriptions",
      description: "Generate professional digital prescriptions with intelligent drug interaction checks. Our AI engine assists doctors in making safer clinical decisions in real-time.",
      fullContent: "You can speak or type to add medicines, while the system provides auto-suggested dosages based on patient history and clinical guidelines. Immediate drug-to-drug allergy warnings alert you to potential risks. Once finalized, the system applies an instant digital signature and exports a secure PDF that can be sent directly to pharmacies.",
      time: "12 mins read"
    }
  };

  const tutorials = [
    { title: "Getting Started with Namma Clinic", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
    { title: "Managing Appointments", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" },
    { title: "Patient Records & EMR", img: "https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&w=800&q=80" },
    { title: "AI Dashboard Analytics", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" },
    { title: "Billing & Revenue Tracking", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
    { title: "Staff Role Management", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" },
    { title: "Prescription & Lab Workflow", img: "https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&w=800&q=80" },
    { title: "Clinic Reports & Insights", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <LandingPageLayout 
      title="Documentation" 
      description="Comprehensive guides and tutorials for the NAMMA CLINIC ecosystem."
    >
      <section className="nc-hero" style={{ minHeight: '40vh', padding: '80px 0 30px', background: '#f8fafc' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <h1 className="hero-headline">Knowledge <span className="gradient-text">Base</span></h1>
            <p className="hero-subtitle">Find everything you need to master the NAMMA CLINIC platform.</p>
            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search documentation..." 
                style={{ width: '100%', padding: '16px 24px 16px 50px', borderRadius: '16px', border: '1px solid var(--nc-border)', fontSize: '16px', outline: 'none' }} 
              />
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--nc-text-light)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="nc-trust" style={{ background: '#fff', paddingTop: '60px' }}>
        <div className="nc-trust-inner">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <div key={i} className="reveal" style={{ animationDelay: `${i * 100}ms` }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Book size={20} className="text-blue-600" /> {cat.title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cat.items.map((item, j) => (
                    <li key={j}>
                      <button 
                        onClick={() => setSelectedItem(item)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: selectedItem === item ? 'var(--nc-blue)' : 'var(--nc-text-muted)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: selectedItem === item ? '700' : '400', transition: 'all 0.2s' }}
                      >
                        <ChevronRight size={14} style={{ opacity: selectedItem === item ? 1 : 0.5 }} /> {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Individual Box for Selected Content */}
          {selectedItem && (
            <div className="reveal visible" style={{ marginTop: '60px', background: '#f8fafc', borderRadius: '24px', border: '1px solid var(--nc-border)', padding: '40px', position: 'relative', boxShadow: 'var(--nc-shadow-lg)' }}>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: '#fff', border: '1px solid var(--nc-border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--nc-text-light)' }}
              >
                <X size={16} />
              </button>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                <div style={{ flex: '1.2', minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: 'var(--nc-blue)' }}>
                      <FileText size={24} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{selectedItem}</h2>
                  </div>
                  
                  <p style={{ fontSize: '16px', color: 'var(--nc-text)', lineHeight: '1.8', marginBottom: '24px', fontWeight: '500' }}>
                    {itemDetails[selectedItem]?.description}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '600' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--nc-blue)' }}><Clock size={16} /> {itemDetails[selectedItem]?.time || "8 mins read"}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--nc-emerald)' }}><Shield size={16} /> Verified Protocol</span>
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '300px', background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid var(--nc-border)' }}>
                  <h4 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '18px', color: 'var(--nc-blue)' }}>Implementation Details</h4>
                  <p style={{ fontSize: '15px', color: 'var(--nc-text-muted)', lineHeight: '1.8' }}>
                    {itemDetails[selectedItem]?.fullContent || "This module is designed to streamline your clinical operations by automating routine tasks and providing intelligent data insights. By integrating this into your daily workflow, you can ensure higher accuracy in patient records and more efficient appointment management."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="nc-problem-solution" style={{ background: '#f8fafc', padding: '100px 0' }}>
        <div className="nc-trust-inner">
          <div className="text-center mb-16">
            <div className="section-tag violet">Visual Learning</div>
            <h2 className="section-title">Video Tutorials</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Visual learners can explore our library of step-by-step video guides to understand how Namma Clinic simplifies healthcare operations.</p>
          </div>

          {/* Featured Walkthrough Video */}
          <div className="reveal" style={{ maxWidth: '1000px', margin: '0 auto 80px', background: '#000', borderRadius: '32px', overflow: 'hidden', position: 'relative', boxShadow: 'var(--nc-shadow-xl)', aspectRatio: '16/9' }}>
            <img 
              src="https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&w=1200&q=80" 
              alt="Walkthrough Thumbnail" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.6), transparent)', zIndex: 1 }}></div>
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', zIndex: 2, color: '#fff' }}>
              <h3 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px', fontWeight: '800' }}>Product Walkthrough</h3>
              <p style={{ opacity: 0.9, fontSize: '16px' }}>Namma Clinic — AI-Powered Smart Clinic Management Platform (2:30)</p>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
              <button style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--nc-blue)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 0 15px rgba(37,99,235,0.3)', transition: 'all 0.3s' }} className="play-pulse">
                <PlayCircle size={48} />
              </button>
            </div>
          </div>

          {/* Tutorial Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorials.map((video, i) => (
              <div key={i} className="reveal" style={{ background: '#fff', padding: '16px', borderRadius: '24px', border: '1px solid var(--nc-border)', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: `${i * 100}ms`, boxShadow: 'var(--nc-shadow-sm)' }}>
                <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                  <img src={video.img} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircle size={32} color="#fff" style={{ opacity: 0.8 }} />
                  </div>
                </div>
                <div style={{ padding: '4px 8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.4', marginBottom: '8px' }}>{video.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--nc-text-muted)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Learn how to {video.title.toLowerCase()} efficiently using the Namma Clinic dashboard.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default DocumentationPage;
