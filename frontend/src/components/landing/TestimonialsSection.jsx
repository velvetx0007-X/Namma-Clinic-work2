import React from 'react';


const TestimonialsSection = () => {
  return (
    <section className="nc-testimonials" id="success-stories">
      <div style={{ textAlign: 'center', marginBottom: '80px' }} className="reveal">
        <div className="section-tag violet">Success Stories</div>
        <h2 className="section-title">Healthcare transformed by Namma Clinic.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          See how progressive clinics are using our OS to redefine patient care and operational efficiency.
        </p>
      </div>

      <div className="nc-test-grid">
        <div className="nc-test-card reveal">
          <div className="nc-test-metric">40% Faster</div>
          <p className="nc-test-quote">
            "We've completely eliminated paper records. The AI-driven prescription workflow has reduced our patient turnaround time by nearly half."
          </p>
        </div>

        <div className="nc-test-card reveal delay-100">
          <div className="nc-test-metric">100% Digital</div>
          <p className="nc-test-quote">
            "The analytics dashboard provides real-time visibility into clinic performance that was previously impossible to track manually."
          </p>
        </div>

        <div className="nc-test-card reveal delay-200">
          <div className="nc-test-metric">Zero Errors</div>
          <p className="nc-test-quote">
            "The OCR upload for legacy records is incredible. We migrated 10 years of patient history into a searchable digital format in weeks."
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
