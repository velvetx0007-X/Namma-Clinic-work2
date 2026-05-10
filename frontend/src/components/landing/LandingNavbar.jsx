import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import BrandText from '../common/BrandText';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Product', href: '#showcase' },
    { name: 'AI', href: '#ai' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`nc-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nc-navbar-inner">
        <Link to="/" className="nc-nav-brand">
          <img src={logo} alt="NAMMA CLINIC" />
          <BrandText className="text-lg" />
        </Link>

        <ul className="nc-nav-links">
          {links.map(l => (
            <li key={l.name}><a href={l.href}>{l.name}</a></li>
          ))}
        </ul>

        <div className="nc-nav-cta">
          <Link to="/login" className="nc-btn-ghost">Log In</Link>
          <Link to="/signup" className="nc-btn-primary">Get Started</Link>
        </div>

        <button className="nc-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(6,8,15,0.95)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px'
        }}>
          {links.map(l => (
            <a key={l.name} href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '12px 0', color: '#94a3b8', fontSize: '16px', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >{l.name}</a>
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Link to="/login" className="nc-btn-ghost" onClick={() => setMobileOpen(false)}>Log In</Link>
            <Link to="/signup" className="nc-btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
