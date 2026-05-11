import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import { Mail, Phone } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="nc-footer">
      <div className="nc-footer-inner">
        <div className="nc-footer-grid">
          <div className="nc-footer-brand">
            <Link to="/" className="nc-nav-brand">
              <img src={logo} alt="NAMMA CLINIC" />
              <span className="brand-namma">NAMMA</span>
              <span className="brand-clinic">CLINIC</span>
            </Link>
            <p>
              The intelligent operating system for modern healthcare facilities. Automating workflows and enhancing care through artificial intelligence.
            </p>
          </div>
          
          <div className="nc-footer-col">
            <h4>Product</h4>
            <ul>
              <li><Link to="/product">Full Product Suite</Link></li>
              <li><Link to="/solutions">Solutions</Link></li>
              <li><Link to="/ai-intelligence">AI Intelligence</Link></li>
            </ul>
          </div>
          
          <div className="nc-footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/documentation">Documentation</Link></li>
              <li><Link to="/api-reference">API Reference</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help-center">Help Center</Link></li>
            </ul>
          </div>
          
          <div className="nc-footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/legal-privacy">Legal & Privacy</Link></li>
            </ul>
          </div>

          <div className="nc-footer-col">
            <h4>Contact Us</h4>
            <ul style={{ gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--nc-text-muted)' }}>
                <Mail size={14} /> nammaclinic.offic@gmail.com
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--nc-text-muted)' }}>
                <Mail size={14} /> zuhvix.tech@gmail.com
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--nc-text-muted)' }}>
                <Phone size={14} /> +91 6382715355
              </li>
            </ul>
          </div>
        </div>
        
        <div className="nc-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Namma Clinic Inc. All rights reserved.</p>
          <p>Tamil Nadu, India</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
