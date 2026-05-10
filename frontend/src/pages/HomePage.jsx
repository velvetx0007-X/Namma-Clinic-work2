import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import BrandText from '../components/common/BrandText';
import './HomePage.css';

const HomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to role-specific dashboard
        if (user) {
            if (user.role === 'clinic') {
                // Check clinic user type
                if (user.userType === 'doctor') {
                    navigate('/doctor-dashboard', { replace: true });
                } else if (user.userType === 'nurse') {
                    navigate('/nurse-dashboard', { replace: true });
                } else if (user.userType === 'receptionist') {
                    navigate('/receptionist-dashboard', { replace: true });
                }
            } else if (user.role === 'patient') {
                navigate('/patient-dashboard', { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="home-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-content">
                    <div className="nav-brand">
                        <BrandText className="text-2xl" />
                    </div>
                    <ul className="nav-links">
                        <li><a href="/home" className="active">Product</a></li>
                        <li><a href="/find-clinic.html" target="_blank" rel="noopener noreferrer">Find Clinics</a></li>
                        <li><a href="#solutions">Solutions</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#about">Company</a></li>
                    </ul>
                    <div className="nav-actions">
                        {user ? (
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="login-btn-nav">Login</button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-title"
                    >
                        Next-Gen Healthcare <br /><span>Management System</span>
                    </motion.h1>
                    <p className="hero-subtitle">
                        Streamline your clinical operations with our comprehensive, AI-powered platform designed for hospitals, clinics, and labs.
                    </p>
                    <div className="hero-cta">
                        <button onClick={() => navigate('/signup')} className="btn-primary-lg">Get Started</button>
                        <button className="btn-secondary-lg">Book a Demo</button>
                    </div>
                </div>
            </header>

            {/* Module Highlights */}
            <section id="solutions" className="modules-section">
                <div className="section-header">
                    <span className="section-tag">COMPREHENSIVE MODULES</span>
                    <h2>Tailored for every healthcare need</h2>
                </div>
                <div className="modules-grid">
                    <div className="module-card">
                        <div className="module-icon hospital">🏥</div>
                        <h3>Hospital Management</h3>
                        <p>End-to-end automation for large-scale hospital operations and departments.</p>
                    </div>
                    <div className="module-card">
                        <div className="module-icon clinic">👨‍⚕️</div>
                        <h3>Clinic Management</h3>
                        <p>Efficient patient queuing, appointments, and electronic medical records.</p>
                    </div>
                    <div className="module-card">
                        <div className="module-icon lab">🔬</div>
                        <h3>Laboratory Information</h3>
                        <p>Integrated billing, result processing, and automated reporting systems.</p>
                    </div>
                    <div className="module-card">
                        <div className="module-icon pharmacy">💊</div>
                        <h3>Pharmacy Inventory</h3>
                        <p>Smart stock management, digital prescriptions, and billing integration.</p>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="workflow-section">
                <div className="workflow-container">
                    <div className="workflow-text">
                        <span className="section-tag">STREAMLINED WORKFLOW</span>
                        <h2>The Patient Journey, Simplified</h2>
                        <ul className="workflow-steps">
                            <li><strong>Online Booking:</strong> Patients find and book appointments in seconds.</li>
                            <li><strong>Smart Registration:</strong> Digital forms and ID cards for faster check-ins.</li>
                            <li><strong>Clinical Excellence:</strong> Seamless integration between doctors and labs.</li>
                            <li><strong>Digital Health:</strong> Access prescriptions and records anywhere, anytime.</li>
                        </ul>
                    </div>
                    <div className="workflow-visual">
                        <div className="visual-card">
                            <div className="visual-item done">✓ Search</div>
                            <div className="visual-item active">● Book Appointment</div>
                            <div className="visual-item">○ Clinical Visit</div>
                            <div className="visual-item">○ Digital Record</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unique Features */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Why Choose NAMMA CLINIC?</h2>
                </div>
                <div className="unique-features-grid">
                    <div className="u-feature">
                        <h4>🤖 AI Health Assistant</h4>
                        <p>Personalized health guidance powered by Gemini AI for every patient.</p>
                    </div>
                    <div className="u-feature">
                        <h4>📍 Real-time Clinic Locator</h4>
                        <p>Find the nearest clinic with live distance and Google Maps directions.</p>
                    </div>
                    <div className="u-feature">
                        <h4>🪪 Digital ID Cards</h4>
                        <p>Modern clinical identity for rapid identification and better service.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-detailed-section p-24 bg-white">
                <div className="max-w-1200 mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="about-image-wrapper relative">
                        <div className="absolute -top-10 -left-10 w-full h-full bg-emerald-50 rounded-[40px] -z-10"></div>
                        <div className="w-full aspect-square bg-gradient-to-br from-emerald-100 to-teal-50 rounded-[40px] flex items-center justify-center text-8xl shadow-xl border-8 border-white">
                            ❤️
                        </div>
                        <div className="absolute -bottom-8 -right-8 premium-card p-6 w-60 shadow-2xl animate-bounce-slow">
                            <h4 className="text-emerald-600 text-2xl font-black">99.9%</h4>
                            <p className="text-slate-500 font-bold">Uptime Guaranteed</p>
                        </div>
                    </div>
                    <div className="about-text-content">
                        <span className="section-tag">WHO WE ARE</span>
                        <h2 className="text-4xl font-extrabold text-emerald-950 mb-6">Pioneering the Digital <br />Health Revolution</h2>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            NAMMA CLINIC is more than just a software; it's a commitment to clinical excellence. Inspired by the world's leading healthcare platforms, we've built a unified ecosystem that connects patients, doctors, and healthcare providers seamlessly.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="v-box">
                                <h5 className="font-bold text-emerald-950 mb-2">Our Vision</h5>
                                <p className="text-sm text-slate-500">To make healthcare accessible and paperless for everyone, everywhere.</p>
                            </div>
                            <div className="v-box">
                                <h5 className="font-bold text-emerald-950 mb-2">Our Mission</h5>
                                <p className="text-sm text-slate-500">Empowering clinics with smart technology to focus on what matters: Patient Care.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Placeholder */}
            <footer className="home-footer pb-20">
                <div className="max-w-1200 mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
                    <div className="col-span-1 md:col-span-2">
                        <BrandText className="text-2xl mb-6" />
                        <p className="text-slate-500 max-w-sm">The ultimate operating system for modern healthcare businesses. Built with ❤️ for doctors and patients.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-950 mb-6 uppercase tracking-widest text-xs">Resources</h4>
                        <ul className="flex flex-col gap-4 text-slate-500">
                            <li><a href="/home">Support Center</a></li>
                            <li><a href="/home">API Documentation</a></li>
                            <li><a href="/home">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-950 mb-6 uppercase tracking-widest text-xs">Connect</h4>
                        <ul className="flex flex-col gap-4 text-slate-500">
                            <li><a href="/home">LinkedIn</a></li>
                            <li><a href="/home">Twitter</a></li>
                            <li><a href="/home">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-100 pt-10">
                    <p>&copy; {new Date().getFullYear()} NAMMA CLINIC. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
