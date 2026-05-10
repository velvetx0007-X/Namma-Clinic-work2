import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Building2, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    clinicName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple frontend validation
    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus({ ...status, error: 'Please fill in all required fields.' });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      // Calling the real backend endpoint we just created
      const response = await api.post('/contact', formData);
      
      if (response.data.success) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({
          fullName: '',
          clinicName: '',
          email: '',
          phoneNumber: '',
          message: ''
        });
      } else {
        throw new Error(response.data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.message || 'Failed to send message. Please try again later.' 
      });
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">Ready to <span className="text-blue-700">Transform</span> Your Clinic?</h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Join the network of modern healthcare providers using NAMMA CLINIC. 
                Our team will help you digitize your patient records and optimize your daily clinical operations.
              </p>
            </motion.div>

            <div className="space-y-8">
              {[
                { icon: <Mail className="text-blue-700" />, label: "Support Email", value: "zuhvix.tech@gmail.com" },
                { icon: <Phone className="text-blue-700" />, label: "Clinic Hotline", value: "+91 63827 15355" },
                { icon: <MapPin className="text-blue-700" />, label: "Headquarters", value: "Tamil Nadu, India" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                    <div className="text-lg font-bold text-gray-900">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-blue-700 to-indigo-800 text-white relative overflow-hidden shadow-xl shadow-blue-200">
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <h4 className="text-xl font-bold mb-2 relative z-10">24/7 Deployment Support</h4>
              <p className="text-blue-100 relative z-10">Our technical specialists ensure a smooth transition with zero downtime for your medical practice.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-2xl relative"
          >
            <AnimatePresence mode="wait">
              {status.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto text-lg leading-relaxed">
                    Thank you for reaching out. A NAMMA CLINIC representative will contact you at <b>{formData.email}</b> within 24 hours.
                  </p>
                  <button 
                    onClick={() => setStatus({ ...status, success: false })}
                    className="px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <MessageSquare className="text-blue-700" /> Request a Live Demo
                  </h3>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <User size={14} className="text-blue-700" /> Full Name *
                        </label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Dr. Rajesh Kumar" 
                          className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Mail size={14} className="text-blue-700" /> Email Address *
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="rajesh@clinic.com" 
                          className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20" 
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Building2 size={14} className="text-blue-700" /> Clinic/Hospital Name
                        </label>
                        <input 
                          type="text" 
                          name="clinicName"
                          value={formData.clinicName}
                          onChange={handleChange}
                          placeholder="City Heart Center" 
                          className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Phone size={14} className="text-blue-700" /> Phone Number
                        </label>
                        <input 
                          type="tel" 
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="+91 98XXX XXXXX" 
                          className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Detailed Message *</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4" 
                        placeholder="Tell us about your clinic's needs..." 
                        className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        required
                      ></textarea>
                    </div>

                    {status.error && (
                      <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3 border border-red-100">
                        <AlertCircle size={18} />
                        {status.error}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={status.loading}
                      className={`w-full py-4 bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-800 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${status.loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      {status.loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
