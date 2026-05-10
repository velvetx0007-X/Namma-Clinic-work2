import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import BrandText from '../common/BrandText';

const LandingFooter = () => (
  <footer className="nc-footer">
    <div className="nc-footer-inner">
      <div className="nc-footer-grid">
        <div className="nc-footer-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <img src={logo} alt="NAMMA CLINIC" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'contain' }} />
            <BrandText className="text-lg" />
          </Link>
          <p>AI-powered healthcare management for modern clinics, doctors, and patients.</p>
        </div>

        <div className="nc-footer-col">
          <h4>Platform</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#ai">AI Assistant</a></li>
            <li><a href="#showcase">Product</a></li>
          </ul>
        </div>

        <div className="nc-footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
          </ul>
        </div>

        <div className="nc-footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#security">Security</a></li>
          </ul>
        </div>
      </div>

      <div className="nc-footer-bottom">
        <p>&copy; {new Date().getFullYear()} NAMMA CLINIC. All rights reserved.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={12} style={{ color: '#ef4444' }} /> for a healthier world.
        </p>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
