import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Star, MessageSquare, Send, ChevronLeft, Loader2, 
    Activity, Clock, Sparkles, Heart 
} from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';
import BrandText from '../components/common/BrandText';
import './ReviewPage.css';

const ReviewPage = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        clinicId: '',
        rating: 5,
        communication: 5,
        treatment: 5,
        waitingTime: 5,
        recommend: true,
        issueResolved: true,
        comment: ''
    });

    const [hovers, setHovers] = useState({ communication: 0, treatment: 0, waitingTime: 0 });

    useEffect(() => {
        fetchClinics();
        if (location.state?.clinicId) {
            setFormData(prev => ({ ...prev, clinicId: location.state.clinicId }));
        }
    }, [location.state]);

    const fetchClinics = async () => {
        try {
            const res = await api.get('/clinics');
            // Filter to show only clinic admins or doctors (entities that can be reviewed)
            setClinics(res.data.data.filter(c => c.userType === 'doctor' || c.role === 'admin'));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching clinics:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.clinicId) {
            alert("Please select a clinic.");
            return;
        }
        
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                ...formData,
                patientId: user.id
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/patient-dashboard');
            }, 3000);
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    if (success) {
        return (
            <div className={`review-success-page flex items-center justify-center min-h-screen p-6 ${isDarkMode ? 'dark' : ''}`}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-view-card bg-white shadow-2xl rounded-[50px] p-16 text-center max-w-2xl w-full border border-slate-50 relative overflow-hidden"
                >
                    <div className="success-confetti-bg absolute inset-0 opacity-5 pointer-events-none">
                        <Sparkles size={400} className="absolute -top-20 -right-20 text-blue-500" />
                        <Heart size={300} className="absolute -bottom-20 -left-20 text-emerald-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="success-logo-container mb-10">
                            <img src={logo} alt="Logo" className="w-24 h-24 rounded-3xl mx-auto shadow-lg mb-6" />
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto -mt-12 ml-auto mr-12 shadow-md border-4 border-white">
                                <Star className="text-emerald-600 fill-emerald-600" size={32} />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl font-black text-slate-900 mb-6">Thank You So Much!</h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                            Your feedback is incredibly valuable to us. Our AI is now analyzing your review to help us maintain our high standard of clinical excellence.
                        </p>
                        
                        <div className="flex flex-col items-center gap-4">
                            <div className="px-8 py-3 bg-blue-50 text-blue-700 rounded-2xl font-black uppercase tracking-widest text-xs">
                                Redirecting to Dashboard...
                            </div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const RatingStars = ({ field, label, icon }) => (
        <div className="rating-row p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-500">{icon}</div>
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</label>
            </div>
            <div className="flex gap-2">
                {[...Array(5)].map((_, index) => {
                    const idx = index + 1;
                    return (
                        <button
                            type="button"
                            key={idx}
                            className={`transition-transform hover:scale-110 ${idx <= (hovers[field] || formData[field]) ? "text-amber-400" : "text-slate-200"}`}
                            onClick={() => setFormData({...formData, [field]: idx})}
                            onMouseEnter={() => setHovers({...hovers, [field]: idx})}
                            onMouseLeave={() => setHovers({...hovers, [field]: 0})}
                        >
                            <Star size={32} fill={idx <= (hovers[field] || formData[field]) ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className={`review-page-bg ${isDarkMode ? 'dark' : ''}`}>
            <nav className="top-navbar-review">
                <div className="navbar-brand" onClick={() => navigate('/patient-dashboard')}>
                    <img src={logo} alt="NAMMA CLINIC" className="navbar-logo" />
                    <BrandText className="text-xl" />
                </div>
                <button className="back-btn" onClick={() => navigate('/patient-dashboard')}>
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>
            </nav>

            <div className="review-container max-w-3xl mx-auto py-12 px-6">
                <div className="review-card bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 border border-slate-100">
                    <div className="review-header mb-12 text-center">
                        <div className="icon-wrapper bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Star className="text-blue-600" size={36} fill="currentColor" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900">Advanced Feedback</h1>
                        <p className="text-slate-400 mt-2 font-medium">Evaluate your doctor and help us improve clinical excellence.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Clinic Selection */}
                        <div className="form-group">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Healthcare Provider</label>
                            <select 
                                required
                                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                                value={formData.clinicId}
                                onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                            >
                                <option value="">-- Choose Doctor / Clinic --</option>
                                {clinics.map(clinic => (
                                    <option key={clinic._id} value={clinic._id}>
                                        Dr. {clinic.userName} ({clinic.clinicName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Granular Ratings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RatingStars field="communication" label="Doctor Communication" icon={<MessageSquare size={18} />} />
                            <RatingStars field="treatment" label="Treatment Quality" icon={<Activity size={18} />} />
                            <RatingStars field="waitingTime" label="Waiting Time" icon={<Clock size={18} />} />
                            <RatingStars field="rating" label="Overall Experience" icon={<Sparkles size={18} />} />
                        </div>

                        {/* Recommendation & Resolution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="toggle-group p-5 bg-slate-50 rounded-3xl flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">Recommend this doctor?</span>
                                <label className="switch-premium">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.recommend} 
                                        onChange={() => setFormData({...formData, recommend: !formData.recommend})} 
                                    />
                                    <span className="slider-premium round"></span>
                                </label>
                            </div>
                            <div className="toggle-group p-5 bg-slate-50 rounded-3xl flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">Issue resolved?</span>
                                <label className="switch-premium">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.issueResolved} 
                                        onChange={() => setFormData({...formData, issueResolved: !formData.issueResolved})} 
                                    />
                                    <span className="slider-premium round"></span>
                                </label>
                            </div>
                        </div>

                        {/* Feedback Textarea with Floating Hint */}
                        <div className="form-group flex flex-col pt-4">
                            <div className="floating-textarea-group relative border-2 border-slate-100 rounded-3xl bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
                                <textarea 
                                    required
                                    rows="3"
                                    className="w-full p-6 pt-10 bg-transparent outline-none resize-none font-medium text-slate-700"
                                    value={formData.comment}
                                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                ></textarea>
                                <label className={`absolute left-6 transition-all pointer-events-none uppercase font-black tracking-widest text-[10px] ${formData.comment ? '-top-2.5 left-4 px-2 bg-white text-blue-500 rounded-md scale-90 border border-blue-100' : 'top-6 text-slate-400'}`}>
                                    Detailed Feedback & Comments
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 ml-4 font-bold uppercase">Hint: Mention specific aspects you liked or areas for improvement.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-3xl transition-all shadow-xl hover:shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <Send size={24} />
                                    Submit Advanced Review
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;
