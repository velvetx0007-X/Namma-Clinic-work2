import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { 
    ChevronLeft, Star, Send, CheckCircle, Loader2, 
    AlertCircle, User, Phone, Hash 
} from 'lucide-react';
import './PatientFeedbackPage.css';

const PatientFeedbackPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [form, setForm] = useState({ clinicId: '', rating: 5, communication: 5, treatment: 5, waitingTime: 5, recommend: true, issueResolved: true, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        api.get('/clinics').then(r => setClinics(r.data.data || [])).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.clinicId) { setMessage({ type: 'error', text: 'Please select a clinic.' }); return; }
        if (!form.comment.trim()) { setMessage({ type: 'error', text: 'Please write a comment.' }); return; }
        setSubmitting(true);
        try {
            await api.post('/reviews', { patientId: user.id, ...form });
            setSubmitted(true);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit.' });
        } finally { setSubmitting(false); }
    };

    const StarRating = ({ label, field }) => (
        <div className="pfp-rating-row">
            <span className="pfp-rating-label">{label}</span>
            <div className="pfp-stars">
                {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className={`pfp-star ${form[field] >= n ? 'filled' : ''}`} onClick={() => setForm(f => ({ ...f, [field]: n }))}>
                        <Star size={22} />
                    </button>
                ))}
                <span className="pfp-star-val">{form[field]}/5</span>
            </div>
        </div>
    );

    return (
        <div className="pfp-root">
            <div className="pfp-topbar">
                <button className="pfp-back-btn" onClick={() => navigate('/patient-dashboard')}><ChevronLeft size={20} /><span>Back</span></button>
                <h1 className="pfp-title">Give Feedback</h1>
                <div style={{ width: 80 }} />
            </div>
            <div className="pfp-container">
                {/* Patient Identity Header */}
                <div className="prp-identity-card" style={{ margin: '0 0 20px 0', width: '100%' }}>
                    <div className="prp-identity-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="prp-identity-info">
                        <div className="pfp-identity-row-lux" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
                            <Hash size={14} />
                            <span style={{ opacity: 0.8 }}>Patient ID:</span>
                            <span style={{ fontWeight: 700 }}>{user.uhid || user.id?.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="pfp-identity-row-lux" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
                            <User size={14} />
                            <span style={{ opacity: 0.8 }}>Name:</span>
                            <span style={{ fontWeight: 700 }}>{user.name}</span>
                        </div>
                        <div className="pfp-identity-row-lux" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                            <Phone size={14} />
                            <span style={{ opacity: 0.8 }}>Phone:</span>
                            <span style={{ fontWeight: 700 }}>{user.phoneNumber || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {submitted ? (
                    <div className="pfp-success-card">
                        <div className="pfp-success-icon"><CheckCircle size={64} /></div>
                        <h2>Thank You!</h2>
                        <p>Your feedback has been submitted successfully.</p>
                        <button className="pfp-done-btn" onClick={() => navigate('/patient-dashboard')}>Back to Dashboard</button>
                    </div>
                ) : (
                    <form className="pfp-card" onSubmit={handleSubmit}>
                        <div className="pfp-card-header"><Star size={24} /><h2>Rate Your Experience</h2></div>
                        <div className="pfp-field-group">
                            <label className="pfp-label">Select Clinic / Doctor</label>
                            <select className="pfp-select" value={form.clinicId} onChange={e => setForm(f => ({ ...f, clinicId: e.target.value }))}>
                                <option value="">-- Choose a clinic --</option>
                                {clinics.map(c => <option key={c._id} value={c._id}>{c.clinicName || c.userName}</option>)}
                            </select>
                        </div>
                        <div className="pfp-ratings-section">
                            <h3 className="pfp-ratings-title">Ratings</h3>
                            <StarRating label="Overall Experience" field="rating" />
                            <StarRating label="Communication" field="communication" />
                            <StarRating label="Treatment Quality" field="treatment" />
                            <StarRating label="Waiting Time" field="waitingTime" />
                        </div>
                        <div className="pfp-yesno-row">
                            <div className="pfp-yesno-item">
                                <span className="pfp-label">Would you recommend?</span>
                                <div className="pfp-toggle-btns">
                                    <button type="button" className={`pfp-toggle ${form.recommend ? 'yes' : ''}`} onClick={() => setForm(f => ({ ...f, recommend: true }))}>👍 Yes</button>
                                    <button type="button" className={`pfp-toggle ${!form.recommend ? 'no' : ''}`} onClick={() => setForm(f => ({ ...f, recommend: false }))}>👎 No</button>
                                </div>
                            </div>
                            <div className="pfp-yesno-item">
                                <span className="pfp-label">Was your issue resolved?</span>
                                <div className="pfp-toggle-btns">
                                    <button type="button" className={`pfp-toggle ${form.issueResolved ? 'yes' : ''}`} onClick={() => setForm(f => ({ ...f, issueResolved: true }))}>✅ Yes</button>
                                    <button type="button" className={`pfp-toggle ${!form.issueResolved ? 'no' : ''}`} onClick={() => setForm(f => ({ ...f, issueResolved: false }))}>❌ No</button>
                                </div>
                            </div>
                        </div>
                        <div className="pfp-field-group">
                            <label className="pfp-label">Your Comment</label>
                            <textarea className="pfp-textarea" rows={5} placeholder="Share your experience..." value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
                        </div>
                        {message.text && (
                            <div className={`pfp-message ${message.type}`}>
                                {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}
                        <button type="submit" className="pfp-submit-btn" disabled={submitting}>
                            {submitting ? <><Loader2 size={16} className="pfp-spin" /> Submitting...</> : <><Send size={16} /> Submit Feedback</>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PatientFeedbackPage;
