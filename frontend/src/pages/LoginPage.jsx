import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import PinInput from '../components/PinInput';
import FloatingLabelInput from '../components/common/FloatingLabelInput';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import RoleDropdown from '../components/common/RoleDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Namma Clinic logo.jpeg';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        countryCode: '+91',
        password: '',
        role: 'patient',
        pin: ''
    });
    const [loginMethod, setLoginMethod] = useState('password');
    const [identifierType, setIdentifierType] = useState('email'); // 'email' or 'phone'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePinChange = (pinValue) => {
        setFormData({ ...formData, pin: pinValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const loginData = {
            role: formData.role,
            identifier: identifierType === 'email' ? formData.email : (formData.countryCode + formData.phoneNumber)
        };

        if (loginMethod === 'password') {
            loginData.password = formData.password;
        } else {
            loginData.pin = formData.pin;
        }

        try {
            const response = await api.post('/auth/login', loginData);

            if (response.data.success) {
                const { user, token } = response.data;
                login(user, token);

                // Redirect based on role
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
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] bg-white p-10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#F0F0F0] text-center"
            >
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Namma Clinic Logo" className="w-24 h-24 mb-4 object-contain" />
                    <h1 className="text-2xl font-bold text-[#333]">Welcome Back</h1>
                    <p className="text-[#757575] text-sm mt-1">Please enter your details to sign in</p>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl text-[#C62828] text-sm text-left">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {/* Role Dropdown */}
                    <div className="mb-2">
                        <label className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-2 block">I am a</label>
                        <RoleDropdown
                            value={formData.role}
                            onChange={(role) => setFormData({ ...formData, role })}
                        />
                    </div>

                    {/* Email / Phone Toggle - REMOVED for single identifier input */}
                    
                    {/* Identifier Input */}
                    <div className="space-y-4">
                        <FloatingLabelInput
                            label="Email Address or Phone Number"
                            id="identifier"
                            type="text"
                            value={identifierType === 'email' ? formData.email : formData.phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value;
                                // Basic heuristic: if it contains @, it's an email
                                if (val.includes('@')) {
                                    setIdentifierType('email');
                                    setFormData({ ...formData, email: val });
                                } else {
                                    setIdentifierType('phone');
                                    setFormData({ ...formData, phoneNumber: val });
                                }
                            }}
                            required
                        />
                    </div>

                    {/* Password / PIN Toggle */}
                    <div className="flex gap-4 mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border ${loginMethod === 'password' ? 'bg-[#1E88E5] text-white border-[#1E88E5]' : 'bg-white text-[#757575] border-[#E0E0E0]'}`}
                            onClick={() => setLoginMethod('password')}
                        >
                            PASSWORD
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border ${loginMethod === 'pin' ? 'bg-[#1E88E5] text-white border-[#1E88E5]' : 'bg-white text-[#757575] border-[#E0E0E0]'}`}
                            onClick={() => setLoginMethod('pin')}
                        >
                            PIN LOGIN
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {loginMethod === 'password' ? (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                            >
                                <FloatingLabelInput
                                    label="Password"
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pin"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex flex-col items-center py-2"
                            >
                                <p className="text-xs font-semibold text-[#757575] mb-4 w-full text-left uppercase">Secure 4-Digit PIN</p>
                                <PinInput length={4} onComplete={handlePinChange} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div className="flex justify-center mt-6">
                        <button 
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            className="text-[#1E88E5] text-sm font-bold hover:underline"
                        >
                            Forgot Password or PIN?
                        </button>
                    </div>
                </form>

                <ForgotPasswordModal 
                    isOpen={showForgotModal} 
                    onClose={() => setShowForgotModal(false)} 
                />

                <div className="mt-8 pt-6 border-t border-[#F5F5F5]">
                    <p className="text-[#757575] text-sm">
                        New practitioner? <Link to="/signup" className="text-[#1E88E5] font-bold hover:underline">Create clinical account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
