import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.jpg';

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
          <span className="brand-namma">NAMMA</span>
          <span className="brand-clinic">CLINIC</span>
        </Link>

        <ul className="nc-nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/product">Product</Link></li>
          <li><Link to="/solutions">Solutions</Link></li>
          <li><Link to="/ai-intelligence">AI Intelligence</Link></li>
        </ul>

        <div className="nc-nav-actions">
          <Link to="/contact" className="btn btn-glass">Book a Demo</Link>
          <Link to="/login" className="btn btn-primary">Login</Link>
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
