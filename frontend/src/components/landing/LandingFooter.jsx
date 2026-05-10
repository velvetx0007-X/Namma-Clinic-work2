import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Facebook, Github, Heart } from 'lucide-react';
import logo from '../../assets/Namma Clinic logo.jpeg';

const LandingFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 lg:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Namma Clinic Logo" 
                className="w-10 h-10 rounded-full object-cover shadow-sm" 
              />
              <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
                NammaClinic
              </span>
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-xs">
              Empowering clinics with AI-powered tools for better patient outcomes and efficient clinical workflows.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Facebook, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              {[
                { name: 'Features', id: 'features' },
                { name: 'Solutions', id: 'solutions' },
                { name: 'AI Assistant', id: 'ai-assistant' },
                { name: 'Wellness Tracking', id: 'wellness-tracking' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={`#${item.id}`} className="text-gray-500 hover:text-blue-600 transition-colors">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4">
              {[
                { name: 'Documentation', id: 'documentation' },
                { name: 'API Reference', id: 'api-reference' },
                { name: 'Case Studies', id: 'case-studies' },
                { name: 'Blog', id: 'blog' },
                { name: 'Community', id: 'community' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={`#${item.id}`} className="text-gray-500 hover:text-blue-600 transition-colors">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About Us', id: 'about-us' },
                { name: 'Careers', id: 'careers' },
                { name: 'Privacy Policy', id: 'privacy-policy' },
                { name: 'Terms of Service', id: 'terms-of-service' },
                { name: 'Security', id: 'security' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={`#${item.id}`} className="text-gray-500 hover:text-blue-600 transition-colors">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Namma Clinic. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-current" /> for a healthier world.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
