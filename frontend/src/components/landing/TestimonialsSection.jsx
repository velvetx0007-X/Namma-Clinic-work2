import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './TestimonialsSection.css';

const testimonials = [
  {
    metric: '40% Faster',
    metricColor: 'blue',
    quote: "We have completely eliminated paper records. The AI-driven prescription workflow has reduced our patient turnaround time by nearly half.",
    author: 'Dr. Ramesh Kumar',
    role: 'Chief of Medicine, Apollo Clinic',
    initials: 'RK',
  },
  {
    metric: '100% Digital',
    metricColor: 'violet',
    quote: "The analytics dashboard provides real-time visibility into clinic performance that was previously impossible to track manually.",
    author: 'Dr. Priya Nair',
    role: 'Medical Director, HealthFirst',
    initials: 'PN',
  },
  {
    metric: 'Zero Errors',
    metricColor: 'emerald',
    quote: "The OCR upload for legacy records is incredible. We migrated 10 years of patient history into a searchable digital format in weeks.",
    author: 'Dr. Arun Menon',
    role: 'Senior Consultant, CarePoint Hospital',
    initials: 'AM',
  },
];

const TestCard = ({ t, delay }) => (
  <div className={`nc-test-card reveal ${delay ? 'delay-' + delay : ''}`}>
    <div className={"nc-test-metric metric-" + t.metricColor}>{t.metric}</div>
    <Quote size={28} className="nc-test-quote-icon" />
    <p className="nc-test-quote">{t.quote}</p>
    <div className="nc-test-author">
      <div className={"nc-test-avatar avatar-" + t.metricColor}>{t.initials}</div>
      <div className="nc-test-info">
        <h5>{t.author}</h5>
        <p>{t.role}</p>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);

  const prev = () => setCurrent(function(c) { return c === 0 ? testimonials.length - 1 : c - 1; });
  const next = () => setCurrent(function(c) { return c === testimonials.length - 1 ? 0 : c + 1; });

  return (
    <section className="nc-testimonials" id="success-stories">

      {/* Header */}
      <div className="nc-test-header reveal">
        <div className="section-tag violet">Success Stories</div>
        <h2 className="section-title">Healthcare transformed by Namma Clinic.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          See how progressive clinics are using our OS to redefine patient care and operational efficiency.
        </p>
      </div>

      {/* Desktop Grid — visible only on tablet and above */}
      <div className="nc-test-grid">
        {testimonials.map(function(t, i) {
          return <TestCard key={i} t={t} delay={i * 100} />;
        })}
      </div>

      {/* Mobile Carousel — visible only on mobile */}
      <div className="nc-test-carousel">
        <div
          className="nc-test-carousel-track"
          ref={trackRef}
          style={{ transform: 'translateX(-' + (current * 100) + '%)' }}
        >
          {testimonials.map(function(t, i) {
            return (
              <div className="nc-test-carousel-slide" key={i}>
                <TestCard t={t} delay={0} />
              </div>
            );
          })}
        </div>

        {/* Prev / Next Arrows */}
        <button className="nc-test-nav nc-test-nav-prev" onClick={prev} aria-label="Previous">
          <ChevronLeft size={20} />
        </button>
        <button className="nc-test-nav nc-test-nav-next" onClick={next} aria-label="Next">
          <ChevronRight size={20} />
        </button>

        {/* Dot Indicators */}
        <div className="nc-test-dots">
          {testimonials.map(function(_, i) {
            return (
              <button
                key={i}
                className={"nc-test-dot" + (i === current ? ' active' : '')}
                onClick={function() { setCurrent(i); }}
                aria-label={"Slide " + (i + 1)}
              />
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default TestimonialsSection;
