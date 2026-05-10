import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Search, 
  Code, 
  BookOpen, 
  Users, 
  Briefcase, 
  Heart,
  Brain,
  Activity,
  ChevronRight,
  Sparkles,
  Zap,
  Terminal,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';

const SupplementalSections = () => {
  const [activeResource, setActiveResource] = useState(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const resourceSections = {
    documentation: {
      title: "Healthcare SaaS Documentation",
      subtitle: "Comprehensive guides for Namma Clinic ecosystem",
      content: (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
              <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Users size={20} /> Patient Workflow
              </h4>
              <p className="text-gray-600 mb-4">A seamless 4-step journey for patient care and management.</p>
              <div className="space-y-3">
                {["Search & Discovery", "Smart Booking", "Digital Check-in", "Health Records Access"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">{i+1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
              <h4 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} /> Doctor Dashboard
              </h4>
              <p className="text-gray-600">Advanced clinical tools for diagnosis, EMR management, and digital prescriptions with AI insights.</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
              <h4 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Brain size={20} /> AI Assistant Workflow
              </h4>
              <p className="text-gray-600">How Gemini AI analyzes patient vitals to provide real-time health guidance and clinical decision support.</p>
            </div>
            <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100">
              <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Activity size={20} /> Wellness Tracking
              </h4>
              <p className="text-gray-600">Integration guide for wearables and real-time vital monitoring across the Namma Clinic platform.</p>
            </div>
          </div>
        </div>
      )
    },
    'api-reference': {
      title: "API Reference & Integration",
      subtitle: "Powering the healthcare infrastructure through modern APIs",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Appointments API", endpoint: "POST /api/appointments", desc: "Manage clinic bookings and doctor schedules." },
              { title: "Patient Records API", endpoint: "GET /api/records/:id", desc: "Securely retrieve encrypted patient health history." },
              { title: "AI Health API", endpoint: "POST /api/ai/analyze", desc: "Submit vitals for AI-driven health risk analysis." }
            ].map((api, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <Terminal size={24} className="text-blue-400 mb-4" />
                <h4 className="font-bold mb-1">{api.title}</h4>
                <code className="text-xs text-blue-300 block mb-3 font-mono">{api.endpoint}</code>
                <p className="text-sm text-slate-400">{api.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Communication Architecture</h4>
            <p className="text-gray-600 mb-6">The frontend communicates via a centralized Axios instance with the Node.js/Express backend. Real-time updates for clinic availability and AI monitoring are handled through secure WebSocket connections.</p>
            <div className="flex flex-wrap gap-4">
              {["RESTful Design", "JWT Auth", "AES-256 Encryption", "WebSocket Sync"].map((tech, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-white border border-blue-200 text-blue-700 text-sm font-bold">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    'case-studies': {
      title: "Healthcare Success Stories",
      subtitle: "Measurable improvements in clinic efficiency and patient outcomes",
      content: (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <TrendingUp size={48} className="mb-8 opacity-40" />
              <h4 className="text-2xl font-bold mb-4">Metro General Clinic</h4>
              <p className="text-blue-100 mb-8">Reduced patient wait times by 65% while increasing daily consultation capacity through automated queue management.</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-black mb-1">65%</div>
                  <div className="text-xs uppercase tracking-widest font-bold opacity-60">Time Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-black mb-1">2.4x</div>
                  <div className="text-xs uppercase tracking-widest font-bold opacity-60">Revenue Growth</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          </div>
          <div className="space-y-6">
             {[
               { title: "Paperless Transformation", stat: "98%", label: "Reduction in Physical Documentation" },
               { title: "Diagnostic Accuracy", stat: "+15%", label: "AI-Assisted Screening Improvement" },
               { title: "Patient Engagement", stat: "3x", label: "Better Follow-up Retention Rate" }
             ].map((item, i) => (
               <div key={i} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.label}</p>
                  </div>
                  <div className="text-2xl font-black text-blue-600">{item.stat}</div>
               </div>
             ))}
          </div>
        </div>
      )
    },
    blog: {
      title: "HealthTech Insights",
      subtitle: "The future of digital healthcare and clinical innovation",
      content: (
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "AI in Modern Clinics", desc: "How Gemini AI is transforming the role of the general practitioner.", date: "May 12, 2026", cat: "Artificial Intelligence" },
            { title: "Preventive Pediatrics", desc: "Smart monitoring for child growth and immunization tracking.", date: "May 08, 2026", cat: "Child Healthcare" },
            { title: "Cloud EMR Standards", desc: "Why decentralized health records are the future of patient privacy.", date: "May 05, 2026", cat: "Infrastructure" }
          ].map((blog, i) => (
            <div key={i} className="rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute top-6 left-6 px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-blue-700">{blog.cat}</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Clock size={12} /> {blog.date}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{blog.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{blog.desc}</p>
                <button className="flex items-center gap-2 font-bold text-blue-700 text-sm">
                  Read Article <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    community: {
      title: "Healthcare Innovation Community",
      subtitle: "A collaborative ecosystem for doctors, clinics, and innovators",
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h4 className="text-2xl font-bold text-gray-900 leading-tight">Join 5,000+ Healthcare Professionals</h4>
            <p className="text-lg text-gray-600">The Namma Clinic community is where the future of Indian healthcare is being discussed and built together.</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Clinical Forums", icon: <MessageSquare size={18} /> },
                { title: "Innovation Hub", icon: <Zap size={18} /> },
                { title: "Wellness Groups", icon: <Heart size={18} /> },
                { title: "System Updates", icon: <Clock size={18} /> }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center gap-3">
                  <div className="text-blue-600">{item.icon}</div>
                  <span className="font-bold text-sm text-gray-800">{item.title}</span>
                </div>
              ))}
            </div>
            <button className="px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all">
              Join the Forum
            </button>
          </div>
          <div className="p-8 rounded-[3rem] bg-gray-50 border border-gray-100">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">DR</div>
                <div>
                   <h5 className="font-bold text-gray-900">Dr. Rajesh Kumar</h5>
                   <p className="text-xs text-gray-500">Chief Surgeon, Apollo Clinic</p>
                </div>
             </div>
             <blockquote className="text-lg text-gray-700 italic mb-8">
               "Namma Clinic has not only improved my workflow but connected me with a network of innovators that are truly changing how we treat patients."
             </blockquote>
             <div className="flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-white text-xs font-bold text-gray-500 border border-gray-100 flex items-center gap-2">
                   <Activity size={14} className="text-blue-600" /> 1.2k Discussions
                </div>
                <div className="px-4 py-2 rounded-xl bg-white text-xs font-bold text-gray-500 border border-gray-100 flex items-center gap-2">
                   <Users size={14} className="text-emerald-600" /> 5k+ Members
                </div>
             </div>
          </div>
        </div>
      )
    }
  };

  const toggleResource = (id) => {
    if (activeResource === id) {
      setActiveResource(null);
    } else {
      setActiveResource(id);
      // Optional: Smooth scroll to the content
      setTimeout(() => {
        const element = document.getElementById('resource-details');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="supplemental-content">
      {/* Solutions Section */}
      <section id="solutions" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Tailored <span className="text-blue-700">Solutions</span></h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Specific workflows for different healthcare environments, ensuring maximum efficiency.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: "Private Clinics", desc: "Streamlined patient records and appointment management for solo and small group practices.", icon: <Heart className="text-blue-600" /> },
              { title: "Diagnostic Centers", desc: "Automated lab test reporting and direct digital delivery to patients and referring doctors.", icon: <Activity className="text-blue-600" /> },
              { title: "Specialized Hospitals", desc: "Complex scheduling and multi-department coordination for high-volume healthcare facilities.", icon: <Briefcase className="text-blue-600" /> }
            ].map((sol, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">{sol.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{sol.title}</h3>
                <p className="text-gray-600 leading-relaxed">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section id="ai-assistant" className="py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6">
                <Sparkles size={16} /> Advanced Clinical AI
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">Next-Gen <span className="text-blue-700">AI Assistant</span></h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Namma Clinic's proprietary AI engine provides real-time clinical decision support, identifying potential health risks before they become critical.
              </p>
              <ul className="space-y-6">
                {[
                  "Predictive health analytics",
                  "Automated medical coding support",
                  "Smart symptom cross-referencing",
                  "Clinical trial matching suggestions"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-700 font-medium text-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ChevronRight size={16} className="text-blue-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
              <div className="relative z-10 p-10 lg:p-16 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] shadow-2xl text-white">
                <Brain size={80} className="mb-10 opacity-20" />
                <h3 className="text-3xl font-bold mb-6">Neural Health Engine</h3>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">Our AI is trained on millions of anonymized medical records to ensure accuracy and safety across all demographics.</p>
                <div className="p-6 bg-white/10 rounded-2xl border border-white/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold uppercase tracking-wider">Analysis Accuracy</span>
                    <span className="text-sm font-bold">99.2%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-[99%] h-full bg-blue-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Tracking Section */}
      <section id="wellness-tracking" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center flex-row-reverse">
             <div className="order-2 lg:order-1 relative">
                <div className="w-full aspect-square bg-blue-200 rounded-full opacity-20 blur-3xl absolute top-0 left-0"></div>
                <div className="relative z-10 grid grid-cols-2 gap-6 lg:gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mt-12 border border-gray-50">
                    <Activity className="text-blue-600 mb-6" size={40} />
                    <div className="text-3xl font-black text-gray-900 mb-1">8,432</div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Daily Steps</div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
                    <Heart className="text-red-500 mb-6" size={40} />
                    <div className="text-3xl font-black text-gray-900 mb-1">72</div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Avg BPM</div>
                  </div>
                </div>
             </div>
             <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="order-1 lg:order-2"
             >
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">Unified <span className="text-blue-700">Wellness Tracking</span></h2>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                  Connect your patients' favorite wearables directly to their medical records. Monitor health trends in real-time between visits with seamless integration.
                </p>
                <div className="space-y-8">
                  {[
                    { title: "Vitals Sync", desc: "Automated heart rate, sleep, and blood oxygen tracking." },
                    { title: "Custom Targets", desc: "Set health goals for patients and track their progress." },
                    { title: "Risk Alerts", desc: "Instant notifications if a patient's vitals deviate from normal." }
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{feat.title}</h4>
                        <p className="text-gray-500 text-base leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Section (Knowledge & Resources) */}
      <section id="resources" className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16 lg:mb-24">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Knowledge & <span className="text-blue-700">Resources</span></h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Everything you need to master Namma Clinic, from technical documentation to community best practices.</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-16">
              {[
                { id: "documentation", title: "Documentation", desc: "Step-by-step guides for doctors, receptionists, and patients.", icon: <BookOpen />, color: "bg-blue-50 text-blue-600 shadow-blue-100/50" },
                { id: "api-reference", title: "API Reference", desc: "Modern REST API docs for integrating with external lab systems and health apps.", icon: <Code />, color: "bg-indigo-50 text-indigo-600 shadow-indigo-100/50" },
                { id: "case-studies", title: "Case Studies", desc: "Read how leading clinics transformed their patient care with our platform.", icon: <FileText />, color: "bg-purple-50 text-purple-600 shadow-purple-100/50" },
                { id: "blog", title: "Blog", desc: "Latest health technology trends and clinical workflow optimization tips.", icon: <Search />, color: "bg-emerald-50 text-emerald-600 shadow-emerald-100/50" },
                { id: "community", title: "Community", desc: "Join our forum of healthcare innovators and share best practices.", icon: <Users />, color: "bg-orange-50 text-orange-600 shadow-orange-100/50" }
              ].map((res, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -10 }}
                  className={`p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 transition-all duration-300 group cursor-pointer ${activeResource === res.id ? 'bg-white ring-2 ring-blue-600 shadow-2xl' : 'hover:bg-white hover:shadow-2xl'}`}
                  onClick={() => toggleResource(res.id)}
                >
                  <div className={`w-16 h-16 ${res.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                    {res.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{res.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-8">{res.desc}</p>
                  <div className="flex items-center gap-2 font-bold text-blue-700">
                    {activeResource === res.id ? 'Collapse' : 'Explore'} <ChevronRight size={18} className={`transition-transform ${activeResource === res.id ? 'rotate-90' : ''}`} />
                  </div>
                </motion.div>
              ))}
           </div>

           {/* Expandable Content Area */}
           <AnimatePresence mode="wait">
             {activeResource && (
               <motion.div
                 id="resource-details"
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="overflow-hidden bg-white rounded-[3rem] border border-gray-100 shadow-[0_30px_100px_rgba(0,0,0,0.1)] scroll-mt-32"
               >
                 <div className="p-10 lg:p-16 relative">
                    <button 
                      onClick={() => setActiveResource(null)}
                      className="absolute top-8 right-8 p-3 rounded-full bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <X size={24} />
                    </button>
                    
                    <div className="mb-12">
                      <span className="text-blue-600 font-black uppercase tracking-widest text-xs mb-3 block">Exploration Mode</span>
                      <h3 className="text-4xl font-black text-gray-900 mb-4">{resourceSections[activeResource].title}</h3>
                      <p className="text-lg text-gray-500">{resourceSections[activeResource].subtitle}</p>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {resourceSections[activeResource].content}
                    </motion.div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </section>

      {/* About & Careers */}
      <section id="about-us" className="py-24 lg:py-32 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
             <div>
                <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">Our Mission</h2>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                  We started Namma Clinic with a simple goal: to make world-class healthcare technology accessible to every clinic in India and beyond. We believe that better tools lead to better outcomes.
                </p>
                <div className="flex gap-12 lg:gap-16">
                  <div>
                    <div className="text-5xl font-black text-blue-400 mb-2">500+</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Clinics Empowered</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-blue-400 mb-2">1M+</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Patients Served</div>
                  </div>
                </div>
             </div>
             <div id="careers" className="bg-white/5 p-10 lg:p-16 rounded-[3rem] border border-white/10 backdrop-blur-sm shadow-2xl">
                <h3 className="text-3xl font-bold mb-6">Join Our Team</h3>
                <p className="text-slate-400 mb-10 text-xl leading-relaxed">We are looking for medical innovators, AI engineers, and care specialists to build the future of health.</p>
                <button className="w-full py-5 bg-blue-700 hover:bg-blue-800 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-900/20 hover:-translate-y-1">
                  View Open Positions
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Legal & Security Sections */}
      <section className="py-24 lg:py-32 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 lg:space-y-32">
          
          {/* Privacy Policy */}
          <div id="privacy-policy" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Privacy Policy</h2>
            </div>
            <div className="prose prose-blue prose-lg max-w-none text-gray-600 space-y-8">
              <p className="font-bold text-gray-900 border-b border-gray-100 pb-4">Last Updated: May 2026</p>
              <p className="text-lg leading-relaxed">
                At Namma Clinic, we take patient data privacy with the utmost seriousness. Our platform is built from the ground up to comply with global healthcare standards, including HIPAA (USA) and DISHA (India).
              </p>
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-gray-900">1. Data Ownership</h4>
                <p className="leading-relaxed">Patients and healthcare providers retain 100% ownership of their medical records. Namma Clinic acts only as a secure custodian of this data, providing the infrastructure to manage it effectively.</p>
                <h4 className="text-2xl font-bold text-gray-900">2. AI Usage Disclosure</h4>
                <p className="leading-relaxed">Our AI Health Assistant analyzes data locally within secure environments. No patient data is used to train external AI models without explicit, informed consent and complete de-identification protocols.</p>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div id="terms-of-service" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center shadow-sm">
                <FileText size={32} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Terms of Service</h2>
            </div>
            <div className="prose prose-indigo prose-lg max-w-none text-gray-600 space-y-8">
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-gray-900">Usage Agreement</h4>
                <p className="leading-relaxed">By using Namma Clinic, healthcare providers agree to maintain accurate medical records and respect patient confidentiality as per their local medical council guidelines and legal requirements.</p>
                <h4 className="text-2xl font-bold text-gray-900">Platform Availability</h4>
                <p className="leading-relaxed">We guarantee 99.9% uptime for our clinical services, ensuring that vital patient information is always accessible when needed most during critical clinical encounters.</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div id="security" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center shadow-sm">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Security Infrastructure</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {[
                { title: "Military-Grade Encryption", desc: "All data is encrypted using AES-256 at rest and TLS 1.3 in transit." },
                { title: "Biometric Access", desc: "Support for 2FA and biometric authentication for clinical staff." },
                { title: "Regular Audits", desc: "Quarterly third-party security audits and real-time vulnerability scanning." },
                { title: "Backup Protocols", desc: "Automated, redundant backups across multiple secure geographic regions." }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-base text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

// Internal utility component for the checkmark
const CheckCircleIcon = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default SupplementalSections;
