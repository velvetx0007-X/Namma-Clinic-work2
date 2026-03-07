import React, { useState, useEffect } from 'react';
import { 
    Search, 
    User, 
    Activity, 
    Pill, 
    Clipboard, 
    ChevronRight, 
    FileText, 
    Calendar,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import api from '../api/axiosInstance';
import './PatientHistory.css';

const PatientHistory = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // History states
    const [history, setHistory] = useState({
        vitals: [],
        prescriptions: [],
        consultations: []
    });
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            setPatients(res.data.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientHistory = async (patientId) => {
        setLoadingHistory(true);
        try {
            const [vitalsRes, prescRes, consultRes] = await Promise.all([
                api.get(`/vitals/patient/${patientId}`),
                api.get(`/prescriptions/patient/${patientId}`),
                api.get(`/consultations/patient/${patientId}`)
            ]);
            
            setHistory({
                vitals: vitalsRes.data.data || [],
                prescriptions: prescRes.data.data || [],
                consultations: consultRes.data.data || []
            });
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setSearchTerm('');
        setShowResults(false);
        fetchPatientHistory(patient._id);
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.uhid && p.uhid.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="patient-history-container">
            {!selectedPatient ? (
                <div className="patient-search-section">
                    <h2>Select Patient to View Record</h2>
                    <div className="search-input-wrapper" style={{ marginTop: '20px' }}>
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            className="w-full p-3 pl-10 rounded-lg border border-gray-200"
                            placeholder="Search by Name or UHID..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                        />
                    </div>
                    {showResults && searchTerm && (
                        <div className="options-dropdown mt-2 border rounded-lg shadow-lg bg-white overflow-hidden">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map(p => (
                                    <div 
                                        key={p._id} 
                                        className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                                        onClick={() => handleSelectPatient(p)}
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.uhid || 'No UHID'}</div>
                                        </div>
                                        <ChevronRight size={16} className="text-emerald-500" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-gray-500 text-center">No patient found</div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="history-content">
                    <button className="flex items-center gap-2 text-emerald-600 mb-6 font-semibold hover:underline" onClick={() => setSelectedPatient(null)}>
                        <ArrowLeft size={16} /> Back to Search
                    </button>

                    <div className="patient-info-header">
                        <div className="p-main-info">
                            <h2>{selectedPatient.name}</h2>
                            <span className="uhid-badge">UHID: {selectedPatient.uhid || 'NOT_ASSIGNED'}</span>
                        </div>
                        <div className="p-side-details">
                            <div className="detail-item">
                                <span className="label">Age</span>
                                <span className="value">{selectedPatient.age || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Blood Group</span>
                                <span className="value">{selectedPatient.bloodGroup || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Phone</span>
                                <span className="value">{selectedPatient.phoneNumber}</span>
                            </div>
                        </div>
                    </div>

                    {loadingHistory ? (
                        <div className="text-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
                    ) : (
                        <div className="history-sections">
                            {/* Vitals Section */}
                            <div className="section-box">
                                <h3><Activity className="text-emerald-500" /> Vitals History</h3>
                                <div className="vitals-list">
                                    {history.vitals.length > 0 ? history.vitals.map(v => (
                                        <div key={v._id} className="vitals-entry">
                                            <div className="entry-header">
                                                <span>{new Date(v.createdAt).toLocaleString()}</span>
                                                <span>By {v.recordedBy?.userName || 'Staff'}</span>
                                            </div>
                                            <div className="vitals-grid">
                                                <div className="v-item"><small>BP</small><span>{v.bloodPressure?.systolic}/{v.bloodPressure?.diastolic}</span></div>
                                                <div className="v-item"><small>Pulse</small><span>{v.pulse} bpm</span></div>
                                                <div className="v-item"><small>Temp</small><span>{v.temperature}°C</span></div>
                                                <div className="v-item"><small>SpO2</small><span>{v.oxygenLevel}%</span></div>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 italic">No vitals recorded yet.</p>}
                                </div>
                            </div>

                            {/* Prescriptions Section */}
                            <div className="section-box">
                                <h3><Pill className="text-emerald-500" /> Prescription History</h3>
                                <div className="presc-list">
                                    {history.prescriptions.length > 0 ? history.prescriptions.map(p => (
                                        <div key={p._id} className="presc-entry">
                                            <div className="entry-header">
                                                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                {p.isAIProcessed && <span className="ai-badge">AI GENERATED</span>}
                                            </div>
                                            <div className="p-meds">
                                                {p.medications.map(m => m.drugName).join(', ')}
                                            </div>
                                            {p.digitalPrescriptionPdf && (
                                                <a 
                                                    href={`http://localhost:5000/${p.digitalPrescriptionPdf}`} 
                                                    target="_blank" 
                                                    className="btn-rx-view"
                                                >
                                                    <FileText size={14} /> View Prescription
                                                </a>
                                            )}
                                        </div>
                                    )) : <p className="text-gray-400 italic">No prescriptions found.</p>}
                                </div>
                            </div>

                            {/* Consultations Section */}
                            <div className="section-box" style={{ gridColumn: 'span 2' }}>
                                <h3><Clipboard className="text-emerald-500" /> Consultation Notes</h3>
                                <div className="consult-list">
                                    {history.consultations.length > 0 ? history.consultations.map(c => (
                                        <div key={c._id} className="consult-entry">
                                            <div className="entry-header">
                                                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                                <span>Dr. {c.doctorId?.userName}</span>
                                            </div>
                                            <div className="consult-details mt-2">
                                                <p><strong>Subjective:</strong> {c.subjective}</p>
                                                <p><strong>Assessment:</strong> {c.assessment}</p>
                                                <p><strong>Plan:</strong> {c.plan}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 italic">No consultation records yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientHistory;
