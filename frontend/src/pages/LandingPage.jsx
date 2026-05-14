import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import MedicalMarquee from '../components/landing/MedicalMarquee';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AISection from '../components/landing/AISection';
import WorkflowSection from '../components/landing/WorkflowSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import ContactSection from '../components/landing/ContactSection';
import LandingFooter from '../components/landing/LandingFooter';
import MocDocWorkflowSection from '../components/landing/MocDocWorkflowSection';
import '../components/landing/LandingPage.css';

const LandingPage = () => {
  useEffect(() => {
    document.title = "NAMMA CLINIC | AI-Powered Smart Healthcare Management";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Modern healthcare workflow system for clinics, doctors, and patients. AI-powered diagnostics, smart prescriptions, and seamless appointment management.");
    }

    // Smooth scroll for anchor links
    const handleClick = function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (!href.startsWith('#')) return;
      
      const targetId = href.substring(1);
      const el = document.getElementById(targetId);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      }
    };
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', handleClick));

    // Scroll reveal observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      document.querySelectorAll('a[href^="#"]').forEach(a => a.removeEventListener('click', handleClick));
    };
  }, []);

  return (
    <div className="landing-root">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustSection />
        <MedicalMarquee />
        <ProblemSection />
        <MocDocWorkflowSection />
        <FeaturesSection />
        <AISection />
        <WorkflowSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
