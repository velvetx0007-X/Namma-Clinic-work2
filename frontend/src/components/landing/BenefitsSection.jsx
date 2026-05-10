import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Users, Shield, TrendingUp, Clock } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-blue-700" />,
      title: "Reduce Paperwork",
      description: "Automate administrative tasks and focus on patient care instead of documentation.",
      stat: "60%",
      label: "Reduction in Paperwork"
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-700" />,
      title: "Faster Workflows",
      description: "Streamlined processes from check-in to prescription generation.",
      stat: "45%",
      label: "Faster Consultations"
    },
    {
      icon: <Users className="w-6 h-6 text-blue-800" />,
      title: "Better Engagement",
      description: "Direct communication channels and patient health tracking portals.",
      stat: "80%",
      label: "Patient Retention"
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      title: "Centralized Records",
      description: "All patient data accessible from any device, anytime, with top-tier security.",
      stat: "100%",
      label: "Data Security"
    },
  ];

  return (
    <section id="benefits" className="py-24 lg:py-32 bg-slate-900 text-white overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-700/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 lg:mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">
                Empowering Doctors with <span className="text-blue-500">Intelligent Tools</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed">
                Designed by healthcare professionals for healthcare professionals. 
                Experience a system that works with you, not against you.
              </p>
            </motion.div>

            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-5 p-4 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-blue-700/20 transition-colors">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition-colors">{benefit.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 relative">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className={`p-8 rounded-3xl border border-white/10 ${index % 2 === 1 ? 'mt-8' : ''} bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm`}
              >
                <div className="text-4xl font-black text-white mb-2">{benefit.stat}</div>
                <div className="text-sm font-bold text-blue-500 uppercase tracking-wider">{benefit.label}</div>
              </motion.div>
            ))}
            
            {/* Background Accent */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-700/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
