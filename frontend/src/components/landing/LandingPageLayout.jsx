import React, { useEffect } from 'react';
import LandingNavbar from './LandingNavbar';
import LandingFooter from './LandingFooter';
import { motion } from 'framer-motion';

const LandingPageLayout = ({ children, title, description }) => {
  useEffect(() => {
    if (title) document.title = `${title} | NAMMA CLINIC`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }
    
    window.scrollTo(0, 0);

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

    return () => observer.disconnect();
  }, [title, description]);

  return (
    <div className="landing-root">
      <LandingNavbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
      <LandingFooter />
    </div>
  );
};

export default LandingPageLayout;
