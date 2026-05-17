import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    CheckCircle, 
    ArrowRight, 
    Shield, 
    Mail, 
    Lock, 
    KeyRound, 
    ChevronLeft,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import api from '../../api/axiosInstance';

const ForgotPasswordModal = ({ isOpen, onClose, resetType = 'password' }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [method, setMethod] = useState('email'); // 'email' or 'phone'

    const [formData, setFormData] = useState({
        identifier: '',
        countryCode: '+91',
        otp: ['', '', '', '', '', ''],
        newPassword: '',
        confirmPassword: '',
        newPin: '',
        confirmPin: ''
    });

    const [timer, setTimer] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // References for OTP inputs
    const otpRefs = useRef([]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setTimeout(() => {
                setStep(1);
                setError('');
                setFormData({
                    identifier: '',
                    countryCode: '+91',
                    otp: ['', '', '', '', '', ''],
                    newPassword: '',
                    confirmPassword: '',
                    newPin: '',
                    confirmPin: ''
                });
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        let t;
        if (timer > 0) t = setInterval(() => setTimer(prev => prev - 1), 1000);
        return () => clearInterval(t);
    }, [timer]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSendOtp = async () => {
        setError('');
        if (!formData.identifier.trim()) {
            setError(`Please enter your registered ${method}`);
            return;
        }

        setLoading(true);
        try {
            let id = formData.identifier.trim();
            let currentMethod = method;

            if (currentMethod === 'email' && !id.includes('@') && /^\d+$/.test(id.replace(/[+]/g, ''))) {
                currentMethod = 'phone';
                setMethod('phone');
            }

            const finalId = currentMethod === 'email' ? id : (id.startsWith('+') ? id : (formData.countryCode + id));
            
            const res = await api.post('/auth/forgot-password', { 
                identifier: finalId, 
                type: currentMethod 
            });

            if (res.data.success) {
                setStep(2);
                setTimer(300); // 5 minutes expiration, 30s cooldown for resend managed visually
                if (res.data.identifier) {
                    setFormData(prev => ({ ...prev, identifier: res.data.identifier }));
                }
                // Auto focus first OTP input after transition
                setTimeout(() => {
                    if (otpRefs.current[0]) otpRefs.current[0].focus();
                }, 400);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send recovery code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        const otpValue = formData.otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const id = method === 'email' ? formData.identifier : (formData.identifier.startsWith('+') ? formData.identifier : formData.countryCode + formData.identifier);
            
            const res = await api.post('/auth/verify-otp', {
                identifier: id,
                type: method,
                otp: otpValue
            });

            if (res.data.success) {
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (pwd) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return re.test(pwd);
    };

    const handleResetCredentials = async () => {
        setError('');

        if (resetType === 'password') {
            if (!validatePassword(formData.newPassword)) {
                setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        } else {
            if (!/^\d{4}$/.test(formData.newPin)) {
                setError('PIN must be exactly 4 digits.');
                return;
            }
            if (formData.newPin !== formData.confirmPin) {
                setError('PINs do not match.');
                return;
            }
        }

        setLoading(true);
        try {
            const id = method === 'email' ? formData.identifier : (formData.identifier.startsWith('+') ? formData.identifier : formData.countryCode + formData.identifier);
            const otpValue = formData.otp.join('');
            
            const payload = {
                identifier: id,
                type: method,
                otp: otpValue
            };

            if (resetType === 'password') payload.newPassword = formData.newPassword;
            if (resetType === 'pin') payload.newPin = formData.newPin;

            const res = await api.post('/auth/reset-credentials', payload);

            if (res.data.success) {
                setStep(4);
                setTimeout(() => {
                    onClose();
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...formData.otp];
        newOtp[index] = value.substring(value.length - 1);
        setFormData({ ...formData, otp: newOtp });
        setError('');

        // Move focus to next input
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!formData.otp[index] && index > 0) {
                otpRefs.current[index - 1].focus();
            } else {
                const newOtp = [...formData.otp];
                newOtp[index] = '';
                setFormData({ ...formData, otp: newOtp });
                setError('');
            }
        } else if (e.key === 'Enter') {
            if (formData.otp.join('').length === 6) {
                handleVerifyOtp();
            }
        }
    };

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0 })
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Blurred Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative z-10"
            >
                {/* Decorative Premium Glow */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1E88E5]/10 to-transparent pointer-events-none" />

                {/* Header Actions */}
                <div className="flex items-center justify-between p-6 relative z-10">
                    {step > 1 && step < 4 ? (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50/50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors border border-gray-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    ) : (
                        <div className="w-10 h-10" /> // Spacer
                    )}
                    
                    <button 
                        onClick={onClose}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50/50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors border border-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pb-10 relative z-10">
                    <AnimatePresence mode="wait" custom={1}>
                        {/* STEP 1: IDENTITY */}
                        {step === 1 && (
                            <motion.div key="step1" custom={1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>
                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#1E88E5]/20 to-[#1E88E5]/5 border border-[#1E88E5]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto text-[#1E88E5] shadow-inner">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-['Satoshi',sans-serif]">Account Recovery</h2>
                                    <p className="text-gray-500 text-sm mt-2 font-medium">Verify your identity to reset your {resetType === 'password' ? 'password' : 'PIN'}</p>
                                </div>

                                <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl gap-1 mb-6 border border-gray-200/50">
                                    <button onClick={() => setMethod('email')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${method === 'email' ? 'bg-white text-[#1E88E5] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>Email</button>
                                    <button onClick={() => setMethod('phone')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${method === 'phone' ? 'bg-white text-[#1E88E5] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>Phone</button>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
                                            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                                                <AlertCircle size={14} className="shrink-0" />
                                                {error}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{method === 'email' ? 'Email Address' : 'Mobile Number'}</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-gray-400">
                                            {method === 'email' ? <Mail size={18} /> : <span className="text-sm font-bold">{formData.countryCode}</span>}
                                        </div>
                                        <input 
                                            type="text" 
                                            name="identifier"
                                            value={formData.identifier}
                                            onChange={handleChange}
                                            placeholder={method === 'email' ? "john@example.com" : "9876543210"}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all outline-none font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                        />
                                    </div>
                                </div>

                                <button onClick={handleSendOtp} disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] hover:from-[#1976D2] hover:to-[#1565C0] text-white font-semibold rounded-xl mt-8 transition-all shadow-[0_8px_16px_-4px_rgba(30,136,229,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Send Secure Code <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: OTP */}
                        {step === 2 && (
                            <motion.div key="step2" custom={1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>
                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#1E88E5]/20 to-[#1E88E5]/5 border border-[#1E88E5]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto text-[#1E88E5] shadow-inner">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-['Satoshi',sans-serif]">Verify Identity</h2>
                                    <p className="text-gray-500 text-sm mt-2 font-medium">Enter the 6-digit code sent to <br/><span className="text-gray-800 font-semibold">{formData.identifier}</span></p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
                                            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                                                <AlertCircle size={14} className="shrink-0" />
                                                {error}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                <div className="flex justify-between gap-2 sm:gap-3 mb-8">
                                    {formData.otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength="1"
                                            className="w-full aspect-[4/5] sm:h-14 text-center text-2xl font-bold text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] focus:scale-[1.02] transition-all outline-none shadow-sm"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e, i)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                        />
                                    ))}
                                </div>
                                
                                <button onClick={handleVerifyOtp} disabled={loading || formData.otp.join('').length !== 6} className="w-full py-3.5 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] hover:from-[#1976D2] hover:to-[#1565C0] text-white font-semibold rounded-xl transition-all shadow-[0_8px_16px_-4px_rgba(30,136,229,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Verify Code'}
                                </button>

                                <div className="mt-6 text-center">
                                    {timer > 270 ? ( // 30s cooldown before resend
                                        <p className="text-sm text-gray-400 font-medium">Resend code in 00:{timer - 270}</p>
                                    ) : (
                                        <button onClick={handleSendOtp} className="text-sm text-[#1E88E5] font-semibold hover:text-[#1565C0] transition-colors">
                                            Didn't receive it? Resend
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: RESET CREDENTIALS */}
                        {step === 3 && (
                            <motion.div key="step3" custom={1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>
                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#43A047]/20 to-[#43A047]/5 border border-[#43A047]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto text-[#43A047] shadow-inner">
                                        <KeyRound className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-['Satoshi',sans-serif]">Secure Access</h2>
                                    <p className="text-gray-500 text-sm mt-2 font-medium">Create your new secure {resetType === 'password' ? 'password' : 'PIN'}</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
                                            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                                                <AlertCircle size={14} className="shrink-0" />
                                                {error}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4">
                                    {resetType === 'password' ? (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
                                                <div className="relative flex items-center">
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#43A047]/20 focus:border-[#43A047] transition-all outline-none font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors">
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-tight">Must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
                                            </div>
                                            <div className="space-y-1 pt-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                                <div className="relative flex items-center">
                                                    <input 
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#43A047]/20 focus:border-[#43A047] transition-all outline-none font-medium text-gray-900 shadow-sm"
                                                    />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors">
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New 4-Digit PIN</label>
                                                <input 
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength="4"
                                                    name="newPin"
                                                    value={formData.newPin}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#43A047]/20 focus:border-[#43A047] transition-all outline-none font-bold text-center text-2xl tracking-[1em] text-gray-900 shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1 pt-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm PIN</label>
                                                <input 
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength="4"
                                                    name="confirmPin"
                                                    value={formData.confirmPin}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#43A047]/20 focus:border-[#43A047] transition-all outline-none font-bold text-center text-2xl tracking-[1em] text-gray-900 shadow-sm"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <button onClick={handleResetCredentials} disabled={loading} className="w-full py-3.5 mt-8 bg-gradient-to-r from-[#43A047] to-[#2E7D32] hover:from-[#2E7D32] hover:to-[#1B5E20] text-white font-semibold rounded-xl transition-all shadow-[0_8px_16px_-4px_rgba(67,160,71,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Update Credentials'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}>
                                <div className="py-10 text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <div className="absolute inset-0 bg-[#43A047]/20 rounded-full animate-ping" />
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.1 }} className="relative w-24 h-24 bg-gradient-to-br from-[#43A047] to-[#2E7D32] rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <CheckCircle className="text-white w-12 h-12" />
                                        </motion.div>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Success!</h2>
                                    <p className="text-gray-500 font-medium max-w-[250px] mx-auto">Your {resetType === 'password' ? 'password' : 'PIN'} has been securely updated.</p>
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <p className="text-sm text-gray-400">Redirecting to login...</p>
                                    </div>
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
