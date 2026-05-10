import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Activity, Calendar, User, Loader2, 
    ChevronRight, ArrowLeft, Pill, FileText, Clipboard, Phone, Clock
} from 'lucide-react';
import api from '../api/axiosInstance';
import './PatientHistory.css';
import AppointmentHistory from './AppointmentHistory';

const PatientHistory = ({ source = 'doctor' }) => {
    const [attendedRecords, setAttendedRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, today, week, month
    const [globalPatient, setGlobalPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('clinical'); // clinical, appointments
    
    // History states for full view
    const [history, setHistory] = useState({
        vitals: [],
        prescriptions: [],
        consultations: [],
        medicalDocuments: []
    });
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (source === 'receptionist') {
            fetchGlobalPatients();
        } else {
            fetchAttendedPatients();
        }
    }, [source]);

    const fetchGlobalPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patients');
            const patients = res.data.data || [];
            setAttendedRecords(patients);
            setFilteredRecords(patients);
        } catch (error) {
            console.error('Error fetching global patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendedPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/consultations/doctor');
            const records = res.data.data || [];
            
            // Deduplicate by patient ID, keeping the latest consultation record
            const uniquePatients = [];
            const patientMap = new Map();
            
            records.forEach(record => {
                if (record.patientId && !patientMap.has(record.patientId._id)) {
                    patientMap.set(record.patientId._id, record);
                    uniquePatients.push(record);
                }
            });

            setAttendedRecords(uniquePatients);
            setFilteredRecords(uniquePatients);
        } catch (error) {
            console.error('Error fetching attended patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (term = searchTerm, type = filterType) => {
        let results = [...attendedRecords];

        // Search by Name, UHID or Phone
        if (term) {
            results = results.filter(record => {
                const p = record.patientId || record;
                return p.name?.toLowerCase().includes(term.toLowerCase()) ||
                p.uhid?.toLowerCase().includes(term.toLowerCase()) ||
                p.phoneNumber?.includes(term);
            });
        }

        // Time-based filtering (only for attended records which have createdAt)
        if (source === 'doctor') {
            const now = new Date();
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            
            if (type === 'today') {
                results = results.filter(r => new Date(r.createdAt) >= startOfToday);
            } else if (type === 'week') {
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                results = results.filter(r => new Date(r.createdAt) >= startOfWeek);
            } else if (type === 'month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                results = results.filter(r => new Date(r.createdAt) >= startOfMonth);
            }
        }

        // If we found a global patient, add it to the top
        if (globalPatient) {
            results = [globalPatient, ...results.filter(r => (r._id || r.patientId?._id) !== globalPatient._id)];
        }

        setFilteredRecords(results);
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterType, attendedRecords, globalPatient]);

    const fetchPatientHistory = async (patientId) => {
        setLoadingHistory(true);
        try {
            const [vitalsRes, prescRes, consultRes, docsRes] = await Promise.all([
                api.get(`/vitals/patient/${patientId}`),
                api.get(`/prescriptions/patient/${patientId}`),
                api.get(`/consultations/patient/${patientId}`),
                api.get(`/medical-documents/patient/${patientId}`)
            ]);
            
            setHistory({
                vitals: vitalsRes.data.data || [],
                prescriptions: prescRes.data.data || [],
                consultations: consultRes.data.data || [],
                medicalDocuments: docsRes.data.data || []
            });
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSelectPatient = (patient) => {
        const p = patient.patientId || patient;
        setSelectedPatient(p);
        fetchPatientHistory(p._id);
    };

    if (loading) return <div className="text-center p-10"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

    return (
        <div className="patient-history-container">
            <AnimatePresence mode="wait">
                {!selectedPatient ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="patient-records-section"
                    >
                        <div className="records-header">
                            <div className="title-area">
                                <h2>{source === 'receptionist' ? 'NAMMA CLINIC Patient Directory' : 'Clinical Patient Records'}</h2>
                                <p className="text-slate-500 text-sm">{source === 'receptionist' ? 'Manage and search all registered patients' : 'Access and manage patient clinical histories'}</p>
                            </div>
                            {source === 'doctor' && (
                                <div className="filter-group-premium">
                                    {['all', 'today', 'week', 'month'].map((type) => (
                                        <button 
                                            key={type}
                                            className={`filter-btn-lux ${filterType === type ? 'active' : ''}`}
                                            onClick={() => setFilterType(type)}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="search-bar-premium mb-10">
                            <div className="search-input-wrapper-lux">
                                <Search className="search-icon-lux" size={20} />
                                <input 
                                    type="text" 
                                    className="search-input-lux"
                                    placeholder="Enter 10-digit phone number or patient name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm.length >= 10 && !isNaN(searchTerm) && (
                                    <button 
                                        className="global-search-btn-lux"
                                        onClick={async () => {
                                            try {
                                                const res = await api.get(`/patients/search/${searchTerm}`);
                                                if (res.data.success) {
                                                    setGlobalPatient(res.data.data);
                                                    setSearchTerm(''); // Clear search so results show
                                                    alert("Patient found!");
                                                }
                                            } catch (err) {
                                                alert("Patient not found in database.");
                                            }
                                        }}
                                    >
                                        Global Search
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="patient-grid-lux">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record, index) => {
                                    const p = record.patientId || record;
                                    return (
                                        <motion.div 
                                            key={record._id || p._id} 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`patient-card-premium ${globalPatient && globalPatient._id === p._id ? 'global-result' : ''}`}
                                            onClick={() => handleSelectPatient(p)}
                                        >
                                            <div className="card-top">
                                                <div className="p-avatar-lux">
                                                    {p.profilePhoto ? (
                                                        <img src={`http://localhost:5000/${p.profilePhoto}`} alt="" />
                                                    ) : (
                                                        <span>{p.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="p-identity">
                                                    <h3>{p.name}</h3>
                                                    <span className="uhid-tag">ID: {p.uhid || 'P-NEW'}</span>
                                                </div>
                                                <div className="arrow-icon">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                            
                                            <div className="card-mid">
                                                <div className="info-pill">
                                                    <Activity size={12} />
                                                    <span>{p.gender || 'N/A'} • {p.age || 'N/A'}Y</span>
                                                </div>
                                                <div className="info-pill">
                                                    <Phone size={12} />
                                                    <span>{p.phoneNumber}</span>
                                                </div>
                                                {record.createdAt && (
                                                    <div className="info-pill">
                                                        <Calendar size={12} />
                                                        <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card-footer-lux">
                                                <button className="btn-action-glass">
                                                    {source === 'doctor' ? 'Clinical History' : 'View Full Details'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="no-records-lux">
                                    <div className="empty-icon-box">
                                        <User size={40} />
                                    </div>
                                    <p>No matching patient records found.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="history-content-lux"
                    >
                        <div className="detail-header-lux">
                            <button className="btn-back-lux" onClick={() => setSelectedPatient(null)}>
                                <ArrowLeft size={18} />
                                <span>Back to Directory</span>
                            </button>
                            
                            <div className="patient-profile-top">
                                <div className="p-profile-main">
                                    <div className="p-avatar-large">
                                        {selectedPatient.profilePhoto ? (
                                            <img src={`http://localhost:5000/${selectedPatient.profilePhoto}`} alt="" />
                                        ) : (
                                            <span>{selectedPatient.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="p-info-text">
                                        <h2>{selectedPatient.name}</h2>
                                        <div className="p-meta-tags">
                                            <span className="uhid-tag-large">#{selectedPatient.uhid || 'NOT_ASSIGNED'}</span>
                                            <span className="info-pill-lux">{selectedPatient.gender}</span>
                                            <span className="info-pill-lux">{selectedPatient.age} Years</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-profile-stats-lux">
                                    <div className="stat-unit">
                                        <span className="label">Blood Group</span>
                                        <span className="value text-rose-600">{selectedPatient.bloodGroup || 'N/A'}</span>
                                    </div>
                                    <div className="stat-unit">
                                        <span className="label">Contact</span>
                                        <span className="value">{selectedPatient.phoneNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="detail-tabs-lux mb-8">
                            <button 
                                className={`detail-tab-btn ${activeTab === 'clinical' ? 'active' : ''}`}
                                onClick={() => setActiveTab('clinical')}
                            >
                                <Activity size={18} />
                                <span>Clinical Timeline</span>
                            </button>
                            <button 
                                className={`detail-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appointments')}
                            >
                                <Calendar size={18} />
                                <span>Appointment History</span>
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div className="loader-overlay-lux">
                                <Loader2 className="animate-spin text-emerald-500" size={48} />
                                <p>Retrieving Clinical Timeline...</p>
                            </div>
                        ) : activeTab === 'clinical' ? (
                            <div className="history-grid-lux">
                                {/* Vitals Timeline */}
                                <div className="history-column">
                                    <div className="column-header">
                                        <div className="icon-badge vitals-bg"><Activity size={18} /></div>
                                        <h3>Vitals History</h3>
                                    </div>
                                    <div className="timeline-container">
                                        {history.vitals.length > 0 ? history.vitals.map((v, i) => (
                                            <div key={v._id} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content-lux">
                                                    <div className="item-meta">
                                                        <span>{new Date(v.createdAt).toLocaleString()}</span>
                                                        <span className="staff-tag">By {v.recordedBy?.userName || 'Staff'}</span>
                                                    </div>
                                                    <div className="vitals-display-grid">
                                                        <div className="v-box">BP <strong>{v.bloodPressure?.systolic}/{v.bloodPressure?.diastolic}</strong></div>
                                                        <div className="v-box">Pulse <strong>{v.pulse}</strong></div>
                                                        <div className="v-box">Temp <strong>{v.temperature}°C</strong></div>
                                                        <div className="v-box">SpO2 <strong>{v.oxygenLevel}%</strong></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="empty-state-lux">No vitals recorded.</div>}
                                    </div>
                                </div>

                                {/* Prescription Section */}
                                <div className="history-column">
                                    <div className="column-header">
                                        <div className="icon-badge presc-bg"><Pill size={18} /></div>
                                        <h3>Prescriptions</h3>
                                    </div>
                                    <div className="cards-stack">
                                        {history.prescriptions.length > 0 ? history.prescriptions.map(p => (
                                            <div key={p._id} className="presc-card-lux">
                                                <div className="p-card-header">
                                                    <span className="date">{new Date(p.createdAt).toLocaleDateString()}</span>
                                                    {p.isAIProcessed && <span className="ai-status">AI Verified</span>}
                                                </div>
                                                <div className="meds-list">
                                                    {p.medications.map((m, idx) => (
                                                        <div key={idx} className="med-line">
                                                            <div className="dot"></div>
                                                            <span>{m.drugName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {p.digitalPrescriptionPdf && (
                                                    <a href={`http://localhost:5000/${p.digitalPrescriptionPdf}`} target="_blank" className="btn-view-pdf-lux">
                                                        <FileText size={14} /> Open Digital Rx
                                                    </a>
                                                )}
                                            </div>
                                        )) : <div className="empty-state-lux">No prescriptions found.</div>}
                                    </div>
                                </div>

                                {/* Consultations */}
                                <div className="history-column full-width">
                                    <div className="column-header">
                                        <div className="icon-badge consult-bg"><Clipboard size={18} /></div>
                                        <h3>Consultation Records</h3>
                                    </div>
                                    <div className="consult-grid-lux">
                                        {history.consultations.length > 0 ? history.consultations.map(c => (
                                            <div key={c._id} className="consult-record-lux">
                                                <div className="c-record-top">
                                                    <div className="doctor-info">
                                                        <User size={14} />
                                                        <span>Dr. {c.doctorId?.userName}</span>
                                                    </div>
                                                    <span className="date">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="c-record-body">
                                                    <div className="soap-item">
                                                        <label>Subjective</label>
                                                        <p>{c.subjective}</p>
                                                    </div>
                                                    <div className="soap-item">
                                                        <label>Assessment</label>
                                                        <p>{c.assessment}</p>
                                                    </div>
                                                    <div className="soap-item">
                                                        <label>Plan</label>
                                                        <p>{c.plan}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="empty-state-lux">No consultation history available.</div>}
                                    </div>
                                </div>
                                {/* Medical Documents */}
                                <div className="history-column full-width mt-6">
                                    <div className="column-header">
                                        <div className="icon-badge doc-bg" style={{ background: '#f8fafc', color: '#64748b' }}><FileText size={18} /></div>
                                        <h3>Uploaded & Generated Documents</h3>
                                    </div>
                                    <div className="docs-grid-lux grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        {history.medicalDocuments.length > 0 ? history.medicalDocuments.map(doc => (
                                            <div key={doc._id} className="doc-card-lux p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase">{doc.documentType}</span>
                                                    <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mb-1 truncate">{doc.title}</h4>
                                                <p className="text-xs text-slate-500 mb-3 truncate">By: {doc.uploadedBy}</p>
                                                <div className="flex gap-2">
                                                    <a 
                                                        href={`http://localhost:5000${doc.fileUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        )) : <div className="empty-state-lux">No documents found.</div>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="appointment-history-section-lux">
                                <AppointmentHistory patientId={selectedPatient._id} role={source} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientHistory;
