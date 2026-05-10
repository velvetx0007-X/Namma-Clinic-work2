import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap } from 'lucide-react';

const PricingSection = () => {

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual practitioners starting their digital journey.",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Up to 100 Patients",
        "Basic Appointment Booking",
        "Smart Prescriptions",
        "Patient History Storage",
        "Email Support",
      ],
      notIncluded: [
        "AI Health Assistant",
        "Advanced Analytics",
        "Multiple Clinic Locations",
        "Custom Branding",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      description: "Best for growing clinics needing advanced AI-powered tools.",
      monthlyPrice: 129,
      annualPrice: 99,
      features: [
        "Unlimited Patients",
        "Advanced Appointment AI",
        "Full AI Health Assistant",
        "Analytics Dashboard",
        "Priority Support",
        "Lab Test Tracking",
      ],
      notIncluded: [
        "Custom White-labeling",
        "Enterprise API Access",
      ],
      cta: "Get Started Now",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Dedicated solutions for large hospitals and clinic chains.",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      features: [
        "Multiple Clinic Support",
        "Custom AI Model Training",
        "Enterprise API & Webhooks",
        "Dedicated Account Manager",
        "White-labeling Options",
        "SSO & Advanced Security",
        "24/7 Phone Support",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 lg:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Flexible <span className="text-blue-700">Pricing</span> Models
          </motion.h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Plans designed to scale with your healthcare practice, from solo clinics to hospital networks.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[2rem] bg-white border ${
                plan.popular ? 'border-blue-700 shadow-2xl scale-105 z-20' : 'border-gray-100 shadow-xl z-10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-700 text-white text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Zap size={12} fill="currentColor" /> Most Recommended
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-900">
                    {typeof plan.annualPrice === 'number' ? `$${plan.annualPrice}` : plan.annualPrice}
                  </span>
                  {typeof plan.annualPrice === 'number' && (
                    <span className="text-gray-400 font-medium mb-1">/mo</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-blue-700" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="#contact"
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  plan.popular 
                    ? 'bg-blue-700 text-white shadow-lg shadow-blue-200 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-1' 
                    : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Request Demo"} <ArrowRight size={18} />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            All deployments include a dedicated success manager. 
            <a href="#contact" className="text-blue-700 font-bold ml-1 hover:underline">Custom integration needed?</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
