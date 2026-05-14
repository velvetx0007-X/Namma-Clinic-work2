import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Play, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.svg';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nc-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nc-nav-inner">
        <Link to="/" className="nc-nav-brand">
          <img src={logo} alt="NAMMA CLINIC" />
        </Link>

        <ul className="nc-nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/product">Product</Link></li>
          <li><Link to="/solutions">Solutions</Link></li>
          <li><Link to="/ai-intelligence">AI Intelligence</Link></li>
        </ul>

        <div className="nc-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/contact" className="btn btn-glass" style={{ boxSizing: 'border-box', padding: '0 20px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '42px' }}>
            <span style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nc-text)' }}>
              <Play size={10} fill="currentColor" style={{ marginLeft: '1px' }} />
            </span>
            Book Demo
          </Link>
          <Link to="/login" className="btn btn-primary" style={{ boxSizing: 'border-box', border: '1px solid transparent', padding: '0 20px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '42px' }}>
            Launch Platform <ArrowRight size={16} />
          </Link>
          <button 
            className="nc-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
