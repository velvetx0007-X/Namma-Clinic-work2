import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`border-b border-gray-100 last:border-0 transition-all ${isOpen ? 'bg-blue-50/30 -mx-4 px-4 rounded-2xl' : ''}`}>
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-blue-700 text-white rotate-180' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does the AI Health Assistant work?",
      answer: "Our AI assistant analyzes patient data, symptoms, and medical history against vast medical knowledge bases to provide diagnostic suggestions and health insights. It is designed to assist doctors, not replace them, by highlighting potential patterns and providing clinical decision support."
    },
    {
      question: "Is patient data secure and private?",
      answer: "Absolutely. We employ enterprise-grade encryption (AES-256) for all data at rest and in transit. Our platform is built to be compliant with international healthcare data privacy standards including HIPAA and GDPR."
    },
    {
      question: "Can I migrate data from my current system?",
      answer: "Yes! We offer professional migration services and robust API tools to help you import your existing patient records, appointment history, and staff data into Namma Clinic with zero downtime."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide tiered support ranging from comprehensive online documentation and email support for Starter plans, to 24/7 dedicated account management and phone support for Enterprise clients."
    },
    {
      question: "Does the platform work on mobile devices?",
      answer: "Yes, Namma Clinic is fully responsive and works perfectly on desktops, tablets, and smartphones. We also offer dedicated mobile apps for both doctors and patients for the best experience on the go."
    },
  ];

  return (
    <section id="faq" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6"
          >
            <HelpCircle size={18} />
            Common Questions
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Everything you need to know about our smart clinic management platform and how it can help your practice.</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-gray-100 p-4 lg:p-8 shadow-2xl shadow-blue-50/50">
          <div className="px-6 md:px-10">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Still have questions? <a href="#contact" className="text-blue-700 font-bold hover:underline">Get in touch with our team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
