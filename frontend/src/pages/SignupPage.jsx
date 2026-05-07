import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import PinInput from '../components/PinInput';
import FloatingLabelInput from '../components/common/FloatingLabelInput';
import PhoneInput from '../components/common/PhoneInput';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';
import './SignupPage.css';

const SignupPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        countryCode: '+91',
        pin: '',
        role: 'patient',
        // Role specific
        clinicName: '',
        clinicAddress: '',
        specialization: '',
        licenseNumber: '',
        department: '',
        clinicCode: ''
    });

    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
    const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
    const [emailTimer, setEmailTimer] = useState(0);
    const [phoneTimer, setPhoneTimer] = useState(0);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePinComplete = (pinValue) => {
        setFormData({ ...formData, pin: pinValue });
    };

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.name || !formData.password || formData.pin.length < 4 || !formData.role) {
                setError('Please fill in all personal details and select a role');
                return false;
            }
        } else if (step === 2) {
            if (!formData.email || !formData.phoneNumber) {
                setError('Email and Phone are required');
                return false;
            }
            if (formData.role === 'clinic' && (!formData.clinicName || !formData.clinicAddress)) {
                setError('Clinic Name and Address are required');
                return false;
            }
            if (formData.role === 'doctor' && (!formData.specialization || !formData.licenseNumber)) {
                setError('Specialization and License Number are required');
                return false;
            }
            if (formData.role === 'nurse' && (!formData.department || !formData.licenseNumber)) {
                setError('Department and License Number are required');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    // OTP Handlers
    const startTimer = (type) => {
        if (type === 'email') setEmailTimer(120);
        else setPhoneTimer(120);
    };

    useEffect(() => {
        let timer;
        if (emailTimer > 0) timer = setInterval(() => setEmailTimer(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [emailTimer]);

    useEffect(() => {
        let timer;
        if (phoneTimer > 0) timer = setInterval(() => setPhoneTimer(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [phoneTimer]);

    const handleSendEmailOtp = async () => {
        try {
            setLoading(true);
            const res = await api.post('/auth/send-email-otp', { email: formData.email });
            if (res.data.success) {
                setSuccess('Email OTP sent!');
                startTimer('email');
                if (res.data.otp) console.log("[DEV] Email OTP:", res.data.otp);
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSendPhoneOtp = async () => {
        try {
            setLoading(true);
            const fullPhone = formData.countryCode + formData.phoneNumber;
            const res = await api.post('/auth/send-phone-otp', { phoneNumber: fullPhone });
            if (res.data.success) {
                setSuccess('Phone OTP sent!');
                startTimer('phone');
                if (res.data.otp) console.log("[DEV] Phone OTP:", res.data.otp);
                setStep(4);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send phone OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (type) => {
        const otpValue = (type === 'email' ? emailOtp : phoneOtp).join('');
        if (otpValue.length < 6) {
            setError('Enter 6-digit code');
            return;
        }

        const identifier = type === 'email' ? formData.email : (formData.countryCode + formData.phoneNumber);

        try {
            setLoading(true);
            const res = await api.post('/auth/verify-otp', { identifier, type, otp: otpValue });
            if (res.data.success) {
                if (type === 'email') {
                    handleFinalSignup();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSignup = async () => {
        try {
            setLoading(true);
            const fullPhone = formData.countryCode + formData.phoneNumber;
            const res = await api.post('/auth/signup', { ...formData, phoneNumber: fullPhone });
            if (res.data.success) {
                setStep(4);
                setTimeout(() => {
                    const { user, token } = res.data;
                    login(user, token);
                    
                    if (user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else if (user.role === 'clinic') {
                        navigate('/clinic-admin-dashboard');
                    } else if (user.role === 'patient') {
                        navigate('/patient-dashboard');
                    } else if (user.role === 'doctor') {
                        navigate('/doctor-dashboard');
                    } else if (user.role === 'nurse') {
                        navigate('/nurse-dashboard');
                    } else if (user.role === 'receptionist') {
                        navigate('/receptionist-dashboard');
                    } else {
                        navigate('/home');
                    }
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const OtpGroup = ({ value, onChange }) => (
        <div className="flex justify-between gap-2 my-6">
            {value.map((digit, i) => (
                <input
                    key={i}
                    type="text"
                    maxLength="1"
                    className="w-full h-12 text-center text-xl font-bold border-2 border-[#E0E0E0] rounded-xl focus:border-[#1E88E5] focus:outline-none focus:shadow-[0_0_0_4px_rgba(30,136,229,0.1)] transition-all"
                    value={digit}
                    onChange={(e) => {
                        const newOtp = [...value];
                        newOtp[i] = e.target.value.substring(e.target.value.length - 1);
                        onChange(newOtp);
                        
                        // Focus next input
                        if (e.target.value && i < 5) {
                            const nextInput = e.target.parentElement.querySelectorAll('input')[i + 1];
                            if (nextInput) nextInput.focus();
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !value[i] && i > 0) {
                            const prevInput = e.target.parentElement.querySelectorAll('input')[i - 1];
                            if (prevInput) prevInput.focus();
                        }
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[480px] bg-white p-10 rounded-[28px] shadow-[0_24px_50px_rgba(0,0,0,0.08)] border border-[#F0F0F0] text-center overflow-hidden"
            >
                {/* Logo and Header */}
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Namma Clinic Logo" className="w-24 h-24 mb-4 object-contain" />
                    <h1 className="text-2xl font-bold text-[#333]">Create Account</h1>
                    <p className="text-[#757575] text-sm font-medium">Join Namma Clinic Clinical App</p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1.5 mb-8 px-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? (step === 4 ? 'bg-[#43A047]' : 'bg-[#1E88E5]') : 'bg-[#E0E0E0]'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            {error && <div className="p-3 mb-6 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

                            <div className="text-left">
                                <FloatingLabelInput label="Full Name" id="name" value={formData.name} onChange={handleChange} required />
                                <FloatingLabelInput label="Password" id="password" type="password" value={formData.password} onChange={handleChange} required />
                                
                                <div className="py-2 mb-4">
                                    <p className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-2">I am signing up as:</p>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full py-3 px-4 rounded-xl border-2 border-[#E0E0E0] bg-white text-sm font-bold text-[#333] appearance-none cursor-pointer focus:border-[#1E88E5] focus:outline-none focus:shadow-[0_0_0_4px_rgba(30,136,229,0.1)] transition-all"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23757575' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                                    >
                                        <option value="patient">🩺 Patient</option>
                                        <option value="doctor">👨‍⚕️ Doctor</option>
                                        <option value="clinic">🏥 Clinic</option>
                                        <option value="nurse">💉 Nurse</option>
                                        <option value="receptionist">📋 Receptionist</option>
                                        <option value="admin">🔐 Admin</option>
                                    </select>
                                </div>

                                <div className="py-2 mb-6">
                                    <p className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-3">Secure 4-Digit PIN</p>
                                    <PinInput length={4} onComplete={handlePinComplete} />
                                </div>

                                <button onClick={nextStep} className="w-full py-4 bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                    Continue <ArrowRight size={18} />
                                </button>
                                <p className="text-center text-sm text-[#757575] mt-6">Already have an account? <Link to="/login" className="text-[#1E88E5] font-bold">Login</Link></p>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <div className="mb-6 text-left">
                                <h2 className="text-xl font-bold text-[#333]">
                                    {formData.role === 'patient' && '🩺 Patient Registration'}
                                    {formData.role === 'doctor' && '👨‍⚕️ Doctor Registration'}
                                    {formData.role === 'clinic' && '🏥 Clinic Registration'}
                                    {formData.role === 'nurse' && '💉 Nurse Registration'}
                                    {formData.role === 'receptionist' && '📋 Receptionist Registration'}
                                    {formData.role === 'admin' && '🔐 Admin Registration'}
                                </h2>
                                <p className="text-[#757575] text-sm mt-1">
                                    {formData.role === 'patient' && 'Enter your contact details to get started.'}
                                    {formData.role === 'doctor' && 'Provide your medical credentials and contact info.'}
                                    {formData.role === 'clinic' && 'Register your clinic with address and contact details.'}
                                    {formData.role === 'nurse' && 'Enter your department and license details.'}
                                    {formData.role === 'receptionist' && 'Link to your clinic and provide contact info.'}
                                    {formData.role === 'admin' && 'Provide your admin credentials.'}
                                </p>
                            </div>
                            
                            {error && <div className="p-3 mb-6 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

                            <div className="text-left">
                                <FloatingLabelInput label="Email Address" id="email" type="email" value={formData.email} onChange={handleChange} required />
                                
                                <PhoneInput 
                                    label="Mobile Number" 
                                    id="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleChange}
                                    countryCode={formData.countryCode}
                                    onCountryCodeChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                                    required 
                                />

                                {formData.role === 'clinic' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 flex flex-col gap-4 overflow-hidden">
                                        <FloatingLabelInput label="Clinic Name" id="clinicName" value={formData.clinicName} onChange={handleChange} required />
                                        <FloatingLabelInput label="Clinic Address" id="clinicAddress" value={formData.clinicAddress} onChange={handleChange} required />
                                    </motion.div>
                                )}

                                {formData.role === 'doctor' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 flex flex-col gap-4 overflow-hidden">
                                        <div className="mb-2">
                                            <label className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-2 block">Specialization</label>
                                            <select
                                                name="specialization"
                                                value={formData.specialization}
                                                onChange={handleChange}
                                                className="w-full py-3 px-4 rounded-xl border-2 border-[#E0E0E0] bg-white text-sm font-bold text-[#333] appearance-none cursor-pointer focus:border-[#1E88E5] focus:outline-none focus:shadow-[0_0_0_4px_rgba(30,136,229,0.1)] transition-all"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23757575' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                                                required
                                            >
                                                <option value="" disabled>Select Specialization</option>
                                                <option value="General Physician">🩺 General Physician</option>
                                                <option value="Cardiologist">❤️ Cardiologist</option>
                                                <option value="Dermatologist">✨ Dermatologist</option>
                                                <option value="Pediatrician">👶 Pediatrician</option>
                                                <option value="Gynecologist">🤰 Gynecologist</option>
                                                <option value="Orthopedic">🦴 Orthopedic</option>
                                                <option value="Neurologist">🧠 Neurologist</option>
                                                <option value="Dentist">🦷 Dentist</option>
                                                <option value="Psychiatrist">😊 Psychiatrist</option>
                                                <option value="Ophthalmologist">👁️ Ophthalmologist</option>
                                                <option value="ENT Specialist">👂 ENT Specialist</option>
                                                <option value="Urologist">💧 Urologist</option>
                                                <option value="Endocrinologist">🧪 Endocrinologist</option>
                                                <option value="Gastroenterologist">🍎 Gastroenterologist</option>
                                                <option value="Oncologist">🎗️ Oncologist</option>
                                                <option value="Pulmonologist">🫁 Pulmonologist</option>
                                                <option value="Nephrologist">🧼 Nephrologist</option>
                                                <option value="Radiologist">📸 Radiologist</option>
                                                <option value="Ayurveda">🌿 Ayurveda</option>
                                                <option value="Homeopathy">💧 Homeopathy</option>
                                                <option value="Physiotherapist">🏃 Physiotherapist</option>
                                            </select>
                                        </div>
                                        <FloatingLabelInput label="Medical License Number" id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required />
                                    </motion.div>
                                )}

                                {formData.role === 'nurse' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 flex flex-col gap-4 overflow-hidden">
                                        <FloatingLabelInput label="Department" id="department" value={formData.department} onChange={handleChange} required />
                                        <FloatingLabelInput label="Nurse License Number" id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required />
                                    </motion.div>
                                )}

                                {formData.role === 'receptionist' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 flex flex-col gap-4 overflow-hidden">
                                        <FloatingLabelInput label="Department" id="department" value={formData.department} onChange={handleChange} />
                                        <FloatingLabelInput label="Clinic Code" id="clinicCode" value={formData.clinicCode} onChange={handleChange} />
                                    </motion.div>
                                )}

                                {formData.role === 'nurse' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2 overflow-hidden">
                                        <FloatingLabelInput label="Clinic Code" id="clinicCode" value={formData.clinicCode} onChange={handleChange} />
                                    </motion.div>
                                )}

                                <button onClick={handleSendEmailOtp} disabled={loading} className="w-full py-4 bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold rounded-xl mt-8 transition-all shadow-lg flex items-center justify-center gap-2">
                                    {loading ? 'Sending OTP...' : 'Send OTP & Verify'} <Mail size={18} />
                                </button>
                                <button onClick={prevStep} className="w-full py-3 text-[#1E88E5] font-bold text-sm mt-2">Go Back</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-[#333]">Verify Email</h2>
                                <p className="text-[#757575] text-sm mt-1">Code sent to <b>{formData.email}</b></p>
                            </div>

                            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}
                            
                            <OtpGroup value={emailOtp} onChange={setEmailOtp} />
                            
                            <p className="text-xs text-[#9E9E9E] font-medium mb-8">
                                {emailTimer > 0 ? `Resend in ${Math.floor(emailTimer/60)}:${(emailTimer%60).toString().padStart(2,'0')}` : <span className="text-[#1E88E5] cursor-pointer font-bold" onClick={handleSendEmailOtp}>Resend Now</span>}
                            </p>

                            <button onClick={() => handleVerifyOtp('email')} disabled={loading} className="w-full py-4 bg-[#43A047] hover:bg-[#2E7D32] text-white font-bold rounded-xl transition-all shadow-lg">
                                {loading ? 'Verifying...' : 'Verify Email Address'}
                            </button>
                            <button onClick={() => setStep(2)} className="w-full py-3 text-[#757575] font-bold text-sm mt-2">Change Email</button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="py-12">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }} className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="text-[#43A047] w-12 h-12" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-[#333] mb-2">You're All Set!</h2>
                                <p className="text-[#757575] font-medium">Your clinical account has been verified.</p>
                                <div className="mt-8">
                                    <p className="text-xs text-[#9E9E9E] animate-pulse">Redirecting to your dashboard...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SignupPage;
