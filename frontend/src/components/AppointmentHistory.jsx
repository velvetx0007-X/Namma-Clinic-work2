import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Calendar, User, Clock, CheckCircle, XCircle, 
    ChevronRight, ArrowRight, Activity, MessageCircle, 
    ExternalLink, RefreshCcw, UserPlus, Search 
} from 'lucide-react';
import api from '../api/axiosInstance';
import './AppointmentHistory.css';

const AppointmentHistory = ({ patientId, role = 'patient' }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, completed, upcoming
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        if (patientId) {
            fetchHistory();
        }
    }, [patientId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/appointments/patient/${patientId}`);
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching appointment history:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            case 'scheduled': return 'status-scheduled';
            case 'pending': return 'status-pending';
            default: return 'status-default';
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        // Status filter
        const statusMatch = filter === 'all' ? true : 
                           filter === 'completed' ? apt.status === 'completed' : 
                           ['scheduled', 'pending'].includes(apt.status);
        
        // Search filter (Doctor or Clinic)
        const searchMatch = !searchTerm ? true : 
                           apt.doctorId?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.doctorId?.clinicName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter
        const typeMatch = typeFilter === 'all' ? true : apt.type === typeFilter;

        return statusMatch && searchMatch && typeMatch;
    });

    if (loading) {
        return (
            <div className="history-loader">
                <div className="spinner"></div>
                <p>Loading Appointment History...</p>
            </div>
        );
    }

    return (
        <div className="appointment-history-wrapper">
            <div className="history-search-row mb-6">
                <div className="search-box-lux">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by doctor or clinic..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="type-filter-lux">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="walk-in">Walk-in</option>
                        <option value="teleconsultation">Teleconsultation</option>
                    </select>
                </div>
            </div>

            <div className="history-filters-row">
                <div className="history-tabs">
                    {['all', 'completed', 'upcoming'].map(t => (
                        <button 
                            key={t}
                            className={`history-tab-btn ${filter === t ? 'active' : ''}`}
                            onClick={() => setFilter(t)}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="history-stats-mini">
                    <span className="stat-pill">Total: {appointments.length}</span>
                </div>
            </div>

            <div className="history-timeline-lux">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt, index) => (
                        <motion.div 
                            key={apt._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`history-item-lux ${index === 0 ? 'latest-apt' : ''}`}
                        >
                            <div className="apt-date-side">
                                <div className="date-box">
                                    <span className="day">{new Date(apt.appointmentDate).getDate()}</span>
                                    <span className="month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div className="time-badge">
                                    <Clock size={12} />
                                    <span>{apt.appointmentTime}</span>
                                </div>
                            </div>

                            <div className="apt-main-card">
                                {index === 0 && <span className="latest-tag">LATEST VISIT</span>}
                                <div className="card-header-lux">
                                    <div className="dr-info-lux">
                                        <div className="dr-avatar-mini">
                                            {apt.doctorId?.userName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4>Dr. {apt.doctorId?.userName}</h4>
                                            <p>{apt.doctorId?.clinicName || 'General Consultation'}</p>
                                        </div>
                                    </div>
                                    <div className={`apt-status-pill ${getStatusColor(apt.status)}`}>
                                        {apt.status}
                                    </div>
                                </div>

                                <div className="card-body-lux">
                                    <div className="body-section">
                                        <label>Complaint / Type</label>
                                        <p>{apt.chiefComplaint || apt.type || 'Regular Checkup'}</p>
                                    </div>
                                    
                                    {apt.comment && (
                                        <div className="body-section">
                                            <label>Diagnosis Summary</label>
                                            <p className="diagnosis-text">{apt.comment}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer-lux">
                                    <div className="footer-actions">
                                        {role !== 'patient' && (
                                            <button className="action-btn-mini secondary">
                                                <ExternalLink size={14} /> View Details
                                            </button>
                                        )}
                                        {apt.status === 'completed' && (
                                            <button className="action-btn-mini primary">
                                                <RefreshCcw size={14} /> Re-book
                                            </button>
                                        )}
                                    </div>
                                    <div className="footer-meta">
                                        <span className="visit-id">Ref: #{apt._id.toString().slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="empty-history-lux">
                        <Calendar size={48} className="empty-icon" />
                        <h3>No Appointment History</h3>
                        <p>No records found for the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentHistory;
