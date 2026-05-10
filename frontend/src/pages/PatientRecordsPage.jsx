import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
    FileText, Pill, Activity, Upload, Download, ZoomIn, ZoomOut,
    X, Bot, ChevronLeft, Eye, Calendar, User, Phone, Hash,
    Loader2, FolderOpen, Sparkles, Image
} from 'lucide-react';
import './PatientRecordsPage.css';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const PatientRecordsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('prescriptions');
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [medicalDocs, setMedicalDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewer, setViewer] = useState(null); // { url, type, title }
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [presRes, labRes, docsRes] = await Promise.all([
                api.get(`/prescriptions/patient/${user.id}`),
                api.get(`/lab-tests/patient/${user.id}`),
                api.get(`/medical-documents/patient/${user.id}`)
            ]);
            setPrescriptions(presRes.data.data || []);
            setLabTests(labRes.data.data || []);
            setMedicalDocs(docsRes.data.data || []);
        } catch (err) {
            console.error('Error loading records:', err);
        } finally {
            setLoading(false);
        }
    };

    const openViewer = (fileUrl, mimeType, title) => {
        const fullUrl = fileUrl?.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
        setViewer({ url: fullUrl, type: mimeType, title });
        setZoom(1);
    };

    const closeViewer = () => setViewer(null);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    const aiPrescriptions = prescriptions.filter(p => p.isAIProcessed);
    const doctorPrescriptions = prescriptions.filter(p => !p.isAIProcessed);

    const patientDocs = medicalDocs.filter(d => d.documentType !== 'ai_prescription');
    const aiDocs = medicalDocs.filter(d => d.documentType === 'ai_prescription');

    const getStatusColor = (status) => {
        const map = { completed: '#10b981', ordered: '#f59e0b', 'sample-collected': '#3b82f6', reviewed: '#8b5cf6', pending: '#94a3b8' };
        return map[status] || '#94a3b8';
    };

    const sections = [
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'ai', label: 'AI Prescriptions', icon: Bot },
        { id: 'labTests', label: 'Lab Tests', icon: Activity },
        { id: 'uploads', label: 'My Uploads', icon: FolderOpen },
    ];

    return (
        <div className="prp-root">
            {/* Top Navbar */}
            <div className="prp-topbar">
                <button className="prp-back-btn" onClick={() => navigate('/patient-dashboard')}>
                    <ChevronLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>
                <h1 className="prp-topbar-title">Medical Records</h1>
                <button className="prp-upload-btn" onClick={() => navigate('/patient/upload-records')}>
                    <Upload size={16} />
                    <span>Upload Documents</span>
                </button>
            </div>

            {/* Patient Identity Header */}
            <div className="prp-identity-card">
                <div className="prp-identity-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="prp-identity-info">
                    <div className="prp-identity-row">
                        <Hash size={14} />
                        <span className="prp-identity-label">Patient ID:</span>
                        <span className="prp-identity-value">{user.uhid || user.id?.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="prp-identity-row">
                        <User size={14} />
                        <span className="prp-identity-label">Name:</span>
                        <span className="prp-identity-value">{user.name}</span>
                    </div>
                    <div className="prp-identity-row">
                        <Phone size={14} />
                        <span className="prp-identity-label">Phone:</span>
                        <span className="prp-identity-value">{user.phoneNumber || 'N/A'}</span>
                    </div>
                </div>
                <div className="prp-identity-stats">
                    <div className="prp-stat-pill">
                        <span className="prp-stat-num">{prescriptions.length}</span>
                        <span className="prp-stat-lbl">Prescriptions</span>
                    </div>
                    <div className="prp-stat-pill">
                        <span className="prp-stat-num">{labTests.length}</span>
                        <span className="prp-stat-lbl">Lab Tests</span>
                    </div>
                    <div className="prp-stat-pill">
                        <span className="prp-stat-num">{medicalDocs.length}</span>
                        <span className="prp-stat-lbl">Documents</span>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="prp-tabs">
                {sections.map(s => (
                    <button
                        key={s.id}
                        className={`prp-tab ${activeSection === s.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(s.id)}
                    >
                        <s.icon size={16} />
                        <span>{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="prp-content">
                {loading ? (
                    <div className="prp-loading">
                        <Loader2 size={32} className="prp-spin" />
                        <p>Loading records...</p>
                    </div>
                ) : (
                    <>
                        {/* PRESCRIPTIONS */}
                        {activeSection === 'prescriptions' && (
                            <div className="prp-section">
                                <div className="prp-section-header">
                                    <Pill size={20} />
                                    <h2>Doctor Prescriptions</h2>
                                    <span className="prp-count-badge">{doctorPrescriptions.length}</span>
                                </div>
                                {doctorPrescriptions.length === 0 ? (
                                    <EmptyState icon={<Pill size={48} />} msg="No prescriptions found" />
                                ) : (
                                    <div className="prp-cards-grid">
                                        {doctorPrescriptions.map(p => (
                                            <div key={p._id} className="prp-record-card">
                                                <div className="prp-card-header">
                                                    <div className="prp-card-icon prescription">
                                                        <Pill size={20} />
                                                    </div>
                                                    <div className="prp-card-meta">
                                                        <h3>{p.medications?.[0]?.drugName || 'Prescription'}</h3>
                                                        <span className="prp-card-sub">
                                                            <Calendar size={12} /> {formatDate(p.createdAt)}
                                                        </span>
                                                    </div>
                                                    <span className={`prp-status-tag ${p.status}`}>{p.status}</span>
                                                </div>
                                                <div className="prp-card-body">
                                                    <div className="prp-info-row">
                                                        <span className="prp-info-label">Doctor</span>
                                                        <span className="prp-info-val">{p.doctorId?.userName || 'N/A'}</span>
                                                    </div>
                                                    <div className="prp-info-row">
                                                        <span className="prp-info-label">Clinic</span>
                                                        <span className="prp-info-val">{p.doctorId?.clinicName || 'N/A'}</span>
                                                    </div>
                                                    <div className="prp-info-row">
                                                        <span className="prp-info-label">Medications</span>
                                                        <span className="prp-info-val">{p.medications?.length || 0} item(s)</span>
                                                    </div>
                                                </div>
                                                <div className="prp-meds-list">
                                                    {p.medications?.slice(0, 3).map((m, i) => (
                                                        <div key={i} className="prp-med-chip">
                                                            <span className="prp-med-name">{m.drugName}</span>
                                                            <span className="prp-med-dose">{m.dosage} · {m.frequency}</span>
                                                        </div>
                                                    ))}
                                                    {p.medications?.length > 3 && <span className="prp-more">+{p.medications.length - 3} more</span>}
                                                </div>
                                                {p.digitalPrescriptionPdf && (
                                                    <div className="prp-card-actions">
                                                        <button className="prp-view-btn" onClick={() => openViewer(p.digitalPrescriptionPdf, 'application/pdf', 'Prescription PDF')}>
                                                            <Eye size={14} /> View PDF
                                                        </button>
                                                        <a className="prp-dl-btn" href={`${BASE_URL}/${p.digitalPrescriptionPdf}`} download>
                                                            <Download size={14} /> Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI PRESCRIPTIONS */}
                        {activeSection === 'ai' && (
                            <div className="prp-section">
                                <div className="prp-section-header ai-header">
                                    <div className="prp-ai-icon-wrap">
                                        <Bot size={20} />
                                    </div>
                                    <h2>AI Generated Prescriptions</h2>
                                    <span className="prp-count-badge ai">{aiPrescriptions.length + aiDocs.length}</span>
                                </div>
                                <div className="prp-ai-note">
                                    <Sparkles size={16} />
                                    <span>These prescriptions were processed and generated by AI from uploaded images/documents.</span>
                                </div>
                                {(aiPrescriptions.length === 0 && aiDocs.length === 0) ? (
                                    <EmptyState icon={<Bot size={48} />} msg="No AI prescriptions found" />
                                ) : (
                                    <div className="prp-cards-grid">
                                        {aiPrescriptions.map(p => (
                                            <div key={p._id} className="prp-record-card ai-card">
                                                <div className="prp-ai-badge"><Sparkles size={12} /> AI Generated</div>
                                                <div className="prp-card-header">
                                                    <div className="prp-card-icon ai">
                                                        <Bot size={20} />
                                                    </div>
                                                    <div className="prp-card-meta">
                                                        <h3>AI Prescription</h3>
                                                        <span className="prp-card-sub">
                                                            <Calendar size={12} /> {formatDate(p.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="prp-card-body">
                                                    {p.aiExtractedData?.diagnosis && (
                                                        <div className="prp-info-row">
                                                            <span className="prp-info-label">Diagnosis</span>
                                                            <span className="prp-info-val">{p.aiExtractedData.diagnosis}</span>
                                                        </div>
                                                    )}
                                                    {p.aiExtractedData?.complaints && (
                                                        <div className="prp-info-row">
                                                            <span className="prp-info-label">Complaints</span>
                                                            <span className="prp-info-val">{p.aiExtractedData.complaints}</span>
                                                        </div>
                                                    )}
                                                    <div className="prp-info-row">
                                                        <span className="prp-info-label">Medications</span>
                                                        <span className="prp-info-val">{p.medications?.length || 0} item(s)</span>
                                                    </div>
                                                </div>
                                                {p.digitalPrescriptionPdf && (
                                                    <div className="prp-card-actions">
                                                        <button className="prp-view-btn" onClick={() => openViewer(p.digitalPrescriptionPdf, 'application/pdf', 'AI Prescription PDF')}>
                                                            <Eye size={14} /> View PDF
                                                        </button>
                                                        <a className="prp-dl-btn" href={`${BASE_URL}/${p.digitalPrescriptionPdf}`} download>
                                                            <Download size={14} /> Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {aiDocs.map(doc => (
                                            <DocCard key={doc._id} doc={doc} onView={openViewer} baseUrl={BASE_URL} formatDate={formatDate} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LAB TESTS */}
                        {activeSection === 'labTests' && (
                            <div className="prp-section">
                                <div className="prp-section-header">
                                    <Activity size={20} />
                                    <h2>Lab Tests & Reports</h2>
                                    <span className="prp-count-badge">{labTests.length}</span>
                                </div>
                                {labTests.length === 0 ? (
                                    <EmptyState icon={<Activity size={48} />} msg="No lab tests found" />
                                ) : (
                                    <div className="prp-cards-grid">
                                        {labTests.map(t => (
                                            <div key={t._id} className="prp-record-card">
                                                <div className="prp-card-header">
                                                    <div className="prp-card-icon lab">
                                                        <Activity size={20} />
                                                    </div>
                                                    <div className="prp-card-meta">
                                                        <h3>{t.testName || 'Lab Test'}</h3>
                                                        <span className="prp-card-sub">
                                                            <Calendar size={12} /> {formatDate(t.createdAt)}
                                                        </span>
                                                    </div>
                                                    <span className="prp-status-dot" style={{ background: getStatusColor(t.status) }}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                                <div className="prp-card-body">
                                                    {t.result && (
                                                        <div className="prp-info-row">
                                                            <span className="prp-info-label">Result</span>
                                                            <span className="prp-info-val">{t.result}</span>
                                                        </div>
                                                    )}
                                                    {t.referenceRange && (
                                                        <div className="prp-info-row">
                                                            <span className="prp-info-label">Reference</span>
                                                            <span className="prp-info-val">{t.referenceRange}</span>
                                                        </div>
                                                    )}
                                                    {t.labName && (
                                                        <div className="prp-info-row">
                                                            <span className="prp-info-label">Lab</span>
                                                            <span className="prp-info-val">{t.labName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {t.reportFile && (
                                                    <div className="prp-card-actions">
                                                        <button className="prp-view-btn" onClick={() => openViewer(t.reportFile, t.reportMimeType || 'application/pdf', t.testName)}>
                                                            <Eye size={14} /> View Report
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MY UPLOADS */}
                        {activeSection === 'uploads' && (
                            <div className="prp-section">
                                <div className="prp-section-header">
                                    <FolderOpen size={20} />
                                    <h2>My Uploaded Documents</h2>
                                    <span className="prp-count-badge">{patientDocs.length}</span>
                                </div>
                                {patientDocs.length === 0 ? (
                                    <div className="prp-empty-uploads">
                                        <FolderOpen size={48} opacity={0.3} />
                                        <p>No documents uploaded yet.</p>
                                        <button className="prp-upload-cta" onClick={() => navigate('/patient/upload-records')}>
                                            <Upload size={16} /> Upload Your First Document
                                        </button>
                                    </div>
                                ) : (
                                    <div className="prp-cards-grid">
                                        {patientDocs.map(doc => (
                                            <DocCard key={doc._id} doc={doc} onView={openViewer} baseUrl={BASE_URL} formatDate={formatDate} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* File Viewer Modal */}
            {viewer && (
                <div className="prp-viewer-overlay" onClick={closeViewer}>
                    <div className="prp-viewer-modal" onClick={e => e.stopPropagation()}>
                        <div className="prp-viewer-toolbar">
                            <span className="prp-viewer-title">{viewer.title}</span>
                            <div className="prp-viewer-controls">
                                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom Out"><ZoomOut size={18} /></button>
                                <span>{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom In"><ZoomIn size={18} /></button>
                                <a href={viewer.url} download className="prp-dl-icon" title="Download"><Download size={18} /></a>
                                <button className="prp-close-viewer" onClick={closeViewer} title="Close"><X size={18} /></button>
                            </div>
                        </div>
                        <div className="prp-viewer-body">
                            {viewer.type === 'application/pdf' ? (
                                <iframe
                                    src={viewer.url}
                                    title="PDF Viewer"
                                    style={{ width: `${zoom * 100}%`, height: '100%', border: 'none', transformOrigin: 'top center' }}
                                />
                            ) : (
                                <div className="prp-img-container">
                                    <img
                                        src={viewer.url}
                                        alt={viewer.title}
                                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                                        className="prp-img-preview"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DocCard = ({ doc, onView, baseUrl, formatDate }) => {
    const isPdf = doc.fileMimeType === 'application/pdf';
    const typeColors = {
        prescription: '#3b82f6', lab_report: '#10b981',
        scan_report: '#8b5cf6', other: '#94a3b8', ai_prescription: '#f59e0b'
    };
    const typeLabels = {
        prescription: 'Prescription', lab_report: 'Lab Report',
        scan_report: 'Scan Report', other: 'Document', ai_prescription: 'AI Prescription'
    };

    return (
        <div className="prp-record-card">
            <div className="prp-card-header">
                <div className="prp-card-icon" style={{ background: `${typeColors[doc.documentType] || '#94a3b8'}22`, color: typeColors[doc.documentType] || '#94a3b8' }}>
                    {isPdf ? <FileText size={20} /> : <Image size={20} />}
                </div>
                <div className="prp-card-meta">
                    <h3>{doc.title || doc.fileName || 'Document'}</h3>
                    <span className="prp-card-sub"><Calendar size={12} /> {formatDate(doc.createdAt)}</span>
                </div>
                <span className="prp-type-tag" style={{ background: `${typeColors[doc.documentType] || '#94a3b8'}22`, color: typeColors[doc.documentType] || '#94a3b8' }}>
                    {typeLabels[doc.documentType] || 'Document'}
                </span>
            </div>
            <div className="prp-card-body">
                <div className="prp-info-row">
                    <span className="prp-info-label">Uploaded by</span>
                    <span className="prp-info-val">{doc.uploadedBy || 'Patient'}</span>
                </div>
                {doc.notes && (
                    <div className="prp-info-row">
                        <span className="prp-info-label">Notes</span>
                        <span className="prp-info-val">{doc.notes}</span>
                    </div>
                )}
                {doc.labResult && (
                    <div className="prp-info-row">
                        <span className="prp-info-label">Result</span>
                        <span className="prp-info-val">{doc.labResult}</span>
                    </div>
                )}
            </div>
            <div className="prp-card-actions">
                <button className="prp-view-btn" onClick={() => onView(doc.fileUrl, doc.fileMimeType, doc.title)}>
                    <Eye size={14} /> {isPdf ? 'View PDF' : 'View Image'}
                </button>
                <a className="prp-dl-btn" href={`${baseUrl}${doc.fileUrl}`} download>
                    <Download size={14} /> Download
                </a>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, msg }) => (
    <div className="prp-empty">
        <div className="prp-empty-icon">{icon}</div>
        <p>{msg}</p>
    </div>
);

export default PatientRecordsPage;
