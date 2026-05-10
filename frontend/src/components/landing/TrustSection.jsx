import React from 'react';
import { Shield, Cloud, Cpu, Clock, Sparkles } from 'lucide-react';

const items = [
  { icon: <Shield size={22} />, title: 'Secure Platform', desc: 'AES-256 encryption' },
  { icon: <Cpu size={22} />, title: 'AI-Powered Ops', desc: 'Gemini AI engine' },
  { icon: <Clock size={22} />, title: 'Real-Time Sync', desc: 'Live patient data' },
  { icon: <Cloud size={22} />, title: 'Cloud Native', desc: '99.9% uptime SLA' },
  { icon: <Sparkles size={22} />, title: 'Smart Rx Engine', desc: 'OCR prescriptions' },
];

const TrustSection = () => (
  <section className="nc-trust">
    <div className="nc-trust-inner">
      <p className="nc-trust-label">Trusted Healthcare Infrastructure</p>
      <div className="nc-trust-grid">
        {items.map((item, i) => (
          <div key={i} className="nc-trust-item">
            <div className="icon">{item.icon}</div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
