import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { CalendarVisual } from './MedicalIllustrations';

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Using mailto to redirect to user's email client
    const mailtoLink = `mailto:zuhvix.tech@gmail.com?subject=Inquiry from ${formData.name}&body=Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
    window.location.href = mailtoLink;
  };

  return (
    <section className="nc-contact" id="contact" style={{ position: 'relative' }}>
      <CalendarVisual className="contact-calendar reveal" />
      <div className="nc-contact-inner">
        <div className="nc-contact-info reveal">
          <div className="section-tag blue">Contact Us</div>
          <h3>Get in touch with our team.</h3>
          <p>Have questions about Namma Clinic? Need help setting up your medical facility? Reach out to our support team and we'll get back to you immediately.</p>
          
          <div className="nc-c-item">
            <div className="nc-c-icon"><Mail size={20} /></div>
            <span>zuhvix.tech@gmail.com</span>
          </div>
          
          <div className="nc-c-item">
            <div className="nc-c-icon"><Phone size={20} /></div>
            <span>+91 6382715355</span>
          </div>
          
          <div className="nc-c-item">
            <div className="nc-c-icon"><MapPin size={20} /></div>
            <span>Tamil Nadu, India</span>
          </div>
        </div>

        <div className="nc-contact-form reveal delay-200">
          <form onSubmit={handleSubmit}>
            <div className="nc-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                className="nc-form-input" 
                placeholder="Your Name" 
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="nc-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                className="nc-form-input" 
                placeholder="sarah@clinic.com" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="nc-form-group">
              <label>Message</label>
              <textarea 
                name="message"
                className="nc-form-input" 
                placeholder="How can we help your clinic?" 
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-blue" style={{ width: '100%', padding: '16px' }}>
              Send Message <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
