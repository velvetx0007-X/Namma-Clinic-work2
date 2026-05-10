import React from 'react';
import { Heart, Target, Users, Mail, Phone, Activity, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import './About.css';
import logo from '../assets/Namma Clinic logo.jpeg';

const About = () => {
    return (
        <div className="about-container">
            <div className="about-header">
                <img src={logo} alt="Namma Clinic" className="about-logo" />
                <h1>About Namma Clinic</h1>
                <p>Revolutionizing Healthcare, One Patient at a Time</p>
            </div>

            <div className="about-card">
                <div className="about-intro">
                    <p>
                        <strong>Namma Clinic</strong> is a comprehensive healthcare management platform designed to bridge the gap between patients, doctors, and clinics. Our mission is to make healthcare accessible, efficient, and patient-centric through the power of technology.
                    </p>
                </div>

                <h2 className="about-section-title"><Target size={24} /> Our Mission</h2>
                <p className="about-text">
                    To empower individuals to take control of their health journey by providing seamless access to medical records, appointment booking, and AI-driven health insights.
                </p>

                <h2 className="about-section-title"><Sparkles size={24} /> Key Features</h2>
                <div className="features-list">
                    <div className="feature-item">
                        <strong><Activity size={18} className="inline-icon" /> Unified Dashboard</strong>
                        <p>Access your prescriptions, lab reports, and appointments in one place.</p>
                    </div>
                    <div className="feature-item">
                        <strong><ClipboardCheck size={18} className="inline-icon" /> AI Health Assistant</strong>
                        <p>Get instant answers to your health queries, from diet plans to exercise routines.</p>
                    </div>
                    <div className="feature-item">
                        <strong><ShieldCheck size={18} className="inline-icon" /> Digital Health Records</strong>
                        <p>Securely store and share your medical history with doctors.</p>
                    </div>
                    <div className="feature-item">
                        <strong><ClipboardCheck size={18} className="inline-icon" /> Smart Appointments</strong>
                        <p>Book consultations with ease and track your queue status visually.</p>
                    </div>
                </div>

                <div className="contact-info">
                    <h2 className="about-section-title"><Mail size={24} /> Contact Us</h2>
                    <p className="about-text">
                        Have questions or feedback? We'd love to hear from you.<br />
                        <strong>Email:</strong> <a href="mailto:zuhvix.tech@gmail.com" className="contact-link">zuhvix.tech@gmail.com</a><br />
                        <strong>Phone:</strong> <span className="contact-link">+91 63827 15355</span>
                    </p>
                </div>
            </div>

            <div className="about-footer">
                &copy; {new Date().getFullYear()} Namma Clinic. Providing Premium Healthcare Facilities.
            </div>
        </div>
    );
};

export default About;
