import React from 'react';
import { FileX, Clock, Users, BarChart3, CalendarX, AlertTriangle } from 'lucide-react';

const problems = [
  { icon: <FileX size={22} />, title: 'Paper Prescriptions', desc: 'Illegible handwriting, lost records, zero traceability in traditional prescription workflows.' },
  { icon: <Clock size={22} />, title: 'Manual Workflows', desc: 'Hours wasted on patient registration, billing, and appointment scheduling every single day.' },
  { icon: <Users size={22} />, title: 'Patient Confusion', desc: 'No digital access to health records, prescriptions, or appointment status for patients.' },
  { icon: <BarChart3 size={22} />, title: 'Zero Analytics', desc: 'No visibility into revenue trends, doctor performance, or clinic operational efficiency.' },
  { icon: <CalendarX size={22} />, title: 'Scheduling Chaos', desc: 'Double bookings, missed appointments, and no real-time queue management system.' },
  { icon: <AlertTriangle size={22} />, title: 'Compliance Risk', desc: 'No audit trail, insecure patient data storage, and non-compliant record keeping.' },
];

const ProblemSection = () => (
  <section className="nc-section" id="problems">
    <div className="nc-section-inner">
      <div className="nc-section-header centered">
        <div className="nc-section-tag" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
          The Problem
        </div>
        <h2 className="nc-section-title">Clinics Are Still Running on Broken Systems</h2>
        <p className="nc-section-subtitle">Most healthcare providers operate with fragmented tools that waste time, lose data, and frustrate both staff and patients.</p>
      </div>
      <div className="nc-problems-grid">
        {problems.map((p, i) => (
          <div key={i} className="nc-problem-card">
            <div className="icon">{p.icon}</div>
            <h4>{p.title}</h4>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
