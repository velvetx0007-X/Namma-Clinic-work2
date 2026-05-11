import React from 'react';
import { Monitor, Building2, FlaskConical, Stethoscope, Microscope, ClipboardList, Activity, Heart, ShieldPlus } from 'lucide-react';

const MedicalMarquee = () => {
  const items = [
    { icon: <Monitor size={40} />, text: "Digital Records" },
    { icon: <Building2 size={40} />, text: "Modern Clinics" },
    { icon: <FlaskConical size={40} />, text: "Lab Integration" },
    { icon: <Stethoscope size={40} />, text: "Expert Consultation" },
    { icon: <Microscope size={40} />, text: "Advanced Research" },
    { icon: <ClipboardList size={40} />, text: "Patient Tracking" },
    { icon: <Activity size={40} />, text: "Live Monitoring" },
    { icon: <ShieldPlus size={40} />, text: "Data Protection" },
  ];

  return (
    <div className="nc-marquee-container">
      <div className="nc-marquee-content">
        {[...items, ...items].map((item, index) => (
          <div key={index} className="nc-marquee-item">
            <div className="nc-marquee-icon">{item.icon}</div>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalMarquee;
