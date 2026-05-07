import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Bot, Cpu, ShieldCheck, Clock, Calendar, MapPin, Phone, Mail, Github, Twitter, Linkedin, Activity, Heart } from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';
import './Footer.css';




const Footer = ({ links, isAdmin }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [aboutText, setAboutText] = useState("Namma Clinic is a state-of-the-art clinical management system designed to bridge the gap between healthcare providers and patients. Our platform standardizes clinical workflows, enhances data accuracy, and ensures seamless communication, allowing doctors and nurses to focus more on patient care and less on administrative tasks.");
    const [isEditing, setIsEditing] = useState(false);
    const [tempText, setTempText] = useState(aboutText);

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <footer className="main-footer">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <div className="footer-logo-container">
                        <img src={logo} alt="Namma Clinic" className="footer-logo" />
                    </div>
                    {isEditing ? (
                        <div className="edit-about-container">
                            <textarea
                                className="edit-about-textarea"
                                value={tempText}
                                onChange={(e) => setTempText(e.target.value)}
                            />
                            <div className="footer-edit-actions">
                                <button className="btn-footer-save" onClick={() => { setAboutText(tempText); setIsEditing(false); }}>Save</button>
                                <button className="btn-footer-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p>{aboutText}</p>
                            {isAdmin && (
                                <button
                                    className="btn-edit-desc"
                                    onClick={() => { setTempText(aboutText); setIsEditing(true); }}
                                    title="Edit About Text"
                                >
                                    <Edit size={14} /> <span>Edit Description</span>
                                </button>
                            )}
                        </>
                    )}
                </div>

                {links && links.length > 0 && (
                    <div className="footer-section">
                        <h3>Dashboard Navigation</h3>
                        <ul className="footer-links">
                            {links.map((link, index) => (
                                <li key={index}>
                                    <button
                                        className="footer-link-btn"
                                        onClick={link.onClick}
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="footer-section">
                    <h3>AI & ML Services</h3>
                    <ul className="footer-links">
                        <li>
                            <button className="footer-link-btn" onClick={() => window.alert("AI Health Assistant is available in your Patient Dashboard.")}>
                                <Bot size={16} /> <span>Health Assistant</span>
                            </button>
                        </li>
                        <li>
                            <button className="footer-link-btn" onClick={() => window.alert("Gemini 1.5 Flash processes your lab tests.")}>
                                <Cpu size={16} /> <span>AI Diagnostics</span>
                            </button>
                        </li>
                        <li>
                            <button className="footer-link-btn" onClick={() => window.alert("Automated prescription processing powered by Gemini.")}>
                                <ShieldCheck size={16} /> <span>Smart Prescriptions</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact & Location</h3>
                    <div className="footer-info">
                        <div className="info-item">
                            <span className="info-icon"><Phone size={16} /></span>
                            <span>+91 6382715355</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon"><MapPin size={16} /></span>
                            <span>Tamil Nadu, India</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="disclaimer">
                    <strong>Disclaimer:</strong> This application is for clinical management assistance only.
                    It should not be used as a substitute for professional medical judgment.
                    Emergency cases should be handled immediately according to standard protocols.
                </p>
            </div>
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="copyright-text">
                        &copy; {currentDate.getFullYear()} Namma Clinic. All rights reserved.
                        Made with <Heart color="var(--action-primary)" fill="var(--action-primary)" size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> for better healthcare.
                    </p>
                    <div className="current-stats">
                        <span className="stat-pill"><Calendar size={12} /> {formatDate(currentDate)}</span>
                        <span className="stat-pill"><Clock size={12} /> {formatTime(currentDate)}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
