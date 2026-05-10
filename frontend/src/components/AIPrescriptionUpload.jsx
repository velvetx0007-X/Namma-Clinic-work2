import React, { useState, useEffect, useRef } from 'react';
import { 
    Upload, Search, User, Stethoscope, FileText, Loader2, 
    CheckCircle, AlertCircle, X, ChevronDown, ChevronRight, 
    ChevronLeft, Activity, Pill, Save, Download, Eye, Plus, Trash2, Calendar
} from 'lucide-react';
import api from '../api/axiosInstance';
import './AIPrescriptionUpload.css';

const AIPrescriptionUpload = ({ onUploadSuccess }) => {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('ai'); // 'ai' or 'manual'
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Step 1: Selection
    const [patientSearch, setPatientSearch] = useState('');
    const [doctorSearch, setDoctorSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showPatientResults, setShowPatientResults] = useState(false);
    const [showDoctorResults, setShowDoctorResults] = useState(false);
    
    // Step 2: Vitals
    const [vitals, setVitals] = useState({
        bloodPressure: '', sugarLevel: '', weight: '', 
        pulse: '', temperature: '', respiratoryRate: '', spO2: ''
    });
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [clinicalNotes, setClinicalNotes] = useState('');

    // Step 3 (AI): File
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Step 3 (Manual): Medications
    const [medications, setMedications] = useState([
        { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    
    // Feedback
    const [status, setStatus] = useState({ type: '', message: '' });
    const [processedResult, setProcessedResult] = useState(null);

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

    const patientRef = useRef(null);
    const doctorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (patientRef.current && !patientRef.current.contains(event.target)) setShowPatientResults(false);
            if (doctorRef.current && !doctorRef.current.contains(event.target)) setShowDoctorResults(false);
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

    const handleAddMed = () => {
        setMedications([...medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const handleRemoveMed = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const handleFinalSubmit = async () => {
        setIsProcessing(true);
        setStatus({ type: 'info', message: mode === 'ai' ? 'AI is analyzing... Please wait.' : 'Generating digital prescription...' });

        try {
            let response;
            if (mode === 'ai') {
                const formData = new FormData();
                formData.append('prescription', file);
                formData.append('patientId', selectedPatient._id);
                formData.append('doctorId', selectedDoctor._id);
                formData.append('vitals', JSON.stringify(vitals));
                formData.append('symptoms', symptoms);
                formData.append('diagnosis', diagnosis);
                formData.append('clinicalNotes', clinicalNotes);
                
                response = await api.post('/ai-prescriptions/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/ai-prescriptions/manual', {
                    patientId: selectedPatient._id,
                    doctorId: selectedDoctor._id,
                    medications,
                    vitals,
                    symptoms,
                    diagnosis,
                    clinicalNotes
                });
            }
            
            setProcessedResult(response.data.data);
            setStatus({ type: 'success', message: 'Prescription created successfully!' });
            setStep(4);
            if (onUploadSuccess) onUploadSuccess(response.data.data);
        } catch (error) {
            console.error('Submission error:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to create prescription.' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="loading-state"><Loader2 className="spin" /> Loading data...</div>;

    return (
        <div className="ai-prescription-upload">
            <div className="step-indicator">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                        <div className="step-number">{step > s ? <CheckCircle size={14} /> : s}</div>
                        <span className="step-label">{['Selection', 'Vitals', 'Creation', 'Result'][s-1]}</span>
                    </div>
                ))}
            </div>

            <div className="upload-header">
                <h2><Upload className="accent-text" /> AI Prescription Upload</h2>
                <p>{['Select patient and doctor', 'Record patient vitals', 'Analyze or create prescription', 'Final review'][step-1]}</p>
            </div>

            {status.message && step !== 4 && (
                <div className={`status-alert ${status.type}`}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span>{status.message}</span>
                </div>
            )}

            {step === 1 && (
                <div className="step-content">
                    <div className="upload-grid">
                        <div className="searchable-select" ref={patientRef}>
                            <label>Patient Selection</label>
                            <div className="search-input-wrapper">
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
                                    className={selectedPatient ? 'has-selection' : ''}
                                />
                                {selectedPatient && (
                                    <button 
                                        className="clear-selection" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedPatient(null); 
                                            setPatientSearch(''); 
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {showPatientResults && (
                                <div className="options-dropdown">
                                    {filteredPatients.map(p => (
                                        <div key={p._id} className="option-item" onClick={() => { setSelectedPatient(p); setShowPatientResults(false); }}>
                                            <div className="item-main"><span className="p-name">{p.name}</span></div>
                                            <span className="p-id">UHID: {p.uhid || p._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    ))}
                                    {filteredPatients.length === 0 && <div className="no-results">No patients found</div>}
                                </div>
                            )}
                            {selectedPatient && (
                                <div className="selection-badge mt-2">
                                    <User size={14} /> Selected: <strong>{selectedPatient.name}</strong>
                                </div>
                            )}
                        </div>

                        <div className="searchable-select" ref={doctorRef}>
                            <label>Doctor Selection</label>
                            <div className="search-input-wrapper">
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
                                    className={selectedDoctor ? 'has-selection' : ''}
                                />
                                {selectedDoctor && (
                                    <button 
                                        className="clear-selection" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedDoctor(null); 
                                            setDoctorSearch(''); 
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {showDoctorResults && (
                                <div className="options-dropdown">
                                    {filteredDoctors.map(d => (
                                        <div key={d._id} className="option-item" onClick={() => { setSelectedDoctor(d); setShowDoctorResults(false); }}>
                                            <div className="item-main"><span className="p-name">Dr. {d.userName}</span></div>
                                            <span className="p-id">{d.clinicName}</span>
                                        </div>
                                    ))}
                                    {filteredDoctors.length === 0 && <div className="no-results">No doctors found</div>}
                                </div>
                            )}
                            {selectedDoctor && (
                                <div className="selection-badge mt-2">
                                    <Stethoscope size={14} /> Selected: <strong>Dr. {selectedDoctor.userName}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="workflow-actions">
                        <div />
                        <button className="btn-nav btn-next" disabled={!selectedPatient || !selectedDoctor} onClick={() => setStep(2)}>Next Step <ChevronRight size={18} /></button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="step-content">
                    <h3 className="section-title"><Activity size={20} /> Vitals & Observations</h3>
                    <div className="vitals-grid">
                        {Object.keys(vitals).map(v => (
                            <div key={v} className="vitals-input-group">
                                <label>{v.replace(/([A-Z])/g, ' $1')}</label>
                                <input type="text" value={vitals[v]} onChange={(e) => setVitals({...vitals, [v]: e.target.value})} placeholder="--" />
                            </div>
                        ))}
                    </div>
                    <div className="form-group-full">
                        <label>Chief Complaints / Symptoms</label>
                        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Enter patient symptoms..." rows="2" />
                    </div>
                    <div className="form-group-full">
                        <label>Diagnosis</label>
                        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Initial diagnosis..." rows="2" />
                    </div>
                    <div className="workflow-actions">
                        <button className="btn-nav btn-back" onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
                        <button className="btn-nav btn-next" onClick={() => setStep(3)}>Continue <ChevronRight size={18} /></button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="step-content">
                    <div className="mode-selection">
                        <div className={`mode-card ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>
                            <div className="mode-icon"><Upload /></div>
                            <h3>AI Smart Upload</h3>
                            <p>Upload handwritten or PDF prescriptions for AI analysis</p>
                        </div>
                        <div className={`mode-card ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
                            <div className="mode-icon"><Plus /></div>
                            <h3>Manual Entry</h3>
                            <p>Create a structured prescription by manually entering medications</p>
                        </div>
                    </div>

                    {mode === 'ai' ? (
                        <div className="ai-upload-section">
                            <div 
                                className={`drop-zone ${dragActive ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} accept="image/*,.pdf" />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={48} className="text-emerald-500 mb-2" />
                                        <p className="font-bold">{file.name}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <Upload size={48} className="text-gray-400 mb-4" />
                                        <p className="text-lg font-bold mb-1">Drag & Drop Prescription</p>
                                        <span className="text-sm text-gray-500">Supports Images & PDFs</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="manual-entry-section meds-entry-section">
                            <h3 className="section-title"><Pill size={18} /> Prescribed Medications</h3>
                            <div className="meds-list">
                                {medications.map((m, idx) => (
                                    <div key={idx} className="med-row">
                                        <input placeholder="Drug Name" value={m.drugName} onChange={(e) => handleMedChange(idx, 'drugName', e.target.value)} />
                                        <input placeholder="Dosage" value={m.dosage} onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)} />
                                        <input placeholder="Freq" value={m.frequency} onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)} />
                                        <input placeholder="Dur" value={m.duration} onChange={(e) => handleMedChange(idx, 'duration', e.target.value)} />
                                        <button className="btn-remove" onClick={() => handleRemoveMed(idx)}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-add-med" onClick={handleAddMed}>+ Add Another Medication</button>
                            <div className="form-group-full mt-4">
                                <label>Clinical Notes / Advice</label>
                                <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Special instructions for patient..." rows="2" />
                            </div>
                        </div>
                    )}

                    <div className="workflow-actions">
                        <button className="btn-nav btn-back" onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
                        <button className="btn-nav btn-next" disabled={isProcessing || (mode === 'ai' && !file) || (mode === 'manual' && medications[0].drugName === '')} onClick={handleFinalSubmit}>
                            {isProcessing ? <><Loader2 className="spin" /> Processing...</> : <><Save size={18} /> Generate Prescription</>}
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="step-content result-view-container">
                    <div className="result-card">
                        <div className="success-animation">
                            <div className="success-icon-wrapper">
                                <CheckCircle size={60} className="success-check" />
                            </div>
                        </div>
                        
                        <div className="result-header">
                            <h2>Prescription Generated Successfully!</h2>
                            <p>Clinical record for <strong>{selectedPatient?.name}</strong> has been created and synced with medical records.</p>
                        </div>

                        <div className="result-summary">
                            <div className="summary-item">
                                <User size={16} />
                                <span>Patient: <strong>{selectedPatient?.name}</strong></span>
                            </div>
                            <div className="summary-item">
                                <Stethoscope size={16} />
                                <span>Doctor: <strong>Dr. {selectedDoctor?.userName}</strong></span>
                            </div>
                            <div className="summary-item">
                                <Calendar size={16} />
                                <span>Date: <strong>{new Date().toLocaleDateString()}</strong></span>
                            </div>
                        </div>
                        
                        <div className="result-actions-grid">
                            <a 
                                href={`http://localhost:5000/${processedResult?.digitalPrescriptionPdf}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="action-btn btn-view"
                            >
                                <Eye size={20} /> View PDF
                            </a>
                            <a 
                                href={`http://localhost:5000/${processedResult?.digitalPrescriptionPdf}`} 
                                download 
                                className="action-btn btn-download"
                            >
                                <Download size={20} /> Download PDF
                            </a>
                            <button 
                                className="action-btn btn-edit"
                                onClick={() => {
                                    setMode('manual');
                                    setMedications(processedResult.medications || []);
                                    setVitals(processedResult.vitals || {});
                                    setSymptoms(processedResult.symptoms || '');
                                    setDiagnosis(processedResult.diagnosis || '');
                                    setClinicalNotes(processedResult.clinicalNotes || '');
                                    setStep(3);
                                }}
                            >
                                <FileText size={20} /> Edit Prescription
                            </button>
                        </div>

                        <div className="result-footer">
                            <button 
                                className="btn-reset-workflow" 
                                onClick={() => { 
                                    setStep(1); 
                                    setProcessedResult(null); 
                                    setFile(null); 
                                    setMedications([{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]); 
                                    setStatus({ type: '', message: '' }); 
                                }}
                            >
                                <Plus size={18} /> Create New Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPrescriptionUpload;
