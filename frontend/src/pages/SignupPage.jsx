import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';

import PinInput from '../components/PinInput';
import './SignupPage.css';

const SignupPage = () => {
    const [selectedRole, setSelectedRole] = useState('patient');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [patientData, setPatientData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        area: '',
        address: '',
        pin: ''
    });

    const [patientStep, setPatientStep] = useState(1);

    // Clinic form state
    const [clinicData, setClinicData] = useState({
        clinicName: '',
        userName: '',
        phoneNumber: '',
        email: '',
        password: '',
        clinicRegistrationNumber: '',
        issuedArea: '',
        userType: 'doctor',
        nmrNumber: '',
        nuid: '',
        employeeCode: '',
        pin: '',
        address: '',
        pincode: ''
    });

    // Admin form state
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '',
        companyId: '',
        pin: ''
    });

    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handlePatientChange = async (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });

        // If area or address changes, we could potentially geocode
        // But for now, let's just update the state
    };

    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return { lat: 13.0827, lng: 80.2707 }; // Default fallback
    };

    const handleSendOtp = async () => {
        if (!patientData.phoneNumber) {
            setError('Please enter a phone number first');
            return;
        }
        try {
            setLoading(true);
            const response = await api.post('/auth/send-otp', { phoneNumber: patientData.phoneNumber });
            if (response.data.success) {
                setShowOtpInput(true);
                setSuccess('OTP sent to your phone number: ' + response.data.otp); // Mock showing OTP
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error
                ? `${err.response.data.message}: ${err.response.data.error}`
                : (err.response?.data?.message || 'Error sending OTP');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const response = await api.post('/auth/verify-otp', {
                phoneNumber: patientData.phoneNumber,
                otp
            });
            if (response.data.success) {
                setIsPhoneVerified(true);
                setShowOtpInput(false);
                setSuccess('Phone number verified successfully!');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error
                ? `${err.response.data.message}: ${err.response.data.error}`
                : (err.response?.data?.message || 'OTP verification failed');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSendVerifyEmail = async () => {
        if (!patientData.email) {
            setError('Please enter an email first');
            return;
        }
        try {
            setLoading(true);
            const response = await api.post('/auth/send-verify-email', { email: patientData.email });
            if (response.data.success) {
                setIsEmailSent(true);
                setSuccess('Verification email sent! Check your inbox (Simulation: Token ' + response.data.token + ')');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error
                ? `${err.response.data.message}: ${err.response.data.error}`
                : (err.response?.data?.message || 'Error sending email');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientPinChange = (pinValue) => {
        setPatientData({ ...patientData, pin: pinValue });
    };

    const handleClinicChange = (e) => {
        setClinicData({ ...clinicData, [e.target.name]: e.target.value });
    };

    const handleClinicPinChange = (pinValue) => {
        setClinicData({ ...clinicData, pin: pinValue });
    };

    const handleAdminChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const handleAdminPinChange = (pinValue) => {
        setAdminData({ ...adminData, pin: pinValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            let response;

            if (selectedRole === 'patient') {
                if (!isPhoneVerified) {
                    setError('Please verify your phone number first');
                    setLoading(false);
                    return;
                }
                const location = await geocodeAddress(patientData.address || patientData.area);
                const finalPatientData = { ...patientData, location };
                response = await api.post('/auth/signup/patient', finalPatientData);
            } else if (selectedRole === 'clinic') {
                response = await api.post('/auth/signup/clinic', clinicData);
            } else if (selectedRole === 'admin') {
                response = await api.post('/auth/signup/admin', adminData);
            }

            if (response.data.success) {
                setSuccess(response.data.message);
                login(response.data.user, response.data.token);

                // Redirect based on role
                setTimeout(() => {
                    const role = response.data.user.role;
                    const userType = response.data.user.userType;

                    if (role === 'admin') {
                        navigate('/admin-dashboard');
                    } else if (role === 'clinic' && userType === 'admin') {
                        navigate('/clinic-admin-dashboard');
                    } else if (role === 'doctor' || (role === 'clinic' && userType === 'doctor')) {
                        navigate('/doctor-dashboard');
                    } else if (role === 'nurse' || (role === 'clinic' && userType === 'nurse')) {
                        navigate('/nurse-dashboard');
                    } else if (role === 'receptionist' || (role === 'clinic' && userType === 'receptionist')) {
                        navigate('/receptionist-dashboard');
                    } else if (role === 'patient') {
                        navigate('/patient-dashboard');
                    } else {
                        navigate('/home');
                    }
                }, 1000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error
                ? `${err.response.data.message}: ${err.response.data.error}`
                : (err.response?.data?.message || 'Registration failed. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container relative overflow-hidden bg-[#011611] flex items-center justify-center min-h-screen py-12 px-4">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="signup-card z-10 w-full max-w-2xl p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30"
                    >
                        <UserPlus className="text-white w-8 h-8" />
                    </motion.div>
                    <h1 className="signup-title text-3xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="signup-subtitle text-emerald-400 mt-1 font-medium">Join Namma Clinic Clinical App</p>
                </div>

                {/* Role Selection Tabs */}
                <div className="role-tabs flex p-1 bg-white/5 rounded-xl mb-6">
                    {['patient', 'clinic', 'admin'].map((role) => (
                        <button
                            key={role}
                            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all capitalize ${selectedRole === role ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:text-slate-100'}`}
                            onClick={() => setSelectedRole(role)}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                {/* Error and Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 mb-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm overflow-hidden"
                        >
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 mb-6 bg-green-500/10 border border-green-500/50 rounded-xl text-green-200 text-sm overflow-hidden"
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dynamic Forms Based on Selected Role */}
                <form onSubmit={handleSubmit} className="signup-form space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedRole}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* PATIENT FORM */}
                            {selectedRole === 'patient' && (
                                <div className="space-y-4">
                                    {patientStep === 1 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-group">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={patientData.name}
                                                        onChange={handlePatientChange}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Email Address</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                            value={patientData.email}
                                                            onChange={handlePatientChange}
                                                            required
                                                            placeholder="name@example.com"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleSendVerifyEmail}
                                                            className="px-4 py-2.5 bg-teal-600/50 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                                            disabled={isEmailSent || !patientData.email}
                                                        >
                                                            {isEmailSent ? 'Sent' : 'Verify'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-group">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Password</label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        value={patientData.password}
                                                        onChange={handlePatientChange}
                                                        required
                                                        minLength="6"
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        placeholder="Min 6 characters"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Security PIN</label>
                                                    <div className="pin-input-wrapper">
                                                        <PinInput
                                                            length={4}
                                                            onComplete={handlePatientPinChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="text-slate-100 text-sm font-medium mb-1.5 block">Phone Number</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="tel"
                                                        name="phoneNumber"
                                                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        value={patientData.phoneNumber}
                                                        onChange={handlePatientChange}
                                                        required
                                                        placeholder="Enter phone number"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOtp}
                                                        className="px-4 py-2.5 bg-emerald-600/50 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                                        disabled={isPhoneVerified || !patientData.phoneNumber}
                                                    >
                                                        {isPhoneVerified ? 'Verified' : 'Verify'}
                                                    </button>
                                                </div>
                                            </div>

                                            {showOtpInput && (
                                                <div className="form-group bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Enter Verification Code</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                            placeholder="6-digit OTP"
                                                            maxLength="6"
                                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyOtp}
                                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                                                        >
                                                            Submit Code
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!patientData.name || !patientData.email || !patientData.password || !patientData.phoneNumber) {
                                                        setError('Please fill all required fields');
                                                        return;
                                                    }
                                                    setError('');
                                                    setPatientStep(2);
                                                }}
                                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                Continue to Address
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-group">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Area</label>
                                                    <input
                                                        type="text"
                                                        name="area"
                                                        value={patientData.area}
                                                        onChange={handlePatientChange}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        placeholder="e.g. Erode"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="text-slate-100 text-sm font-medium mb-1.5 block">Full Address</label>
                                                    <textarea
                                                        name="address"
                                                        value={patientData.address}
                                                        onChange={handlePatientChange}
                                                        required
                                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                                        placeholder="Complete address for geocoding"
                                                        rows="3"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setPatientStep(1)}
                                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {loading ? 'Registering...' : 'Complete Signup'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* CLINIC FORM */}
                            {selectedRole === 'clinic' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Clinic Name</label>
                                            <input
                                                type="text"
                                                name="clinicName"
                                                value={clinicData.clinicName}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="Medical Center Name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">User Name</label>
                                            <input
                                                type="text"
                                                name="userName"
                                                value={clinicData.userName}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="Profile username"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={clinicData.phoneNumber}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="Primary phone number"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={clinicData.email}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="clinic@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Assign Role</label>
                                            <select
                                                name="userType"
                                                value={clinicData.userType}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                            >
                                                <option value="doctor" className="bg-[#022c22]">Physician/Doctor</option>
                                                <option value="nurse" className="bg-[#022c22]">Specialist Nurse</option>
                                                <option value="receptionist" className="bg-[#022c22]">Reception Desk</option>
                                                <option value="admin" className="bg-[#022c22]">Clinic Administrator</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Clinic Registration No.</label>
                                            <input
                                                type="text"
                                                name="clinicRegistrationNumber"
                                                value={clinicData.clinicRegistrationNumber}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="e.g. CLINIC-2024-001"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="text-slate-100 text-sm font-medium mb-1.5 block">Issued Area</label>
                                        <input
                                            type="text"
                                            name="issuedArea"
                                            value={clinicData.issuedArea}
                                            onChange={handleClinicChange}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            placeholder="Area where registration was issued"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Full Address</label>
                                            <div className="relative">
                                                <textarea
                                                    name="address"
                                                    value={clinicData.address}
                                                    onChange={handleClinicChange}
                                                    required
                                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                                    placeholder="Complete clinic address"
                                                    rows="2"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setClinicData({ ...clinicData, address: clinicData.issuedArea })}
                                                    className="absolute right-2 bottom-2 px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-[10px] text-white rounded-md transition-all"
                                                    title="Copy from Issued Area"
                                                >
                                                    Use Issued Area
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={clinicData.pincode}
                                                onChange={handleClinicChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="e.g. 600001"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={clinicData.password}
                                                onChange={handleClinicChange}
                                                required
                                                minLength="6"
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Security PIN</label>
                                            <div className="pin-input-wrapper">
                                                <PinInput
                                                    length={4}
                                                    onChange={handleClinicPinChange}
                                                    onComplete={handleClinicPinChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {clinicData.userType !== 'admin' && (
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">
                                                {clinicData.userType === 'doctor' ? 'NMR Number' : clinicData.userType === 'nurse' ? 'NUID' : 'Employee ID (Optional)'}
                                            </label>
                                            <input
                                                type="text"
                                                name={clinicData.userType === 'doctor' ? 'nmrNumber' : clinicData.userType === 'nurse' ? 'nuid' : 'employeeCode'}
                                                value={clinicData.userType === 'doctor' ? clinicData.nmrNumber : clinicData.userType === 'nurse' ? clinicData.nuid : clinicData.employeeCode}
                                                onChange={handleClinicChange}
                                                required={clinicData.userType !== 'receptionist'}
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder={`Enter ${clinicData.userType === 'doctor' ? 'NMR Number' : clinicData.userType === 'nurse' ? 'NUID' : 'Employee Code'}`}
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Complete Clinic Registration'}
                                    </button>
                                </div>
                            )}

                            {/* ADMIN FORM */}
                            {selectedRole === 'admin' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Admin Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={adminData.name}
                                                onChange={handleAdminChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Corporate Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={adminData.email}
                                                onChange={handleAdminChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Organization</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={adminData.companyName}
                                                onChange={handleAdminChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="Clinical Group Name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Organization ID</label>
                                            <input
                                                type="text"
                                                name="companyId"
                                                value={adminData.companyId}
                                                onChange={handleAdminChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="e.g. ORG-2024-001"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={adminData.password}
                                                onChange={handleAdminChange}
                                                required
                                                minLength="6"
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="Min 6 characters"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-slate-100 text-sm font-medium mb-1.5 block">Security PIN</label>
                                            <div className="pin-input-wrapper">
                                                <PinInput
                                                    length={4}
                                                    onComplete={handleAdminPinChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Complete Admin Registration'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="login-link text-emerald-400/80 text-sm font-medium">
                        Existing Practitioner? <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">Sign in here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
