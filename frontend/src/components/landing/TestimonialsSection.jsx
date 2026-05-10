import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    text: "NAMMA CLINIC completely transformed how we manage our practice. The AI health assistant provides insights that have directly improved patient outcomes.",
    author: "Dr. Arun Sharma", role: "Lead Cardiologist, HeartCare Center", avatar: "AS", rating: 5,
  },
  {
    text: "The transition from paperwork to this digital platform was surprisingly smooth. My staff loves the appointment management, and patients appreciate the real-time updates.",
    author: "Dr. Priya Menon", role: "Founder, City Health Clinic", avatar: "PM", rating: 5,
  },
  {
    text: "Finally, a healthcare SaaS that understands clinical workflows. Smart prescriptions and lab tracking have saved us hours of administrative work every week.",
    author: "Sunita Patel", role: "Clinic Administrator, Wellness Plus", avatar: "SP", rating: 5,
  },
];

const TestimonialsSection = () => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((idx + 1) % testimonials.length);
  const prev = () => setIdx((idx - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[idx];

  return (
    <section className="nc-section" id="testimonials" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="nc-section-inner">
        <div className="nc-section-header centered">
          <div className="nc-section-tag">Testimonials</div>
          <h2 className="nc-section-title">Trusted by Healthcare Professionals</h2>
        </div>

        <div className="nc-testimonial-card">
          <div className="nc-testimonial-stars">
            {[...Array(t.rating)].map((_, i) => <Star key={i} size={18} fill="#eab308" />)}
          </div>
          <p className="nc-testimonial-text">"{t.text}"</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nc-testimonial-author">
              <div className="nc-testimonial-avatar">{t.avatar}</div>
              <div>
                <h5>{t.author}</h5>
                <p>{t.role}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={prev} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 32 : 8, height: 8, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: i === idx ? '#3b82f6' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
