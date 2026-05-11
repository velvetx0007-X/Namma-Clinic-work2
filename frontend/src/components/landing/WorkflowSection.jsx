import React from 'react';
import { UserCheck, Stethoscope, Pill, BarChart3 } from 'lucide-react';

const WorkflowSection = () => {
  return (
    <section className="nc-workflow" id="workflow">
      <div className="nc-workflow-inner">
        <div style={{ textAlign: 'center' }} className="reveal">
          <div className="section-tag blue">Real-time Clinical Flow</div>
          <h2 className="section-title">A seamless patient journey.</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Namma Clinic automates the entire lifecycle of a patient visit, from the moment they walk in to their post-treatment follow-up.
          </p>
        </div>

        <div className="nc-workflow-steps reveal delay-200">
          <div className="nc-step">
            <div className="nc-step-circle">
              <UserCheck size={32} />
            </div>
            <h4>1. Reception</h4>
            <p>Digital check-in, instant profile retrieval, and insurance verification.</p>
          </div>
          
          <div className="nc-step">
            <div className="nc-step-circle">
              <Stethoscope size={32} />
            </div>
            <h4>2. Consultation</h4>
            <p>Doctors access unified records and input observations seamlessly.</p>
          </div>
          
          <div className="nc-step">
            <div className="nc-step-circle">
              <Pill size={32} />
            </div>
            <h4>3. Prescription</h4>
            <p>AI generates digital prescriptions sent directly to the patient's phone.</p>
          </div>
          
          <div className="nc-step">
            <div className="nc-step-circle">
              <BarChart3 size={32} />
            </div>
            <h4>4. Analytics</h4>
            <p>Visit data flows into clinic dashboards for operational intelligence.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
