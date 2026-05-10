import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Calendar, 
  Database, 
  FlaskConical, 
  Footprints, 
  TrendingUp, 
  BarChart3 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Health Assistant",
      description: "Intelligent medical diagnosis support and health insight generation using advanced AI models.",
      color: "bg-blue-700",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart Prescriptions",
      description: "Digital prescriptions with automatic interaction checks and pharmacy integration.",
      color: "bg-indigo-700",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Appointment Management",
      description: "Seamless scheduling for patients and optimized calendar management for clinic staff.",
      color: "bg-blue-800",
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Patient Records",
      description: "Secure, centralized storage for medical history, imaging, and test results.",
      color: "bg-indigo-800",
    },
    {
      icon: <FlaskConical className="w-8 h-8" />,
      title: "Lab Test Tracking",
      description: "Real-time updates on laboratory tests with automated patient notifications.",
      color: "bg-blue-700",
    },
    {
      icon: <Footprints className="w-8 h-8" />,
      title: "Wellness tracking",
      description: "Integrate with wearables to track steps, activity, and vitals for comprehensive health monitoring.",
      color: "bg-indigo-700",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Child Growth Monitoring",
      description: "Specialized tools for pediatric tracking including growth charts and vaccination alerts.",
      color: "bg-blue-800",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Data-driven insights for clinic efficiency, revenue tracking, and patient health trends.",
      color: "bg-indigo-800",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Powerful Features for <span className="text-blue-700">Modern Healthcare</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Comprehensive tools designed to streamline clinical workflows and improve patient outcomes through advanced technology.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-300"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
