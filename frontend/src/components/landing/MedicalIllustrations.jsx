import React from 'react';
import { User, Stethoscope, Building2, Microscope, FlaskConical, ClipboardList, Monitor } from 'lucide-react';

export const DoctorVisual = ({ className }) => (
  <div className={`visual-character ${className}`}>
    <div className="visual-bg-blob"></div>
    <div className="visual-icon-main"><User size={48} /></div>
    <div className="visual-accessory acc-1"><Stethoscope size={20} /></div>
    <div className="visual-accessory acc-2"><ClipboardList size={20} /></div>
  </div>
);

export const LabVisual = ({ className }) => (
  <div className={`visual-character ${className}`}>
    <div className="visual-bg-blob violet"></div>
    <div className="visual-icon-main"><Microscope size={48} /></div>
    <div className="visual-accessory acc-1"><FlaskConical size={20} /></div>
  </div>
);

export const HospitalVisual = ({ className }) => (
  <div className={`visual-character ${className}`}>
    <div className="visual-bg-blob blue"></div>
    <div className="visual-icon-main"><Building2 size={48} /></div>
  </div>
);

export const DashboardVisual = ({ className }) => (
  <div className={`visual-character ${className}`}>
    <div className="visual-bg-blob emerald"></div>
    <div className="visual-icon-main"><Monitor size={48} /></div>
  </div>
);

export const CalendarVisual = ({ className }) => (
  <div className={`visual-character ${className}`}>
    <div className="visual-bg-blob violet"></div>
    <div className="visual-icon-main"><ClipboardList size={48} /></div>
  </div>
);
