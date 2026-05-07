import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Lock, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import FloatingLabelInput from '../common/FloatingLabelInput';
import PhoneInput from '../common/PhoneInput';
import api from '../../api/axiosInstance';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [method, setMethod] = useState('email'); // 'email' or 'phone'

    const [formData, setFormData] = useState({
        identifier: '',
        countryCode: '+91',
        otp: ['', '', '', '', '', ''],
        newPassword: '',
        newPin: ''
    });

    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let t;
        if (timer > 0) t = setInterval(() => setTimer(prev => prev - 1), 1000);
        return () => clearInterval(t);
    }, [timer]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const id = method === 'email' ? formData.identifier : (formData.countryCode + formData.identifier);
            const res = await api.post('/auth/forgot-password', { identifier: id, type: method });
            if (res.data.success) {
                setStep(2);
                setTimer(120);
                if (res.data.otp) console.log("[DEV] Reset OTP:", res.data.otp);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndReset = async () => {
        setError('');
        setLoading(true);
        try {
            const id = method === 'email' ? formData.identifier : (formData.countryCode + formData.identifier);
            const otpValue = formData.otp.join('');
            
            const res = await api.post('/auth/reset-credentials', {
                identifier: id,
                type: method,
                otp: otpValue,
                newPassword: formData.newPassword,
                newPin: formData.newPin
            });

            if (res.data.success) {
                setStep(4);
                setTimeout(() => {
                    onClose();
                    setStep(1);
                    setFormData({ identifier: '', countryCode: '+91', otp: ['', '', '', '', '', ''], newPassword: '', newPin: '' });
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset credentials');
        } finally {
            setLoading(false);
        }
    };

    const OtpGroup = () => (
        <div className="flex justify-between gap-2 my-6">
            {formData.otp.map((digit, i) => (
                <input
                    key={i}
                    type="text"
                    maxLength="1"
                    className="w-full h-12 text-center text-xl font-bold border-2 border-[#E0E0E0] rounded-xl focus:border-[#1E88E5] focus:outline-none transition-all"
                    value={digit}
                    onChange={(e) => {
                        const newOtp = [...formData.otp];
                        newOtp[i] = e.target.value.substring(e.target.value.length - 1);
                        setFormData({ ...formData, otp: newOtp });
                        
                        // Focus next input
                        if (e.target.value && i < 5) {
                            const nextInput = e.target.parentElement.querySelectorAll('input')[i + 1];
                            if (nextInput) nextInput.focus();
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !formData.otp[i] && i > 0) {
                            const prevInput = e.target.parentElement.querySelectorAll('input')[i - 1];
                            if (prevInput) prevInput.focus();
                        }
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-[440px] bg-white rounded-[28px] shadow-2xl overflow-hidden relative"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-[#E3F2FD] rounded-2xl flex items-center justify-center mb-4 mx-auto text-[#1E88E5]">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#333]">Reset Access</h2>
                                    <p className="text-[#757575] text-sm mt-1">Verify your identity to reset credentials</p>
                                </div>

                                <div className="flex p-1 bg-[#F5F5F5] rounded-xl gap-1 mb-6">
                                    <button onClick={() => setMethod('email')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'email' ? 'bg-white text-[#1E88E5] shadow-sm' : 'text-gray-400'}`}>Email</button>
                                    <button onClick={() => setMethod('phone')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-white text-[#1E88E5] shadow-sm' : 'text-gray-400'}`}>Phone</button>
                                </div>

                                {error && <div className="p-3 mb-6 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

                                {method === 'email' ? (
                                    <FloatingLabelInput label="Email Address" id="identifier" name="identifier" value={formData.identifier} onChange={handleChange} required />
                                ) : (
                                    <PhoneInput 
                                        label="Mobile Number" id="identifier" value={formData.identifier} 
                                        onChange={handleChange} countryCode={formData.countryCode} 
                                        onCountryCodeChange={(e) => setFormData({...formData, countryCode: e.target.value})} 
                                        required 
                                    />
                                )}

                                <button onClick={handleSendOtp} disabled={loading} className="w-full py-4 bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold rounded-xl mt-4 transition-all shadow-lg flex items-center justify-center gap-2">
                                    {loading ? 'Processing...' : 'Send Reset Code'} <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-6 text-center">
                                    <h2 className="text-2xl font-bold text-[#333]">Verify Identity</h2>
                                    <p className="text-[#757575] text-sm mt-1">Enter the 6-digit code sent to your {method}</p>
                                </div>

                                {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}
                                
                                <OtpGroup />
                                
                                <p className="text-xs text-center text-[#9E9E9E] font-medium mb-8">
                                    {timer > 0 ? `Resend code in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2,'0')}` : <span className="text-[#1E88E5] cursor-pointer font-bold" onClick={handleSendOtp}>Resend Now</span>}
                                </p>

                                <button onClick={() => setStep(3)} className="w-full py-4 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-bold rounded-xl transition-all shadow-lg">
                                    Next Step
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-bold text-[#333]">New Credentials</h2>
                                    <p className="text-[#757575] text-sm mt-1">Set your new password and PIN</p>
                                </div>

                                {error && <div className="p-3 mb-6 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

                                <div className="space-y-2 text-left">
                                    <FloatingLabelInput label="New Password" id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required />
                                    
                                    <div className="py-2 mb-6">
                                        <p className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-3">New 4-Digit PIN</p>
                                        <FloatingLabelInput label="New PIN" id="newPin" name="newPin" type="password" maxLength="4" value={formData.newPin} onChange={handleChange} required />
                                    </div>

                                    <button onClick={handleVerifyAndReset} disabled={loading} className="w-full py-4 bg-[#43A047] hover:bg-[#2E7D32] text-white font-bold rounded-xl transition-all shadow-lg">
                                        {loading ? 'Updating...' : 'Save New Credentials'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="py-12 text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }} className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-[#43A047] w-12 h-12" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-[#333] mb-2">Updated!</h2>
                                    <p className="text-[#757575] font-medium">Your credentials have been successfully reset.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordModal;
