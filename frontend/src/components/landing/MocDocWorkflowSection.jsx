import React, { useState } from 'react';
import './MocDocWorkflowSection.css';
import { Settings, FileText, Cloud, Monitor, MapPin, Key } from 'lucide-react';
import logo from '../../assets/logo.svg';

const features = [
  {
    side: 'left',
    icon: <Settings size={20} />,
    label: 'Zero Maintenance',
    tooltip: 'Our cloud-based platform handles all updates, patches, and server management automatically — so your clinic team can focus fully on patient care without any IT headaches.',
  },
  {
    side: 'left',
    icon: <FileText size={20} />,
    label: 'Go Paperless',
    tooltip: 'Eliminate paper-based records entirely. Digital prescriptions, e-reports, and online appointment slips make your clinic eco-friendly and dramatically reduce administrative overhead.',
  },
  {
    side: 'left',
    icon: <Cloud size={20} />,
    label: 'Secure Backup',
    tooltip: 'All your patient data is encrypted and automatically backed up to the cloud in real-time. Redundant storage across multiple servers ensures zero data loss, always.',
  },
  {
    side: 'right',
    icon: <Monitor size={20} />,
    label: <>Access Anytime,<br />Anywhere & Any Device</>,
    tooltip: 'Namma Clinic works seamlessly on any browser, tablet, phone, or desktop — so doctors and staff can access patient records and manage appointments from anywhere in the world.',
  },
  {
    side: 'right',
    icon: <MapPin size={20} />,
    label: 'Multi-Location Support',
    tooltip: 'Manage multiple clinic branches from a single dashboard. Centralized patient records, staff management, and reporting across all your locations — effortlessly unified.',
  },
  {
    side: 'right',
    icon: <Key size={20} />,
    label: <>Minimal Cost of<br />Ownership</>,
    tooltip: 'No expensive hardware, no dedicated IT staff, no setup fees. Our flexible subscription model means you only pay for what you use — making enterprise-grade healthcare tech affordable for every clinic.',
  },
];

const FeatureBox = ({ icon, label, tooltip, side }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="mocdoc-feature-box"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="md-feature-icon">{icon}</div>
      <span>{label}</span>

      {/* Tooltip Popup */}
      {hovered && (
        <div className={`md-tooltip ${side === 'right' ? 'tooltip-left' : 'tooltip-right'}`}>
          <div className="md-tooltip-arrow"></div>
          <p>{tooltip}</p>
        </div>
      )}
    </div>
  );
};

const MocDocWorkflowSection = () => {
  const leftFeatures = features.filter(f => f.side === 'left');
  const rightFeatures = features.filter(f => f.side === 'right');

  return (
    <section className="mocdoc-workflow-section">
      <div className="mocdoc-workflow-inner reveal">

        {/* Left Side Features */}
        <div className="mocdoc-workflow-column left">
          {leftFeatures.map((f, i) => (
            <FeatureBox key={i} {...f} />
          ))}
        </div>

        {/* Center Hub */}
        <div className="mocdoc-workflow-center">
          {/* Connector Lines (SVG) */}
          <svg className="md-connector-lines" viewBox="0 0 1000 400" preserveAspectRatio="none">
            {/* Left lines */}
            <path d="M 500 200 L 150 200 L 150 70 L 0 70" fill="none" stroke="#2563eb" strokeWidth="2" />
            <path d="M 500 200 L 0 200" fill="none" stroke="#2563eb" strokeWidth="2" />
            <path d="M 500 200 L 150 200 L 150 330 L 0 330" fill="none" stroke="#2563eb" strokeWidth="2" />

            {/* Right lines */}
            <path d="M 500 200 L 850 200 L 850 70 L 1000 70" fill="none" stroke="#2563eb" strokeWidth="2" />
            <path d="M 500 200 L 1000 200" fill="none" stroke="#2563eb" strokeWidth="2" />
            <path d="M 500 200 L 850 200 L 850 330 L 1000 330" fill="none" stroke="#2563eb" strokeWidth="2" />
          </svg>

          {/* Central Logo Graphic */}
          <div className="md-center-logo-container">
            <div className="md-logo-ring">
              <img src={logo} alt="NAMMA CLINIC" className="md-logo-img" />
            </div>
            <div className="md-platform-base"></div>
          </div>

          {/* Decorative floating elements */}
          <div className="md-floating-gear md-gear-1"><Settings size={32} color="#94a3b8" /></div>
          <div className="md-floating-gear md-gear-2"><Settings size={20} color="#94a3b8" /></div>
          <div className="md-floating-cloud">
            <Cloud size={48} color="#e2e8f0" fill="#f8fafc" strokeWidth={1} />
          </div>
          <div className="md-floating-box md-box-1"></div>
          <div className="md-floating-box md-box-2"></div>
        </div>

        {/* Right Side Features */}
        <div className="mocdoc-workflow-column right">
          {rightFeatures.map((f, i) => (
            <FeatureBox key={i} {...f} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default MocDocWorkflowSection;
