import React, { useState, useEffect, useRef } from 'react';
import { 
    Upload, 
    Search, 
    User, 
    Stethoscope, 
    FileText, 
    Loader2, 
    CheckCircle, 
    AlertCircle,
    X,
    ChevronDown
} from 'lucide-react';
import api from '../api/axiosInstance';
import './AIPrescriptionUpload.css';

const AIPrescriptionUpload = ({ onUploadSuccess }) => {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Search & Selection State
    const [patientSearch, setPatientSearch] = useState('');
    const [doctorSearch, setDoctorSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showPatientResults, setShowPatientResults] = useState(false);
    const [showDoctorResults, setShowDoctorResults] = useState(false);
    
    // File State
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    
    // Feedback State
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, clinicsRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/clinics')
                ]);
                setPatients(patientsRes.data.data || []);
                setDoctors((clinicsRes.data.data || []).filter(c => c.userType === 'doctor'));
            } catch (error) {
                console.error('Error fetching data:', error);
                setStatus({ type: 'error', message: 'Failed to load patients/doctors.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Refs for click-outside
    const patientRef = useRef(null);
    const doctorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (patientRef.current && !patientRef.current.contains(event.target)) {
                setShowPatientResults(false);
            }
            if (doctorRef.current && !doctorRef.current.contains(event.target)) {
                setShowDoctorResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
        (p.uhid && p.uhid.toLowerCase().includes(patientSearch.toLowerCase()))
    );

    const filteredDoctors = doctors.filter(d => 
        d.userName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        (d.clinicName && d.clinicName.toLowerCase().includes(doctorSearch.toLowerCase()))
    );

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus({ type: '', message: '' });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedPatient || !selectedDoctor || !file) {
            setStatus({ type: 'error', message: 'Please select patient, doctor and prescription image.' });
            return;
        }

        setIsProcessing(true);
        setStatus({ type: 'info', message: 'AI is analyzing the prescription... Please wait.' });

        const formData = new FormData();
        formData.append('prescription', file);
        formData.append('patientId', selectedPatient._id);
        formData.append('doctorId', selectedDoctor._id);

        try {
            const response = await api.post('/ai-prescriptions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setStatus({ type: 'success', message: 'Prescription processed and AI digital record created!' });
            setFile(null);
            setSelectedPatient(null);
            setSelectedDoctor(null);
            setPatientSearch('');
            setDoctorSearch('');
            
            if (onUploadSuccess) onUploadSuccess(response.data.data);
        } catch (error) {
            console.error('Upload error:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to process prescription.' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="ai-prescription-upload" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader2 className="processing-loader" size={40} />
            </div>
        );
    }

    return (
        <div className="ai-prescription-upload">
            <div className="upload-header">
                <h2><FileText className="accent-text" /> AI Prescription Module</h2>
                <p>Upload handwritten or digital prescriptions for AI analysis</p>
            </div>

            <div className="upload-grid">
                {/* Patient Search */}
                <div className="searchable-select" ref={patientRef}>
                    <label>Patient Selection</label>
                    <div className="search-input-wrapper" onClick={() => setShowPatientResults(true)}>
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Name or UHID..."
                            value={selectedPatient ? selectedPatient.name : patientSearch}
                            onChange={(e) => {
                                setPatientSearch(e.target.value);
                                if (selectedPatient) setSelectedPatient(null);
                                setShowPatientResults(true);
                            }}
                            onFocus={() => setShowPatientResults(true)}
                        />
                        <div className="dropdown-indicator">
                            <ChevronDown size={18} className={showPatientResults ? 'rotate' : ''} />
                        </div>
                        {selectedPatient && (
                            <button className="clear-selection" onClick={(e) => { e.stopPropagation(); setSelectedPatient(null); setPatientSearch(''); }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {showPatientResults && (
                        <div className="options-dropdown">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map(p => (
                                    <div 
                                        key={p._id} 
                                        className={`option-item ${selectedPatient?._id === p._id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedPatient(p);
                                            setShowPatientResults(false);
                                        }}
                                    >
                                        <div className="item-main">
                                            <span className="p-name">{p.name}</span>
                                            {selectedPatient?._id === p._id && <CheckCircle size={14} className="check-icon" />}
                                        </div>
                                        <span className="p-id">UHID: {p.uhid || p._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="option-item no-results">No patient found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Doctor Search */}
                <div className="searchable-select" ref={doctorRef}>
                    <label>Doctor Selection</label>
                    <div className="search-input-wrapper" onClick={() => setShowDoctorResults(true)}>
                        <Stethoscope className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Doctor..."
                            value={selectedDoctor ? `Dr. ${selectedDoctor.userName}` : doctorSearch}
                            onChange={(e) => {
                                setDoctorSearch(e.target.value);
                                if (selectedDoctor) setSelectedDoctor(null);
                                setShowDoctorResults(true);
                            }}
                            onFocus={() => setShowDoctorResults(true)}
                        />
                        <div className="dropdown-indicator">
                            <ChevronDown size={18} className={showDoctorResults ? 'rotate' : ''} />
                        </div>
                        {selectedDoctor && (
                            <button className="clear-selection" onClick={(e) => { e.stopPropagation(); setSelectedDoctor(null); setDoctorSearch(''); }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {showDoctorResults && (
                        <div className="options-dropdown">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map(d => (
                                    <div 
                                        key={d._id} 
                                        className={`option-item ${selectedDoctor?._id === d._id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDoctor(d);
                                            setShowDoctorResults(false);
                                        }}
                                    >
                                        <div className="item-main">
                                            <span className="p-name">Dr. {d.userName}</span>
                                            {selectedDoctor?._id === d._id && <CheckCircle size={14} className="check-icon" />}
                                        </div>
                                        <span className="p-id">{d.clinicName}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="option-item no-results">No doctor found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Drop Zone */}
            <div 
                className={`drop-zone ${dragActive ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                    accept="image/*,.pdf"
                />
                
                {file ? (
                    <>
                        <CheckCircle size={40} color="var(--accent-primary)" />
                        <div className="file-info">
                            <p className="file-name">{file.name}</p>
                            <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button className="change-file" onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}>Change File</button>
                    </>
                ) : (
                    <>
                        <Upload size={40} className="upload-icon" />
                        <p>Drag and drop prescription image here</p>
                        <span>or click to browse files</span>
                    </>
                )}
            </div>

            {/* Status Feedback */}
            {status.message && (
                <div className={`status-alert ${status.type}`}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span>{status.message}</span>
                </div>
            )}

            <button 
                className="btn-process"
                disabled={isProcessing || !file || !selectedPatient || !selectedDoctor}
                onClick={handleUpload}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="processing-loader" size={20} />
                        <span>AI Analyzing...</span>
                    </>
                ) : (
                    <>
                        <Upload size={20} />
                        <span>Upload & Process with AI</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default AIPrescriptionUpload;
