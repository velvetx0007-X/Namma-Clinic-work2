import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
    Upload, Camera, FileText, Image, X, CheckCircle,
    ChevronLeft, Loader2, AlertCircle, FolderOpen,
    User, Phone, Hash
} from 'lucide-react';
import './PatientUploadPage.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const CATEGORY_OPTIONS = [
    { value: 'prescription', label: '💊 Prescription' },
    { value: 'lab_report', label: '🧪 Lab Report' },
    { value: 'scan_report', label: '🩻 Scan Report' },
    { value: 'other', label: '📄 Other Document' },
];

const PatientUploadPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [category, setCategory] = useState('prescription');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid file type. Please upload PDF, JPG, JPEG, or PNG.' });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File too large. Maximum size is 10MB.' });
            return;
        }
        setSelectedFile(file);
        setMessage({ type: '', text: '' });
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview({ type: 'image', url: e.target.result });
            reader.readAsDataURL(file);
        } else {
            setPreview({ type: 'pdf', name: file.name });
        }
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }
        setUploading(true);
        setMessage({ type: '', text: '' });
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('patientId', user.id);
            formData.append('documentType', category);
            formData.append('title', title || selectedFile.name);
            formData.append('notes', notes);

            await api.post('/medical-documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            setSelectedFile(null);
            setPreview(null);
            setTitle('');
            setNotes('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreview(null);
        setTitle('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="pup-root">
            {/* Topbar */}
            <div className="pup-topbar">
                <button className="pup-back-btn" onClick={() => navigate('/patient/records')}>
                    <ChevronLeft size={20} />
                    <span>Back to Records</span>
                </button>
                <h1 className="pup-title">Upload Medical Documents</h1>
                <div style={{ width: 140 }} />
            </div>

            <div className="pup-container">
                {/* Patient Identity Header */}
                <div className="prp-identity-card" style={{ margin: '0 0 20px 0', width: '100%' }}>
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
                </div>

                <div className="pup-main-card">

                    {/* Category Selector */}
                    <div className="pup-field-group">
                        <label className="pup-label">Document Category</label>
                        <div className="pup-category-grid">
                            {CATEGORY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`pup-cat-btn ${category === opt.value ? 'active' : ''}`}
                                    onClick={() => setCategory(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload Zone */}
                    {!selectedFile ? (
                        <div
                            className={`pup-dropzone ${dragOver ? 'dragover' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="pup-dz-icon">
                                <Upload size={40} />
                            </div>
                            <h3>Drop your file here or click to browse</h3>
                            <p>Supports PDF, JPG, JPEG, PNG · Max 10MB</p>
                            <div className="pup-dz-badges">
                                <span>📄 PDF</span>
                                <span>🖼️ JPG</span>
                                <span>🖼️ JPEG</span>
                                <span>🖼️ PNG</span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="pup-hidden-input"
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                        </div>
                    ) : (
                        <div className="pup-preview-box">
                            <button className="pup-clear-btn" onClick={clearFile}><X size={18} /></button>
                            {preview?.type === 'image' ? (
                                <img src={preview.url} alt="Preview" className="pup-img-preview" />
                            ) : (
                                <div className="pup-pdf-preview">
                                    <FileText size={48} />
                                    <span>{preview?.name || selectedFile.name}</span>
                                    <span className="pup-file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Camera Scan Button */}
                    <div className="pup-camera-row">
                        <button className="pup-camera-btn" onClick={() => cameraInputRef.current?.click()}>
                            <Camera size={18} />
                            <span>Scan with Camera</span>
                        </button>
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="pup-hidden-input"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                        <span className="pup-camera-hint">Use your device camera to scan a document</span>
                    </div>

                    {/* Title */}
                    <div className="pup-field-group">
                        <label className="pup-label">Document Title</label>
                        <input
                            type="text"
                            className="pup-input"
                            placeholder="e.g. Blood Test Report - May 2026"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div className="pup-field-group">
                        <label className="pup-label">Notes (optional)</label>
                        <textarea
                            className="pup-textarea"
                            rows={3}
                            placeholder="Add any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`pup-message ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pup-actions">
                        <button className="pup-cancel-btn" onClick={() => navigate('/patient/records')}>
                            Cancel
                        </button>
                        <button className="pup-submit-btn" onClick={handleUpload} disabled={uploading || !selectedFile}>
                            {uploading ? (
                                <><Loader2 size={16} className="pup-spin" /> Uploading...</>
                            ) : (
                                <><Upload size={16} /> Upload Document</>
                            )}
                        </button>
                    </div>

                    {message.type === 'success' && (
                        <button className="pup-view-records-btn" onClick={() => navigate('/patient/records')}>
                            <FolderOpen size={16} /> View My Records
                        </button>
                    )}
                </div>

                {/* Tips Panel */}
                <div className="pup-tips-panel">
                    <h3>📋 Upload Tips</h3>
                    <ul>
                        <li>Ensure documents are clearly readable before uploading</li>
                        <li>PDFs are preferred for multi-page documents</li>
                        <li>Images should be well-lit and flat</li>
                        <li>Max file size: 10MB per document</li>
                        <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
                    </ul>
                    <div className="pup-privacy-note">
                        <span>🔒</span>
                        <p>Your documents are stored securely and only accessible by you and authorized clinic staff.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientUploadPage;
