import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import PinInput from '../components/PinInput';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';

import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'patient',
        pin: ''
    });
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'pin'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
            email: formData.email,
            role: formData.role
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
                } else if (user.role === 'clinic' && user.userType === 'admin') {
                    navigate('/clinic-admin-dashboard');
                } else if (user.role === 'doctor' || (user.role === 'clinic' && user.userType === 'doctor')) {
                    navigate('/doctor-dashboard');
                } else if (user.role === 'nurse' || (user.role === 'clinic' && user.userType === 'nurse')) {
                    navigate('/nurse-dashboard');
                } else if (user.role === 'receptionist' || (user.role === 'clinic' && user.userType === 'receptionist')) {
                    navigate('/receptionist-dashboard');
                } else if (user.role === 'patient') {
                    navigate('/patient-dashboard');
                } else {
                    navigate('/home'); // Fallback
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container relative overflow-hidden bg-[var(--bg-primary)] flex items-center justify-center min-h-screen">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="login-card z-10 w-full max-w-md p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
            >
                <div className="flex flex-col items-center mb-4">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30"
                    >
                        <LogIn className="text-white w-7 h-7" />
                    </motion.div>
                    <h1 className="login-title text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                    <p className="login-subtitle text-emerald-400 mt-0.5 text-sm font-medium">Login to Namma Clinic</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 mb-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="login-form space-y-3">
                    <div className="form-group mb-0">
                        <label className="text-slate-100 text-xs font-medium mb-0.5 block text-left">Select Role</label>
                        <div className="role-selector-buttons flex p-1 bg-white/5 rounded-xl">
                            {['patient', 'clinic', 'admin'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${formData.role === role ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => setFormData({ ...formData, role: role })}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="form-group">
                        <label className="text-slate-100 text-xs font-medium mb-0.5 block text-left">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/80" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '2.5rem' }}
                                className="w-full pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="login-method-toggle flex p-1 bg-white/5 rounded-xl mb-0">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'password' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setLoginMethod('password')}
                        >
                            Password
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'pin' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setLoginMethod('pin')}
                        >
                            PIN Login
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {loginMethod === 'password' ? (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="form-group"
                            >
                                <label className="text-slate-100 text-xs font-medium mb-0.5 block text-left">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/80" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={loginMethod === 'password'}
                                        style={{ paddingLeft: '2.5rem' }}
                                        className="w-full pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pin"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="form-group flex flex-col items-center"
                            >
                                <label className="text-slate-100 text-sm font-medium mb-2 block w-full text-left">Enter 4-Digit Security PIN</label>
                                <PinInput
                                    length={4}
                                    onComplete={handlePinChange}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="submit-btn w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>{loginMethod === 'password' ? 'Sign In Securely' : 'Authorize with PIN'}</span>
                                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="signup-link text-emerald-400/80 text-sm font-medium">
                        New to Namma Clinic? <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">Create clinical account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
