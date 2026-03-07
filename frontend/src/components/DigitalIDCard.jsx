import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ShieldCheck, Download, Edit3 } from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';

import './DigitalIDCard.css';

const DigitalIDCard = ({ user, onEdit }) => {
    const cardRef = useRef(null);
    const {
        name,
        userName,
        clinicName,
        role,
        userType,
        email,
        phoneNumber,
        profilePhoto,
        id,
        uhid,
        bloodGroup,
        nmrNumber,
        nuid,
        employeeCode,
        specialization,
        clinicRegistrationNumber
    } = user;

    const displayRole = userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : role?.charAt(0).toUpperCase() + role?.slice(1);
    const displayName = name || userName || 'N/A';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const avatarUrl = profilePhoto
        ? `${apiUrl}/${profilePhoto}`
        : `https://ui-avatars.com/api/?name=${displayName}&background=10b981&color=fff`;

    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${displayName}_NammaClinic_ID.pdf`);
        } catch (err) {
            console.error('PDF Error:', err);
            alert('Failed to generate PDF');
        }
    };

    const shineRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current || !shineRef.current) return;
        const { left, top } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        gsap.to(shineRef.current, {
            x: x - 100,
            y: y - 100,
            opacity: 0.15,
            duration: 0.3
        });
    };

    const handleMouseLeave = () => {
        if (shineRef.current) {
            gsap.to(shineRef.current, {
                opacity: 0,
                duration: 0.5
            });
        }
    };

    return (
        <div className="id-card-wrapper relative">
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="digital-id-card relative overflow-hidden group"
            >
                {/* GSAP Shine Effect */}
                <div
                    ref={shineRef}
                    className="absolute w-48 h-48 bg-white rounded-full pointer-events-none blur-3xl opacity-0 z-50"
                />

                <div className="card-header overflow-hidden">
                    <div className="card-brand flex items-center gap-2">
                        <img src={logo} alt="Namma Clinic" className="card-logo w-8 h-8 rounded-lg" />
                        <h3 className="font-bold text-white tracking-wide">Namma Clinic</h3>
                    </div>

                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="verified-badge bg-green-500/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-500/30"
                    >
                        <ShieldCheck className="text-green-400 w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Verified</span>
                    </motion.div>
                    {onEdit && (
                        <button
                            className="edit-card-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            title="Edit Profile"
                        >
                            ✏️
                        </button>
                    )}
                </div>

                <div className="card-body">
                    <div className="photo-section">
                        <img src={avatarUrl} alt={displayName} className="profile-photo" crossOrigin="anonymous" />
                        <div className="role-chip">{displayRole}</div>
                    </div>

                    <div className="info-section">
                        <h2 className="user-name">{displayName}</h2>
                        <p className="user-id">ID: {id?.substring(0, 8).toUpperCase()}</p>

                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Email</label>
                                <span>{email}</span>
                            </div>
                            <div className="detail-item">
                                <label>Phone</label>
                                <span>{phoneNumber || 'N/A'}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label">AGE</span>
                                <span className="value">{user.age || 'N/A'}</span>
                            </div>
                            {user.role === 'patient' && (
                                <>
                                    <div className="detail-item">
                                        <span className="label">UHID</span>
                                        <span className="value">{user.uhid || 'NOT ASSIGNED'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">BLOOD GROUP</span>
                                        <span className="value">{user.bloodGroup || 'N/A'}</span>
                                    </div>
                                </>
                            )}

                            {userType === 'doctor' && (
                                <>
                                    <div className="detail-item">
                                        <label>NMR No.</label>
                                        <span>{nmrNumber || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Specialization</label>
                                        <span>{specialization || 'General Physician'}</span>
                                    </div>
                                </>
                            )}

                            {userType === 'nurse' && (
                                <div className="detail-item">
                                    <label>NUID</label>
                                    <span>{nuid || 'N/A'}</span>
                                </div>
                            )}

                            {(userType === 'receptionist' || role === 'clinic') && clinicName && (
                                <div className="detail-item">
                                    <label>Clinic</label>
                                    <span>{clinicName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="disclaimer-section">
                        <p className="disclaimer-title">Disclaimer</p>
                        <p className="disclaimer-text">
                            This ID card is for identification purposes only.
                            Unauthorized use or alteration is prohibited.
                        </p>
                    </div>
                    <div className="footer-text">
                        <p>This is a digital identity card issued by Namma Clinic.</p>
                        <p>Emergency Contact: 911</p>
                    </div>
                </div>
            </motion.div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                className="download-id-btn w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
            >
                <Download className="w-5 h-5" />
                <span>Download Professional ID Card</span>
            </motion.button>
        </div >
    );
};

export default DigitalIDCard;
