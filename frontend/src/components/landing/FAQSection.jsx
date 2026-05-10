import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: "How does the AI Health Assistant work?", a: "Our AI assistant analyzes patient data, symptoms, and medical history against vast medical knowledge bases to provide diagnostic suggestions and health insights. It assists doctors with clinical decision support — it does not replace them." },
  { q: "Is patient data secure and private?", a: "Absolutely. We employ AES-256 encryption for all data at rest and in transit. Our platform is built to comply with international healthcare data privacy standards including HIPAA and GDPR." },
  { q: "Can I migrate data from my current system?", a: "Yes! We offer professional migration services and robust API tools to help you import existing patient records, appointment history, and staff data into NAMMA CLINIC with zero downtime." },
  { q: "What kind of support do you provide?", a: "We provide tiered support ranging from comprehensive documentation and email support, to 24/7 dedicated account management and priority phone support for enterprise clients." },
  { q: "Does the platform work on mobile devices?", a: "Yes, NAMMA CLINIC is fully responsive and works perfectly on desktops, tablets, and smartphones. We also offer dedicated mobile experiences for both doctors and patients." },
];

const FAQSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="nc-section" id="faq" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="nc-section-inner">
        <div className="nc-section-header centered">
          <div className="nc-section-tag">FAQ</div>
          <h2 className="nc-section-title">Common Questions</h2>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '24px 0',
            }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: open === i ? '#fff' : '#94a3b8', transition: 'color 0.3s' }}>{f.q}</span>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: open === i ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                  color: open === i ? '#fff' : '#64748b', transition: 'all 0.3s',
                }}>
                  {open === i ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {open === i && (
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', marginTop: 16, marginBottom: 0 }}>{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
