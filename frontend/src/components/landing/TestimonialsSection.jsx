import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "NAMMA CLINIC has completely transformed how I manage my practice. The AI health assistant provides insights that have directly improved my patient outcomes. Highly recommended!",
      author: "Dr.demodoc1",
      role: "Lead Cardiologist, HeartCare Center",
      avatar: "AS",
      rating: 5,
    },
    {
      text: "The transition from paperwork to this digital platform was surprisingly smooth. My staff loves the appointment management, and our patients appreciate the real-time updates.",
      author: "Dr.demodoc2",
      role: "Founder, City Health Clinic",
      avatar: "VM",
      rating: 5,
    },
    {
      text: "Finally, a healthcare SaaS that actually understands clinical workflows. The smart prescriptions and lab tracking features have saved us hours of administrative work every week.",
      author: "democlinic1",
      role: "Clinic Administrator, Wellness Plus",
      avatar: "SP",
      rating: 4,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Trusted by <span className="text-blue-600">Healthcare Professionals</span>
          </motion.h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">See what doctors and clinic administrators are saying about their transition to digital healthcare.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon Decoration */}
          <div className="absolute -top-10 -left-10 text-blue-50 opacity-10">
            <Quote size={200} fill="currentColor" />
          </div>

          <div className="relative z-10 bg-gray-50 rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-2xl shadow-blue-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} size={20} fill="#EAB308" className="text-yellow-500" />
                  ))}
                </div>

                <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-10 italic">
                  "{testimonials[activeIndex].text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{testimonials[activeIndex].author}</h4>
                    <p className="text-gray-500 font-medium">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-10 right-10 flex gap-4">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white transition-all shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-12 gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-12 bg-blue-600' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
