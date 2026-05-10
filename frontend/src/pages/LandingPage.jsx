import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import ContactSection from '../components/landing/ContactSection';
import SupplementalSections from '../components/landing/SupplementalSections';
import LandingFooter from '../components/landing/LandingFooter';

const LandingPage = () => {
  useEffect(() => {
    // Set Page Title and SEO Meta
    document.title = "NAMMA CLINIC | AI-Powered Smart Healthcare Management";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Modern healthcare workflow system for clinics, doctors, and patients. AI-powered diagnostics, smart prescriptions, and seamless appointment management.");
    }

    // Smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for fixed navbar
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <SupplementalSections />
        <FAQSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
