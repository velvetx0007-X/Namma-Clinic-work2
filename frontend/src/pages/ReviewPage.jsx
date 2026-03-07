import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Send, ChevronLeft, Loader2 } from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';
import './ReviewPage.css';

const ReviewPage = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        clinicId: '',
        rating: 5,
        comment: ''
    });

    const [hover, setHover] = useState(0);

    useEffect(() => {
        fetchClinics();
    }, []);

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
            <div className={`review-success-container ${isDarkMode ? 'dark' : ''}`}>
                <div className="success-content shadow-2xl rounded-3xl p-12 text-center animate-bounce-slow">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="text-emerald-600 fill-emerald-600" size={48} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Thank You!</h1>
                    <p className="text-slate-500 text-lg">Your review has been submitted and analyzed by our AI. We value your feedback!</p>
                    <p className="text-slate-400 mt-8 text-sm">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`review-page-bg ${isDarkMode ? 'dark' : ''}`}>
            <nav className="top-navbar-review">
                <div className="navbar-brand" onClick={() => navigate('/patient-dashboard')}>
                    <img src={logo} alt="Namma Clinic" className="navbar-logo" />
                    <h2>Namma Clinic</h2>
                </div>
                <button className="back-btn" onClick={() => navigate('/patient-dashboard')}>
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>
            </nav>

            <div className="review-container max-w-2xl mx-auto py-12 px-6">
                <div className="review-card bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 border border-emerald-50">
                    <div className="review-header mb-10 text-center">
                        <div className="icon-wrapper bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="text-emerald-600" size={36} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">Share Your Experience</h1>
                        <p className="text-slate-400 mt-2">Your feedback helps us improve our healthcare services.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="form-group">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">Select Clinic / Doctor</label>
                            <select 
                                required
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                value={formData.clinicId}
                                onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                            >
                                <option value="">-- Choose Facility --</option>
                                {clinics.map(clinic => (
                                    <option key={clinic._id} value={clinic._id}>
                                        {clinic.clinicName} (Dr. {clinic.userName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group text-center">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Your Rating</label>
                            <div className="star-rating flex justify-center gap-2">
                                {[...Array(5)].map((star, index) => {
                                    index += 1;
                                    return (
                                        <button
                                            type="button"
                                            key={index}
                                            className={`star-btn transition-transform hover:scale-125 ${index <= (hover || formData.rating) ? "text-amber-400" : "text-slate-200"}`}
                                            onClick={() => setFormData({...formData, rating: index})}
                                            onMouseEnter={() => setHover(index)}
                                            onMouseLeave={() => setHover(formData.rating)}
                                        >
                                            <Star size={48} fill={index <= (hover || formData.rating) ? "currentColor" : "none"} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">Your Feedback</label>
                            <textarea 
                                required
                                rows="5"
                                placeholder="Describe your experience with the clinic..."
                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none resize-none"
                                value={formData.comment}
                                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-3xl transition-all shadow-xl hover:shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <Send size={24} />
                                    Submit Feedback
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
