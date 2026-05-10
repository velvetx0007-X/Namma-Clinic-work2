import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, User, Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

const ContactSection = () => {
  const [formData, setFormData] = useState({ fullName: '', clinicName: '', email: '', phoneNumber: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus({ ...status, error: 'Please fill in all required fields.' });
      return;
    }
    setStatus({ loading: true, success: false, error: null });
    try {
      const response = await api.post('/contact', formData);
      if (response.data.success) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({ fullName: '', clinicName: '', email: '', phoneNumber: '', message: '' });
      } else throw new Error(response.data.message || 'Something went wrong');
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || 'Failed to send message.' });
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.3s',
  };

  return (
    <section className="nc-section" id="contact" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="nc-section-inner">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <div className="nc-section-header">
              <div className="nc-section-tag emerald">Contact</div>
              <h2 className="nc-section-title">Ready to Transform Your Clinic?</h2>
              <p className="nc-section-subtitle">Our team will help you digitize patient records and optimize clinical operations.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { icon: <Mail size={20} />, label: 'Email', value: 'zuhvix.tech@gmail.com' },
                { icon: <Phone size={20} />, label: 'Phone', value: '+91 63827 15355' },
                { icon: <MapPin size={20} />, label: 'Location', value: 'Tamil Nadu, India' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '40px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {status.success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: '#64748b', marginBottom: 24 }}>A NAMMA CLINIC representative will contact you within 24 hours.</p>
                <button onClick={() => setStatus({ ...status, success: false })} className="nc-btn-primary">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={20} style={{ color: '#3b82f6' }} /> Request a Demo
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input style={inputStyle} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name *" required />
                  <input style={inputStyle} name="email" value={formData.email} onChange={handleChange} placeholder="Email *" type="email" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input style={inputStyle} name="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="Clinic Name" />
                  <input style={inputStyle} name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone" />
                </div>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your clinic's needs... *" required />
                {status.error && (
                  <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} /> {status.error}
                  </div>
                )}
                <button type="submit" disabled={status.loading} className="nc-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {status.loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
